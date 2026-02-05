import { promises as fs } from 'fs'
import path from 'path'
import { google } from 'googleapis'
import { BaseDestination } from './base.js'

/**
 * Google Photos destination for uploading files
 * Uses the Google Photos Library API
 */
export class GooglePhotosDestination extends BaseDestination {
  constructor(config = {}) {
    super(config)
    this.name = 'google-photos'
    this.auth = null
    this.baseUrl = 'https://photoslibrary.googleapis.com'
    this.tokenRefreshTimer = null
    this.isRefreshing = false
  }

  /**
   * Initialize Google Photos authentication
   */
  async initialize() {
    const credentialsPath = this.config.credentialsPath
    const tokenPath = this.config.tokenPath

    if (!credentialsPath) {
      throw new Error('Google Photos credentials path is required')
    }

    if (!tokenPath) {
      throw new Error('Token path is required for Google Photos')
    }

    const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'))
    const { client_id, client_secret, redirect_uris } =
      credentials.installed || credentials.web

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris?.[0],
    )

    try {
      const token = JSON.parse(await fs.readFile(tokenPath, 'utf8'))
      oauth2Client.setCredentials(token)

      // Handle token refresh - save all token updates
      oauth2Client.on('tokens', async (tokens) => {
        try {
          const currentToken = JSON.parse(await fs.readFile(tokenPath, 'utf8'))
          const updatedToken = { ...currentToken, ...tokens }
          await fs.writeFile(tokenPath, JSON.stringify(updatedToken, null, 2))
          console.log(
            `✅ Google Photos token refreshed (expires: ${new Date(updatedToken.expiry_date).toLocaleString()})`,
          )
        } catch (error) {
          console.error('❌ Failed to save refreshed token:', error.message)
        }
      })

      this.auth = oauth2Client

      // Start proactive token refresh timer
      this.startTokenRefreshTimer()
    } catch (error) {
      throw new Error(
        `Token file not found. Run the auth setup script first: ${error.message}`,
      )
    }
  }

  /**
   * Start a timer to proactively refresh tokens before they expire
   * Google access tokens expire after 1 hour, so we refresh every 45 minutes
   */
  startTokenRefreshTimer() {
    // Clear any existing timer
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer)
    }

    // Refresh token every 45 minutes (45 * 60 * 1000 ms)
    const REFRESH_INTERVAL = 45 * 60 * 1000

    this.tokenRefreshTimer = setInterval(async () => {
      try {
        if (!this.auth) return

        // Prevent overlapping refresh attempts
        if (this.isRefreshing) {
          console.log(
            '⏭️  Skipping Google Photos token refresh (refresh already in progress)',
          )
          return
        }

        this.isRefreshing = true
        console.log('🔄 Proactively refreshing Google Photos token...')
        // This will automatically trigger token refresh if needed
        await this.auth.getAccessToken()
      } catch (error) {
        console.error('❌ Error during proactive token refresh:', error.message)
      } finally {
        this.isRefreshing = false
      }
    }, REFRESH_INTERVAL)

    console.log(
      '⏰ Started Google Photos token refresh timer (every 45 minutes)',
    )
  }

  /**
   * Check if the destination is ready
   */
  async isReady() {
    try {
      if (!this.auth) return false
      const accessToken = await this.auth.getAccessToken()
      return !!accessToken.token
    } catch {
      return false
    }
  }

  /**
   * Make an authenticated request to the Google Photos API
   */
  async makeRequest(endpoint, options = {}) {
    const accessToken = await this.auth.getAccessToken()

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Google Photos API error: ${response.status} - ${error}`)
    }

    return response
  }

  /**
   * Upload a file to Google Photos
   */
  async upload(filePath, metadata) {
    if (!this.auth) {
      throw new Error('Google Photos not initialized')
    }

    // Step 1: Upload the bytes and get an upload token
    const uploadToken = await this.uploadBytes(filePath, metadata)

    // Step 2: Create the media item
    const mediaItem = await this.createMediaItem(
      uploadToken,
      metadata.destinationFilename || path.basename(filePath),
      metadata.description || '',
    )

    return {
      mediaItemId: mediaItem.id,
      productUrl: mediaItem.productUrl,
      filename: mediaItem.filename,
    }
  }

  /**
   * Upload file bytes to Google Photos
   */
  async uploadBytes(filePath, metadata) {
    const fileContent = await fs.readFile(filePath)
    const fileName = metadata.destinationFilename || path.basename(filePath)

    const response = await this.makeRequest('/v1/uploads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Goog-Upload-Content-Type':
          metadata.mimeType || 'application/octet-stream',
        'X-Goog-Upload-Protocol': 'raw',
        'X-Goog-Upload-File-Name': fileName,
      },
      body: fileContent,
    })

    return response.text()
  }

  /**
   * Create a media item from an upload token
   */
  async createMediaItem(uploadToken, filename, description) {
    const body = {
      newMediaItems: [
        {
          description: description || filename,
          simpleMediaItem: {
            fileName: filename,
            uploadToken,
          },
        },
      ],
    }

    const response = await this.makeRequest('/v1/mediaItems:batchCreate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (
      !data.newMediaItemResults ||
      data.newMediaItemResults.length === 0 ||
      data.newMediaItemResults[0].status.message !== 'Success'
    ) {
      const errorMessage =
        data.newMediaItemResults?.[0]?.status?.message || 'Unknown error'
      throw new Error(`Failed to create media item: ${errorMessage}`)
    }

    return data.newMediaItemResults[0].mediaItem
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    // Stop token refresh timer
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer)
      this.tokenRefreshTimer = null
      console.log('🛑 Stopped Google Photos token refresh timer')
    }
    this.isRefreshing = false
    this.auth = null
  }
}
