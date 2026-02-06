import { promises as fs } from 'fs'
import { createReadStream } from 'fs'
import { createHash } from 'crypto'
import path from 'path'

import config from '../config.js'
import { getCollection } from './db.js'

/**
 * Calculate SHA-256 hash of a file
 */
export async function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(filePath)
    stream.on('data', (data) => hash.update(data))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

/**
 * Append an entry to a JSONL log file (fire-and-forget, best-effort).
 * Logs are kept for auditability but are NOT the source of truth.
 */
async function appendJsonlLog(filename, entry) {
  try {
    await fs.mkdir(config.logDir, { recursive: true })
    await fs.appendFile(
      path.join(config.logDir, filename),
      JSON.stringify(entry) + '\n',
    )
  } catch (err) {
    console.error(`Warning: failed to append to ${filename}: ${err.message}`)
  }
}

/**
 * Strip LokiJS internal metadata fields from a document before returning it.
 */
function stripMeta(doc) {
  if (!doc) return null
  const { $loki, meta, ...rest } = doc
  return rest
}

/**
 * Check if a file hash has already been received
 */
export async function isHashAlreadyReceived(hash) {
  const col = getCollection('received')
  return col.findOne({ hash }) !== null
}

/**
 * Log a file received via FTP
 */
export async function logFileReceived({
  filename,
  size,
  mimeType,
  date,
  hash,
  sourcePath,
}) {
  const entry = {
    type: 'received',
    id: `recv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    filename,
    size,
    mimeType,
    hash,
    fileDate: date?.toISOString(),
    sourcePath,
  }

  // Insert into LokiJS (source of truth)
  const col = getCollection('received')
  col.insert({ ...entry })

  // Append to JSONL log (audit trail)
  await appendJsonlLog('received.jsonl', entry)

  return entry.id
}

/**
 * Log an upload to a specific destination
 */
export async function logDestinationUpload({
  receivedId,
  filename,
  destination,
  success,
  result,
  error,
  duration,
}) {
  const entry = {
    type: 'destination',
    receivedId,
    timestamp: new Date().toISOString(),
    filename,
    destination,
    success,
    result,
    error,
    duration,
  }

  // Insert into LokiJS (source of truth)
  const col = getCollection('destinations')
  col.insert({ ...entry })

  // Append to JSONL log (audit trail)
  await appendJsonlLog('destinations.jsonl', entry)
}

/**
 * Get a specific received file entry by ID
 */
export async function getReceivedById(receivedId) {
  const col = getCollection('received')
  const doc = col.findOne({ id: receivedId })
  return stripMeta(doc)
}

/**
 * Get recent received files
 */
export async function getRecentReceived(limit = 100) {
  const col = getCollection('received')
  const docs = col
    .chain()
    .simplesort('$loki', { desc: true })
    .limit(limit)
    .data()
  return docs.map(stripMeta)
}

/**
 * Get destination uploads, optionally filtered by receivedId
 */
export async function getDestinationUploads(limit = 100, receivedId = null) {
  const col = getCollection('destinations')
  let chain = col.chain()

  if (receivedId) {
    chain = chain.find({ receivedId })
  }

  const docs = chain.simplesort('$loki', { desc: true }).limit(limit).data()
  return docs.map(stripMeta)
}

/**
 * Get combined logs showing files received with their destination statuses
 */
export async function getCombinedLogs(limit = 100) {
  const received = await getRecentReceived(limit)

  // Collect all receivedIds for a batch lookup
  const receivedIds = received.map((r) => r.id)

  const destCol = getCollection('destinations')
  const destinations = destCol
    .find({ receivedId: { $in: receivedIds } })
    .map(stripMeta)

  // Build a map of receivedId -> destination uploads
  const destinationMap = new Map()
  for (const dest of destinations) {
    if (!destinationMap.has(dest.receivedId)) {
      destinationMap.set(dest.receivedId, [])
    }
    destinationMap.get(dest.receivedId).push(dest)
  }

  // Combine received files with their destination statuses
  return received.map((recv) => ({
    ...recv,
    destinations: destinationMap.get(recv.id) || [],
  }))
}
