import express from 'express'
import cors from 'cors'
import { promises as fs } from 'fs'
import path from 'path'
import { google } from 'googleapis'
import multer from 'multer'

import config from '../config.js'
import settings, { loadSettings, updateSettings } from './settings.js'
import { destinationManager, getActiveUploads } from './destinations/index.js'
import { getCombinedLogs, getDestinationUploads } from './upload-log.js'
import { setupDestinations } from '../server.js'

const SCOPES = {
  drive: ['https://www.googleapis.com/auth/drive.file'],
  photos: ['https://www.googleapis.com/auth/photoslibrary.appendonly'],
}

// In-memory transfer status tracking
const transferStatus = {
  active: [],
  recent: [],
  stats: {
    totalUploads: 0,
    successfulUploads: 0,
    failedUploads: 0,
    lastUploadTime: null,
  },
}

// Track active transfers
export function trackTransfer(transfer) {
  transferStatus.active.push({
    id: Date.now(),
    ...transfer,
    startTime: new Date().toISOString(),
    status: 'in-progress',
  })
}

// Complete a transfer
export function completeTransfer(id, success, result = {}) {
  const index = transferStatus.active.findIndex((t) => t.id === id)
  if (index !== -1) {
    const transfer = transferStatus.active.splice(index, 1)[0]
    transfer.status = success ? 'completed' : 'failed'
    transfer.endTime = new Date().toISOString()
    transfer.result = result

    transferStatus.recent.unshift(transfer)
    // Keep only last 50 recent transfers
    if (transferStatus.recent.length > 50) {
      transferStatus.recent.pop()
    }

    transferStatus.stats.totalUploads++
    if (success) {
      transferStatus.stats.successfulUploads++
    } else {
      transferStatus.stats.failedUploads++
    }
    transferStatus.stats.lastUploadTime = new Date().toISOString()
  }
}

// Pending auth callbacks
const pendingAuthCallbacks = new Map()

// Configure multer for memory storage (we'll validate and save manually)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept JSON files
    if (
      file.mimetype === 'application/json' ||
      file.originalname.endsWith('.json')
    ) {
      cb(null, true)
    } else {
      cb(new Error('Only JSON files are allowed'))
    }
  },
})

