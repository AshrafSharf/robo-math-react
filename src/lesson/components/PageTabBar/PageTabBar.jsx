import React, { useState, useCallback } from 'react';
import { useLesson } from '../../context';
import PlaybackBar from '../PlaybackBar/PlaybackBar';
import './PageTabBar.css';

const PageTab = ({ page, isActive, onClick, onDelete, canDelete }) => {
  return (
    <div
      className={`page-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={page.name}
    >
      <span className="page-tab-name">{page.name}</span>
      {canDelete && (
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

const PageTabBar = ({ isSidebarCollapsed, controller, onPlaybackStart }) => {
  const { lesson, activePage, setActivePage, addPage, deletePage } = useLesson();
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
              canDelete={canDelete}
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
            title="Interactive Playback"
            disabled={!controller?.roboCanvas || !controller.commandModels?.length}
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M8 5v14l11-7L8 5z"/>
            </svg>
          </button>
        )}
        <button
          className="add-page-btn"
          onClick={addPage}
          title="Add Page"
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
