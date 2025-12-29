import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import toast from 'react-hot-toast';
import { useAssets } from '../../lesson/context';
import { AssetType } from '../../api';
import AssetThumbnail from './AssetThumbnail';
import './AssetManagerModal.css';

/**
 * Asset Manager Modal
 *
 * Modal dialog for managing lesson assets (images, audio).
 */
const AssetManagerModal = ({ isOpen, onClose, lessonId }) => {
  const nodeRef = useRef(null);
  const resizeRef = useRef(null);
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('images');
  const [size, setSize] = useState({ width: 600, height: 450 });
  const [uploading, setUploading] = useState(false);

  const {
    assets,
    loading,
    error,
    loadAssets,
    uploadAsset,
    renameAsset,
    deleteAsset,
    clearAssets,
  } = useAssets();

  // Load assets when modal opens
  useEffect(() => {
    if (isOpen && lessonId) {
      loadAssets(lessonId);
    }
    return () => {
      if (!isOpen) {
        clearAssets();
      }
    };
  }, [isOpen, lessonId, loadAssets, clearAssets]);

  // Resize handling
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e) => {
      if (!resizeRef.current) return;
      const rect = nodeRef.current.getBoundingClientRect();
      const newWidth = Math.min(Math.max(400, e.clientX - rect.left + 10), window.innerWidth - rect.left - 20);
      const newHeight = Math.min(Math.max(300, e.clientY - rect.top + 10), window.innerHeight - rect.top - 20);
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      resizeRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  const startResize = (e) => {
    e.preventDefault();
    resizeRef.current = true;
    document.body.style.cursor = 'se-resize';
    document.body.style.userSelect = 'none';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !lessonId) return;

    setUploading(true);
    try {
      await uploadAsset(lessonId, file, AssetType.IMAGE);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleRename = async (assetId, newFilename) => {
    if (!lessonId) return;
    try {
      await renameAsset(lessonId, assetId, newFilename);
    } catch (err) {
      toast.error(`Rename failed: ${err.message}`);
    }
  };

  const handleDelete = async (assetId) => {
    if (!lessonId) return;
    if (!window.confirm('Delete this asset?')) return;

    try {
      await deleteAsset(lessonId, assetId);
      toast.success('Asset deleted');
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  // Filter assets by active tab
  const filteredAssets = assets.filter(asset => {
    if (activeTab === 'images') return asset.type === AssetType.IMAGE;
    if (activeTab === 'audio') return asset.type === AssetType.AUDIO;
    return true;
  });

  return (
    <div className="asset-modal-overlay" onKeyDown={handleKeyDown}>
      <Draggable handle=".asset-modal-header" nodeRef={nodeRef} bounds="parent">
        <div
          ref={nodeRef}
          className="asset-modal"
          style={{ width: size.width, height: size.height }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="asset-modal-header">
            <h3>Assets</h3>
            <button className="asset-modal-close" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>

          {/* Toolbar with tabs and upload */}
          <div className="asset-modal-toolbar">
            <div className="asset-tabs">
              <button
                className={`asset-tab ${activeTab === 'images' ? 'active' : ''}`}
                onClick={() => setActiveTab('images')}
              >
                Images
              </button>
              <button
                className={`asset-tab ${activeTab === 'audio' ? 'active' : ''}`}
                onClick={() => setActiveTab('audio')}
                disabled
                title="Coming soon"
              >
                Audio
              </button>
            </div>

            <button
              className="asset-upload-btn"
              onClick={handleUploadClick}
              disabled={uploading || !lessonId}
            >
              {uploading ? (
                <span className="asset-upload-spinner" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 3v10M3 8h10" />
                </svg>
              )}
              Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Body */}
          <div className="asset-modal-body">
            {loading ? (
              <div className="asset-loading">Loading assets...</div>
            ) : error ? (
              <div className="asset-error">{error}</div>
            ) : filteredAssets.length === 0 ? (
              <div className="asset-empty">
                <p>No {activeTab} yet.</p>
                <p>Click Upload to add one!</p>
              </div>
            ) : (
              <div className="asset-grid">
                {filteredAssets.map(asset => (
                  <AssetThumbnail
                    key={asset.id}
                    asset={asset}
                    onRename={(newName) => handleRename(asset.id, newName)}
                    onDelete={() => handleDelete(asset.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Resize handle */}
          <div className="asset-modal-resize" onMouseDown={startResize} />
        </div>
      </Draggable>
    </div>
  );
};

export default AssetManagerModal;
