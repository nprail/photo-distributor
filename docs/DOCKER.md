# Docker Deployment Guide

This guide explains how to deploy Photo Distributor using Docker, with specific instructions for Synology NAS.

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Synology NAS Deployment](#synology-nas-deployment)
- [Environment Variables](#environment-variables)
- [Volume Mounts](#volume-mounts)
- [Networking](#networking)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:

   ```bash
   git clone https://github.com/nprail/photo-distributor.git
   cd photo-distributor
   ```

2. Create required directories:

   ```bash
   mkdir -p data photos
   ```

3. Set up environment configuration:

   ```bash
   # Copy example configuration
   cp .env.example .env

   # Edit .env and set PASV_URL to your NAS/server IP
   nano .env
   ```

   Minimal `.env` example:

   ```env
   FTP_PORT=2121
   FTP_HOST=0.0.0.0
   PASV_URL=192.168.1.100    # Change to your NAS/server IP
   WEB_PORT=3001
   PHOTOS_DIR=./photos
   ```

4. Start the container:

   ```bash
   docker compose up -d
   ```

5. Access the web dashboard at `http://your-server-ip:3001` to configure FTP credentials and destinations

### Using Docker Run

If not using Docker Compose, you can run the container directly with environment variables:

```bash
docker build -t photo-distributor .

docker run -d \
  --name photo-distributor \
  --restart unless-stopped \
  -p 2121:2121 \
  -p 1024-1048:1024-1048 \
  -p 3001:3001 \
  -e FTP_PORT=2121 \
  -e FTP_HOST=0.0.0.0 \
  -e PASV_URL=192.168.1.100 \
  -e WEB_PORT=3001 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/photos:/data/photos \
  photo-distributor
```

Alternatively, use `--env-file`:

```bash
docker run -d \
  --name photo-distributor \
  --restart unless-stopped \
  -p 2121:2121 \
  -p 1024-1048:1024-1048 \
  -p 3001:3001 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/photos:/data/photos \
  photo-distributor
```

## Configuration

### Using .env File (Recommended)

The easiest way to configure the application is using a `.env` file:

1. Copy the example configuration:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your settings:

   ```bash
   nano .env
   ```

3. Key variables to update:
   - `PASV_URL`: Set to your NAS/server IP address (most important for FTP to work)
   - `PHOTOS_DIR`: Set to where photos should be stored (relative path or absolute)
   - Other variables can use defaults

4. Docker Compose will automatically read from `.env` when you run `docker compose up`

### Initial Setup After Starting

The first time you run the container, you need to:

1. **Access the web dashboard** at `http://your-server-ip:3001`
2. **Set FTP credentials** in Settings
3. **Configure destinations** (Local, Google Drive, Google Photos)
4. **Upload Google OAuth credentials** if using cloud destinations

### Settings

On first startup, the service will create default settings in its database. Access the dashboard at `http://your-server-ip:3001` to:

- Set FTP credentials
- Configure destinations (Local, Google Drive, Google Photos)
- Set upload behavior options

**Important**: The local photos directory is configured as `/data/photos` inside the container. This path is mapped to your host directory via Docker volumes.

## Synology NAS Deployment

### Prerequisites

- Synology NAS with Docker package installed (Container Manager)
- SSH access to your NAS (optional but recommended)
- A shared folder for photos (e.g., `/volume1/photos`)

### Method 1: Using Container Manager UI

1. **Install Container Manager** from Package Center if not already installed

2. **Create project folder**:
   - Open File Station
   - Navigate to `/docker` (or create it)
   - Create folder: `photo-distributor`
   - Create subfolder: `data`

3. **Set up environment**:
   - Create a `.env` file in `/docker/photo-distributor/`
   - Copy content from `.env.example`
   - Edit and set `PASV_URL` to your NAS IP

4. **Upload files**:
   - Upload `docker-compose.yml` to `/docker/photo-distributor/`
   - Upload `.env` with your configuration

5. **Build and deploy**:
   - In Container Manager, go to **Project**
   - Click **Create**
   - Select the folder with your docker-compose.yml
   - Click **Build** then **Start**

### Pointing to NAS Photos Directory

To save photos to an existing Synology shared folder:

1. **Identify your shared folder path**:
   - Common paths: `/volume1/photos`, `/volume1/Pictures`, `/volume1/home/photos`
   - Check in Control Panel > Shared Folder

2. **Update docker-compose.yml**:

   ```yaml
   volumes:
     - /volume1/photos:/data/photos
   ```

   This maps your NAS `/volume1/photos` folder to `/data/photos` inside the container.

3. **Photo Organization**:
   Photos will be organized by date:
   ```
   /volume1/photos/
   ├── 2026/
   │   ├── 2026-01-15/
   │   │   ├── photo1.jpg
   │   │   └── photo2.jpg
   │   └── 2026-01-16/
   │       └── photo3.jpg
   ```

### Synology Firewall Configuration

If you have the Synology firewall enabled:

1. Go to **Control Panel** > **Security** > **Firewall**
2. Click **Edit Rules**
3. Add rules to allow:
   - Port 2121 TCP - FTP command
   - Ports 1024-1048 TCP - FTP passive mode
   - Port 3001 TCP - Web dashboard

## Environment Variables

| Variable       | Default                 | Description                                                              |
| -------------- | ----------------------- | ------------------------------------------------------------------------ |
| `FTP_PORT`     | `2121`                  | FTP server port (2121 avoids permission issues)                          |
| `FTP_HOST`     | `0.0.0.0`               | FTP bind address                                                         |
| `PASV_URL`     | `0.0.0.0`               | **Important**: Your server's external IP for passive FTP                 |
| `WEB_PORT`     | `3001`                  | Web dashboard port                                                       |
| `WEB_BASE_URL` | `http://localhost:3001` | Base URL for the web dashboard (used for OAuth redirects)                |
| `DATA_DIR`     | `/app/data`             | Base directory for config, logs, and temp files                          |
| `PHOTOS_DIR`   | `./photos`              | Host path for photo storage (used in docker-compose volume mapping only) |
| `NODE_ENV`     | `production`            | Node.js environment mode                                                 |

### Setting PASV_URL

The `PASV_URL` is critical for FTP passive mode to work:

- Set it to your NAS/server's **LAN IP address** (e.g., `192.168.1.100`)
- Cameras and FTP clients need to reach this address for file transfers

## Volume Mounts

| Container Path     | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| `/app/data`        | All application data (database, config, logs, temp uploads) |
| `/app/data/config` | OAuth credentials and tokens                                |
| `/app/data/logs`   | JSONL audit log files                                       |
| `/app/data/temp`   | Temporary FTP upload storage                                |
| `/data/photos`     | Final photo destination (organized by date)                 |

## Networking

### Port Mappings

| Host Port | Container Port | Protocol | Purpose                   |
| --------- | -------------- | -------- | ------------------------- |
| 2121      | 2121           | TCP      | FTP command channel       |
| 1024-1048 | 1024-1048      | TCP      | FTP passive data channels |
| 3001      | 3001           | TCP      | Web dashboard             |

### Using Different Ports

The default port 2121 avoids permission issues and conflicts with built-in FTP servers. If you need a different port:

```yaml
ports:
  - '2222:2121' # Map host 2222 to container 2121
```

Then configure your camera/client to connect to port 2222.

### FTP Passive Mode

For FTP to work correctly:

1. Set `PASV_URL` to your server's IP address
2. Ensure ports 1024-1048 are open in your firewall
3. If behind NAT, forward these ports to your server

## Updating

To update to a new version:

```bash
cd /volume1/docker/photo-distributor

# Pull latest changes (if using git)
git pull

# Rebuild and restart
sudo docker compose build
sudo docker compose up -d
```

## Troubleshooting

### Container won't start

Check logs:

```bash
docker compose logs photo-distributor
```

### Permission denied errors

If you encounter permission issues with mounted volumes, ensure the directories exist and are writable:

```bash
# Create directories if needed
mkdir -p data photos

# Check container logs for specific errors
docker compose logs photo-distributor
```

### FTP connection issues

1. **Verify PASV_URL is correct**:

   ```bash
   docker compose exec photo-distributor printenv PASV_URL
   ```

2. **Check firewall**:
   - Ensure ports 2121 and 1024-1048 are open
   - Test with: `nc -zv your-nas-ip 2121`

3. **Test locally first**:
   ```bash
   ftp localhost 2121
   ```

### Google OAuth not working

1. OAuth callback requires the web dashboard to be accessible
2. Ensure port 3001 is accessible from your browser
3. Set `WEB_BASE_URL` in your `.env` to the URL you access the dashboard from (e.g., `http://192.168.1.100:3001`)
4. Check that redirect URI in Google Cloud Console matches:
   `<WEB_BASE_URL>/api/auth/google/callback`

### Photos not appearing

1. Check the destination is enabled in settings
2. Verify permissions on the photos directory
3. Check logs for errors:
   ```bash
   docker compose logs -f photo-distributor
   ```

### Viewing logs

```bash
# All logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# Last 100 lines
docker compose logs --tail 100

# Application log files
cat data/logs/received.jsonl
cat data/logs/destinations.jsonl
```
