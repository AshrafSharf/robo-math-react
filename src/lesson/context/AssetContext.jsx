import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getAssets,
  uploadAsset as apiUploadAsset,
  renameAsset as apiRenameAsset,
  deleteAsset as apiDeleteAsset,
  AssetType,
  validateAssetFile,
} from '../../api';

const AssetContext = createContext(null);

export const AssetProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(null);

  /**
   * Load assets for a lesson
   */
  const loadAssets = useCallback(async (lessonId, type = null) => {
    if (!lessonId) {
      setAssets([]);
      setCurrentLessonId(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getAssets(lessonId, type);
      setAssets(data);
      setCurrentLessonId(lessonId);
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError(err.message);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload a new asset
   */
  const uploadAsset = useCallback(async (lessonId, file, type = AssetType.IMAGE) => {
    // Validate file
    const validation = validateAssetFile(file, type);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    setLoading(true);
    setError(null);

    try {
      const newAsset = await apiUploadAsset(lessonId, file, type);
      setAssets(prev => [...prev, newAsset]);
      return newAsset;
    } catch (err) {
      console.error('Failed to upload asset:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Rename an asset
   */
  const renameAsset = useCallback(async (lessonId, assetId, newFilename) => {
    setError(null);

    try {
      const updatedAsset = await apiRenameAsset(lessonId, assetId, newFilename);
      setAssets(prev =>
        prev.map(asset =>
          asset.id === assetId ? { ...asset, filename: newFilename, ...updatedAsset } : asset
        )
      );
      return updatedAsset;
    } catch (err) {
      console.error('Failed to rename asset:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Delete an asset
   */
  const deleteAsset = useCallback(async (lessonId, assetId) => {
    setError(null);

    try {
      await apiDeleteAsset(lessonId, assetId);
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Get assets filtered by type
   */
  const getAssetsByType = useCallback((type) => {
    return assets.filter(asset => asset.type === type);
  }, [assets]);

  /**
   * Clear assets (e.g., when closing modal)
   */
  const clearAssets = useCallback(() => {
    setAssets([]);
    setCurrentLessonId(null);
    setError(null);
  }, []);

  return (
    <AssetContext.Provider value={{
      assets,
      loading,
      error,
      currentLessonId,
      loadAssets,
      uploadAsset,
      renameAsset,
      deleteAsset,
      getAssetsByType,
      clearAssets,
    }}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};
