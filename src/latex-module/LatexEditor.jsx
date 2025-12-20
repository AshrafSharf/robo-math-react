import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import './LatexEditor.css';

// LaTeX language mode for CodeMirror
const latexMode = {
  token: function(stream, state) {
    if (stream.match(/\\[a-zA-Z]+/)) return 'keyword';
    if (stream.match(/[{}]/)) return 'bracket';
    if (stream.match(/[\[\]]/)) return 'squareBracket';
    if (stream.match(/[&_^]/)) return 'operator';
    if (stream.match(/[0-9]+/)) return 'number';
    stream.next();
    return null;
  }
};

// Custom syntax highlighting colors
const latexHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#61afef' },
  { tag: tags.bracket, color: '#e5c07b' },
  { tag: tags.squareBracket, color: '#c678dd' },
  { tag: tags.operator, color: '#56b6c2' },
  { tag: tags.number, color: '#d19a66' },
]);

// Custom theme for LaTeX editor (height set dynamically via props)
const latexTheme = EditorView.theme({
  '&': {
    fontSize: '18px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    backgroundColor: '#282c34',
  },
  '.cm-content': {
    padding: '15px',
    lineHeight: '28px',
    caretColor: '#528bff',
  },
  '.cm-line': { padding: '0' },
  '.cm-gutters': { display: 'none' },
  '.cm-scroller': { overflow: 'auto' },
  '&.cm-focused': { outline: 'none' },
  '.cm-cursor': { borderLeftColor: '#528bff', borderLeftWidth: '2px' },
  '.cm-selectionBackground': { backgroundColor: '#3e4451 !important' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#3e4451 !important' },
}, { dark: true });

const LatexEditor = forwardRef(({ value, onChange, placeholder, height = '140px' }, ref) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    insertText: (text) => {
      if (!viewRef.current) return;
      const view = viewRef.current;
      const from = view.state.selection.main.from;
      const to = view.state.selection.main.to;
      const transaction = view.state.update({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
      view.dispatch(transaction);
      view.focus();
    },
    focus: () => viewRef.current?.focus(),
  }));

  const extensions = [
    latexTheme,
    EditorView.lineWrapping,
    EditorState.tabSize.of(2),
    StreamLanguage.define(latexMode),
    syntaxHighlighting(latexHighlightStyle),
  ];

  return (
    <div className="latex-editor-container" style={{ height, display: 'flex', flexDirection: 'column' }}>
      <CodeMirror
        ref={editorRef}
        value={value}
        height={height}
        extensions={extensions}
        onChange={onChange}
        onCreateEditor={(view) => { viewRef.current = view; }}
        basicSetup={{
          lineNumbers: false,
          highlightActiveLineGutter: false,
          highlightSpecialChars: false,
          foldGutter: false,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: false,
          indentOnInput: false,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: false,
          autocompletion: false,
          rectangularSelection: false,
          crosshairCursor: false,
          highlightActiveLine: false,
          highlightSelectionMatches: false,
          closeBracketsKeymap: false,
          searchKeymap: false,
          foldKeymap: false,
          completionKeymap: false,
          lintKeymap: false,
        }}
        placeholder={placeholder}
      />
    </div>
  );
});

LatexEditor.displayName = 'LatexEditor';
export default LatexEditor;
