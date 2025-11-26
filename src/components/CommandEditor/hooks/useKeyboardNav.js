import { useCallback } from 'react';

/**
 * Hook to handle keyboard navigation between commands
 * @param {Array} commands - Array of command objects
 * @param {number} selectedId - Currently selected command ID
 * @param {Function} setSelectedId - Function to update selected ID
 * @param {Object} inputRefs - Ref object containing input refs
 * @returns {Object} { handleKeyDown } - Keyboard event handler
 */
const useKeyboardNav = (commands, selectedId, setSelectedId, inputRefs) => {
  const handleKeyDown = useCallback((e, commandId) => {
    const currentIndex = commands.findIndex(c => c.id === commandId);

    switch (e.key) {
      case 'ArrowUp':
        if (currentIndex > 0) {
          e.preventDefault();
          const prevId = commands[currentIndex - 1].id;
          setSelectedId(prevId);
          setTimeout(() => inputRefs.current[prevId]?.focus(), 0);
        }
        break;

      case 'ArrowDown':
        if (currentIndex < commands.length - 1) {
          e.preventDefault();
          const nextId = commands[currentIndex + 1].id;
          setSelectedId(nextId);
          setTimeout(() => inputRefs.current[nextId]?.focus(), 0);
        }
        break;

      case 'Tab':
        if (!e.shiftKey && currentIndex < commands.length - 1) {
          e.preventDefault();
          const nextId = commands[currentIndex + 1].id;
          setSelectedId(nextId);
          setTimeout(() => inputRefs.current[nextId]?.focus(), 0);
        } else if (e.shiftKey && currentIndex > 0) {
          e.preventDefault();
          const prevId = commands[currentIndex - 1].id;
          setSelectedId(prevId);
          setTimeout(() => inputRefs.current[prevId]?.focus(), 0);
        }
        break;

      default:
        break;
    }
  }, [commands, setSelectedId, inputRefs]);

  return { handleKeyDown };
};

export default useKeyboardNav;
