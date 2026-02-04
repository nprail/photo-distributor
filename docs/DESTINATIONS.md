# Destinations Configuration

This document explains how to configure different upload destinations for the Photos FTP Uploader.

## Overview

The modular destination system allows you to upload files to multiple destinations simultaneously. Each destination is independent and can be enabled/disabled via environment variables.

## Available Destinations

### 1. Local Filesystem (Default)

Files are organized into date-based folders on your local filesystem.

**Configuration:**

```bash
DESTINATION_LOCAL_ENABLED=true  # Default: true
PHOTOS_DIR=/path/to/photos       # Default: ./photos
```

### 2. Google Drive

Upload files to Google Drive with automatic folder organization.

**Configuration:**

```bash
DESTINATION_GOOGLE_DRIVE_ENABLED=true
GOOGLE_DRIVE_CREDENTIALS=/path/to/credentials.json
GOOGLE_DRIVE_TOKEN=/path/to/token.json
GOOGLE_DRIVE_ROOT_FOLDER_ID=optional_folder_id
```

**Setup:**

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Google Drive API**
3. Create OAuth 2.0 credentials (Desktop app type)
4. Download the credentials JSON file to `config/google-drive-credentials.json`
5. Open the web dashboard in your browser
6. Go to the Destinations section and follow the prompts to connect your Google account
7. Set the environment variables above

### 3. Google Photos

Upload files directly to Google Photos with automatic album organization.

**Configuration:**

```bash
DESTINATION_GOOGLE_PHOTOS_ENABLED=true
GOOGLE_PHOTOS_CREDENTIALS=/path/to/credentials.json
GOOGLE_PHOTOS_TOKEN=/path/to/token.json
```

**Setup:**

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Photos Library API**
3. Create OAuth 2.0 credentials (Desktop app type)
4. Download the credentials JSON file to `config/google-photos-credentials.json`
5. Open the web dashboard in your browser
6. Go to the Destinations section and follow the prompts to connect your Google account
7. Set the environment variables above

## Example .env File

```bash
# FTP Server
FTP_PORT=2121
FTP_HOST=0.0.0.0
PASV_URL=192.168.1.100

# Local Destination
DESTINATION_LOCAL_ENABLED=true
PHOTOS_DIR=/path/to/photos

# Google Drive Destination
DESTINATION_GOOGLE_DRIVE_ENABLED=true
GOOGLE_DRIVE_CREDENTIALS=./config/google-drive-credentials.json
GOOGLE_DRIVE_TOKEN=./config/google-drive-token.json

# Google Photos Destination
DESTINATION_GOOGLE_PHOTOS_ENABLED=true
GOOGLE_PHOTOS_CREDENTIALS=./config/google-photos-credentials.json
GOOGLE_PHOTOS_TOKEN=./config/google-photos-token.json

# Delete source file after successful upload
DELETE_AFTER_UPLOAD=true
```

## Adding New Destinations

To add a new destination:

1. Create a new file in `lib/destinations/` extending `BaseDestination`
2. Implement the required methods: `initialize()`, `upload()`, `isReady()`
3. Register the destination in `server.js`
4. Add configuration options to `config.js`

Example:

```javascript
import { BaseDestination } from './base.js'

export class MyCustomDestination extends BaseDestination {
  constructor(config = {}) {
    super(config)
    this.name = 'my-custom'
  }

  async initialize() {
    // Setup logic
  }

  async isReady() {
    return true
  }

  async upload(filePath, metadata) {
    // Upload logic
    return { success: true }
  }
}
```

## File Metadata

When uploading, each destination receives metadata about the file:

```javascript
{
  originalFilename: 'IMG_1234.jpg',
  destinationFilename: 'IMG_1234.jpg',
  date: Date,           // Extracted from EXIF or file stats
  mimeType: 'image/jpeg',
  extension: '.jpg'
}
```

## Logging

All uploads are logged to `logs/uploads.jsonl` with destination-specific information:

```json
{
  "timestamp": "2026-01-30T12:00:00.000Z",
  "original": "/tmp/ftp-uploads/IMG_1234.jpg",
  "destination": "google-drive",
  "result": {
    "fileId": "abc123",
    "webViewLink": "https://drive.google.com/..."
  }
}
```
