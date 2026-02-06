import express from 'express'
import cors from 'cors'
import { promises as fs } from 'fs'
import path from 'path'
import { google } from 'googleapis'
import multer from 'multer'
import { WebSocketServer } from 'ws'

import config from '../config.js'
import settings, { loadSettings, updateSettings } from './settings.js'
import { destinationManager, getActiveUploads } from './destinations/index.js'
import {
  getCombinedLogs,
  getDestinationUploads,
  getReceivedById,
  getUploadStats,
} from './upload-log.js'
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

// Track active file receives (FTP uploads to server)
const activeReceives = new Map()

/**
 * Track start of file receive
 */
export function trackReceiveStart(filename) {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  activeReceives.set(id, {
    id,
    filename,
    startTime: new Date().toISOString(),
    status: 'receiving',
  })
  broadcastStatusUpdate()
  return id
}

/**
 * Track end of file receive
 */
export function trackReceiveEnd(id) {
  activeReceives.delete(id)
  broadcastStatusUpdate()
}

/**
 * Get all active receives
 */
export function getActiveReceives() {
  return [...activeReceives.values()]
}

// Track active transfers
export function trackTransfer(transfer) {
  const newTransfer = {
    id: Date.now(),
    ...transfer,
    startTime: new Date().toISOString(),
    status: 'in-progress',
  }
  transferStatus.active.push(newTransfer)
  broadcastUpdate('transfer:start', newTransfer)
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

    // Broadcast the update
    broadcastUpdate('transfer:complete', {
      transfer,
      stats: transferStatus.stats,
    })
  }
}

// Broadcast full status update
export async function broadcastStatusUpdate() {
  try {
    const destinations = destinationManager
      .getEnabledDestinations()
      .map((d) => ({
        name: d.getName(),
        enabled: d.enabled,
      }))

    const activeDestinationUploads = getActiveUploads()
    const logs = await getCombinedLogs(50)

    broadcastUpdate('status', {
      ftpServer: {
        running: true,
        host: config.ftpHost,
        port: config.ftpPort,
      },
      destinations,
      activeReceives: getActiveReceives(),
      activeUploads: activeDestinationUploads,
      transfers: {
        active: transferStatus.active,
        recent: transferStatus.recent.slice(0, 20),
      },
      stats: getUploadStats(),
      receivedFiles: logs,
    })
  } catch (error) {
    console.error('Error broadcasting status update:', error)
  }
}

// Pending auth callbacks
const pendingAuthCallbacks = new Map()

// WebSocket clients
const wsClients = new Set()

// Broadcast to all connected WebSocket clients
export function broadcastUpdate(type, data) {
  const message = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString(),
  })
  for (const client of wsClients) {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(message)
    }
  }
}

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

  // Get all initial data in one call (reduces API calls on page load)
  app.get('/api/init', async (req, res) => {
    try {
      const destinations = []
      for (const [name, destination] of destinationManager.destinations) {
        destinations.push({
          name,
          enabled: destination.enabled,
          type: destination.constructor.name,
        })
      }

      // Get auth status
      const authStatus = {
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
        authStatus.drive.hasCredentials = true
      } catch {}
      try {
        await fs.access(settings.destinations.googleDrive.tokenPath)
        authStatus.drive.hasToken = true
        authStatus.drive.authenticated = true
      } catch {}

      // Check Photos
      try {
        await fs.access(settings.destinations.googlePhotos.credentialsPath)
        authStatus.photos.hasCredentials = true
      } catch {}
      try {
        await fs.access(settings.destinations.googlePhotos.tokenPath)
        authStatus.photos.hasToken = true
        authStatus.photos.authenticated = true
      } catch {}

      const currentSettings = await loadSettings()
      res.json({
        settings: currentSettings,
        authStatus,
        destinations,
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

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

  // Retry a failed upload to a specific destination
  app.post('/api/retry-upload', async (req, res) => {
    try {
      const { receivedId, destination } = req.body
      if (!receivedId || !destination) {
        return res
          .status(400)
          .json({ error: 'receivedId and destination are required' })
      }

      const received = await getReceivedById(receivedId)
      if (!received) {
        return res.status(404).json({ error: 'Received file not found' })
      }

      if (!received.sourcePath) {
        return res
          .status(400)
          .json({ error: 'Source file path not available for this entry' })
      }

      // Check if source file still exists
      try {
        await fs.access(received.sourcePath)
      } catch {
        return res
          .status(400)
          .json({ error: 'Source file no longer exists on disk' })
      }

      const metadata = {
        originalFilename: received.filename,
        destinationFilename: received.filename,
        date: received.fileDate ? new Date(received.fileDate) : new Date(),
        mimeType: received.mimeType,
        extension: path.extname(received.filename).toLowerCase(),
        receivedId: received.id,
      }

      const result = await destinationManager.uploadTo(
        destination,
        received.sourcePath,
        metadata,
      )
      broadcastStatusUpdate()
      res.json({ success: true, result })
    } catch (error) {
      broadcastStatusUpdate()
      res.status(500).json({ error: error.message })
    }
  })

  // Retry all failed uploads
  app.post('/api/retry-all-failed', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 200
      const logs = await getCombinedLogs(limit)
      const retryResults = []

      for (const file of logs) {
        if (!file.sourcePath) continue

        // Check if source file still exists
        try {
          await fs.access(file.sourcePath)
        } catch {
          continue
        }

        const failedDestinations = (file.destinations || []).filter(
          (d) => !d.success,
        )
        if (failedDestinations.length === 0) continue

        // Get the set of destinations that have already succeeded
        const succeededDestinations = new Set(
          (file.destinations || [])
            .filter((d) => d.success)
            .map((d) => d.destination),
        )

        const metadata = {
          originalFilename: file.filename,
          destinationFilename: file.filename,
          date: file.fileDate ? new Date(file.fileDate) : new Date(),
          mimeType: file.mimeType,
          extension: path.extname(file.filename).toLowerCase(),
          receivedId: file.id,
        }

        // Get unique failed destinations that haven't since succeeded
        const uniqueFailedDests = [
          ...new Set(failedDestinations.map((d) => d.destination)),
        ].filter((d) => !succeededDestinations.has(d))

        for (const dest of uniqueFailedDests) {
          try {
            const result = await destinationManager.uploadTo(
              dest,
              file.sourcePath,
              metadata,
            )
            retryResults.push({
              receivedId: file.id,
              destination: dest,
              success: true,
              result,
            })
          } catch (error) {
            retryResults.push({
              receivedId: file.id,
              destination: dest,
              success: false,
              error: error.message,
            })
          }
        }
      }

      broadcastStatusUpdate()
      res.json({
        success: true,
        retried: retryResults.length,
        results: retryResults,
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
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

      const redirectUri = `${config.webBaseUrl}/api/auth/google/callback`

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

      // Create WebSocket server on the same HTTP server
      const wss = new WebSocketServer({ server, path: '/ws' })

      wss.on('connection', (ws) => {
        console.log('📡 WebSocket client connected')
        wsClients.add(ws)

        // Send initial status on connection
        broadcastStatusUpdate()

        ws.on('close', () => {
          console.log('📡 WebSocket client disconnected')
          wsClients.delete(ws)
        })

        ws.on('error', (error) => {
          console.error('WebSocket error:', error)
          wsClients.delete(ws)
        })
      })

      console.log(`📡 WebSocket server: ws://localhost:${webPort}/ws`)
      resolve(server)
    })

    server.on('error', reject)
  })
}
