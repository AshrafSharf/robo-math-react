import React, { useState, useRef, useEffect } from 'react';
import { useLesson } from '../../context';
import './PageTabBar.css';

const PageTab = ({ page, isActive, onClick, onDelete, onRename, canDelete, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(page.name);
  const inputRef = useRef(null);

  // Only disable switching for non-active tabs
  const canSwitch = isActive || !disabled;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e) => {
    if (disabled) return;
    e.stopPropagation();
    setEditValue(page.name);
    setIsEditing(true);
  };

  const handleBlur = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== page.name) {
      onRename(trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setEditValue(page.name);
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    if (!canSwitch) return;
    onClick();
  };

  return (
    <div
      className={`page-tab ${isActive ? 'active' : ''} ${!canSwitch ? 'disabled' : ''}`}
      onClick={handleClick}
      title={!canSwitch ? 'Stop playback to switch pages' : page.name}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="page-tab-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="page-tab-name"
          onDoubleClick={handleDoubleClick}
        >
          {page.name}
        </span>
      )}
      {canDelete && !disabled && !isEditing && (
        <span
          className="page-tab-close"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete page"
        >
          &times;
        </span>
      )}
    </div>
  );
};

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="1" width="16" height="16" rx="2" />
    <line x1="6" y1="1" x2="6" y2="17" />
    <line x1="12" y1="1" x2="12" y2="17" />
    <line x1="1" y1="6" x2="17" y2="6" />
    <line x1="1" y1="12" x2="17" y2="12" />
  </svg>
);

const ImportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 12V2M9 12l-4-4M9 12l4-4" />
    <path d="M2 14v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" />
  </svg>
);

const PageTabBar = ({ isSidebarCollapsed, isPlaybackActive = false, showGrid, onShowGridChange, onOpenImport }) => {
  const { lesson, activePage, setActivePage, addPage, deletePage, renamePage } = useLesson();
  const canDelete = lesson.pages.length > 1;

  return (
    <div className={`page-tab-bar ${isSidebarCollapsed ? 'expanded' : ''}`}>
      <div className="page-tabs">
        {lesson.pages.map(page => (
          <PageTab
            key={page.id}
            page={page}
            isActive={page.id === activePage.id}
            onClick={() => setActivePage(page.id)}
            onDelete={() => deletePage(page.id)}
            onRename={(name) => renamePage(page.id, name)}
            canDelete={canDelete}
            disabled={isPlaybackActive}
          />
        ))}
        <button
          className="add-page-btn"
          onClick={addPage}
          title={isPlaybackActive ? "Stop playback first" : "Add Page"}
          disabled={isPlaybackActive}
        >
          +
        </button>
      </div>
      <div className="page-tab-bar-actions">
        <button
          className={`grid-toggle-btn ${showGrid ? 'active' : ''}`}
          onClick={() => onShowGridChange(!showGrid)}
          title={showGrid ? 'Hide Grid' : 'Show Grid'}
        >
          <GridIcon />
        </button>
        <button
          className="import-btn"
          onClick={onOpenImport}
          title="Import"
        >
          <ImportIcon />
        </button>
      </div>
    </div>
  );
};

export default PageTabBar;
