/**
 * LaTeX Module - Self-contained LaTeX editor with snippets
 *
 * Usage:
 *   import { LatexBuilderModal } from './latex-module';
 *   <LatexBuilderModal isOpen={true} onClose={() => {}} />
 *
 * External dependencies (must be installed):
 *   - react, react-dom
 *   - react-bootstrap
 *   - react-katex, katex
 *   - react-draggable
 *   - @uiw/react-codemirror
 *   - @codemirror/view, @codemirror/state, @codemirror/language
 *   - @lezer/highlight
 */

export { default as LatexBuilderModal, getLatexExpressions } from './LatexBuilderModal';
export { default as LatexBuilder } from './LatexBuilder';
export { default as LatexEditor } from './LatexEditor';
export { default as SnippetsPanel } from './SnippetsPanel';
export { SnippetInsertionProvider, useSnippetInsertion } from './SnippetInsertionContext';
