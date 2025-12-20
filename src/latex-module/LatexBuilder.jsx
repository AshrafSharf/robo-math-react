import { useState, useRef, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { useClipboard } from './hooks';
import LatexEditor from './LatexEditor';
import SnippetsPanel from './SnippetsPanel';
import './LatexBuilder.css';

export default function LatexBuilder({ variables = [], onVariablesChange }) {
  const [selectedIndex, setSelectedIndex] = useState(variables.length > 0 ? 0 : -1);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [snippetsExpanded, setSnippetsExpanded] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const editorRef = useRef(null);
  const { copied, copy } = useClipboard();

  // Select first variable when variables load and nothing is selected
  useEffect(() => {
    if (variables.length > 0 && selectedIndex === -1) {
      setSelectedIndex(0);
    }
  }, [variables.length]);

  // Get current latex code from selected variable
  const latexCode = selectedIndex >= 0 && variables[selectedIndex]
    ? variables[selectedIndex].latex
    : '';

  // Update latex code for selected variable
  const handleLatexChange = (newLatex) => {
    if (selectedIndex >= 0 && onVariablesChange) {
      const updated = [...variables];
      updated[selectedIndex] = { ...updated[selectedIndex], latex: newLatex };
      onVariablesChange(updated);
    }
  };

  // Add new variable
  const handleAddVariable = () => {
    const newVar = { variable: '', latex: '' };
    const updated = [...variables, newVar];
    if (onVariablesChange) {
      onVariablesChange(updated);
    }
    const newIndex = updated.length - 1;
    setSelectedIndex(newIndex);
    setEditingIndex(newIndex);
  };

  // Delete variable
  const handleDeleteVariable = (index, e) => {
    e.stopPropagation();
    const updated = variables.filter((_, i) => i !== index);
    if (onVariablesChange) {
      onVariablesChange(updated);
    }
    // Adjust selection
    if (selectedIndex === index) {
      setSelectedIndex(-1);
    } else if (selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
    setEditingIndex(-1);
  };

  // Select variable row
  const handleSelectVariable = (index) => {
    setSelectedIndex(index);
    setEditingIndex(index);
  };

  // Update variable name
  const handleVariableNameChange = (index, newName) => {
    if (onVariablesChange) {
      const updated = [...variables];
      updated[index] = { ...updated[index], variable: newName };
      onVariablesChange(updated);
    }
  };

  // Handle key press in variable name input
  const handleVariableKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      setEditingIndex(-1);
      // Focus the editor
      if (editorRef.current && editorRef.current.focus) {
        editorRef.current.focus();
      }
    }
  };

  const handleSnippetClick = (snippet) => {
    if (editorRef.current && editorRef.current.insertText) {
      editorRef.current.insertText(snippet.latex);
    }
  };

  return (
    <div className="latex-builder-with-sidebar">
      {/* Left sidebar - Variable list */}
      <div className="latex-var-sidebar">
        <div className="latex-var-header">
          <button
            className="latex-var-add-btn"
            onClick={handleAddVariable}
            title="Add Variable"
          >
            +
          </button>
          <button
            className="latex-var-delete-btn-header"
            onClick={(e) => selectedIndex >= 0 && handleDeleteVariable(selectedIndex, e)}
            disabled={selectedIndex < 0}
            title="Delete Selected"
          >
            −
          </button>
        </div>
        <div className="latex-var-list">
          {variables.map((item, index) => (
            <div
              key={index}
              className={`latex-var-row ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => handleSelectVariable(index)}
            >
              {editingIndex === index ? (
                <input
                  type="text"
                  className="latex-var-name-input"
                  value={item.variable}
                  onChange={(e) => handleVariableNameChange(index, e.target.value)}
                  onKeyDown={handleVariableKeyDown}
                  onBlur={() => setEditingIndex(-1)}
                  placeholder="var"
                  maxLength={5}
                  autoFocus
                />
              ) : (
                <span className="latex-var-name">
                  {item.variable || '?'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Editor */}
      <div className="latex-builder-vertical">
        <div className={`latex-editor-section ${!previewVisible ? 'expanded' : ''}`}>
          <div className="editor-wrapper">
            <LatexEditor
              ref={editorRef}
              value={latexCode}
              onChange={handleLatexChange}
              placeholder={selectedIndex >= 0 ? "Enter LaTeX code..." : "Select or add a variable first"}
              readOnly={selectedIndex < 0}
              height={previewVisible ? "140px" : "100%"}
            />
            <div className="editor-overlay-buttons-bottom">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{previewVisible ? 'Hide Preview' : 'Show Preview'}</Tooltip>}
                delay={{ show: 300, hide: 0 }}
              >
                <button
                  className={`icon-btn ${previewVisible ? 'icon-btn-primary' : 'icon-btn-secondary'}`}
                  onClick={() => setPreviewVisible(!previewVisible)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{copied ? 'Copied!' : 'Copy'}</Tooltip>}
                delay={{ show: 300, hide: 0 }}
              >
                <button
                  className={copied ? 'icon-btn icon-btn-success' : 'icon-btn icon-btn-secondary'}
                  onClick={() => copy(latexCode)}
                  disabled={!latexCode}
                >
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </OverlayTrigger>
            </div>
          </div>
        </div>

        {previewVisible && (
          <div className="latex-preview-section">
            <div className="latex-preview-box">
              {!latexCode.trim() ? (
                <div className="preview-placeholder">
                  {selectedIndex >= 0 ? 'Preview will appear here' : 'Select a variable to edit'}
                </div>
              ) : (
                <InlineMath math={latexCode} />
              )}
            </div>
          </div>
        )}

        <div className="latex-snippets-section">
          <SnippetsPanel onSnippetClick={handleSnippetClick} showGeneral={true} showCategories={false} />
          <div className="latex-snippets-toggle">
            <button
              className="snippets-toggle-btn"
              onClick={() => setSnippetsExpanded(!snippetsExpanded)}
              title={snippetsExpanded ? 'Hide Categories' : 'Show Categories'}
            >
              {snippetsExpanded ? '▼ Categories' : '▶ Categories'}
            </button>
          </div>
          {snippetsExpanded && (
            <SnippetsPanel onSnippetClick={handleSnippetClick} showGeneral={false} showCategories={true} />
          )}
        </div>
      </div>
    </div>
  );
}
