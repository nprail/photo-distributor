/**
 * SD card detection.
 * Looks for removable volumes / mount-points that contain a DCIM folder,
 * which is the standard structure used by digital cameras and phones.
 *
 * Supported platforms: macOS, Linux (including Raspberry Pi / desktop),
 * and Windows (drive letters).
 */

import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

/**
 * Platform-specific root paths to search for mounted volumes.
 */
function getCandidateRoots() {
  const platform = os.platform()

  if (platform === 'darwin') {
    // macOS — all volumes appear under /Volumes
    return ['/Volumes']
  }

  if (platform === 'win32') {
    // Windows — iterate drive letters A–Z and check each one
    return Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(65 + i) + ':\\',
    )
  }

  // Linux / other Unix-like systems
  const username = os.userInfo().username
  return [
    `/media/${username}`, // Ubuntu / Debian desktop automount
    '/media',
    '/run/media',
    '/mnt',
  ]
}

/**
 * Return true if the given path is a directory that exists.
 */
async function isDir(p) {
  try {
    return (await fs.stat(p)).isDirectory()
  } catch {
    return false
  }
}

/**
 * Return the immediate child directories of a directory.
 */
async function listDirs(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries
      .filter((e) => e.isDirectory() || e.isSymbolicLink())
      .map((e) => path.join(dir, e.name))
  } catch {
    return []
  }
}

/**
 * Recursively find all photo/video files under a directory tree that have
 * a supported extension.
 *
 * @param {string} dir
 * @param {string[]} extensions - lower-cased extensions including the dot, e.g. ['.jpg', '.cr3']
 * @returns {Promise<string[]>} absolute file paths
 */
export async function findMediaFiles(dir, extensions) {
  const results = []

  async function walk(current) {
    let entries
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch {
      return
    }

    await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(current, entry.name)
        if (entry.isDirectory()) {
          await walk(full)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (extensions.includes(ext)) {
            results.push(full)
          }
        }
      }),
    )
  }

  await walk(dir)
  return results
}

/**
 * Detect SD cards / camera storage volumes.
 * Returns an array of objects: { name, path, dcimPath }
 *
 * @returns {Promise<Array<{name: string, path: string, dcimPath: string}>>}
 */
export async function detectSdCards() {
  const found = []
  const roots = getCandidateRoots()

  for (const root of roots) {
    if (!(await isDir(root))) continue

    const children = await listDirs(root)

    for (const volumePath of children) {
      // Skip the macOS "Macintosh HD" re-mount which is just the main drive
      const volName = path.basename(volumePath)
      if (volName === 'Macintosh HD') continue

      const dcimPath = path.join(volumePath, 'DCIM')
      if (await isDir(dcimPath)) {
        found.push({
          name: volName,
          path: volumePath,
          dcimPath,
        })
      }
    }
  }

  return found
}
