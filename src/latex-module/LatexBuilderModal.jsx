import { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import LatexBuilder from './LatexBuilder';
import './LatexBuilderModal.css';

const STORAGE_KEY = 'robomath-latex-variables';

export default function LatexBuilderModal({ isOpen, onClose, onVariablesChange }) {
  const [size, setSize] = useState({ width: 550, height: 'auto' });
  const [variables, setVariables] = useState([]);
  const nodeRef = useRef(null);
  const resizeRef = useRef(null);

  // Load variables from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setVariables(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load latex variables:', e);
    }
  }, []);

  // Save variables to localStorage and notify parent
  const handleVariablesChange = useCallback((newVariables) => {
    setVariables(newVariables);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVariables));
    } catch (e) {
      console.error('Failed to save latex variables:', e);
    }
    // Notify parent component
    if (onVariablesChange) {
      onVariablesChange(newVariables);
    }
  }, [onVariablesChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e) => {
      if (!resizeRef.current) return;
      const rect = nodeRef.current.getBoundingClientRect();
      const newWidth = Math.min(Math.max(350, e.clientX - rect.left + 10), window.innerWidth - rect.left - 10);
      const newHeight = Math.min(Math.max(300, e.clientY - rect.top + 10), window.innerHeight - rect.top - 10);
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      resizeRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  const startResize = (e) => {
    e.preventDefault();
    resizeRef.current = true;
    document.body.style.cursor = 'se-resize';
    document.body.style.userSelect = 'none';
  };

  if (!isOpen) return null;

  return (
    <div className="latex-modal-overlay">
      <Draggable handle=".latex-modal-header" nodeRef={nodeRef} bounds="parent">
        <div
          ref={nodeRef}
          className="latex-modal-container"
          style={{ width: size.width, height: size.height }}
        >
          <div className="latex-modal-header">
            <span>LaTeX Variables</span>
            <button className="latex-modal-close" onClick={onClose}>×</button>
          </div>
          <div className="latex-modal-body">
            <LatexBuilder
              variables={variables}
              onVariablesChange={handleVariablesChange}
            />
          </div>
          <div className="latex-modal-resize" onMouseDown={startResize} />
        </div>
      </Draggable>
    </div>
  );
}

// Export helper to get expressions from variables
export function getLatexExpressions(variables) {
  return variables
    .filter(v => v.variable && v.variable.trim())
    .map(v => `${v.variable} = "${v.latex}"`);
}
