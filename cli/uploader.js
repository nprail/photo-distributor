/**
 * FTP uploader.
 * Connects to a photo-distributor FTP server and uploads a list of files.
 */

import path from 'path'
import { Client } from 'basic-ftp'

/** Extensions supported by photo-distributor (must match server). */
export const SUPPORTED_EXTENSIONS = [
  // Photos
  '.jpg',
  '.jpeg',
  '.png',
  '.heic',
  '.heif',
  '.webp',
  '.tiff',
  '.tif',
  '.cr2',
  '.cr3',
  // Videos
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.m4v',
  '.3gp',
  '.wmv',
]

/**
 * Upload a list of files to photo-distributor via FTP.
 *
 * @param {object} options
 * @param {string}   options.host
 * @param {number}   options.port
 * @param {string}   options.user
 * @param {string}   options.password
 * @param {string[]} options.files       - Absolute paths to files to upload
 * @param {boolean}  [options.dryRun]    - If true, skip actual upload
 * @param {function} [options.onProgress] - Called with (current, total, filePath, status)
 *   status is 'uploading' | 'done' | 'error' | 'skipped'
 *
 * @returns {Promise<{uploaded: number, skipped: number, failed: number}>}
 */
export async function uploadFiles({
  host,
  port,
  user,
  password,
  files,
  dryRun = false,
  onProgress,
}) {
  const stats = { uploaded: 0, skipped: 0, failed: 0 }

  // Filter to supported extensions
  const supported = files.filter((f) =>
    SUPPORTED_EXTENSIONS.includes(path.extname(f).toLowerCase()),
  )
  const unsupportedCount = files.length - supported.length
  stats.skipped += unsupportedCount

  if (supported.length === 0) {
    return stats
  }

  if (dryRun) {
    for (let i = 0; i < supported.length; i++) {
      onProgress?.(i + 1, supported.length, supported[i], 'skipped')
    }
    stats.skipped += supported.length
    return stats
  }

  const client = new Client()
  client.ftp.verbose = false

  try {
    await client.access({
      host,
      port,
      user,
      password,
      secure: false,
    })

    for (let i = 0; i < supported.length; i++) {
      const filePath = supported[i]
      const filename = path.basename(filePath)

      onProgress?.(i + 1, supported.length, filePath, 'uploading')

      try {
        await client.uploadFrom(filePath, `/${filename}`)
        stats.uploaded++
        onProgress?.(i + 1, supported.length, filePath, 'done')
      } catch (err) {
        stats.failed++
        onProgress?.(i + 1, supported.length, filePath, 'error', err.message)
      }
    }
  } finally {
    client.close()
  }

  return stats
}
