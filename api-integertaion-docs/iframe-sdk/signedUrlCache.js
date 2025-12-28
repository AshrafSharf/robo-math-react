/**
 * Signed URL Cache - Manages cached signed URLs with expiration
 *
 * This module caches signed URLs from Supabase Storage and automatically
 * tracks expiration to determine when URLs need to be refreshed.
 *
 * Usage:
 *   import { signedUrlCache } from './signedUrlCache';
 *
 *   // Cache a URL
 *   signedUrlCache.set('path/to/image.png', 'https://...', 1703127056);
 *
 *   // Get a URL (returns null if expired or not found)
 *   const url = signedUrlCache.get('path/to/image.png');
 *
 *   // Find paths that need refresh
 *   const expiredPaths = signedUrlCache.getPathsNeedingRefresh(['path1', 'path2']);
 */

class SignedUrlCache {
  /**
   * @param {number} refreshThresholdMs - Time before expiry to consider URL as needing refresh (default: 5 minutes)
   * @param {number} maxSize - Maximum number of URLs to cache (default: 1000)
   */
  constructor(refreshThresholdMs = 5 * 60 * 1000, maxSize = 1000) {
    this.cache = new Map();
    this.refreshThreshold = refreshThresholdMs;
    this.maxSize = maxSize;
  }

  /**
   * Store a signed URL with its expiration time
   * @param {string} path - Storage path
   * @param {string} signedUrl - The signed URL
   * @param {number} expiresAt - Unix timestamp (seconds) when URL expires
   */
  set(path, signedUrl, expiresAt) {
    // Enforce max size using LRU-like behavior
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(path, {
      signedUrl,
      expiresAt: expiresAt * 1000, // Convert to milliseconds for easier comparison
      cachedAt: Date.now(),
    });
  }

  /**
   * Get a cached signed URL if valid
   * @param {string} path - Storage path
   * @returns {string|null} The signed URL if valid, null if expired or not found
   */
  get(path) {
    const entry = this.cache.get(path);
    if (!entry) return null;

    const now = Date.now();
    const timeUntilExpiry = entry.expiresAt - now;

    // Return null if expired or about to expire
    if (timeUntilExpiry < this.refreshThreshold) {
      return null;
    }

    return entry.signedUrl;
  }

  /**
   * Check if a path has a valid (non-expired) URL
   * @param {string} path - Storage path
   * @returns {boolean}
   */
  has(path) {
    return this.get(path) !== null;
  }

  /**
   * Get paths from the list that need to be refreshed
   * @param {string[]} paths - Array of storage paths to check
   * @returns {string[]} Paths that are expired or not cached
   */
  getPathsNeedingRefresh(paths) {
    return paths.filter(path => !this.has(path));
  }

  /**
   * Get all cached URLs for the given paths
   * @param {string[]} paths - Array of storage paths
   * @returns {Object} Map of path to signedUrl (only valid URLs)
   */
  getMultiple(paths) {
    const result = {};
    for (const path of paths) {
      const url = this.get(path);
      if (url) {
        result[path] = url;
      }
    }
    return result;
  }

  /**
   * Batch set multiple URLs
   * @param {Array<{path: string, signedUrl: string, expiresAt: number}>} urls
   */
  setMultiple(urls) {
    for (const { path, signedUrl, expiresAt } of urls) {
      this.set(path, signedUrl, expiresAt);
    }
  }

  /**
   * Remove a URL from cache
   * @param {string} path - Storage path
   */
  delete(path) {
    this.cache.delete(path);
  }

  /**
   * Clear all cached URLs
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Remove all expired entries from cache
   * @returns {number} Number of entries removed
   */
  cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [path, entry] of this.cache.entries()) {
      if (entry.expiresAt - now < this.refreshThreshold) {
        this.cache.delete(path);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get cache statistics
   * @returns {Object} Stats including size, expired count, etc.
   */
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiresAt - now >= this.refreshThreshold) {
        validCount++;
      } else {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      validCount,
      expiredCount,
      maxSize: this.maxSize,
    };
  }
}

// Export singleton instance with default settings
export const signedUrlCache = new SignedUrlCache();
export { SignedUrlCache };
export default signedUrlCache;
