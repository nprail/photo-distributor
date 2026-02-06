import { promises as fs } from 'fs'
import path from 'path'
import { google } from 'googleapis'
import { BaseDestination } from './base.js'
import { formatDateForPath } from '../distributor.js'
import appConfig from '../../config.js'

/**
 * Google Drive destination for uploading files
 */
export class GoogleDriveDestination extends BaseDestination {
  constructor(config = {}) {
    super(config)
    this.name = 'google-drive'
    this.drive = null
    this.auth = null
    this.rootFolderId = config.rootFolderId || null
    this.folderCache = new Map()
  }

  /**
   * Initialize Google Drive authentication
   */
  async initialize() {
    const credentialsPath = appConfig.googleDriveCredentialsPath
    const tokenPath = appConfig.googleDriveTokenPath

    if (!credentialsPath) {
      throw new Error('Google Drive credentials path is required')
    }

    const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'))

    // Support both service account and OAuth2 credentials
    if (credentials.type === 'service_account') {
      this.auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      })
    } else {
      // OAuth2 credentials
      const { client_id, client_secret, redirect_uris } =
        credentials.installed || credentials.web

      const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris?.[0],
      )

      if (!tokenPath) {
        throw new Error('Token path is required for OAuth2 credentials')
      }

      try {
        const token = JSON.parse(await fs.readFile(tokenPath, 'utf8'))
        oauth2Client.setCredentials(token)

        // Handle token refresh
        oauth2Client.on('tokens', async (tokens) => {
          try {
            const currentToken = JSON.parse(
              await fs.readFile(tokenPath, 'utf8'),
            )
            const updatedToken = { ...currentToken, ...tokens }
            await fs.writeFile(tokenPath, JSON.stringify(updatedToken, null, 2))
            console.log(
              `✅ Google Drive token refreshed (expires: ${new Date(updatedToken.expiry_date).toLocaleString()})`,
            )
          } catch (error) {
            console.error('❌ Failed to save refreshed token:', error.message)
          }
        })

        this.auth = oauth2Client
      } catch (error) {
        throw new Error(
          `Token file not found. Run the auth setup script first: ${error.message}`,
        )
      }
    }

    this.drive = google.drive({ version: 'v3', auth: this.auth })

    // Create or find root photos folder if not specified
    if (!this.rootFolderId) {
      this.rootFolderId = await this.findOrCreateFolder('Photos', null)
    }
  }

  /**
   * Check if the destination is ready
   */
  async isReady() {
    try {
      if (!this.drive) return false
      await this.drive.files.list({ pageSize: 1 })
      return true
    } catch {
      return false
    }
  }

  /**
   * Upload a file to Google Drive
   */
  async upload(filePath, metadata) {
    if (!this.drive) {
      throw new Error('Google Drive not initialized')
    }

    const { year, folder } = formatDateForPath(metadata.date || new Date())
    const folderId = await this.getOrCreateDateFolder(year, folder)

    const fileMetadata = {
      name: metadata.destinationFilename || path.basename(filePath),
      parents: [folderId],
    }

    const media = {
      mimeType: metadata.mimeType || 'application/octet-stream',
      body: (await import('fs')).createReadStream(filePath),
    }

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink, webContentLink',
    })

    return {
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
      folderId,
      folderPath: `Photos/${year}/${folder}`,
    }
  }

  /**
   * Find or create a folder in Google Drive
   */
  async findOrCreateFolder(name, parentId) {
    const query = parentId
      ? `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
      : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`

    const response = await this.drive.files.list({
      q: query,
      fields: 'files(id, name)',
      pageSize: 1,
    })

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id
    }

    // Create the folder
    const folderMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : [],
    }

    const folder = await this.drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    })

    return folder.data.id
  }

  /**
   * Get or create the date-based folder structure
   */
  async getOrCreateDateFolder(year, dateFolder) {
    const cacheKey = `${year}/${dateFolder}`
    if (this.folderCache.has(cacheKey)) {
      return this.folderCache.get(cacheKey)
    }

    // Create year folder
    const yearFolderId = await this.findOrCreateFolder(year, this.rootFolderId)

    // Create date folder
    const dateFolderId = await this.findOrCreateFolder(dateFolder, yearFolderId)

    this.folderCache.set(cacheKey, dateFolderId)
    return dateFolderId
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    this.folderCache.clear()
    this.drive = null
    this.auth = null
  }
}
