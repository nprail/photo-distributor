#!/usr/bin/env node
/**
 * Google OAuth Setup Script
 *
 * This script helps you authenticate with Google APIs for Google Drive and Google Photos.
 * Run this once to generate the token files needed for the destinations.
 *
 * Usage:
 *   node scripts/google-auth-setup.js --service drive|photos --credentials <path>
 *
 * Prerequisites:
 *   1. Create a project in Google Cloud Console
 *   2. Enable the Google Drive API and/or Photos Library API
 *   3. Create OAuth 2.0 credentials (Desktop app type)
 *   4. Download the credentials JSON file
 */

import { promises as fs } from 'fs'
import path from 'path'
import { google } from 'googleapis'
import http from 'http'
import { URL } from 'url'

const SCOPES = {
  drive: ['https://www.googleapis.com/auth/drive.file'],
  photos: ['https://www.googleapis.com/auth/photoslibrary.appendonly'],
}

async function main() {
  const args = process.argv.slice(2)
  const serviceIndex = args.indexOf('--service')
  const credentialsIndex = args.indexOf('--credentials')

  if (serviceIndex === -1 || credentialsIndex === -1) {
    console.log(`
Google OAuth Setup Script

Usage:
  node scripts/google-auth-setup.js --service <drive|photos> --credentials <path>

Options:
  --service       The Google service to authenticate (drive or photos)
  --credentials   Path to the OAuth credentials JSON file downloaded from Google Cloud Console

Example:
  node scripts/google-auth-setup.js --service drive --credentials ./credentials.json
  node scripts/google-auth-setup.js --service photos --credentials ./credentials.json

The token will be saved to:
  - Google Drive: ./config/google-drive-token.json
  - Google Photos: ./config/google-photos-token.json
    `)
    process.exit(1)
  }

  const service = args[serviceIndex + 1]
  const credentialsPath = args[credentialsIndex + 1]

  if (!['drive', 'photos'].includes(service)) {
    console.error('Error: Service must be "drive" or "photos"')
    process.exit(1)
  }

  const scopes = SCOPES[service]
  const tokenPath = path.join(
    process.cwd(),
    'config',
    `google-${service}-token.json`,
  )

  console.log(`\n🔐 Setting up Google ${service === 'drive' ? 'Drive' : 'Photos'} authentication...\n`)

  try {
    const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'))
    const { client_id, client_secret, redirect_uris } =
      credentials.installed || credentials.web

    // Use localhost for OAuth redirect
    const redirectUri = 'http://localhost:3000/oauth2callback'

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirectUri,
    )

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    })

    console.log('📋 Opening browser for authentication...')
    console.log('   If the browser does not open, visit this URL manually:\n')
    console.log(`   ${authUrl}\n`)

    // Start local server to receive the OAuth callback
    const code = await waitForAuthCode()

    console.log('🔄 Exchanging authorization code for tokens...')

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Save the token
    await fs.mkdir(path.dirname(tokenPath), { recursive: true })
    await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2))

    console.log(`\n✅ Token saved to: ${tokenPath}`)
    console.log(`\n📝 Add these to your environment variables:`)
    console.log(`   DESTINATION_GOOGLE_${service.toUpperCase()}_ENABLED=true`)
    console.log(`   GOOGLE_${service.toUpperCase()}_CREDENTIALS=${credentialsPath}`)
    console.log(`   GOOGLE_${service.toUpperCase()}_TOKEN=${tokenPath}`)
    process.exit(0)
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`)
    process.exit(1)
  }
}

function waitForAuthCode() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost:3000')
        if (url.pathname === '/oauth2callback') {
          const code = url.searchParams.get('code')
          const error = url.searchParams.get('error')

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(`
              <html>
                <body style="font-family: system-ui; padding: 40px; text-align: center;">
                  <h1>❌ Authentication Failed</h1>
                  <p>Error: ${error}</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `)
            server.close()
            reject(new Error(`Authentication failed: ${error}`))
            return
          }

          if (code) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(`
              <html>
                <body style="font-family: system-ui; padding: 40px; text-align: center;">
                  <h1>✅ Authentication Successful!</h1>
                  <p>You can close this window and return to the terminal.</p>
                </body>
              </html>
            `)
            server.close()
            resolve(code)
          }
        }
      } catch (err) {
        reject(err)
      }
    })

    server.listen(3000, () => {
      console.log('🌐 Waiting for authentication callback on http://localhost:3000...')
    })

    server.on('error', (err) => {
      reject(new Error(`Failed to start auth server: ${err.message}`))
    })

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close()
      reject(new Error('Authentication timed out after 5 minutes'))
    }, 5 * 60 * 1000)
  })
}

main()
