import React, { useEffect, useRef, useState } from 'react';
import { EditorView, lineNumbers, keymap } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap, insertNewline } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { completionStatus, acceptCompletion } from '@codemirror/autocomplete';
import { roboCanvasAutocomplete } from '../../auto_complete';
import './ImportModal.css';

/**
 * Import Modal with CodeMirror editor for bulk importing expressions
 */
const ImportModal = ({ isOpen, onClose, onImport, initialExpressions = [] }) => {
  const containerRef = useRef(null);
  const editorViewRef = useRef(null);
  const [value, setValue] = useState('');

  // Initialize CodeMirror
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Build initial content from expressions (filter out empty ones)
    const initialContent = initialExpressions
      .filter(expr => expr && expr.trim())
      .join('\n');

    const startState = EditorState.create({
      doc: initialContent,
      extensions: [
        lineNumbers(),
        javascript(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        // Handle Enter: accept completion if dropdown is open, otherwise newline
        Prec.highest(keymap.of([
          {
            key: 'Enter',
            run: (view) => {
              if (completionStatus(view.state) === 'active') {
                return acceptCompletion(view);
              }
              return insertNewline(view);
            }
          }
        ])),
        keymap.of(defaultKeymap),
        ...roboCanvasAutocomplete(() => [], 0),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setValue(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": {
            fontSize: "115%",
            fontFamily: "Monaco, Consolas, 'Courier New', monospace",
            backgroundColor: "#fff"
          },
          ".cm-content": {
            padding: "8px 0",
            caretColor: "#000",
            minHeight: "250px"
          },
          ".cm-line": {
            padding: "2px 8px",
            lineHeight: "1.4"
          },
          "&.cm-focused": {
            outline: "none"
          },
          ".cm-scroller": {
            overflow: "auto",
            maxHeight: "400px"
          },
          ".cm-gutters": {
            backgroundColor: "#f7f7f7",
            borderRight: "1px solid #ddd",
            color: "#999",
            fontSize: "90%"
          },
          ".cm-activeLineGutter": {
            backgroundColor: "#e8e8e8"
          },
          ".cm-activeLine": {
            backgroundColor: "rgba(0, 0, 0, 0.04)"
          }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current
    });

    editorViewRef.current = view;
    setValue(initialContent);
    view.focus();

    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
  }, [isOpen, initialExpressions]);

  const handleImport = () => {
    if (!value.trim()) return;

    // Split by newlines and filter empty lines
    const lines = value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length > 0) {
      onImport(lines);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="import-modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="import-modal" onClick={e => e.stopPropagation()}>
        <div className="import-modal-header">
          <h3>Import Expressions</h3>
          <button className="import-modal-close" onClick={onClose}>
            <i className="glyphicon glyphicon-remove" />
          </button>
        </div>
        <div className="import-modal-body">
          <p className="import-modal-hint">Enter one expression per line:</p>
          <div ref={containerRef} className="import-modal-editor" />
        </div>
        <div className="import-modal-footer">
          <button className="btn btn-default" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleImport}>
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
