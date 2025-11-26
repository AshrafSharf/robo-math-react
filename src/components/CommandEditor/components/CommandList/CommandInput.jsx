import React, { useRef, forwardRef, useState } from 'react';
import useAutoResize from '../../hooks/useAutoResize';
import useAutocomplete from '../../hooks/useAutocomplete';
import CodeMirrorInput from './CodeMirrorInput';

/**
 * Auto-expanding command input with autocomplete
 */
const CommandInput = forwardRef(({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder,
  commandId
}, ref) => {
  const localRef = useRef(null);
  const inputRef = ref || localRef;
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize hook - only use when focused
  const { width, measureRef } = useAutoResize(value);

  // Calculate display width: expanded when focused with extra space, truncated when not
  const displayWidth = isFocused ? Math.max(width + 100, 150) : 200;

  // Autocomplete hook
  const {
    suggestions,
    showSuggestions,
    selectedIndex,
    handleKeyDown: handleAutocompleteKeyDown,
    selectSuggestion,
    hideSuggestions
  } = useAutocomplete(value);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleKeyDownInternal = (e) => {
    // Handle autocomplete navigation
    if (showSuggestions) {
      const handled = handleAutocompleteKeyDown(e);
      if (handled) return;

      // Handle Enter to select suggestion
      if (e.key === 'Enter' && suggestions.length > 0) {
        e.preventDefault();
        const selected = selectSuggestion(selectedIndex);
        if (selected) {
          // Extract search string and replace with selected
          const parts = value.split(/[,=(]/);
          const lastPart = parts[parts.length - 1];
          const newValue = value.slice(0, -lastPart.length) + selected + '(';
          onChange(newValue);
          hideSuggestions();
          return;
        }
      }
    }

    // Pass to parent for command-level keyboard navigation
    onKeyDown?.(e);
  };

  const handleSuggestionClick = (suggestion) => {
    const parts = value.split(/[,=(]/);
    const lastPart = parts[parts.length - 1];
    const newValue = value.slice(0, -lastPart.length) + suggestion + '(';
    onChange(newValue);
    hideSuggestions();
    inputRef.current?.focus();
  };

  const handleFocusInternal = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlurInternal = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow click
    setTimeout(() => hideSuggestions(), 200);
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
      />

      {showSuggestions && isFocused && (
        <div className="ui-autocomplete ui-menu ui-widget ui-widget-content">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`ui-menu-item ${index === selectedIndex ? 'ui-state-focus' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur
                handleSuggestionClick(suggestion);
              }}
            >
              <a className="ui-menu-item-wrapper">{suggestion}</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

CommandInput.displayName = 'CommandInput';

export default CommandInput;
