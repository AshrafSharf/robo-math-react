/**
 * Hooks for LaTeX Module
 */

import { useState, useCallback } from 'react';

// useClipboard - Clipboard operations with feedback
export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [timeout]);

  return { copied, copy };
}

// useModal - Modal state management
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}
