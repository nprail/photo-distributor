# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt, exiftool-vendored)
RUN apk add --no-cache python3 make g++ 

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:24-alpine

WORKDIR /app

# Install runtime dependencies
# perl is required for exiftool
RUN apk add --no-cache perl

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Set default environment variables
ENV NODE_ENV=production \
    DATA_DIR=/app/data \
    DOCKER_ENV=true

# Expose FTP and web ports
# FTP command port (2121 avoids permission issues)
EXPOSE 2121
# FTP passive ports
EXPOSE 1024-1048
# Web dashboard
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/status || exit 1

CMD ["node", "server.js"]
