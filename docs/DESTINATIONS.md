# Destinations Configuration

This document explains how to configure different upload destinations for Photo Distributor.

## Overview

The modular destination system allows you to upload files to multiple destinations simultaneously. Each destination is independent and can be enabled/disabled via the web dashboard.

All destination settings are stored in `config/settings.json` and can be managed through the web dashboard at `http://localhost:3001` under the Settings tab. Changes take effect immediately when you click Save.

## Available Destinations

### 1. Local Filesystem (Default)

Files are organized into date-based folders on your local filesystem.

**Settings (via web dashboard):**

- **Enabled**: Toggle on/off
- **Photos Directory**: Path where organized photos are stored (default: `./photos`)

### 2. Google Drive

Upload files to Google Drive with automatic folder organization.

**Settings (via web dashboard):**

- **Enabled**: Toggle on/off
- **Root Folder ID**: Optional folder ID to upload into (leave empty to create a 'Photos' folder)

**Setup:**

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Google Drive API**
3. Create OAuth 2.0 credentials (Desktop app type)
4. Download the credentials JSON file to `config/google-drive-credentials.json`
5. Open the web dashboard and go to the Destinations tab
6. Click "Connect" next to Google Drive and authorize access
7. Enable Google Drive in the Settings tab

### 3. Google Photos

Upload files directly to Google Photos with automatic album organization.

**Settings (via web dashboard):**

- **Enabled**: Toggle on/off

**Setup:**

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Photos Library API**
3. Create OAuth 2.0 credentials (Desktop app type)
4. Download the credentials JSON file to `config/google-photos-credentials.json`
5. Open the web dashboard and go to the Destinations tab
6. Click "Connect" next to Google Photos and authorize access
7. Enable Google Photos in the Settings tab

## Example settings.json

```json
{
  "ftp": {
    "username": "anonymous",
    "password": "anonymous"
  },
  "directories": {
    "photosDir": "./photos",
    "logDir": "./logs"
  },
  "deleteAfterUpload": true,
  "destinations": {
    "local": {
      "enabled": true,
      "photosDir": "./photos"
    },
    "googleDrive": {
      "enabled": true,
      "credentialsPath": "./config/google-drive-credentials.json",
      "tokenPath": "./config/google-drive-token.json",
      "rootFolderId": null
    },
    "googlePhotos": {
      "enabled": false,
      "credentialsPath": "./config/google-photos-credentials.json",
      "tokenPath": "./config/google-photos-token.json"
    }
  }
}
```

Note: It's recommended to use the web dashboard to edit settings rather than manually editing this file.

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
