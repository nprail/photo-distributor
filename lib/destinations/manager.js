import { logDestinationUpload } from '../upload-log.js'
import { broadcastStatusUpdate } from '../web-server.js'

// Track active uploads per destination
const activeUploads = new Map()

/**
 * Get active uploads for all destinations
 */
export function getActiveUploads() {
  const result = {}
  for (const [destination, uploads] of activeUploads) {
    result[destination] = [...uploads.values()]
  }
  return result
}

/**
 * Track start of an upload
 */
function trackUploadStart(destination, filename, receivedId) {
  if (!activeUploads.has(destination)) {
    activeUploads.set(destination, new Map())
  }
  const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  activeUploads.get(destination).set(uploadId, {
    id: uploadId,
    filename,
    receivedId,
    startTime: new Date().toISOString(),
    status: 'uploading',
  })
  // Broadcast real-time update
  broadcastStatusUpdate()
  return uploadId
}

/**
 * Track end of an upload
 */
function trackUploadEnd(destination, uploadId, success) {
  const uploads = activeUploads.get(destination)
  if (uploads) {
    uploads.delete(uploadId)
  }
  // Broadcast real-time update
  broadcastStatusUpdate()
}

/**
 * Manages multiple upload destinations
 */
export class DestinationManager {
  constructor() {
    this.destinations = new Map()
  }

  /**
   * Register a destination
   * @param {BaseDestination} destination
   */
  register(destination) {
    this.destinations.set(destination.getName(), destination)
    console.log(`📦 Registered destination: ${destination.getName()}`)
  }

  /**
   * Initialize all enabled destinations
   * @returns {Promise<void>}
   */
  async initializeAll() {
    const initPromises = []

    for (const [name, destination] of this.destinations) {
      if (destination.enabled) {
        initPromises.push(
          destination
            .initialize()
            .then(() => {
              console.log(`✅ Initialized destination: ${name}`)
            })
            .catch((error) => {
              console.error(`❌ Failed to initialize ${name}: ${error.message}`)
              destination.enabled = false
            }),
        )
      }
    }

    await Promise.all(initPromises)
  }

  /**
   * Upload a file to all enabled destinations
   * @param {string} filePath - Local path to the file
   * @param {object} metadata - File metadata including receivedId
   * @returns {Promise<object[]>} - Array of upload results
   */
  async uploadToAll(filePath, metadata) {
    const results = []
    const enabledDestinations = this.getEnabledDestinations()

    if (enabledDestinations.length === 0) {
      console.warn('⚠️ No enabled destinations configured')
      return results
    }

    const uploadPromises = enabledDestinations.map(async (destination) => {
      const name = destination.getName()
      const uploadId = trackUploadStart(name, metadata.originalFilename, metadata.receivedId)
      const startTime = Date.now()

      try {
        const result = await destination.upload(filePath, metadata)
        const duration = Date.now() - startTime
        console.log(`✅ Uploaded to ${name}: ${metadata.originalFilename}`)

        trackUploadEnd(name, uploadId, true)

        await logDestinationUpload({
          receivedId: metadata.receivedId,
          filename: metadata.originalFilename,
          destination: name,
          success: true,
          result,
          duration,
        })

        return {
          destination: name,
          success: true,
          result,
        }
      } catch (error) {
        const duration = Date.now() - startTime
        console.error(
          `❌ Failed to upload to ${name}: ${error.message}`,
        )

        trackUploadEnd(name, uploadId, false)

        await logDestinationUpload({
          receivedId: metadata.receivedId,
          filename: metadata.originalFilename,
          destination: name,
          success: false,
          error: error.message,
          duration,
        })

        return {
          destination: name,
          success: false,
          error: error.message,
        }
      }
    })

    return Promise.all(uploadPromises)
  }

  /**
   * Upload a file to a specific destination
   * @param {string} destinationName
   * @param {string} filePath
   * @param {object} metadata
   * @returns {Promise<object>}
   */
  async uploadTo(destinationName, filePath, metadata) {
    const destination = this.destinations.get(destinationName)
    if (!destination) {
      throw new Error(`Destination not found: ${destinationName}`)
    }
    if (!destination.enabled) {
      throw new Error(`Destination is disabled: ${destinationName}`)
    }

    const uploadId = trackUploadStart(destinationName, metadata.originalFilename, metadata.receivedId)
    const startTime = Date.now()

    try {
      const result = await destination.upload(filePath, metadata)
      const duration = Date.now() - startTime

      trackUploadEnd(destinationName, uploadId, true)

      await logDestinationUpload({
        receivedId: metadata.receivedId,
        filename: metadata.originalFilename,
        destination: destinationName,
        success: true,
        result,
        duration,
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      trackUploadEnd(destinationName, uploadId, false)

      await logDestinationUpload({
        receivedId: metadata.receivedId,
        filename: metadata.originalFilename,
        destination: destinationName,
        success: false,
        error: error.message,
        duration,
      })

      throw error
    }
  }

  /**
   * Get all enabled destinations
   * @returns {BaseDestination[]}
   */
  getEnabledDestinations() {
    return Array.from(this.destinations.values()).filter((d) => d.enabled)
  }

  /**
   * Get all registered destinations
   * @returns {BaseDestination[]}
   */
  getAllDestinations() {
    return Array.from(this.destinations.values())
  }

  /**
   * Check if any destinations are enabled and ready
   * @returns {Promise<boolean>}
   */
  async hasReadyDestinations() {
    const enabled = this.getEnabledDestinations()
    if (enabled.length === 0) return false

    const readyChecks = await Promise.all(enabled.map((d) => d.isReady()))
    return readyChecks.some((ready) => ready)
  }

  /**
   * Clear all destinations (for re-initialization)
   */
  clear() {
    this.destinations.clear()
  }

  /**
   * Clean up all destinations
   * @returns {Promise<void>}
   */
  async cleanup() {
    const cleanupPromises = Array.from(this.destinations.values()).map((d) =>
      d.cleanup().catch((err) =>
        console.error(`Error cleaning up ${d.getName()}: ${err.message}`),
      ),
    )
    await Promise.all(cleanupPromises)
  }
}

// Singleton instance
export const destinationManager = new DestinationManager()
