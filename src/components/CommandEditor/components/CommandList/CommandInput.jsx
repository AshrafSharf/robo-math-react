import React, { useRef, forwardRef, useState, useCallback, useMemo } from 'react';
import useAutoResize from '../../hooks/useAutoResize';
import CodeMirrorInput from './CodeMirrorInput';
import { extractVariables } from '../../auto_complete';

/**
 * Auto-expanding command input with CodeMirror autocomplete
 */
const CommandInput = forwardRef(({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder,
  commandId,
  commandIndex,
  allCommands
}, ref) => {
  const localRef = useRef(null);
  const inputRef = ref || localRef;
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize hook
  const { width, measureRef } = useAutoResize(value);

  // Calculate display width: expands based on content when focused, fixed width when unfocused
  const displayWidth = isFocused ? Math.max(width + 80, 250) : 250;

  // Create variable provider that returns variables defined before current line
  const variableProvider = useCallback((lineIndex) => {
    if (!allCommands) return [];
    return extractVariables(allCommands, lineIndex);
  }, [allCommands]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleKeyDownInternal = (e) => {
    // Pass to parent for command-level keyboard navigation
    onKeyDown?.(e);
  };

  const handleFocusInternal = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlurInternal = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Hidden span for measuring text width */}
      <span
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          fontSize: '115%',
          padding: '5px'
        }}
      >
        {value || placeholder}
      </span>

      <CodeMirrorInput
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocusInternal}
        onBlur={handleBlurInternal}
        onKeyDown={handleKeyDownInternal}
        placeholder={placeholder}
        commandId={commandId}
        isFocused={isFocused}
        displayWidth={displayWidth}
        variableProvider={variableProvider}
        currentLineIndex={commandIndex}
      />
    </div>
  );
});

CommandInput.displayName = 'CommandInput';

export default CommandInput;
