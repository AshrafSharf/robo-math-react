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
  onImport,
  onToggleSidebar,
  isExecuting,
  isPaused,
  isSidebarCollapsed
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
        className="btn btn-default import-btn pull-left"
        onClick={onImport}
        title="Import Expressions"
      >
        <i className="glyphicon glyphicon-import" />
      </a>

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
