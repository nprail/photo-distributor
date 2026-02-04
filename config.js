// Unified configuration for the application
// All config values are loaded from environment variables with sensible defaults
import 'dotenv/config'
import path from 'path'
import os from 'os'

const config = {
  // FTP Server Settings
  ftpPort: process.env.FTP_PORT || 21,
  ftpHost: process.env.FTP_HOST || '0.0.0.0',
  pasvUrl: process.env.PASV_URL || '0.0.0.0',

  // Directory Settings
  photosDir: process.env.PHOTOS_DIR || path.join(process.cwd(), 'photos'),
  uploadDir: process.env.UPLOAD_DIR || path.join(os.tmpdir(), 'ftp-uploads'),
  logDir: process.env.LOG_DIR || path.join(process.cwd(), 'logs'),

  // Destination Settings
  destinations: {
    // Local filesystem destination (enabled by default)
    local: {
      enabled: process.env.DESTINATION_LOCAL_ENABLED !== 'false',
      photosDir: process.env.PHOTOS_DIR || path.join(process.cwd(), 'photos'),
    },

    // Google Drive destination
    googleDrive: {
      enabled: process.env.DESTINATION_GOOGLE_DRIVE_ENABLED === 'true',
      credentialsPath:
        process.env.GOOGLE_DRIVE_CREDENTIALS ||
        path.join(process.cwd(), 'config', 'google-drive-credentials.json'),
      tokenPath:
        process.env.GOOGLE_DRIVE_TOKEN ||
        path.join(process.cwd(), 'config', 'google-drive-token.json'),
      rootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || null,
    },

    // Google Photos destination
    googlePhotos: {
      enabled: process.env.DESTINATION_GOOGLE_PHOTOS_ENABLED === 'true',
      credentialsPath:
        process.env.GOOGLE_PHOTOS_CREDENTIALS ||
        path.join(process.cwd(), 'config', 'google-photos-credentials.json'),
      tokenPath:
        process.env.GOOGLE_PHOTOS_TOKEN ||
        path.join(process.cwd(), 'config', 'google-photos-token.json'),
    },
  },

  // Delete source file after successful upload to all destinations
  deleteAfterUpload: process.env.DELETE_AFTER_UPLOAD !== 'false',
}

export default config
