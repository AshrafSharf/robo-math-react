import React from 'react';

/**
 * Command action buttons (delete and settings)
 */
const CommandActions = ({ onDelete, onSettings }) => {
  // Prevent mousedown from triggering blur on the input
  const handleMouseDown = (e) => {
    e.preventDefault();
  };

  return (
    <div className="cmd-setting-btn">
      <div className="cmd-setting-panel">
        <i
          className="glyphicon glyphicon-remove cmd-item-remove"
          onClick={onDelete}
          onMouseDown={handleMouseDown}
          title="Delete"
          style={{ display: 'block' }}
        />
        <i
          className="glyphicon glyphicon-cog cmd-item-style-toggle"
          onClick={onSettings}
          onMouseDown={handleMouseDown}
          title="Settings"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
};

export default CommandActions;
