import React, { useRef } from 'react';
import CommandItem from './CommandItem';
import useKeyboardNav from '../../hooks/useKeyboardNav';

/**
 * List of command items with keyboard navigation
 */
const CommandList = ({
  commands,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onPlay,
  onSettingsClick,
  onAddCommand
}) => {
  const inputRefs = useRef({});

  const { handleKeyDown } = useKeyboardNav(
    commands,
    selectedId,
    onSelect,
    inputRefs
  );

  const handleKeyDownWithEnter = (e, commandId, action) => {
    if (action === 'enter') {
      // Add new command after this one
      onAddCommand?.(commandId);
    } else {
      handleKeyDown(e, commandId);
    }
  };

  return (
    <>
      {commands.map((command) => (
        <CommandItem
          key={command.id}
          command={command}
          isSelected={selectedId === command.id}
          onSelect={onSelect}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onPlay={onPlay}
          onSettings={onSettingsClick}
          onKeyDown={handleKeyDownWithEnter}
          ref={(el) => {
            if (el) {
              inputRefs.current[command.id] = el;
            }
          }}
        />
      ))}
    </>
  );
};

export default CommandList;
