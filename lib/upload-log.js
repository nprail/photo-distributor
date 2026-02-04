import { promises as fs } from 'fs'
import path from 'path'

import config from '../config.js'

/**
 * Log a file received via FTP
 */
export async function logFileReceived({ filename, size, mimeType, date }) {
  const entry = {
    type: 'received',
    id: `recv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    filename,
    size,
    mimeType,
    fileDate: date?.toISOString(),
    destinations: [], // Will be populated as uploads complete
  }
  await fs.appendFile(
    path.join(config.logDir, 'received.jsonl'),
    JSON.stringify(entry) + '\n',
  )
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
  await fs.appendFile(
    path.join(config.logDir, 'destinations.jsonl'),
    JSON.stringify(entry) + '\n',
  )
}

/**
 * Get recent received files
 */
export async function getRecentReceived(limit = 100) {
  try {
    const logPath = path.join(config.logDir, 'received.jsonl')
    const content = await fs.readFile(logPath, 'utf8')
    const logs = content
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .reverse()
    return logs.slice(0, limit)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

/**
 * Get destination uploads, optionally filtered by receivedId
 */
export async function getDestinationUploads(limit = 100, receivedId = null) {
  try {
    const logPath = path.join(config.logDir, 'destinations.jsonl')
    const content = await fs.readFile(logPath, 'utf8')
    let logs = content
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .reverse()

    if (receivedId) {
      logs = logs.filter((log) => log.receivedId === receivedId)
    }

    return logs.slice(0, limit)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

/**
 * Get combined logs showing files received with their destination statuses
 */
export async function getCombinedLogs(limit = 100) {
  const received = await getRecentReceived(limit)
  const destinations = await getDestinationUploads(limit * 3) // Get more to cover all destinations

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
