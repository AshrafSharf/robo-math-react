/**
 * Point2Space Iframe SDK
 *
 * This SDK provides communication and storage utilities for iframe apps
 * (lesson builder and viewer) that are embedded in the Point2Space platform.
 *
 * ## Quick Start
 *
 * ```javascript
 * import { parentBridge, iframeStorage } from '@point2space/iframe-sdk';
 *
 * // Initialize on app startup
 * async function init() {
 *   // Wait for parent to send auth token and context
 *   await parentBridge.init();
 *
 *   // Now you can access lesson context
 *   const { lessonId, channelId, mode } = parentBridge.getContext();
 *
 *   // Upload images
 *   const result = await iframeStorage.uploadImage(file);
 *
 *   // Get signed URLs (with automatic caching)
 *   const url = await iframeStorage.getSignedUrl(result.path);
 *
 *   // Save content back to parent
 *   parentBridge.saveContent({ slides: [...] }, 'Updated slide 1');
 * }
 *
 * init();
 * ```
 *
 * ## Modules
 *
 * - `parentBridge` - Communication with parent app via postMessage
 * - `iframeStorage` - API client for image upload and signed URL retrieval
 * - `signedUrlCache` - Cache for signed URLs with expiration tracking
 */

export { parentBridge } from './parentBridge.js';
export { iframeStorage } from './iframeStorage.js';
export { signedUrlCache, SignedUrlCache } from './signedUrlCache.js';

// Re-export all as named exports for tree-shaking
