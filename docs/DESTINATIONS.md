# Destinations Configuration

This document explains how to configure different upload destinations for Photo Distributor.

## Overview

The modular destination system allows you to upload files to multiple destinations simultaneously. Each destination is independent and can be enabled/disabled via the web dashboard.

All destination settings are stored in a LokiJS database (`data/photo-distributor.db`) and can be managed through the web dashboard at `http://localhost:3001` under the Settings tab. Changes take effect immediately when you click Save.

## Available Destinations

### 1. Local Filesystem (Default)

Files are organized into date-based folders on your local filesystem.

**Settings (via web dashboard):**

- **Enabled**: Toggle on/off
- **Photos Directory**: Path where organized photos are stored (default: `./photos`)

#### File Organization

Files are automatically organized into date-based folders:

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

Structure: `<destination-folder>/<yyyy>/<yyyy-mm-dd>/`

#### Date Extraction Priority

For photos, the server attempts to extract the capture date from EXIF metadata in the following order:

1. `DateTimeOriginal` - When the photo was originally taken
2. `CreateDate` - When the digital file was created
3. `DateTimeDigitized` - When the image was digitized
4. `DateTime` - General date/time tag
5. `GPSDateStamp` - Date from GPS data

If no EXIF date is found (or for video files), the server falls back to:

- File birth time (creation date)
- File modification time

#### Duplicate Handling

Duplicates are handled at two levels:

1. **Hash-based rejection**: Before processing, each file's SHA-256 hash is checked against all previously received files. Exact duplicates are rejected entirely.
2. **Filename conflicts**: When a file with the same name already exists in the destination folder, the new file is renamed with a numeric suffix: `filename_1.jpg`, `filename_2.jpg`, etc.

#### Temporary Upload Directory

Uploaded files are first stored in a temporary directory (`data/temp/`) before being processed and copied to their final destination(s).

### 2. Google Drive

Upload files to Google Drive with automatic folder organization.

**Settings (via web dashboard):**

- **Enabled**: Toggle on/off
- **Root Folder ID**: Optional folder ID to upload into (leave empty to create a 'Photos' folder)

**Setup:**

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Google Drive API**
3. Create OAuth 2.0 credentials (Desktop app type)
4. Download the credentials JSON file from Google Cloud Console
5. Start the server and open the web dashboard at `http://localhost:3001`
6. Go to the Destinations tab
7. **Upload your credentials** by clicking "Upload Credentials" next to Google Drive and selecting your downloaded JSON file
8. Click "Connect" to authorize access in your browser
9. Enable Google Drive in the Settings tab

### 3. Google Photos

Upload files directly to Google Photos with automatic album organization.

**Settings (via web dashboard):**

- **Enabled**: Toggle on/off

**Setup:**

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Photos Library API**
3. Create OAuth 2.0 credentials (Desktop app type)
4. Download the credentials JSON file from Google Cloud Console
5. Start the server and open the web dashboard at `http://localhost:3001`
6. Go to the Destinations tab
7. **Upload your credentials** by clicking "Upload Credentials" next to Google Photos and selecting your downloaded JSON file
8. Click "Connect" to authorize access in your browser
9. Enable Google Photos in the Settings tab

## Adding New Destinations

To add a new destination:

1. Create a new file in `lib/destinations/` extending `BaseDestination`
2. Implement the required methods: `initialize()`, `upload()`, `isReady()`
3. Export the destination class from `lib/destinations/index.js`
4. Add default configuration to `lib/settings.js`
5. Register the destination in `server.js` `setupDestinations()`

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
  extension: '.jpg',
  receivedId: 'recv-...' // Internal tracking ID
}
```

## Logging

All activity is logged to two JSONL files in the `data/logs/` directory:

- **`received.jsonl`** - Records every file received via FTP
- **`destinations.jsonl`** - Records each upload to a destination with success/failure status

These files serve as an audit trail.
