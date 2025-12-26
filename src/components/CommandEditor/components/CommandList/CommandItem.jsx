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
  commandIndex,
  allCommands,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onPlaySingle,
  onSettings,
  onKeyDown,
  onInputFocus,
  onInputBlur,
  error,
  canPlay = false,
  isPopupMode = false,
  // Global playback state
  isPlayingThis = false,
  isAnyPlaying = false,
  onStop
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
      className={`robo-cmditem ${isSelected ? 'selected' : ''} ${isPlayingThis ? 'playing' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="robo-fade-container">
        {/* Play/Stop button - show stop when this command is playing */}
        {canPlay && !error ? (
          isPlayingThis ? (
            // Show STOP when this command is playing
            <i
              className="glyphicon glyphicon-stop cmd-play-single-left cmd-stop"
              onClick={(e) => {
                e.stopPropagation();
                if (onStop) onStop();
              }}
              title="Stop and show result"
            />
          ) : (
            // Show PLAY (disabled if any playback is in progress)
            <i
              className={`glyphicon glyphicon-play cmd-play-single-left ${isAnyPlaying ? 'disabled' : ''}`}
              onClick={(e) => {
                if (isAnyPlaying) return;
                e.stopPropagation();
                onPlaySingle(command.id);
              }}
              title={isAnyPlaying ? "Wait for animation to finish" : "Play this only"}
            />
          )
        ) : (
          <span className="cmd-play-placeholder" />
        )}

        <DragHandle listeners={listeners} attributes={attributes} error={error} />

        <span className="robo-cmd-main">
          <CommandInput
            ref={inputRef}
            value={command.expression}
            onChange={handleExpressionChange}
            onFocus={() => {
              onSelect(command.id);
              onInputFocus?.(command.id);
            }}
            onBlur={() => onInputBlur?.(command.id)}
            onKeyDown={handleKeyDownInternal}
            placeholder="type here..."
            commandId={command.id}
            commandIndex={commandIndex}
            allCommands={allCommands}
            isPopupMode={isPopupMode}
          />
        </span>

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
