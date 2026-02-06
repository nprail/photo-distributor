import path from 'path'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { getCollection } from './db.js'

/**
 * Generate a random password using only letters and numbers
 */
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.randomBytes(length)
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

// Default settings structure
const defaultSettings = {
  // FTP Credentials
  ftp: {
    username: 'pd',
    password: null, // Generated on first start
  },

  // Delete source file after successful upload to all destinations
  deleteAfterUpload: true,

  // Destination Settings
  destinations: {
    local: {
      enabled: true,
      photosDir: path.join(process.cwd(), 'photos'),
    },
    googleDrive: {
      enabled: false,
      rootFolderId: null,
    },
    googlePhotos: {
      enabled: false,
    },
  },
}

// In-memory settings cache
let _settings = null

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const result = { ...target }

  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result
}

/**
 * Load settings from LokiJS, merging with defaults
 * @returns {Promise<object>}
 */
export async function loadSettings() {
  try {
    const col = getCollection('settings')
    const row = col.findOne({ key: 'main' })

    if (row) {
      const savedSettings = row.value
      _settings = deepMerge(defaultSettings, savedSettings)
    } else {
      // No settings saved yet — generate password and persist
      _settings = { ...defaultSettings }
      _settings.ftp = { ...defaultSettings.ftp }
      _settings.ftp.password = generatePassword()
      console.log(`\n🔑 Generated FTP credentials:`)
      console.log(`   Username: ${_settings.ftp.username}`)
      console.log(`   Password: ${_settings.ftp.password}`)
      await saveSettings(_settings)
      return _settings
    }

    if (!_settings.ftp?.passwordHash && _settings.ftp?.password) {
      _settings.ftp.passwordHash = await bcrypt.hash(_settings.ftp.password, 10)
    }

    return _settings
  } catch (error) {
    console.error('Error loading settings:', error.message)
    _settings = { ...defaultSettings }
    return _settings
  }
}

/**
 * Save settings to LokiJS
 * @param {object} settingsData
 * @returns {Promise<void>}
 */
export async function saveSettings(settingsData) {
  // Auto-hash the FTP password if it exists and has changed
  if (settingsData.ftp?.password) {
    const needsHashing =
      !settingsData.ftp.passwordHash ||
      !(await bcrypt
        .compare(settingsData.ftp.password, settingsData.ftp.passwordHash)
        .catch(() => false))

    if (needsHashing) {
      settingsData.ftp.passwordHash = await bcrypt.hash(
        settingsData.ftp.password,
        10,
      )
    }
  }

  const col = getCollection('settings')
  const existing = col.findOne({ key: 'main' })

  if (existing) {
    existing.value = settingsData
    col.update(existing)
  } else {
    col.insert({ key: 'main', value: settingsData })
  }
}

/**
 * Update specific settings (partial update)
 * @param {object} updates - Partial settings object to merge
 * @returns {Promise<object>} - The updated full settings
 */
export async function updateSettings(updates) {
  const current = await loadSettings()
  const updated = deepMerge(current, updates)
  await saveSettings(updated)
  _settings = updated
  return updated
}

/**
 * Reload settings from the database
 * @returns {Promise<object>}
 */
export async function reloadSettings() {
  return loadSettings()
}

/**
 * Get a specific setting by path (e.g., 'ftp.port')
 * @param {string} settingPath
 * @returns {Promise<any>}
 */
export async function getSetting(settingPath) {
  const s = await loadSettings()
  return settingPath.split('.').reduce((obj, key) => obj?.[key], s)
}

/**
 * Get the default settings
 * @returns {object}
 */
export function getDefaultSettings() {
  return { ...defaultSettings }
}

// Settings object with getters for dynamic access
const settings = {
  // Settings management functions
  load: loadSettings,
  save: saveSettings,
  update: updateSettings,
  reload: reloadSettings,
  get: getSetting,
  getDefaults: getDefaultSettings,

  // FTP Credentials
  get ftpUsername() {
    return _settings?.ftp?.username || defaultSettings.ftp.username
  },
  get ftpPassword() {
    return _settings?.ftp?.password || defaultSettings.ftp.password
  },
  get ftpPasswordHash() {
    return _settings?.ftp?.passwordHash
  },

  // Destination Settings
  get destinations() {
    if (_settings?.destinations) {
      return {
        local: {
          ...defaultSettings.destinations.local,
          ..._settings.destinations.local,
        },
        googleDrive: {
          ...defaultSettings.destinations.googleDrive,
          ..._settings.destinations.googleDrive,
        },
        googlePhotos: {
          ...defaultSettings.destinations.googlePhotos,
          ..._settings.destinations.googlePhotos,
        },
      }
    }
    return defaultSettings.destinations
  },

  // Delete after upload
  get deleteAfterUpload() {
    if (_settings?.deleteAfterUpload !== undefined) {
      return _settings.deleteAfterUpload
    }
    return defaultSettings.deleteAfterUpload
  },
}

export default settings
