/**
 * HTTP uploader for photo-distributor.
 * Uses the purpose-built upload API (POST /api/upload).
 */

import path from 'path'
import { openAsBlob } from 'fs'

/**
 * Get supported upload extensions from the server.
 *
 * @param {object} options
 * @param {string} options.baseUrl - e.g. "http://192.168.1.50:3001"
 * @returns {Promise<string[]>}
 */
export async function getSupportedExtensions({ baseUrl }) {
  let res
  try {
    res = await fetch(`${baseUrl}/api/upload/supported-extensions`)
  } catch (err) {
    throw new Error(
      `Cannot reach server at ${baseUrl} — is photo-distributor running? (${err.message})`,
    )
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      body.error || `Failed to load supported extensions (HTTP ${res.status})`,
    )
  }

  const body = await res.json().catch(() => ({}))
  const extensions = Array.isArray(body.extensions) ? body.extensions : null
  if (!extensions || extensions.length === 0) {
    throw new Error('Server returned no supported extensions')
  }

  return extensions.map((ext) => String(ext).toLowerCase())
}

/**
 * Exchange credentials for a short-lived upload session token.
 * Avoids re-running bcrypt on every individual file upload.
 *
 * @param {object} options
 * @param {string} options.baseUrl   - e.g. "http://192.168.1.50:3001"
 * @param {string} options.user
 * @param {string} options.password
 * @returns {Promise<string>} bearer token
 */
export async function getUploadToken({ baseUrl, user, password }) {
  let res
  try {
    res = await fetch(`${baseUrl}/api/upload/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password }),
    })
  } catch (err) {
    throw new Error(
      `Cannot reach server at ${baseUrl} — is photo-distributor running? (${err.message})`,
    )
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Authentication failed (HTTP ${res.status})`)
  }

  const { token } = await res.json()
  return token
}

/**
 * Upload a list of files to photo-distributor via the HTTP API.
 *
 * @param {object}   options
 * @param {string}   options.baseUrl      - e.g. "http://192.168.1.50:3001"
 * @param {string}   options.token        - Bearer token from getUploadToken()
 * @param {string[]} options.files        - Absolute file paths to upload
 * @param {boolean}  [options.dryRun]     - List files without uploading
 * @param {function} [options.onProgress] - Called with (current, total, filePath, status, errMsg?)
 *   status: 'uploading' | 'done' | 'error' | 'skipped'
 *
 * @returns {Promise<{uploaded: number, skipped: number, failed: number}>}
 */
export async function uploadFiles({
  baseUrl,
  token,
  files,
  supportedExtensions,
  dryRun = false,
  onProgress,
}) {
  const stats = { uploaded: 0, skipped: 0, failed: 0 }

  // Filter to supported extensions
  const supported = files.filter((f) =>
    supportedExtensions.includes(path.extname(f).toLowerCase()),
  )
  stats.skipped += files.length - supported.length

  if (supported.length === 0) return stats

  if (dryRun) {
    for (let i = 0; i < supported.length; i++) {
      onProgress?.(i + 1, supported.length, supported[i], 'skipped')
    }
    stats.skipped += supported.length
    return stats
  }

  for (let i = 0; i < supported.length; i++) {
    const filePath = supported[i]
    const filename = path.basename(filePath)

    onProgress?.(i + 1, supported.length, filePath, 'uploading')

    try {
      const blob = await openAsBlob(filePath)
      const form = new FormData()
      form.append('file', blob, filename)

      const res = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })

      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 415) {
          throw new Error(
            body.error ||
              `Unsupported file type rejected by server (HTTP ${res.status})`,
          )
        }
        throw new Error(body.error || `Server error (HTTP ${res.status})`)
      }

      // Defensive handling: if server returns a JSON failure payload with 2xx,
      // surface it instead of treating the upload as successful.
      if (body.success === false) {
        throw new Error(body.error || 'Upload was rejected by server')
      }

      if (body.duplicate) {
        stats.skipped++
        onProgress?.(i + 1, supported.length, filePath, 'skipped')
      } else {
        stats.uploaded++
        onProgress?.(i + 1, supported.length, filePath, 'done')
      }
    } catch (err) {
      stats.failed++
      onProgress?.(i + 1, supported.length, filePath, 'error', err.message)
    }
  }

  return stats
}
