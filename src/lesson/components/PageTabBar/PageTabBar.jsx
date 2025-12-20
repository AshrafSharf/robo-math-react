import React, { useState, useRef, useCallback } from 'react';
import { useLesson } from '../../context';
import { InteractiveCommandController } from '../../../engine/controller/InteractiveCommandController.js';
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

const PageTabBar = ({ isSidebarCollapsed, controller }) => {
  const { lesson, activePage, setActivePage, addPage, deletePage } = useLesson();
  const canDelete = lesson.pages.length > 1;

  const [showPlaybackBar, setShowPlaybackBar] = useState(false);
  const interactiveControllerRef = useRef(null);

  const handlePlayClick = useCallback(async () => {
    if (!controller?.roboCanvas) {
      console.warn('Cannot start playback: no roboCanvas');
      return;
    }

    // Cancel any pending execution from the main controller
    controller.cancelPendingExecution();

    // Create new interactive controller with same roboCanvas
    const interactiveController = new InteractiveCommandController(controller.roboCanvas);
    interactiveController.setCommandModels(controller.commandModels);

    // Initialize (clears canvas, prepares commands, does NOT play)
    const success = await interactiveController.initialize();
    if (success) {
      interactiveControllerRef.current = interactiveController;
      setShowPlaybackBar(true);
    }
  }, [controller]);

  const handleClosePlayback = useCallback(() => {
    if (interactiveControllerRef.current) {
      interactiveControllerRef.current.destroy();
      interactiveControllerRef.current = null;
    }
    setShowPlaybackBar(false);

    // Re-execute main controller to restore normal view
    if (controller) {
      controller.executeAll(controller.commandModels);
    }
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
        <button
          className="add-page-btn"
          onClick={addPage}
          title="Add Page"
        >
          +
        </button>
      </div>

      {showPlaybackBar && interactiveControllerRef.current && (
        <PlaybackBar
          controller={interactiveControllerRef.current}
          onClose={handleClosePlayback}
        />
      )}
    </>
  );
};

export default PageTabBar;