export function createWebServer() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // Serve static React app
  const publicDir = path.join(process.cwd(), 'public')

  // API Routes

  // Get transfer status
  app.get('/api/status', (req, res) => {
    const destinations = destinationManager
      .getEnabledDestinations()
      .map((d) => ({
        name: d.getName(),
        enabled: d.enabled,
      }))

    // Get active uploads per destination
    const activeDestinationUploads = getActiveUploads()

    res.json({
      ftpServer: {
        running: true,
        host: config.ftpHost,
        port: config.ftpPort,
      },
      destinations,
      activeUploads: activeDestinationUploads,
      transfers: {
        active: transferStatus.active,
        recent: transferStatus.recent.slice(0, 20),
      },
      stats: transferStatus.stats,
    })
  })

  // Get received files with their destination statuses
  app.get('/api/logs/received', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100
      const logs = await getCombinedLogs(limit)
      res.json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get destination uploads
  app.get('/api/logs/destinations', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100
      const receivedId = req.query.receivedId || null
      const logs = await getDestinationUploads(limit, receivedId)
      res.json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get Google auth status
  app.get('/api/auth/google/status', async (req, res) => {
    const status = {
      drive: {
        enabled: settings.destinations.googleDrive.enabled,
        authenticated: false,
        hasCredentials: false,
        hasToken: false,
      },
      photos: {
        enabled: settings.destinations.googlePhotos.enabled,
        authenticated: false,
        hasCredentials: false,
        hasToken: false,
      },
    }

    // Check Drive
    try {
      await fs.access(settings.destinations.googleDrive.credentialsPath)
      status.drive.hasCredentials = true
    } catch {}
    try {
      await fs.access(settings.destinations.googleDrive.tokenPath)
      status.drive.hasToken = true
      status.drive.authenticated = true
    } catch {}

    // Check Photos
    try {
      await fs.access(settings.destinations.googlePhotos.credentialsPath)
      status.photos.hasCredentials = true
    } catch {}
    try {
      await fs.access(settings.destinations.googlePhotos.tokenPath)
      status.photos.hasToken = true
      status.photos.authenticated = true
    } catch {}

    res.json(status)
  })

  // Upload Google credentials file
  app.post(
    '/api/auth/google/:service/credentials',
    upload.single('credentials'),
    async (req, res) => {
      const { service } = req.params
      if (!['drive', 'photos'].includes(service)) {
        return res.status(400).json({ error: 'Invalid service' })
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      try {
        // Parse and validate the JSON
        const credentialsData = JSON.parse(req.file.buffer.toString('utf8'))

        // Validate it has the expected structure
        if (!credentialsData.installed && !credentialsData.web) {
          return res.status(400).json({
            error:
              'Invalid credentials file format. Expected OAuth 2.0 client credentials.',
          })
        }

        const credType = credentialsData.installed || credentialsData.web
        if (!credType.client_id || !credType.client_secret) {
          return res.status(400).json({
            error:
              'Invalid credentials file. Missing client_id or client_secret.',
          })
        }

        // Determine the target path
        const credentialsPath =
          service === 'drive'
            ? settings.destinations.googleDrive.credentialsPath
            : settings.destinations.googlePhotos.credentialsPath

        // Ensure config directory exists
        await fs.mkdir(path.dirname(credentialsPath), { recursive: true })

        // Save the credentials file
        await fs.writeFile(
          credentialsPath,
          JSON.stringify(credentialsData, null, 2),
          'utf8',
        )

        console.log(`✅ Saved ${service} credentials to ${credentialsPath}`)

        res.json({
          success: true,
          message: `Credentials uploaded successfully for ${service === 'drive' ? 'Google Drive' : 'Google Photos'}`,
          hasCredentials: true,
        })
      } catch (error) {
        console.error('Error saving credentials:', error)

        if (error instanceof SyntaxError) {
          return res.status(400).json({ error: 'Invalid JSON file' })
        }

        res.status(500).json({
          error: `Failed to save credentials: ${error.message}`,
        })
      }
    },
  )

  // Start Google OAuth flow
  app.get('/api/auth/google/:service/start', async (req, res) => {
    const { service } = req.params
    if (!['drive', 'photos'].includes(service)) {
      return res.status(400).json({ error: 'Invalid service' })
    }

    const credentialsPath =
      service === 'drive'
        ? settings.destinations.googleDrive.credentialsPath
        : settings.destinations.googlePhotos.credentialsPath

    try {
      const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'))
      const { client_id, client_secret } =
        credentials.installed || credentials.web

      const webPort = config.webPort || 3001
      const redirectUri = `http://localhost:${webPort}/api/auth/google/callback`

      const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirectUri,
      )

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES[service],
        prompt: 'consent',
        state: service,
      })

      // Store the oauth client for callback
      pendingAuthCallbacks.set(service, { oauth2Client, credentialsPath })

      res.json({ authUrl })
    } catch (error) {
      res.status(500).json({
        error: `Failed to start auth: ${error.message}`,
        hint: 'Make sure credentials file exists',
      })
    }
  })

  // OAuth callback
  app.get('/api/auth/google/callback', async (req, res) => {
    const { code, state: service, error } = req.query

    if (error) {
      return res.send(`
        <html>
          <head><title>Authentication Failed</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1>❌ Authentication Failed</h1>
            <p>Error: ${error}</p>
            <p><a href="/">Return to Dashboard</a></p>
          </body>
        </html>
      `)
    }

    const pending = pendingAuthCallbacks.get(service)
    if (!pending) {
      return res.status(400).send('Invalid or expired auth session')
    }

    try {
      const { oauth2Client } = pending
      const { tokens } = await oauth2Client.getToken(code)
      oauth2Client.setCredentials(tokens)

      const tokenPath =
        service === 'drive'
          ? settings.destinations.googleDrive.tokenPath
          : settings.destinations.googlePhotos.tokenPath

      await fs.mkdir(path.dirname(tokenPath), { recursive: true })
      await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2))

      // Automatically enable the destination after successful OAuth
      const destKey = service === 'drive' ? 'googleDrive' : 'googlePhotos'
      await updateSettings({
        destinations: {
          ...settings.destinations,
          [destKey]: {
            ...settings.destinations[destKey],
            enabled: true,
          },
        },
      })

      // Reload destinations to pick up the newly authenticated service
      await setupDestinations()

      pendingAuthCallbacks.delete(service)

      res.send(`
        <html>
          <head>
            <title>Authentication Successful</title>
            <script>
              setTimeout(() => window.close(), 2000);
            </script>
          </head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1>✅ Authentication Successful!</h1>
            <p>Google ${service === 'drive' ? 'Drive' : 'Photos'} has been connected and enabled.</p>
            <p>This window will close automatically...</p>
            <p><a href="/">Return to Dashboard</a></p>
          </body>
        </html>
      `)
    } catch (error) {
      pendingAuthCallbacks.delete(service)
      res.status(500).send(`
        <html>
          <head><title>Authentication Error</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1>❌ Token Exchange Failed</h1>
            <p>${error.message}</p>
            <p><a href="/">Return to Dashboard</a></p>
          </body>
        </html>
      `)
    }
  })

  // Get destination status
  app.get('/api/destinations', (req, res) => {
    const destinations = []

    for (const [name, destination] of destinationManager.destinations) {
      destinations.push({
        name,
        enabled: destination.enabled,
        type: destination.constructor.name,
      })
    }

    res.json(destinations)
  })

  // Get current settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await loadSettings()
      res.json(settings)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Update settings
  app.put('/api/settings', async (req, res) => {
    try {
      const updates = req.body
      const updatedSettings = await updateSettings(updates)

      // Reload settings
      await settings.reload()

      // Reinitialize destinations with new settings
      const { setupDestinations } = await import('../server.js')
      await setupDestinations()

      const destinations = []
      for (const [name, destination] of destinationManager.destinations) {
        destinations.push({
          name,
          enabled: destination.enabled,
          type: destination.constructor.name,
        })
      }

      res.json({
        success: true,
        settings: updatedSettings,
        destinations,
        message: 'Settings saved and destinations applied',
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Serve React app for all other routes
  app.use(express.static(publicDir))

  // SPA fallback
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'))
  })

  return app
}

export async function startWebServer(port = 3001) {
  const app = createWebServer()
  const webPort = config.webPort || port

  return new Promise((resolve, reject) => {
    const server = app.listen(webPort, () => {
      console.log(`\n🌐 Web Dashboard: http://localhost:${webPort}`)
      resolve(server)
    })

    server.on('error', reject)
  })
}
