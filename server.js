import FtpSrv from 'ftp-srv'
import { promises as fs } from 'fs'
import bcrypt from 'bcrypt'

import config from './config.js'
import { initDatabase, saveDatabase, closeDatabase } from './lib/db.js'
import settings from './lib/settings.js'
import { PHOTO_EXTENSIONS } from './lib/exif.js'
import { VirtualFileSystem } from './lib/virtual-fs.js'
import {
  destinationManager,
  LocalDestination,
  GoogleDriveDestination,
  GooglePhotosDestination,
} from './lib/destinations/index.js'
import { startWebServer } from './lib/web-server.js'

const VIDEO_EXTENSIONS = [
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.m4v',
  '.3gp',
  '.wmv',
]
const SUPPORTED_EXTENSIONS = [...PHOTO_EXTENSIONS, ...VIDEO_EXTENSIONS]

export async function setupDestinations() {
  console.log('\n📦 Setting up upload destinations...')

  // Clear existing destinations
  destinationManager.clear()

  // Register local destination
  if (settings.destinations.local.enabled) {
    destinationManager.register(
      new LocalDestination(settings.destinations.local),
    )
  }

  // Register Google Drive destination
  if (settings.destinations.googleDrive.enabled) {
    destinationManager.register(
      new GoogleDriveDestination(settings.destinations.googleDrive),
    )
  }

  // Register Google Photos destination
  if (settings.destinations.googlePhotos.enabled) {
    destinationManager.register(
      new GooglePhotosDestination(settings.destinations.googlePhotos),
    )
  }

  // Initialize all destinations
  await destinationManager.initializeAll()

  const enabledDestinations = destinationManager.getEnabledDestinations()
  if (enabledDestinations.length === 0) {
    console.warn(
      '\n⚠️  No destinations enabled! Files will be organized locally.',
    )
  } else {
    console.log(`\n✅ ${enabledDestinations.length} destination(s) ready:`)
    enabledDestinations.forEach((d) => {
      console.log(`   - ${d.getName()}`)
    })
  }
}

async function startServer() {
  // Initialize database first
  await initDatabase()
  console.log('🗄️  Database initialized')

  // Load settings from database
  await settings.reload()
  console.log('📋 Settings loaded')

  await fs.mkdir(config.configDir, { recursive: true })
  await fs.mkdir(config.uploadDir, { recursive: true })
  await fs.mkdir(config.logDir, { recursive: true })

  // Setup upload destinations
  await setupDestinations()

  const ftpServer = new FtpSrv({
    url: `ftp://${config.ftpHost}:${config.ftpPort}`,
    anonymous: false,
    pasv_url: config.pasvUrl,
    pasv_min: 1024,
    pasv_max: 1048,
    greeting: ['Welcome to Photo Distributor'],
  })

  ftpServer.on(
    'login',
    async ({ connection, username, password }, resolve, reject) => {
      try {
        console.log(`Login attempt: ${username}`)

        // Reload settings to get latest credentials (allows live updates)
        await settings.reload()

        // Check credentials
        const passwordMatches = await bcrypt.compare(
          password,
          settings.ftpPasswordHash,
        )

        if (username === settings.ftpUsername && passwordMatches) {
          console.log(`✅ User ${username} authenticated successfully`)
          resolve({
            fs: new VirtualFileSystem(connection, {
              SUPPORTED_EXTENSIONS,
            }),
          })
        } else {
          console.log(`❌ Authentication failed for user ${username}`)
          const error = new Error('Invalid username or password')
          error.code = 401
          error.name = 'GeneralError'
          reject(error)
        }
      } catch (error) {
        console.error(
          `❌ Error during login for user ${username}: ${error.message}`,
        )
        const err = new Error('Authentication error')
        err.code = 500
        err.name = 'GeneralError'
        reject(err)
      }
    },
  )

  ftpServer.on('client-error', ({ connection, context, error }) => {
    console.error(`Client error: ${error.message}`)
    console.error(error)
  })

  try {
    await ftpServer.listen()
    console.log(`\n📷 Photo Distributor started!`)
    console.log(`   FTP URL: ftp://${config.ftpHost}:${config.ftpPort}`)
    console.log(`\n   Supported formats:`)
    console.log(`   - Photos: ${PHOTO_EXTENSIONS.join(', ')}`)
    console.log(`   - Videos: ${VIDEO_EXTENSIONS.join(', ')}`)

    // Start web dashboard
    await startWebServer()

    console.log(`\n   Waiting for connections...`)
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`)
    if (error.code === 'EACCES' && config.ftpPort < 1024) {
      console.error(
        `   Port ${config.ftpPort} requires elevated privileges. Use port 1024 or higher.`,
      )
    }
    process.exit(1)
  }

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down...')
    await destinationManager.cleanup()
    await saveDatabase()
    await closeDatabase()
    console.log('🗄️  Database saved and closed')
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

startServer()
