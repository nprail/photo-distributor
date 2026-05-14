/**
 * CLI configuration management.
 * Persists default connection settings to ~/.photo-distributor.json
 */

import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

const CONFIG_FILE = path.join(os.homedir(), '.photo-distributor.json')

const DEFAULTS = {
  host: 'localhost',
  port: 2121,
  user: 'pd',
  password: null,
}

/**
 * Load CLI config from ~/.photo-distributor.json, falling back to defaults.
 * @returns {Promise<object>}
 */
export async function loadConfig() {
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf8')
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

/**
 * Persist CLI config to ~/.photo-distributor.json.
 * Only saves the fields that differ from defaults to keep the file clean.
 * @param {object} updates
 */
export async function saveConfig(updates) {
  const current = await loadConfig()
  const next = { ...current, ...updates }
  await fs.writeFile(CONFIG_FILE, JSON.stringify(next, null, 2) + '\n', 'utf8')
  return next
}
