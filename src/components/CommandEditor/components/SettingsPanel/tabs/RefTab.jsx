import React, { useEffect, useRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { completionStatus, acceptCompletion } from '@codemirror/autocomplete';
import { roboCanvasAutocomplete, clearSignatureTooltips } from '../../../auto_complete';

/**
 * Ref Tab - Multi-line CodeMirror editor for ref() expression content
 * Only shown when expression type is 'ref'
 */
const RefTab = ({ content, onChange, variableProvider, currentLineIndex }) => {
    const containerRef = useRef(null);
    const editorViewRef = useRef(null);
    const onChangeRef = useRef(onChange);

    // Keep onChange ref updated
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Initialize CodeMirror (multi-line)
    useEffect(() => {
        if (!containerRef.current) return;

        const startState = EditorState.create({
            doc: content || '',
            extensions: [
                javascript(),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                // Add robo-canvas autocomplete with variable support
                ...roboCanvasAutocomplete(variableProvider, currentLineIndex),
                keymap.of([
                    ...defaultKeymap,
                    {
                        key: 'Tab',
                        run: (view) => {
                            // If autocomplete is active, accept the completion
                            if (completionStatus(view.state) === 'active') {
                                return acceptCompletion(view);
                            }
                            return false;
                        }
                    }
                ]),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        const newValue = update.state.doc.toString();
                        onChangeRef.current?.(newValue);
                    }
                    if (update.focusChanged && !update.view.hasFocus) {
                        // Clear signature tooltips on blur
                        update.view.dispatch({
                            effects: clearSignatureTooltips.of(null)
                        });
                    }
                }),
                EditorView.theme({
                    "&": {
                        fontSize: "14px",
                        fontFamily: "Monaco, Consolas, 'Courier New', monospace",
                        height: "150px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "#fff"
                    },
                    ".cm-content": {
                        padding: "8px",
                        minHeight: "140px",
                        caretColor: "#000"
                    },
                    ".cm-scroller": {
                        overflow: "auto"
                    },
                    "&.cm-focused": {
                        outline: "2px solid #007bff",
                        outlineOffset: "-1px"
                    },
                    ".cm-line": {
                        padding: "0 2px"
                    },
                    ".cm-gutters": {
                        display: "none"
                    }
                }),
                EditorView.lineWrapping
            ]
        });

        const view = new EditorView({
            state: startState,
            parent: containerRef.current
        });

        editorViewRef.current = view;

        return () => view.destroy();
    }, []);

    // Sync external content changes
    useEffect(() => {
        if (editorViewRef.current) {
            const currentValue = editorViewRef.current.state.doc.toString();
            if (currentValue !== content) {
                editorViewRef.current.dispatch({
                    changes: { from: 0, to: currentValue.length, insert: content || '' }
                });
            }
        }
    }, [content]);

    return (
        <div className="ref-tab">
            <div ref={containerRef} className="ref-editor-container" />
            <div className="ref-tab-hint">
                Enter an expression (e.g., point(G, 3, 4))
            </div>
        </div>
    );
};

export default RefTab;
