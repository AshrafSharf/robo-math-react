import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

/**
 * CodeMirror-based input component with single-line editing
 */
const CodeMirrorInput = forwardRef(({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder,
  commandId,
  isFocused,
  displayWidth
}, ref) => {
  const containerRef = useRef(null);
  const editorViewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onKeyDownRef = useRef(onKeyDown);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);

  // Keep refs updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onKeyDownRef.current = onKeyDown;
  }, [onKeyDown]);

  useEffect(() => {
    onFocusRef.current = onFocus;
  }, [onFocus]);

  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (editorViewRef.current) {
        editorViewRef.current.focus();
      }
    }
  }));

  // Initialize CodeMirror
  useEffect(() => {
    if (!containerRef.current) return;

    const startState = EditorState.create({
      doc: value || '',
      extensions: [
        javascript(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([
          ...defaultKeymap,
          {
            key: 'Enter',
            run: (view) => {
              // Prevent new line, trigger parent handler
              const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
              onKeyDownRef.current?.(event);
              return true;
            }
          },
          {
            key: 'ArrowUp',
            run: (view) => {
              const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
              onKeyDownRef.current?.(event);
              return true;
            }
          },
          {
            key: 'ArrowDown',
            run: (view) => {
              const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
              onKeyDownRef.current?.(event);
              return true;
            }
          },
          {
            key: 'Tab',
            run: (view) => {
              const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
              onKeyDownRef.current?.(event);
              return true;
            }
          }
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            // Simulate event object for compatibility with existing onChange handler
            onChangeRef.current?.({ target: { value: newValue } });
          }
          if (update.focusChanged) {
            if (update.view.hasFocus) {
              onFocusRef.current?.();
            } else {
              onBlurRef.current?.();
            }
          }
        }),
        EditorView.domEventHandlers({
          keydown: (event, view) => {
            // Let our custom keymaps handle these
            if (['Enter', 'ArrowUp', 'ArrowDown', 'Tab'].includes(event.key)) {
              return false;
            }
            return false;
          }
        }),
        EditorView.theme({
          "&": {
            fontSize: "115%",
            fontFamily: "Monaco, Consolas, 'Courier New', monospace",
            padding: "0",
            margin: "0"
          },
          ".cm-gutters": {
            display: "none !important",
            width: "0 !important",
            minWidth: "0 !important"
          },
          ".cm-gutter": {
            display: "none !important",
            width: "0 !important"
          },
          ".cm-content": {
            padding: "0",
            margin: "0",
            caretColor: "#000",
            minHeight: "auto"
          },
          ".cm-line": {
            padding: "0",
            margin: "0",
            lineHeight: "1.2"
          },
          ".cm-cursor": {
            height: "1.2em",
            borderLeftWidth: "1.5px"
          },
          "&.cm-focused": {
            outline: "none"
          },
          ".cm-scroller": {
            overflow: "hidden",
            padding: "0",
            margin: "0"
          },
          ".cm-placeholder": {
            color: "#999",
            fontFamily: '"Open Sans","Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: "16px"
          }
        }),
        EditorView.lineWrapping,
        EditorState.transactionFilter.of(tr => {
          // Prevent multi-line input - filter out newlines
          if (tr.newDoc.lines > 1) {
            return [];
          }
          return tr;
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []); // Only run once on mount

  // Update content when value prop changes (external updates)
  useEffect(() => {
    if (editorViewRef.current) {
      const currentValue = editorViewRef.current.state.doc.toString();
      if (currentValue !== value) {
        editorViewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value || ''
          }
        });
      }
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`cmd-expression codemirror-wrapper ${isFocused ? 'focused' : ''}`}
      data-id={commandId}
      style={{
        width: `${displayWidth}px`,
        transition: 'width 0.2s ease'
      }}
    />
  );
});

CodeMirrorInput.displayName = 'CodeMirrorInput';

export default CodeMirrorInput;
