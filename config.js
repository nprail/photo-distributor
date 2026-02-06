// Environment variable based configuration
// These settings require a server restart to change
import 'dotenv/config'
import path from 'path'

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data')

const configDir = path.join(dataDir, 'config')

const config = {
  // FTP Server Settings
  ftpPort: parseInt(process.env.FTP_PORT, 10) || 2121,
  ftpHost: process.env.FTP_HOST || '0.0.0.0',
  pasvUrl: process.env.PASV_URL || '0.0.0.0',

  // Web Dashboard Settings
  webPort: parseInt(process.env.WEB_PORT, 10) || 3001,
  webBaseUrl: process.env.WEB_BASE_URL || 'http://localhost:3001',

  // Directory Settings
  dataDir,
  configDir,
  logDir: path.join(dataDir, 'logs'),
  uploadDir: path.join(dataDir, 'temp'),

  // Standardized credential/token paths
  googleDriveCredentialsPath: path.join(configDir, 'google-drive-credentials.json'),
  googleDriveTokenPath: path.join(configDir, 'google-drive-token.json'),
  googlePhotosCredentialsPath: path.join(configDir, 'google-photos-credentials.json'),
  googlePhotosTokenPath: path.join(configDir, 'google-photos-token.json'),
}

export default config
