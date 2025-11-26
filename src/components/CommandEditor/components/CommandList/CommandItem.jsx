import React, { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CommandInput from './CommandInput';
import CommandActions from './CommandActions';
import DragHandle from './DragHandle';

/**
 * Individual command item with drag & drop, input, and actions
 */
const CommandItem = ({
  command,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onPlay,
  onSettings,
  onKeyDown
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: command.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleExpressionChange = (value) => {
    onUpdate(command.id, { expression: value });
  };

  const handleKeyDownInternal = (e) => {
    // Enter key adds new command
    if (e.key === 'Enter') {
      e.preventDefault();
      onKeyDown?.(e, command.id, 'enter');
      return;
    }

    // Pass other keys to keyboard navigation
    onKeyDown?.(e, command.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`robo-cmditem ${isSelected ? 'selected' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="robo-fade-container">
        <span className="robo-cmd-main">
          <CommandInput
            ref={inputRef}
            value={command.expression}
            onChange={handleExpressionChange}
            onFocus={() => onSelect(command.id)}
            onKeyDown={handleKeyDownInternal}
            placeholder="type here..."
            commandId={command.id}
          />

          <DragHandle listeners={listeners} attributes={attributes} />
        </span>

        <i
          className="glyphicon glyphicon-play cmd-item-play"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(command);
          }}
          title="Play"
        />

        {isHovered && (
          <CommandActions
            onDelete={() => onDelete(command.id)}
            onSettings={(e) => {
              e.stopPropagation();
              onSettings(command.id);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CommandItem;
