/**
 * API Module
 *
 * Exports all API clients and models.
 */

// API Client
export { default as apiClient } from './apiClient.js';
export { apiRequest, get, post, put, patch, del } from './apiClient.js';

// Lesson API
export { default as lessonApi } from './lessonApi.js';
export {
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
  getMyLessons,
} from './lessonApi.js';

// Asset API
export { default as assetApi } from './assetApi.js';
export {
  getAssets,
  uploadAsset,
  renameAsset,
  deleteAsset,
  getSignedUrl,
  getSignedUrls,
} from './assetApi.js';

// Models
export {
  AssetType,
  SupportedMimeTypes,
  MaxFileSizes,
  validateAssetFile,
  formatFileSize,
} from './models/Asset.js';
