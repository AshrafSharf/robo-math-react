import React from 'react';

/**
 * Command menu bar with play controls (matches robocompass structure)
 */
const CommandMenuBar = ({
  onPlayAll,
  onStop,
  onPause,
  onResume,
  onDeleteAll,
  onOpenLatex,
  onToggleSidebar,
  onPopupMode,
  // Playback state (from mediator via props)
  isActive = false,     // Any playback in progress
  isPaused = false,     // Currently paused
  isPlaying = false,    // Currently playing (not paused)
  stopPlayback,
  isSidebarCollapsed,
  isPopupMode
}) => {
  // Combined stop handler - calls both mediator and local stop
  const handleStop = () => {
    if (stopPlayback) stopPlayback();
    if (onStop) onStop();
  };

  return (
    <div className="robo-cmd-menu-bar">
      <a
        className="btn btn-default delete-all pull-left"
        onClick={onDeleteAll}
        title="Delete All"
      >
        <i className="glyphicon glyphicon-trash" />
      </a>

      {/* Play All - show play when idle, pause/resume when active */}
      {!isActive ? (
        <a
          className="btn btn-default play-all pull-left"
          onClick={onPlayAll}
          title="Play All"
        >
          <i className="glyphicon glyphicon-play" />
        </a>
      ) : (
        // Show pause/resume when any playback is active
        !isPaused ? (
          <a
            className="btn btn-default pause-all pull-left"
            onClick={onPause}
            title="Pause"
          >
            <i className="glyphicon glyphicon-pause" />
          </a>
        ) : (
          <a
            className="btn btn-default resume-all pull-left"
            onClick={onResume}
            title="Resume"
          >
            <i className="glyphicon glyphicon-play" />
          </a>
        )
      )}

      {/* Stop - active (red) when playing, disabled (black) when idle */}
      <a
        className={`btn btn-default stop-all pull-left ${isActive ? 'active' : 'disabled'}`}
        onClick={isActive ? handleStop : undefined}
        title="Stop"
      >
        <i className="glyphicon glyphicon-stop" />
      </a>

      <a
        className="btn btn-default latex-btn pull-left"
        onClick={onOpenLatex}
        title="LaTeX Editor"
      >
        <span style={{ fontSize: '18px' }}>∑</span>
      </a>

      {/* Popup mode button - only visible in collapsed state */}
      {isSidebarCollapsed && !isPopupMode && (
        <a
          className="btn btn-default popup-btn pull-left"
          onClick={onPopupMode}
          title="Open as popup"
        >
          <i className="glyphicon glyphicon-new-window" />
        </a>
      )}

      <a
        id="slide-btn"
        className="btn btn-default resize-btn pull-right"
        onClick={onToggleSidebar}
        title={isSidebarCollapsed ? "Show" : "Hide"}
      >
        <i className={`glyphicon ${isSidebarCollapsed ? 'glyphicon-chevron-right' : 'glyphicon-chevron-left'}`} />
      </a>
    </div>
  );
};

export default CommandMenuBar;
