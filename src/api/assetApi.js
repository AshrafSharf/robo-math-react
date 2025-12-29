/**
 * Asset API
 *
 * API functions for managing lesson assets (images, audio, video).
 */

import { get, post, patch, del } from './apiClient.js';

/**
 * Get all assets for a lesson
 * @param {string} lessonId - UUID of the lesson
 * @param {string} [type] - Filter by type: 'image', 'audio', or 'video'
 * @returns {Promise<Asset[]>}
 */
export async function getAssets(lessonId, type = null) {
  const endpoint = type
    ? `/storage/lessons/${lessonId}/assets?type=${type}`
    : `/storage/lessons/${lessonId}/assets`;

  const response = await get(endpoint);
  return response.data || [];
}

/**
 * Upload an asset to a lesson
 * @param {string} lessonId - UUID of the lesson
 * @param {File} file - The file to upload
 * @param {'image' | 'audio' | 'video'} type - Asset type
 * @returns {Promise<Asset>}
 */
export async function uploadAsset(lessonId, file, type) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await post(`/storage/lessons/${lessonId}/assets`, formData);
  return response.data;
}

/**
 * Rename an asset
 * @param {string} lessonId - UUID of the lesson
 * @param {string} assetId - UUID of the asset
 * @param {string} filename - New filename
 * @returns {Promise<Asset>}
 */
export async function renameAsset(lessonId, assetId, filename) {
  const response = await patch(`/storage/lessons/${lessonId}/assets/${assetId}`, {
    filename,
  });
  return response.data;
}

/**
 * Delete an asset
 * @param {string} lessonId - UUID of the lesson
 * @param {string} assetId - UUID of the asset
 * @returns {Promise<void>}
 */
export async function deleteAsset(lessonId, assetId) {
  await del(`/storage/lessons/${lessonId}/assets/${assetId}`);
}

/**
 * Get a signed URL for an asset
 * @param {string} path - Storage path of the asset
 * @returns {Promise<{ path: string, signedUrl: string, expiresAt: number }>}
 */
export async function getSignedUrl(path) {
  const response = await get(`/storage/assets/url?path=${encodeURIComponent(path)}`);
  return response.data;
}

/**
 * Get signed URLs for multiple assets
 * @param {string[]} paths - Storage paths
 * @returns {Promise<Array<{ path: string, signedUrl: string, expiresAt: number }>>}
 */
export async function getSignedUrls(paths) {
  if (paths.length === 0) return [];

  const response = await post('/storage/assets/urls', { paths });
  return response.data || [];
}

export default {
  getAssets,
  uploadAsset,
  renameAsset,
  deleteAsset,
  getSignedUrl,
  getSignedUrls,
};
