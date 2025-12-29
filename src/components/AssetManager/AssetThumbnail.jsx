import React, { useState, useRef, useEffect } from 'react';
import { formatFileSize } from '../../api';
import './AssetThumbnail.css';

/**
 * Asset Thumbnail Component
 *
 * Displays an asset as a thumbnail card with:
 * - Image preview
 * - Editable filename
 * - Delete button
 */
const AssetThumbnail = ({ asset, onRename, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(asset.filename);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(asset.filename);
  }, [asset.filename]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select filename without extension
      const dotIndex = editValue.lastIndexOf('.');
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== asset.filename) {
      onRename(trimmed);
    } else {
      setEditValue(asset.filename);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(asset.filename);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete();
  };

  // Use signedUrl if available, otherwise show placeholder
  const imageUrl = asset.signedUrl || '';

  return (
    <div className="asset-thumbnail">
      {/* Image preview */}
      <div className="asset-thumbnail-image">
        {imageUrl ? (
          <img src={imageUrl} alt={asset.filename} />
        ) : (
          <div className="asset-thumbnail-placeholder">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="4" y="4" width="24" height="24" rx="2" />
              <circle cx="11" cy="11" r="2" />
              <path d="M28 20l-6-6-8 8" />
              <path d="M20 28l-8-8-8 8" />
            </svg>
          </div>
        )}

        {/* Delete button overlay */}
        <button
          className="asset-thumbnail-delete"
          onClick={handleDeleteClick}
          title="Delete asset"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>

      {/* Filename */}
      <div className="asset-thumbnail-info">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="asset-thumbnail-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div
            className="asset-thumbnail-filename"
            onClick={() => setIsEditing(true)}
            title={`${asset.filename}\nClick to rename`}
          >
            {asset.filename}
          </div>
        )}
        <div className="asset-thumbnail-size">
          {formatFileSize(asset.size)}
        </div>
      </div>
    </div>
  );
};

export default AssetThumbnail;
