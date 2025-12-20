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
  isExecuting,
  isPaused,
  isSidebarCollapsed,
  isPopupMode
}) => {
  return (
    <div className="robo-cmd-menu-bar">
      <a
        className="btn btn-default delete-all pull-left"
        onClick={onDeleteAll}
        title="Delete All"
      >
        <i className="glyphicon glyphicon-trash" />
      </a>

      {!isExecuting ? (
        <a
          className="btn btn-default play-all pull-left"
          onClick={onPlayAll}
          title="Play All"
        >
          <i className="glyphicon glyphicon-play" />
        </a>
      ) : (
        <>
          {!isPaused ? (
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
          )}
        </>
      )}

      <a
        className="btn btn-default stop-all pull-left"
        onClick={onStop}
        disabled={!isExecuting}
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
