import path from 'path'
import { promises as fs } from 'fs'
import { BaseDestination } from './base.js'
import { formatDateForPath } from '../distributor.js'

/**
 * Local filesystem destination for organizing files
 * This is the original behavior of the application
 */
export class LocalDestination extends BaseDestination {
  constructor(config = {}) {
    super(config)
    this.name = 'local'
    this.photosDir = config.photosDir
  }

  /**
   * Initialize the local destination
   */
  async initialize() {
    if (!this.photosDir) {
      throw new Error('Local destination requires photosDir config')
    }

    await fs.mkdir(this.photosDir, { recursive: true })
  }

  /**
   * Check if the destination is ready
   */
  async isReady() {
    try {
      await fs.access(this.photosDir)
      return true
    } catch {
      return false
    }
  }

  /**
   * Upload (move) a file to the local organized directory
   */
  async upload(filePath, metadata) {
    const { year, folder } = formatDateForPath(metadata.date || new Date())
    const destDir = path.join(this.photosDir, year, folder)
    await fs.mkdir(destDir, { recursive: true })

    const originalFilename =
      metadata.destinationFilename ||
      metadata.originalFilename ||
      path.basename(filePath)
    const ext = path.extname(originalFilename).toLowerCase()

    let destFilename = originalFilename
    let destPath = path.join(destDir, destFilename)
    let counter = 1

    while (await this.fileExists(destPath)) {
      const baseName = path.basename(originalFilename, ext)
      destFilename = `${baseName}_${counter}${ext}`
      destPath = path.join(destDir, destFilename)
      counter++
    }

    // Copy file instead of move so other destinations can use it
    await fs.copyFile(filePath, destPath)

    return {
      destinationPath: destPath,
      folderPath: `${year}/${folder}`,
      filename: destFilename,
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}
