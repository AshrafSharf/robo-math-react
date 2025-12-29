/**
 * Asset Model
 *
 * Represents a lesson asset (image, audio, video).
 */

/**
 * @typedef {Object} Asset
 * @property {string} id - UUID of the asset
 * @property {string} lesson_id - UUID of the parent lesson
 * @property {'image' | 'audio' | 'video'} type - Asset type
 * @property {string} filename - Original filename
 * @property {string} storage_path - Storage path in the bucket
 * @property {string} mime_type - MIME type (e.g., 'image/png')
 * @property {number} size - File size in bytes
 * @property {string} created_by - UUID of the user who uploaded
 * @property {string} created_at - ISO timestamp
 * @property {string} [signedUrl] - Signed URL for accessing the asset
 * @property {number} [expiresAt] - Unix timestamp when signedUrl expires
 */

/**
 * Asset types enum
 */
export const AssetType = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
};

/**
 * Supported MIME types by asset type
 */
export const SupportedMimeTypes = {
  [AssetType.IMAGE]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ],
  [AssetType.AUDIO]: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
  ],
  [AssetType.VIDEO]: [
    'video/mp4',
    'video/webm',
    'video/ogg',
  ],
};

/**
 * Max file sizes in bytes
 */
export const MaxFileSizes = {
  [AssetType.IMAGE]: 10 * 1024 * 1024,  // 10MB
  [AssetType.AUDIO]: 50 * 1024 * 1024,  // 50MB
  [AssetType.VIDEO]: 50 * 1024 * 1024,  // 50MB
};

/**
 * Check if a file is valid for upload
 * @param {File} file
 * @param {string} type - Asset type
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAssetFile(file, type) {
  const supportedTypes = SupportedMimeTypes[type];
  if (!supportedTypes) {
    return { valid: false, error: `Unknown asset type: ${type}` };
  }

  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Supported: ${supportedTypes.join(', ')}`,
    };
  }

  const maxSize = MaxFileSizes[type];
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File too large: ${Math.round(file.size / (1024 * 1024))}MB. Max: ${maxMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get human-readable file size
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
