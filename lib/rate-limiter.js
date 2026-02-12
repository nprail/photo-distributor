/**
 * Simple in-memory rate limiter for authentication attempts.
 * Tracks failed login attempts per IP address and blocks
 * further attempts after exceeding the configured threshold.
 */
export class LoginRateLimiter {
  /**
   * @param {object} options
   * @param {number} options.maxAttempts - Max failed attempts before lockout (default: 5)
   * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
   */
  constructor({ maxAttempts = 5, windowMs = 15 * 60 * 1000 } = {}) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    // Map of IP -> { count, firstAttempt }
    this._attempts = new Map()
    // Periodic cleanup every 5 minutes
    this._cleanupInterval = setInterval(() => this._cleanup(), 5 * 60 * 1000)
    this._cleanupInterval.unref()
  }

  /**
   * Check if an IP is currently rate-limited
   * @param {string} ip
   * @returns {boolean}
   */
  isBlocked(ip) {
    const entry = this._attempts.get(ip)
    if (!entry) return false

    // If the window has expired, clear the entry
    if (Date.now() - entry.firstAttempt > this.windowMs) {
      this._attempts.delete(ip)
      return false
    }

    return entry.count >= this.maxAttempts
  }

  /**
   * Record a failed login attempt for an IP
   * @param {string} ip
   */
  recordFailure(ip) {
    const now = Date.now()
    const entry = this._attempts.get(ip)

    if (!entry || now - entry.firstAttempt > this.windowMs) {
      this._attempts.set(ip, { count: 1, firstAttempt: now })
    } else {
      entry.count++
    }
  }

  /**
   * Clear failures for an IP (e.g., after successful login)
   * @param {string} ip
   */
  recordSuccess(ip) {
    this._attempts.delete(ip)
  }

  /**
   * Remove expired entries
   */
  _cleanup() {
    const now = Date.now()
    for (const [ip, entry] of this._attempts) {
      if (now - entry.firstAttempt > this.windowMs) {
        this._attempts.delete(ip)
      }
    }
  }

  /**
   * Stop the cleanup interval (for graceful shutdown)
   */
  close() {
    clearInterval(this._cleanupInterval)
  }
}
