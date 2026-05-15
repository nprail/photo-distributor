<p align="center">
	<a href="https://github.com/nprail/photo-distributor">
		<img src="https://raw.githubusercontent.com/nprail/photo-distributor/main/logo.svg" alt="photo-distributor logo" width="140" />
	</a>
	<br /><br />
	<strong>photo-distributor CLI</strong>
	<br />
	<em>Command-line uploader for <a href="https://github.com/nprail/photo-distributor">photo-distributor</a></em>
</p>

Command-line uploader for sending photos and videos from an SD card (or any folder) to a running [photo-distributor](https://github.com/nprail/photo-distributor) server.

## What it does

- Auto-detects mounted camera/SD card volumes by looking for a `DCIM` directory
- Recursively scans for supported media files
- Uploads files to the [photo-distributor](https://github.com/nprail/photo-distributor) upload API
- Skips duplicates reported by the server
- Supports dry-run mode to preview uploads
- Saves default server credentials locally for repeat use

## Install

From npm (global install):

```bash
npm install -g photo-distributor-cli
```

This installs the `pd-upload` command globally on your machine.

If you prefer not to install globally, run it with `npx`:

```bash
npx photo-distributor-cli <command> [options]
```

## Quick start

```bash
# Auto-detect SD card, then upload from selected DCIM folder
pd-upload

# Upload from a specific folder
pd-upload upload /Volumes/CANON/DCIM

# Default command is upload, so this is equivalent
pd-upload /Volumes/CANON/DCIM

# Preview files without uploading
pd-upload --dry-run /Volumes/CANON/DCIM
```

## Commands

| Command                     | Description                                                              |
| --------------------------- | ------------------------------------------------------------------------ |
| `pd-upload [source]`        | Default command. Upload from `source`, or auto-detect SD card if omitted |
| `pd-upload upload [source]` | Explicit upload command                                                  |
| `pd-upload detect`          | List detected SD cards / camera storage volumes                          |
| `pd-upload config`          | Show or save default connection settings                                 |

## Connection options

These apply to `upload` and `config`:

| Option                  | Description                                      | Default                 |
| ----------------------- | ------------------------------------------------ | ----------------------- |
| `--url <url>`           | Server URL (`http` or `https`)                   | `http://localhost:3001` |
| `--user <user>`         | Username                                         | `pd`                    |
| `--password <password>` | Password                                         | prompted if missing     |
| `--dry-run`             | List files that would be uploaded, do not upload | off                     |

## Save defaults once

```bash
pd-upload config --url http://192.168.1.50:3001 --user pd --password mysecret
```

Then run uploads without repeating flags:

```bash
pd-upload
```

The CLI stores settings in:

- `~/.photo-distributor.json`

## SD card detection behavior

The CLI checks mounted volumes and keeps entries containing a `DCIM` directory.

- macOS: `/Volumes/*`
- Linux: `/media/<user>/*`, `/media/*`, `/run/media/*`, `/mnt/*`
- Windows: drive letters `A:\` through `Z:\`

## Supported file types

Photos:

- `.jpg`, `.jpeg`, `.png`, `.heic`, `.heif`, `.webp`, `.tiff`, `.tif`, `.cr2`, `.cr3`

Videos:

- `.mp4`, `.mov`, `.avi`, `.mkv`, `.m4v`, `.3gp`, `.wmv`

## Typical workflow

```bash
# 1) Verify server is running
#    Example: http://localhost:3001

# 2) Save connection once
pd-upload config --url http://localhost:3001 --user pd

# 3) Detect card
pd-upload detect

# 4) Dry-run first
pd-upload --dry-run

# 5) Upload
pd-upload
```

## Troubleshooting

### Authentication failed

- Confirm `--user` and `--password`
- Re-save credentials with `pd-upload config`

### Cannot reach server

- Confirm server URL and port, for example `http://localhost:3001`
- Make sure [photo-distributor](https://github.com/nprail/photo-distributor) is running and reachable from this machine

### No SD cards detected

- Provide a source path explicitly, for example:

```bash
pd-upload /path/to/media
```

### No files found

- Confirm files are under the selected folder
- Confirm file extensions are in the supported list above
