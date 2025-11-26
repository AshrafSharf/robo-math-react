import { useState, useEffect, useCallback } from 'react';
import { getSearchStr, getSuggestions } from '../utils/validators';

/**
 * Hook to handle autocomplete functionality
 * @param {string} value - Current input value
 * @returns {Object} Autocomplete state and handlers
 */
const useAutocomplete = (value) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update suggestions when value changes
  useEffect(() => {
    const searchStr = getSearchStr(value);
    if (searchStr && searchStr !== 'no-match') {
      const filtered = getSuggestions(searchStr);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  // Handle keyboard navigation in autocomplete
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) return false;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        return true;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        return true;

      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        return true;

      default:
        return false;
    }
  }, [showSuggestions, suggestions]);

  const selectSuggestion = useCallback((index) => {
    if (index >= 0 && index < suggestions.length) {
      return suggestions[index];
    }
    return null;
  }, [suggestions]);

  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  return {
    suggestions,
    showSuggestions,
    selectedIndex,
    handleKeyDown,
    selectSuggestion,
    hideSuggestions
  };
};

export default useAutocomplete;
