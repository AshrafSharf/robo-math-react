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
  onPlaySingle,
  onSettingsClick,
  onAddCommand,
  errors = [],
  canPlayInfos = []
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
      {commands.map((command, index) => {
        const errorForCommand = errors.find(e => e.index === index);
        const canPlayInfo = canPlayInfos.find(c => c.index === index);
        return (
          <CommandItem
            key={command.id}
            command={command}
            commandIndex={index}
            allCommands={commands}
            isSelected={selectedId === command.id}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onPlaySingle={onPlaySingle}
            onSettings={onSettingsClick}
            onKeyDown={handleKeyDownWithEnter}
            error={errorForCommand?.error}
            canPlay={canPlayInfo?.canPlay ?? false}
            ref={(el) => {
              if (el) {
                inputRefs.current[command.id] = el;
              }
            }}
          />
        );
      })}
    </>
  );
};

export default CommandList;
