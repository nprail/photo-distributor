import path from 'path'
import { promises as fs } from 'fs'
import { createWriteStream } from 'fs'
import { organizeFile } from './organize.js'
import settings from './settings.js'
import config from '../config.js'

const LOG = false

export class PhotoFileSystem {
  log(message) {
    if (!LOG) return

    console.log(`[photos-fs] ${message}`)
  }

  constructor(connection, { SUPPORTED_EXTENSIONS }) {
    this.connection = connection
    this.SUPPORTED_EXTENSIONS = SUPPORTED_EXTENSIONS

    this.log('Initialized PhotoFileSystem', {
      SUPPORTED_EXTENSIONS,
    })
  }

  async get(fileName) {
    this.log(`get: ${fileName}`)

    return {
      name: path.basename(fileName),
      isDirectory: () => true,
      size: 0,
      mtime: new Date(),
      mode: 0o100644,
      uid: process.getuid ? process.getuid() : 0,
      gid: process.getgid ? process.getgid() : 0,
      path: fileName,
    }
  }

  // unused by Canon FTP
  currentDirectory() {
    return '/'
  }

  // unused by Canon FTP
  async chdir(dir) {
    return
  }

  async list(dir = '.') {
    this.log(`list: ${dir}`)
    return []
  }

  // unused by Canon FTP
  async mkdir(dir) {
    this.log(`mkdir: ${dir}`)

    return
  }

  async write(fileName, { append = false } = {}) {
    this.log(`write: ${fileName}`)

    const tempPath = path.join(
      config.uploadDir,
      `${Date.now()}-${path.basename(fileName)}`,
    )
    await fs.mkdir(config.uploadDir, { recursive: true })
    const writeStream = createWriteStream(tempPath, {
      flags: append ? 'a' : 'w',
    })
    writeStream.originalFilename = path.basename(fileName)
    writeStream.tempPath = tempPath
    writeStream.on('finish', async () => {
      try {
        await organizeFile(
          tempPath,
          writeStream.originalFilename,
          settings.photosDir,
          this.SUPPORTED_EXTENSIONS,
        )
      } catch (error) {
        try {
          await fs.unlink(tempPath)
        } catch {}
      }
    })
    return {
      stream: writeStream,
      clientPath: fileName,
    }
  }

  // unused by Canon FTP
  async read(fileName) {
    this.log(`read: ${fileName}`)

    return
  }

  // unused by Canon FTP
  async delete(fileName) {
    this.log(`delete: ${fileName}`)
    return
  }

  // unused by Canon FTP
  async rename(from, to) {
    this.log(`rename: ${from} - ${to}`)
    return
  }

  // unused by Canon FTP
  async chmod(fileName, mode) {
    this.log(`chmod: ${fileName} to ${mode}`)
    return
  }

  // unused by Canon FTP
  async getUniqueName(fileName) {
    this.log(`getUniqueName: ${fileName}`)
    return
  }
}
