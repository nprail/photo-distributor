<p align="center">
  <img src="logo.svg" alt="Photo Distributor Logo" width="160" />
  <br /><br />
  <strong>Photo Distributor</strong>
  <br />
  <em>An FTP server that distributes photos to one or more destinations.</em>
  <br /><br />
  <a href="#installation"><img src="https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker Ready" /></a>
  <a href="#features"><img src="https://img.shields.io/badge/destinations-local%20%7C%20gdrive%20%7C%20gphotos-8b5cf6" alt="Destinations" /></a>
  <a href="#supported-file-formats"><img src="https://img.shields.io/badge/formats-JPEG%20%7C%20RAW%20%7C%20video-34d399" alt="Formats" /></a>
</p>

---

This service was originally built as an FTP endpoint for Canon cameras to automatically upload media to multiple locations including a NAS and Google Photos.

## Features

- **Multiple Destinations**: Upload to local storage, Google Drive, and Google Photos simultaneously
- **Automatic Organization**: Files are organized into `<destination-folder>/<yyyy>/<yyyy-mm-dd>/` based on their capture date
- **EXIF Metadata Extraction**: Reads capture date from photo EXIF data for accurate organization
- **Multiple Format Support**: Handles common photo and video formats including RAW files
- **Duplicate Detection**: Rejects exact duplicate files via SHA-256 hashing; renames files with the same name but different content
- **FTP Authentication**: Supports username/password authentication with bcrypt-hashed passwords
- **Web Dashboard**: Built-in React-based dashboard with real-time WebSocket updates for monitoring transfers, managing destinations, and configuring settings

## Supported File Formats

### Photos

- JPEG: `.jpg`, `.jpeg`
- PNG: `.png`
- HEIF: `.heic`, `.heif`
- WebP: `.webp`
- TIFF: `.tiff`, `.tif`
- Canon RAW: `.cr2`, `.cr3`

### Videos

- `.mp4`, `.mov`, `.avi`, `.mkv`, `.m4v`, `.3gp`, `.wmv`

## Installation

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/nprail/photo-distributor.git
cd photo-distributor

# Create required directories
mkdir -p data photos

# Copy example .env file and update with your settings
cp .env.example .env
# Edit .env and set PASV_URL to your server IP
nano .env

# Start with Docker Compose
docker compose up -d
```

Access the web dashboard at `http://localhost:3001` to configure settings.

See [docs/DOCKER.md](docs/DOCKER.md) for complete Docker deployment instructions, including **Synology NAS** setup.

### Using Node.js

```bash
# Install dependencies
npm install

# Copy example .env file and update with your settings
cp .env.example .env

# Start the server
npm start
```

## Usage

### Starting the Server

```bash
# Start with default settings (port 2121)
npm start

# With custom data directory
DATA_DIR=/path/to/data npm start
```

## Configuration

The server uses two types of configuration:

1. **Environment Variables** (in `.env` file) - Server startup settings that require a restart to change (ports, host bindings)
2. **Runtime Settings** - Stored in a LokiJS database (`data/photo-distributor.db`) and managed via the web dashboard without restarting

### Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and update the variables for your setup. Here are the available options:

| Variable       | Default                 | Description                                                                                                                              |
| -------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `FTP_PORT`     | `2121`                  | FTP server port. Use 2121+ to avoid requiring root privileges                                                                            |
| `FTP_HOST`     | `0.0.0.0`               | Host address to bind to. Use `0.0.0.0` for all interfaces or a specific IP                                                               |
| `PASV_URL`     | `0.0.0.0`               | **IMPORTANT**: Public IP or hostname for passive mode connections. Set this to your server's IP address that FTP clients will connect to |
| `FTP_TLS`      | `true`                  | Enable/disable TLS for FTPS. Set to `false` to disable (not recommended)                                                                |
| `FTP_TLS_CERT` |                         | Path to a custom TLS certificate file. If not set, a self-signed certificate is auto-generated                                           |
| `FTP_TLS_KEY`  |                         | Path to a custom TLS private key file. Must be provided together with `FTP_TLS_CERT`                                                    |
| `FTP_LOGIN_MAX_ATTEMPTS` | `5`           | Maximum failed login attempts before temporarily blocking an IP                                                                          |
| `FTP_LOGIN_WINDOW_MS`    | `900000`      | Rate limit window in milliseconds (default: 15 minutes)                                                                                  |
| `WEB_PORT`     | `3001`                  | Port for the web dashboard                                                                                                               |
| `WEB_BASE_URL` | `http://localhost:3001` | Base URL for the web dashboard, used for Google OAuth redirect URIs                                                                      |
| `DATA_DIR`     | `./data`                | Base directory for config, logs, and temp files. Subdirectories: `config/`, `logs/`, `temp/`                                             |
| `NODE_ENV`     | `production`            | Node.js environment mode                                                                                                                 |

**Important Notes:**

- `.env` is **not** committed to git (see `.gitignore`) - keep your local configuration private
- `.env.example` shows example values and should be committed to version control

## Destinations

Files are automatically uploaded to configured destinations, each organizing them into date-based folders. Available destinations include:

- **Local Filesystem** (enabled by default)
- **Google Drive** (OAuth 2.0 setup required)
- **Google Photos** (OAuth 2.0 setup required)

Multiple destinations can be enabled simultaneously to upload files to all of them.

All destination settings are configured through the web dashboard at `http://localhost:3001` under the Settings tab.

See [docs/DESTINATIONS.md](docs/DESTINATIONS.md) for detailed destination configuration, file organization, and setup instructions.

## Behavior

### Unsupported Files

Files with unsupported extensions are silently discarded.

## Technical Details

### Passive Mode

The server uses passive mode ports 1024-1048 for data connections. This range can be adjusted in the source code if needed.

## Troubleshooting

### Files not being organized correctly

1. Check that the file has valid EXIF metadata
2. Verify the file extension is in the supported list
3. Check server logs for error messages

### Cannot connect from other devices

Ensure the server is binding to all interfaces and the passive URL is correct:

```bash
FTP_HOST=0.0.0.0 PASV_URL=<your-local-ip> npm start
```

## Security

This application includes several security features to protect against unauthorized access:

- **FTPS (Explicit TLS)**: TLS encryption is enabled by default using an auto-generated self-signed certificate. Clients connect via `AUTH TLS` for encrypted data and command channels. You can provide your own certificate via `FTP_TLS_CERT` and `FTP_TLS_KEY` environment variables.
- **Authentication Rate Limiting**: Failed login attempts are tracked per IP address. After 5 failed attempts (configurable via `FTP_LOGIN_MAX_ATTEMPTS`), the IP is temporarily blocked for 15 minutes (configurable via `FTP_LOGIN_WINDOW_MS`).
- **Bcrypt Password Hashing**: FTP passwords are stored using bcrypt hashing with salt rounds.

**Key security considerations:**

- Web dashboard has no authentication — do **not** expose the web dashboard (port 3001) to the public internet without additional protection (e.g., a reverse proxy with authentication, VPN, or firewall rules)
- Set `FTP_TLS=false` to disable TLS if needed (not recommended for public access)

## License

UNLICENSED
