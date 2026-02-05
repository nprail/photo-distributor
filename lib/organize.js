import path from 'path'
import { promises as fs } from 'fs'
import { extractDateFromFile } from './exif.js'
import { destinationManager } from './destinations/index.js'
import settings from './settings.js'
import { logFileReceived } from './upload-log.js'
import { broadcastStatusUpdate } from './web-server.js'

export function formatDateForPath(date) {
  const year = date.getFullYear().toString()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return { year, folder: `${year}-${month}-${day}` }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(ext) {
  const mimeTypes = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.webp': 'image/webp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.cr2': 'image/x-canon-cr2',
    '.cr3': 'image/x-canon-cr3',
    // Videos
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.m4v': 'video/x-m4v',
    '.3gp': 'video/3gpp',
    '.wmv': 'video/x-ms-wmv',
  }
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
}

/**
 * Get file size
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return stats.size
  } catch {
    return null
  }
}

export async function organizeFile(
  sourcePath,
  originalFilename,
  photosDir,
  SUPPORTED_EXTENSIONS,
) {
  const ext = path.extname(originalFilename).toLowerCase()
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    await fs.unlink(sourcePath)
    return
  }

  const fileDate = await extractDateFromFile(sourcePath)
  const mimeType = getMimeType(ext)
  const fileSize = await getFileSize(sourcePath)

  // Log that we received this file
  const receivedId = await logFileReceived({
    filename: originalFilename,
    size: fileSize,
    mimeType,
    date: fileDate,
  })

  console.log(`📥 Received: ${originalFilename} (${receivedId})`)

  // Broadcast status update for new file received
  broadcastStatusUpdate()

  // Build metadata for destinations
  const metadata = {
    originalFilename,
    destinationFilename: originalFilename,
    date: fileDate,
    mimeType,
    extension: ext,
    receivedId, // Include the received ID for tracking
  }

  // Check if we have any destinations registered
  const hasDestinations = destinationManager.getEnabledDestinations().length > 0

  if (hasDestinations) {
    // Upload to all enabled destinations
    const results = await destinationManager.uploadToAll(sourcePath, metadata)

    // Log results
    const successful = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)

    if (successful.length > 0) {
      console.log(
        `📤 Uploaded ${originalFilename} to ${successful.length} destination(s)`,
      )
    }

    if (failed.length > 0) {
      console.warn(
        `⚠️ Failed to upload ${originalFilename} to: ${failed.map((r) => r.destination).join(', ')}`,
      )
    }

    // Broadcast status update after destination uploads complete
    broadcastStatusUpdate()

    // Delete source file after successful uploads (if configured)
    if (settings.deleteAfterUpload && successful.length > 0) {
      try {
        await fs.unlink(sourcePath)
      } catch (error) {
        console.error(`Failed to delete source file: ${error.message}`)
      }
    }
  } else {
    // Fallback to original behavior if no destinations are configured
    const { year, folder } = formatDateForPath(fileDate)
    const destDir = path.join(photosDir, year, folder)
    await fs.mkdir(destDir, { recursive: true })

    let destFilename = originalFilename
    let destPath = path.join(destDir, destFilename)
    let counter = 1

    while (await fileExists(destPath)) {
      const baseName = path.basename(originalFilename, ext)
      destFilename = `${baseName}_${counter}${ext}`
      destPath = path.join(destDir, destFilename)
      counter++
    }

    await fs.rename(sourcePath, destPath)
    console.log(`📁 Organized: ${originalFilename} -> ${destPath}`)
    
    // Broadcast status update after local organization
    broadcastStatusUpdate()
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
