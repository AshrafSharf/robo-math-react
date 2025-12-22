import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLesson } from '../../context';
import PlaybackBar from '../PlaybackBar/PlaybackBar';
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

const PageTabBar = ({ isSidebarCollapsed, controller, onPlaybackStart, isPlaybackActive = false }) => {
  const { lesson, activePage, setActivePage, addPage, deletePage, renamePage } = useLesson();
  const canDelete = lesson.pages.length > 1;

  const [showPlaybackBar, setShowPlaybackBar] = useState(false);

  const handlePlayClick = useCallback(async () => {
    if (!controller?.roboCanvas) {
      console.warn('Cannot start playback: no roboCanvas');
      return;
    }

    controller.cancelPendingExecution();
    const success = await controller.startInteractivePlay();
    if (success) {
      setShowPlaybackBar(true);
      onPlaybackStart?.();
    }
  }, [controller, onPlaybackStart]);

  const handleClosePlayback = useCallback(async () => {
    await controller?.stopAndDrawInteractive();
    setShowPlaybackBar(false);
    controller?.executeAll(controller.commandModels);
  }, [controller]);

  return (
    <>
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
        </div>
        {showPlaybackBar ? (
          <button
            className="stop-page-btn"
            onClick={handleClosePlayback}
            title="Stop Playback"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M6 6h12v12H6z"/>
            </svg>
          </button>
        ) : (
          <button
            className="play-page-btn"
            onClick={handlePlayClick}
            title={isPlaybackActive ? "Stop current playback first" : "Interactive Playback"}
            disabled={isPlaybackActive || !controller?.roboCanvas || !controller.commandModels?.length}
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M8 5v14l11-7L8 5z"/>
            </svg>
          </button>
        )}
        <button
          className="add-page-btn"
          onClick={addPage}
          title={isPlaybackActive ? "Stop playback first" : "Add Page"}
          disabled={isPlaybackActive}
        >
          +
        </button>
      </div>

      {showPlaybackBar && (
        <PlaybackBar
          controller={controller}
          onClose={handleClosePlayback}
        />
      )}
    </>
  );
};

export default PageTabBar;
