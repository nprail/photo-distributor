import { promises as fs } from 'fs'
import path from 'path'
import { exiftool } from 'exiftool-vendored'

export const PHOTO_EXTENSIONS = [
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
]

export async function extractDateFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  try {
    if (PHOTO_EXTENSIONS.includes(ext)) {
      // Use exiftool-vendored for robust EXIF extraction (CR3/CR2 supported)
      const tags = await exiftool.read(filePath)
      const dateFields = [
        'DateTimeOriginal',
        'CreateDate',
        'DateTimeDigitized',
        'DateTime',
        'GPSDateStamp',
      ]

      for (const field of dateFields) {
        if (tags[field]) {
          const imageDate = tags[field]

          const parsed = imageDate?.toDate()

          if (parsed) {
            return parsed
          }
        }
      }
    }

    const stats = await fs.stat(filePath)
    const fileDate =
      stats.birthtime && stats.birthtime.getTime() > 0
        ? stats.birthtime
        : stats.mtime
    return fileDate
  } catch (error) {
    console.log('Failed to extract EXIF date for', filePath, error)
    return new Date()
  }
}
