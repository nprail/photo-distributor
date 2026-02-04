import { promises as fs } from 'fs'
import path from 'path'

const SETTINGS_PATH = path.join(process.cwd(), 'config', 'settings.json')

// Default settings structure
const defaultSettings = {
  // FTP Credentials
  ftp: {
    username: 'anonymous',
    password: 'anonymous',
  },

  // Directory Settings
  directories: {
    photosDir: path.join(process.cwd(), 'photos'),
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
      credentialsPath: path.join(
        process.cwd(),
        'config',
        'google-drive-credentials.json',
      ),
      tokenPath: path.join(process.cwd(), 'config', 'google-drive-token.json'),
      rootFolderId: null,
    },
    googlePhotos: {
      enabled: false,
      credentialsPath: path.join(
        process.cwd(),
        'config',
        'google-photos-credentials.json',
      ),
      tokenPath: path.join(process.cwd(), 'config', 'google-photos-token.json'),
    },
  },
}

// In-memory settings cache
let _settings = null

/**
 * Load settings from the settings file, merging with defaults
 * @returns {Promise<object>}
 */
export async function loadSettings() {
  try {
    await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true })
    const content = await fs.readFile(SETTINGS_PATH, 'utf8')
    const savedSettings = JSON.parse(content)
    // Deep merge with defaults to ensure all fields exist
    _settings = deepMerge(defaultSettings, savedSettings)
    return _settings
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, save and return defaults
      await saveSettings(defaultSettings)
      _settings = { ...defaultSettings }
      return _settings
    }
    console.error('Error loading settings:', error.message)
    _settings = { ...defaultSettings }
    return _settings
  }
}

/**
 * Save settings to the settings file
 * @param {object} settings
 * @returns {Promise<void>}
 */
export async function saveSettings(settings) {
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true })
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2))
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
 * Reload settings from disk
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
  const settings = await loadSettings()
  return settingPath.split('.').reduce((obj, key) => obj?.[key], settings)
}

/**
 * Deep merge two objects
 * @param {object} target
 * @param {object} source
 * @returns {object}
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

  // Directory Settings
  get photosDir() {
    return (
      _settings?.directories?.photosDir || defaultSettings.directories.photosDir
    )
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
export { SETTINGS_PATH }
