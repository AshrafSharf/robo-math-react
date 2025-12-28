/**
 * Parent Bridge - Communication module for iframe apps
 *
 * This module handles postMessage communication between the iframe app
 * and the parent Point2Space application.
 *
 * Usage:
 *   import { parentBridge } from './parentBridge';
 *
 *   // Initialize and wait for parent
 *   await parentBridge.init();
 *
 *   // Get auth token for API calls
 *   const token = parentBridge.getToken();
 *
 *   // Get lesson context
 *   const { lessonId, channelId, mode } = parentBridge.getContext();
 */

class ParentBridge {
  constructor() {
    this.token = null;
    this.context = null;
    this.parentOrigin = null;
    this.isInitialized = false;
    this.initPromise = null;
    this.initResolver = null;

    // Bind message handler
    this.handleMessage = this.handleMessage.bind(this);
  }

  /**
   * Initialize the bridge and wait for parent to send INIT message
   * @returns {Promise<void>} Resolves when initialized
   */
  init() {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve) => {
      this.initResolver = resolve;

      // Listen for messages from parent
      window.addEventListener('message', this.handleMessage);

      // Notify parent that iframe is ready
      this.sendReady();
    });

    return this.initPromise;
  }

  /**
   * Handle incoming messages from parent
   */
  handleMessage(event) {
    const { type, payload } = event.data || {};

    switch (type) {
      case 'INIT':
        this.parentOrigin = event.origin;
        this.token = payload.token;
        this.context = {
          lessonId: payload.lessonId,
          channelId: payload.channelId,
          mode: payload.mode,
          apiBaseUrl: payload.apiBaseUrl,
          // Lesson content signed URL (for loading lesson)
          contentUrl: payload.contentUrl,
          contentExpiresAt: payload.contentExpiresAt,
        };
        this.isInitialized = true;

        if (this.initResolver) {
          this.initResolver();
          this.initResolver = null;
        }
        break;

      case 'TOKEN_REFRESH':
        this.token = payload.token;
        break;

      default:
        break;
    }
  }

  /**
   * Send READY message to parent
   */
  sendReady() {
    // Send to parent (use * since we don't know parent origin yet)
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'READY', payload: {} }, '*');
    }
  }

  /**
   * Send message to parent
   */
  sendMessage(type, payload = {}) {
    if (!this.parentOrigin) {
      console.warn('Parent origin not set, cannot send message');
      return;
    }

    if (window.parent !== window) {
      window.parent.postMessage({ type, payload }, this.parentOrigin);
    }
  }

  /**
   * Get the auth token for API calls
   * @returns {string|null} The JWT token
   */
  getToken() {
    return this.token;
  }

  /**
   * Get the lesson context
   * @returns {Object} Context with lessonId, channelId, mode, apiBaseUrl
   */
  getContext() {
    return this.context || {};
  }

  /**
   * Get the API base URL
   * @returns {string} The API base URL
   */
  getApiBaseUrl() {
    return this.context?.apiBaseUrl || '';
  }

  /**
   * Check if in edit mode
   * @returns {boolean}
   */
  isEditMode() {
    return this.context?.mode === 'edit';
  }

  /**
   * Check if in view mode
   * @returns {boolean}
   */
  isViewMode() {
    return this.context?.mode === 'view';
  }

  /**
   * Get the lesson content signed URL
   * @returns {string|null} The signed URL for lesson content
   */
  getContentUrl() {
    return this.context?.contentUrl || null;
  }

  /**
   * Get the lesson content expiration time
   * @returns {number|null} Unix timestamp when content URL expires
   */
  getContentExpiresAt() {
    return this.context?.contentExpiresAt || null;
  }

  /**
   * Check if content URL is still valid
   * @param {number} bufferMs - Buffer time before expiry (default 5 min)
   * @returns {boolean}
   */
  isContentUrlValid(bufferMs = 5 * 60 * 1000) {
    const expiresAt = this.getContentExpiresAt();
    if (!expiresAt) return false;
    return (expiresAt * 1000) - Date.now() > bufferMs;
  }

  /**
   * Load lesson content from the signed URL
   * @returns {Promise<Object>} The lesson content as JSON
   */
  async loadLessonContent() {
    const contentUrl = this.getContentUrl();
    if (!contentUrl) {
      throw new Error('No content URL available');
    }

    const response = await fetch(contentUrl);
    if (!response.ok) {
      throw new Error(`Failed to load lesson content: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Notify parent to save content
   * @param {Object} content - The lesson content to save
   * @param {string} notes - Optional version notes
   */
  saveContent(content, notes = '') {
    this.sendMessage('SAVE_CONTENT', { content, notes });
  }

  /**
   * Report an error to parent
   * @param {string} code - Error code
   * @param {string} message - Error message
   */
  reportError(code, message) {
    this.sendMessage('ERROR', { code, message });
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    window.removeEventListener('message', this.handleMessage);
    this.token = null;
    this.context = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const parentBridge = new ParentBridge();
export default parentBridge;
