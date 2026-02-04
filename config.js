// Environment variable based configuration
// These settings require a server restart to change
import 'dotenv/config'

const config = {
  // FTP Server Settings
  ftpPort: parseInt(process.env.FTP_PORT, 10) || 21,
  ftpHost: process.env.FTP_HOST || '0.0.0.0',
  pasvUrl: process.env.PASV_URL || '0.0.0.0',

  // Web Dashboard Settings
  webPort: parseInt(process.env.WEB_PORT, 10) || 3001,
}

export default config
