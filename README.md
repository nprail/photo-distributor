# Photos FTP Uploader

An FTP server that automatically organizes uploaded photos and videos into date-based folders by extracting metadata from the files.

## Features

- **Automatic Organization**: Files are automatically moved to `photos/<yyyy>/<yyyy-mm-dd>/` based on their capture date
- **EXIF Metadata Extraction**: Reads capture date from photo EXIF data for accurate organization
- **Multiple Format Support**: Handles common photo and video formats including RAW files
- **Duplicate Handling**: Automatically renames files if a file with the same name already exists
- **Anonymous FTP Access**: Simple setup with no authentication required (can be customized)

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

```bash
npm install
```

## Usage

### Starting the Server

```bash
# Start with default settings (port 21, requires root/admin)
npm start

# Start on a non-privileged port (recommended)
FTP_PORT=2121 npm start

# With custom photos directory
FTP_PORT=2121 PHOTOS_DIR=/path/to/photos npm start
```

### Connecting to the Server

Use any FTP client to connect:

```bash
# Command line FTP
ftp localhost 2121

# Or use GUI clients like FileZilla, Cyberduck, etc.
# Host: localhost (or your server IP)
# Port: 2121 (or your configured port)
# Username: any (anonymous access)
# Password: any
```

## Configuration

The server is configured using environment variables. You can create a `.env` file in the project root to define these values, or set them directly when running the server.

### FTP Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `FTP_PORT` | `21` | FTP server port. Use 2121+ to avoid requiring root privileges |
| `FTP_HOST` | `0.0.0.0` | Host address to bind to. Use `0.0.0.0` for all interfaces or a specific IP |
| `PASV_URL` | `0.0.0.0` | Public IP for passive mode connections (important for remote clients) |

### Directory Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PHOTOS_DIR` | `./photos` | Directory where organized photos will be stored |
| `UPLOAD_DIR` | System temp dir | Temporary directory for FTP uploads during processing |
| `LOG_DIR` | `./logs` | Directory where upload logs will be stored |

### Destination Configuration

Each destination can be independently enabled or disabled:

#### Local Filesystem
| Variable | Default | Description |
|----------|---------|-------------|
| `DESTINATION_LOCAL_ENABLED` | `true` | Enable/disable local filesystem destination |
| `PHOTOS_DIR` | `./photos` | Where to store organized photos locally |

#### Google Drive
| Variable | Default | Description |
|----------|---------|-------------|
| `DESTINATION_GOOGLE_DRIVE_ENABLED` | `false` | Enable/disable Google Drive uploads |
| `GOOGLE_DRIVE_CREDENTIALS` | `./config/google-drive-credentials.json` | Path to Google Drive credentials file |
| `GOOGLE_DRIVE_TOKEN` | `./config/google-drive-token.json` | Path to Google Drive token file |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | (none) | Optional: Root folder ID in Google Drive for uploads |

#### Google Photos
| Variable | Default | Description |
|----------|---------|-------------|
| `DESTINATION_GOOGLE_PHOTOS_ENABLED` | `false` | Enable/disable Google Photos uploads |
| `GOOGLE_PHOTOS_CREDENTIALS` | `./config/google-photos-credentials.json` | Path to Google Photos credentials file |
| `GOOGLE_PHOTOS_TOKEN` | `./config/google-photos-token.json` | Path to Google Photos token file |

### General Options

| Variable | Default | Description |
|----------|---------|-------------|
| `DELETE_AFTER_UPLOAD` | `true` | Delete source file after successful upload to all destinations |

### Example Configurations

**Local development:**
```bash
FTP_PORT=2121 npm start
```

**Network accessible (LAN):**
```bash
FTP_PORT=2121 FTP_HOST=0.0.0.0 PASV_URL=192.168.1.100 npm start
```

**With Google Drive and local storage:**
```bash
FTP_PORT=2121 \
DESTINATION_LOCAL_ENABLED=true \
DESTINATION_GOOGLE_DRIVE_ENABLED=true \
GOOGLE_DRIVE_CREDENTIALS=./config/google-drive-credentials.json \
GOOGLE_DRIVE_TOKEN=./config/google-drive-token.json \
npm start
```

**Sample .env file:**
```env
FTP_PORT=2121
FTP_HOST=0.0.0.0
PASV_URL=192.168.1.100

PHOTOS_DIR=/path/to/photos
LOG_DIR=/path/to/logs

DESTINATION_LOCAL_ENABLED=true
DESTINATION_GOOGLE_DRIVE_ENABLED=false
DESTINATION_GOOGLE_PHOTOS_ENABLED=false

DELETE_AFTER_UPLOAD=true
```

## Destinations

Files are automatically uploaded to configured destinations, each organizing them into date-based folders. Available destinations include:

- **Local Filesystem** (enabled by default)
- **Google Drive** (OAuth 2.0 setup required)
- **Google Photos** (OAuth 2.0 setup required)

Multiple destinations can be enabled simultaneously to upload files to all of them.

See [docs/DESTINATIONS.md](docs/DESTINATIONS.md) for detailed setup instructions and configuration options.

## Behavior

### Date Extraction Priority

For photos, the server attempts to extract the capture date from EXIF metadata in the following order:

1. `DateTimeOriginal` - When the photo was originally taken
2. `CreateDate` - When the digital file was created
3. `DateTimeDigitized` - When the image was digitized
4. `DateTime` - General date/time tag
5. `GPSDateStamp` - Date from GPS data

If no EXIF date is found (or for video files), the server falls back to:
- File birth time (creation date)
- File modification time

### File Organization

Files are organized into the following structure:

```
photos/
├── 2024/
│   ├── 2024-01-15/
│   │   ├── IMG_001.jpg
│   │   └── IMG_002.cr2
│   └── 2024-03-22/
│       └── vacation.mp4
└── 2025/
    └── 2025-12-25/
        ├── christmas.heic
        └── christmas_1.heic  # Renamed duplicate
```

### Duplicate File Handling

When a file with the same name already exists in the destination folder:
- The new file is renamed with a numeric suffix: `filename_1.jpg`, `filename_2.jpg`, etc.
- Original file extension is preserved
- Counter increments until a unique name is found

### Unsupported Files

Files with unsupported extensions are logged and discarded. They are not moved to the photos directory.

## Technical Details

### Temporary Upload Directory

Uploaded files are first stored in a temporary directory (`/tmp/ftp-uploads` or OS equivalent) before being processed and moved to their final destination. This ensures atomic file operations.

### Passive Mode

The server uses passive mode ports 1024-1048 for data connections. This range can be adjusted in the source code if needed.

## Troubleshooting

### "Port requires elevated privileges"

Ports below 1024 (including default FTP port 21) require root/administrator access. Solution:
```bash
FTP_PORT=2121 npm start
```

### Files not being organized correctly

1. Check that the file has valid EXIF metadata
2. Verify the file extension is in the supported list
3. Check server logs for error messages

### Cannot connect from other devices

Ensure the server is binding to all interfaces and the passive URL is correct:
```bash
FTP_HOST=0.0.0.0 PASV_URL=<your-local-ip> FTP_PORT=2121 npm start
```

## License

UNLICENSED
