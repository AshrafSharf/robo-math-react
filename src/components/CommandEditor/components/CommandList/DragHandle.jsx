import React from 'react';

/**
 * Drag handle for sortable command items
 */
const DragHandle = ({ listeners, attributes }) => {
  return (
    <span
      className="cmd-editor-left"
      {...listeners}
      {...attributes}
      style={{ cursor: 'move', touchAction: 'none' }}
    >
      <span style={{ fontSize: '10px', color: '#888', userSelect: 'none' }}>☰</span>
    </span>
  );
};

export default DragHandle;
