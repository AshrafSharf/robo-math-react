/**
 * Iframe Storage Client - API client for storage operations from iframe apps
 *
 * This module provides methods to upload images and get signed URLs
 * from within the iframe apps (builder/viewer).
 *
 * Usage:
 *   import { iframeStorage } from './iframeStorage';
 *   import { parentBridge } from './parentBridge';
 *
 *   // Initialize (after parentBridge.init())
 *   await parentBridge.init();
 *
 *   // Upload an image
 *   const result = await iframeStorage.uploadImage(file);
 *   console.log(result.path, result.signedUrl, result.expiresAt);
 *
 *   // Get a signed URL (with caching)
 *   const url = await iframeStorage.getSignedUrl('path/to/image.png');
 *
 *   // Batch get signed URLs
 *   const urls = await iframeStorage.getSignedUrls(['path1', 'path2']);
 */

import { parentBridge } from './parentBridge.js';
import { signedUrlCache } from './signedUrlCache.js';

class IframeStorageClient {
  /**
   * Make an authenticated API request
   */
  async request(endpoint, options = {}) {
    const token = parentBridge.getToken();
    const apiBaseUrl = parentBridge.getApiBaseUrl();

    if (!token) {
      throw new Error('Not authenticated - call parentBridge.init() first');
    }

    const url = `${apiBaseUrl}/api${endpoint}`;
    const config = {
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Upload an image file
   * @param {File} file - The image file to upload
   * @returns {Promise<{path: string, signedUrl: string, expiresAt: number}>}
   */
  async uploadImage(file) {
    const { lessonId } = parentBridge.getContext();

    if (!lessonId) {
      throw new Error('No lesson context - cannot upload');
    }

    const formData = new FormData();
    formData.append('file', file);

    const result = await this.request(`/storage/lessons/${lessonId}/images`, {
      method: 'POST',
      body: formData,
    });

    const { path, signedUrl, expiresAt } = result.data;

    // Cache the signed URL
    signedUrlCache.set(path, signedUrl, expiresAt);

    return { path, signedUrl, expiresAt };
  }

  /**
   * Get a signed URL for an image path (with caching)
   * @param {string} path - Storage path
   * @param {boolean} forceRefresh - Force refresh even if cached
   * @returns {Promise<string>} The signed URL
   */
  async getSignedUrl(path, forceRefresh = false) {
    // Check cache first
    if (!forceRefresh) {
      const cached = signedUrlCache.get(path);
      if (cached) {
        return cached;
      }
    }

    // Fetch from API
    const result = await this.request(`/storage/images/url?path=${encodeURIComponent(path)}`);
    const { signedUrl, expiresAt } = result.data;

    // Cache the result
    signedUrlCache.set(path, signedUrl, expiresAt);

    return signedUrl;
  }

  /**
   * Get signed URLs for multiple paths (with caching)
   * @param {string[]} paths - Array of storage paths
   * @param {boolean} forceRefresh - Force refresh even if cached
   * @returns {Promise<Array<{path: string, signedUrl: string, expiresAt: number}>>}
   */
  async getSignedUrls(paths, forceRefresh = false) {
    if (paths.length === 0) {
      return [];
    }

    // Determine which paths need fetching
    const pathsToFetch = forceRefresh
      ? paths
      : signedUrlCache.getPathsNeedingRefresh(paths);

    // Get cached URLs for paths that don't need fetching
    const results = [];
    const cachedUrls = forceRefresh ? {} : signedUrlCache.getMultiple(paths);

    // Add cached results
    for (const path of paths) {
      if (cachedUrls[path]) {
        results.push({
          path,
          signedUrl: cachedUrls[path],
          expiresAt: null, // Cached, exact expiry unknown but still valid
        });
      }
    }

    // Fetch URLs that aren't cached
    if (pathsToFetch.length > 0) {
      const response = await this.request('/storage/images/urls', {
        method: 'POST',
        body: JSON.stringify({ paths: pathsToFetch }),
      });

      // Cache and add fetched results
      for (const item of response.data) {
        signedUrlCache.set(item.path, item.signedUrl, item.expiresAt);
        results.push(item);
      }
    }

    // Return in original order
    return paths.map(path =>
      results.find(r => r.path === path) || { path, signedUrl: null, expiresAt: null }
    );
  }

  /**
   * Refresh URLs that are about to expire
   * @param {string[]} paths - Paths to check and refresh
   * @returns {Promise<number>} Number of URLs refreshed
   */
  async refreshExpiringUrls(paths) {
    const pathsToRefresh = signedUrlCache.getPathsNeedingRefresh(paths);

    if (pathsToRefresh.length === 0) {
      return 0;
    }

    await this.getSignedUrls(pathsToRefresh, true);
    return pathsToRefresh.length;
  }

  /**
   * Get a URL, using cache if available
   * This is a synchronous method that returns cached URL or null
   * @param {string} path - Storage path
   * @returns {string|null} Cached URL or null
   */
  getCachedUrl(path) {
    return signedUrlCache.get(path);
  }

  /**
   * Clear the URL cache
   */
  clearCache() {
    signedUrlCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return signedUrlCache.getStats();
  }

  // ========== Lesson Content Methods ==========

  /**
   * Load lesson content from the signed URL provided by parent
   * This is the preferred method - uses the pre-signed URL from INIT
   * @returns {Promise<Object>} The lesson content as JSON
   */
  async loadLessonContent() {
    return parentBridge.loadLessonContent();
  }

  /**
   * Fetch lesson content via API (if signed URL is expired or unavailable)
   * @param {number} version - Optional version number
   * @returns {Promise<Object>} The lesson content as JSON
   */
  async fetchLessonContent(version = null) {
    const { lessonId } = parentBridge.getContext();
    if (!lessonId) {
      throw new Error('No lesson context');
    }

    const endpoint = version
      ? `/storage/lessons/${lessonId}/content?version=${version}`
      : `/storage/lessons/${lessonId}/content`;

    const result = await this.request(endpoint);
    return result.data;
  }

  /**
   * Get a fresh signed URL for lesson content
   * @param {number} version - Optional version number
   * @returns {Promise<{signedUrl: string, expiresAt: number}>}
   */
  async getLessonContentUrl(version = null) {
    const { lessonId } = parentBridge.getContext();
    if (!lessonId) {
      throw new Error('No lesson context');
    }

    const endpoint = version
      ? `/storage/lessons/${lessonId}/content/url?version=${version}`
      : `/storage/lessons/${lessonId}/content/url`;

    const result = await this.request(endpoint);
    return result.data;
  }

  /**
   * Smart load lesson content - uses cached URL if valid, fetches fresh otherwise
   * @returns {Promise<Object>} The lesson content as JSON
   */
  async loadContent() {
    // Try using the signed URL from parent first
    if (parentBridge.isContentUrlValid()) {
      try {
        return await parentBridge.loadLessonContent();
      } catch (error) {
        console.warn('Failed to load from signed URL, falling back to API:', error);
      }
    }

    // Fallback to API
    return this.fetchLessonContent();
  }
}

// Export singleton instance
export const iframeStorage = new IframeStorageClient();
export default iframeStorage;
