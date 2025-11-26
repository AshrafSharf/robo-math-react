import React from 'react';

/**
 * Command action buttons (delete and settings)
 */
const CommandActions = ({ onDelete, onSettings }) => {
  return (
    <div className="cmd-setting-btn">
      <div className="cmd-setting-panel">
        <i
          className="glyphicon glyphicon-remove cmd-item-remove"
          onClick={onDelete}
          title="Delete"
          style={{ display: 'block' }}
        />
        <i
          className="glyphicon glyphicon-cog cmd-item-style-toggle"
          onClick={onSettings}
          title="Settings"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
};

export default CommandActions;
