/**
 * Base destination class - all upload destinations must extend this
 */
export class BaseDestination {
  constructor(config = {}) {
    this.config = config
    this.name = 'base'
    this.enabled = config.enabled ?? true
  }

  /**
   * Initialize the destination (authenticate, setup, etc.)
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass')
  }

  /**
   * Upload a file to the destination
   * @param {string} filePath - Local path to the file
   * @param {object} metadata - File metadata (date, original name, etc.)
   * @returns {Promise<object>} - Upload result with destination-specific info
   */
  async upload(filePath, metadata) {
    throw new Error('upload() must be implemented by subclass')
  }

  /**
   * Check if the destination is properly configured and ready
   * @returns {Promise<boolean>}
   */
  async isReady() {
    throw new Error('isReady() must be implemented by subclass')
  }

  /**
   * Get the destination name
   * @returns {string}
   */
  getName() {
    return this.name
  }

  /**
   * Clean up resources (close connections, etc.)
   * @returns {Promise<void>}
   */
  async cleanup() {
    // Optional: subclasses can override
  }
}
