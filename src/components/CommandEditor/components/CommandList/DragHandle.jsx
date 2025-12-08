import React from 'react';
import ErrorIndicator from './ErrorIndicator';

/**
 * Drag handle for sortable command items
 */
const DragHandle = ({ listeners, attributes, error }) => {
  return (
    <span
      className={`cmd-editor-left ${error ? 'has-error' : ''}`}
      {...(error ? {} : { ...listeners, ...attributes })}
    >
      {error ? (
        <ErrorIndicator error={error} />
      ) : (
        <span className="drag-handle-icon">☰</span>
      )}
    </span>
  );
};

export default DragHandle;
