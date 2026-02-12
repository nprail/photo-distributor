// Environment variable based configuration
// These settings require a server restart to change
import 'dotenv/config'
import path from 'path'

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data')

const configDir = path.join(dataDir, 'config')

// Docker environment detection
const isDocker = process.env.DOCKER_ENV === 'true'

const config = {
  // Docker environment flag
  isDocker,

  // FTP Server Settings
  ftpPort: parseInt(process.env.FTP_PORT, 10) || 2121,
  ftpHost: process.env.FTP_HOST || '0.0.0.0',
  pasvUrl: process.env.PASV_URL || '0.0.0.0',

  // TLS Settings
  // Set FTP_TLS=false to explicitly disable TLS (not recommended for public access)
  tlsEnabled: process.env.FTP_TLS !== 'false',
  // Optional: provide custom cert/key paths (otherwise auto-generated self-signed cert is used)
  tlsCert: process.env.FTP_TLS_CERT || '',
  tlsKey: process.env.FTP_TLS_KEY || '',

  // Rate Limiting Settings
  loginMaxAttempts: parseInt(process.env.FTP_LOGIN_MAX_ATTEMPTS, 10) || 5,
  loginWindowMs: parseInt(process.env.FTP_LOGIN_WINDOW_MS, 10) || 15 * 60 * 1000,

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
