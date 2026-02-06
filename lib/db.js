import loki from 'lokijs'
import { promises as fs } from 'fs'
import path from 'path'
import config from '../config.js'

const DB_PATH = path.join(config.dataDir, 'photo-distributor.db')

let db = null
let _initPromise = null

/**
 * Initialize the LokiJS database.
 * Returns a promise that resolves when the DB is loaded/ready.
 * Safe to call multiple times — will only initialize once.
 */
export function initDatabase() {
  if (_initPromise) return _initPromise

  _initPromise = new Promise((resolve, reject) => {
    db = new loki(DB_PATH, {
      autoload: true,
      autoloadCallback: (err) => {
        if (err) return reject(err)

        // Ensure collections exist
        ensureCollections()

        // Migrate legacy file-based data on first run
        migrateFromFiles()
          .then(() => resolve(db))
          .catch((migrationErr) => {
            console.error(
              'Warning: migration from legacy files failed:',
              migrationErr.message,
            )
            resolve(db) // still resolve — migration is best-effort
          })
      },
      autosave: true,
      autosaveInterval: 5000, // save every 5 seconds
    })
  })

  return _initPromise
}

/**
 * Ensure all required collections exist with proper indexes.
 */
function ensureCollections() {
  // Settings collection — stores key/value config entries
  if (!db.getCollection('settings')) {
    db.addCollection('settings', { unique: ['key'] })
  }

  // Received files collection
  if (!db.getCollection('received')) {
    const received = db.addCollection('received', {
      unique: ['id'],
      indices: ['hash', 'timestamp'],
    })
  }

  // Destination uploads collection
  if (!db.getCollection('destinations')) {
    db.addCollection('destinations', {
      indices: ['receivedId', 'timestamp', 'destination'],
    })
  }
}

/**
 * One-time migration: import data from legacy JSON/JSONL files into LokiJS.
 * Only imports when the LokiJS collections are empty.
 */
async function migrateFromFiles() {
  const settingsCol = db.getCollection('settings')
  const receivedCol = db.getCollection('received')
  const destCol = db.getCollection('destinations')

  // --- Migrate settings.json ---
  if (settingsCol.count() === 0) {
    try {
      const settingsPath = path.join(config.configDir, 'settings.json')
      const content = await fs.readFile(settingsPath, 'utf8')
      const savedSettings = JSON.parse(content)
      settingsCol.insert({ key: 'main', value: savedSettings })
      console.log('📥 Migrated settings.json into database')
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn('⚠️  Could not migrate settings.json:', err.message)
      }
    }
  }

  // --- Migrate received.jsonl ---
  if (receivedCol.count() === 0) {
    try {
      const logPath = path.join(config.logDir, 'received.jsonl')
      const content = await fs.readFile(logPath, 'utf8')
      const entries = content
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))

      if (entries.length > 0) {
        receivedCol.insert(entries)
        console.log(
          `📥 Migrated ${entries.length} received entries into database`,
        )
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn('⚠️  Could not migrate received.jsonl:', err.message)
      }
    }
  }

  // --- Migrate destinations.jsonl ---
  if (destCol.count() === 0) {
    try {
      const logPath = path.join(config.logDir, 'destinations.jsonl')
      const content = await fs.readFile(logPath, 'utf8')
      const entries = content
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))

      if (entries.length > 0) {
        destCol.insert(entries)
        console.log(
          `📥 Migrated ${entries.length} destination entries into database`,
        )
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn('⚠️  Could not migrate destinations.jsonl:', err.message)
      }
    }
  }

  // Save after migration
  db.saveDatabase(() => {})
}

/**
 * Get the database instance. Must call initDatabase() first.
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

/**
 * Get a collection by name.
 */
export function getCollection(name) {
  const database = getDb()
  const collection = database.getCollection(name)
  if (!collection) {
    throw new Error(`Collection "${name}" not found.`)
  }
  return collection
}

/**
 * Force save the database to disk.
 */
export function saveDatabase() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve()
    db.saveDatabase((err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

/**
 * Close the database (for graceful shutdown).
 */
export function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve()
    db.close((err) => {
      if (err) return reject(err)
      db = null
      _initPromise = null
      resolve()
    })
  })
}
