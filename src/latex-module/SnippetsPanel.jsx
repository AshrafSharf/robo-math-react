import { useState, useMemo } from 'react';
import { InlineMath } from 'react-katex';
import { Nav } from 'react-bootstrap';
import { snippetCategories, getSnippetsByCategory, getGeneralSnippets } from './latexSnippets';
import { useSnippetInsertion } from './SnippetInsertionContext';
import 'katex/dist/katex.min.css';
import './SnippetsPanel.css';

export default function SnippetsPanel({ onSnippetClick, showGeneral = true, showCategories = true }) {
  const { insertSnippet } = useSnippetInsertion();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedGeneralIndex, setCopiedGeneralIndex] = useState(null);
  const [activeKey, setActiveKey] = useState(snippetCategories[0]);

  const generalSnippets = useMemo(() => getGeneralSnippets(), []);
  const categorySnippets = useMemo(() => getSnippetsByCategory(activeKey), [activeKey]);

  const handleSnippetClick = async (snippet, index, isGeneral = false) => {
    if (onSnippetClick) {
      onSnippetClick(snippet);
    } else if (insertSnippet) {
      insertSnippet(snippet.latex);
    }

    try {
      await navigator.clipboard.writeText(snippet.latex);
      if (isGeneral) {
        setCopiedGeneralIndex(index);
        setTimeout(() => setCopiedGeneralIndex(null), 1000);
      } else {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="snippets-panel">
      {showGeneral && (
        <div className="general-section">
          <div className="snippets-grid general-grid">
            {generalSnippets.map((snippet, index) => (
              <div
                key={`general-${index}`}
                className={`snippet-item ${copiedGeneralIndex === index ? 'copied' : ''}`}
                onClick={() => handleSnippetClick(snippet, index, true)}
                title={snippet.name}
              >
                <div className="snippet-render">
                  <InlineMath math={snippet.latex} />
                </div>
                {copiedGeneralIndex === index && (
                  <div className="copy-indicator">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showCategories && (
        <div className="windows-tabs-container">
          <Nav variant="tabs" activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
            {snippetCategories.map((category) => (
              <Nav.Item key={category}>
                <Nav.Link eventKey={category}>{category}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          <div className="tab-content-area">
            <div className="snippets-grid category-grid">
              {categorySnippets.map((snippet, index) => (
                <div
                  key={`${activeKey}-${index}`}
                  className={`snippet-item ${copiedIndex === index ? 'copied' : ''}`}
                  onClick={() => handleSnippetClick(snippet, index, false)}
                  title={snippet.name}
                >
                  <div className="snippet-render">
                    <InlineMath math={snippet.latex} />
                  </div>
                  {copiedIndex === index && (
                    <div className="copy-indicator">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
