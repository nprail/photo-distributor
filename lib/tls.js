import { promises as fs } from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import config from '../config.js'

const execFileAsync = promisify(execFile)

const CERT_DIR = path.join(config.configDir, 'tls')
const CERT_PATH = path.join(CERT_DIR, 'cert.pem')
const KEY_PATH = path.join(CERT_DIR, 'key.pem')

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Generate a self-signed TLS certificate using openssl
 */
async function generateSelfSignedCert() {
  await fs.mkdir(CERT_DIR, { recursive: true })

  console.log('🔐 Generating self-signed TLS certificate...')

  await execFileAsync('openssl', [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-keyout',
    KEY_PATH,
    '-out',
    CERT_PATH,
    '-days',
    '3650',
    '-nodes',
    '-subj',
    '/CN=photo-distributor',
  ])

  console.log('✅ TLS certificate generated')
}

/**
 * Load TLS options for the FTP server.
 * Uses custom cert/key if provided via environment variables,
 * otherwise auto-generates a self-signed certificate.
 * Returns false if TLS is explicitly disabled.
 */
export async function loadTlsOptions() {
  if (config.tlsEnabled === false) {
    console.log('⚠️  TLS is disabled (FTP_TLS=false)')
    return false
  }

  let certPath = config.tlsCert
  let keyPath = config.tlsKey

  // Use custom cert/key if both are provided
  if (certPath && keyPath) {
    console.log('🔐 Using custom TLS certificate')
  } else {
    // Auto-generate self-signed certificate if needed
    certPath = CERT_PATH
    keyPath = KEY_PATH

    if (!(await fileExists(certPath)) || !(await fileExists(keyPath))) {
      await generateSelfSignedCert()
    } else {
      console.log('🔐 Using existing self-signed TLS certificate')
    }
  }

  const [cert, key] = await Promise.all([
    fs.readFile(certPath),
    fs.readFile(keyPath),
  ])

  return { cert, key }
}
