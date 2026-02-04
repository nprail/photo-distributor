import { promises as fs } from 'fs'
import path from 'path'

import settings from './settings.js'

export async function logUpload({ original, destination, result }) {
  const entry = {
    timestamp: new Date().toISOString(),
    original,
    destination,
    result,
  }
  await fs.appendFile(
    path.join(settings.logDir, 'uploads.jsonl'),
    JSON.stringify(entry) + '\n',
  )
}

export async function getRecentLogs(limit = 100) {
  try {
    const logPath = path.join(settings.logDir, 'uploads.jsonl')
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
