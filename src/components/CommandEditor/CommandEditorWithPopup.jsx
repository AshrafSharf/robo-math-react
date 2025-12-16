import React, { useState } from 'react';
import CommandEditor from './CommandEditor';
import PopupContainer from './components/PopupContainer';

/**
 * CommandEditorWithPopup - Wrapper component that handles the three display modes:
 * 1. Expanded (normal sidebar)
 * 2. Collapsed (buttons only)
 * 3. Popup (floating window via portal)
 */
const CommandEditorWithPopup = (props) => {
  const [isPopupMode, setIsPopupMode] = useState(false);

  const handlePopupMode = () => {
    setIsPopupMode(true);
  };

  const handleRestoreToSidebar = () => {
    setIsPopupMode(false);
  };

  // Popup mode: render CommandEditor inside PopupContainer
  if (isPopupMode) {
    return (
      <PopupContainer onRestoreToSidebar={handleRestoreToSidebar}>
        <CommandEditor
          {...props}
          isPopupMode={true}
          onRestoreToSidebar={handleRestoreToSidebar}
        />
      </PopupContainer>
    );
  }

  // Normal sidebar mode (expanded or collapsed)
  return (
    <CommandEditor
      {...props}
      isPopupMode={false}
      onPopupMode={handlePopupMode}
    />
  );
};

export default CommandEditorWithPopup;
