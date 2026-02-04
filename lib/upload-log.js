import { promises as fs } from 'fs'
import path from 'path'

import config from '../config.js'

export async function logUpload({ original, destination }) {
  const entry = {
    timestamp: new Date().toISOString(),
    original,
    destination,
  }
  await fs.appendFile(
    path.join(config.logDir, 'uploads.jsonl'),
    JSON.stringify(entry) + '\n',
  )
}
