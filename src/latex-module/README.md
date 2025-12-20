# LaTeX Module

Self-contained LaTeX editor with snippets panel.

## Files

- `index.js` - Main exports
- `LatexBuilderModal.jsx/css` - Draggable/resizable modal wrapper
- `LatexBuilder.jsx/css` - Main editor + preview + snippets layout
- `LatexEditor.jsx/css` - CodeMirror-based LaTeX editor
- `SnippetsPanel.jsx/css` - Categorized LaTeX snippets
- `latexSnippets.js` - Snippets data
- `hooks.js` - useClipboard, useModal hooks
- `SnippetInsertionContext.jsx` - Context for snippet insertion

## Usage

```jsx
import { LatexBuilderModal } from './latex-module';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open LaTeX Editor</button>
      <LatexBuilderModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

## External Dependencies

Install these packages:

```bash
npm install react react-dom react-bootstrap bootstrap react-katex katex react-draggable @uiw/react-codemirror @codemirror/view @codemirror/state @codemirror/language @lezer/highlight
```

Also import Bootstrap CSS in your app:
```js
import 'bootstrap/dist/css/bootstrap.min.css';
```
