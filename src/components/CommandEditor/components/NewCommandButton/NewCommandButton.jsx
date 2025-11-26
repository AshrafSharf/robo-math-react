import React from 'react';

/**
 * Button to add a new command at the end
 */
const NewCommandButton = ({ onClick }) => {
  return (
    <div className="new-cmd-item" onClick={onClick}>
      <span>New command</span>
    </div>
  );
};

export default NewCommandButton;
