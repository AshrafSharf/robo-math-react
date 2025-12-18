import { useState, useEffect } from 'react';

/**
 * Test page for debugging MathJax SVG structure
 * Helps discover consistent patterns for fraction bars and other structural elements
 */
export default function SvgStructureTest() {
  const [latex, setLatex] = useState('\\frac{2}{3}');
  const [rawSvg, setRawSvg] = useState('');
  const [structureLog, setStructureLog] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Check if MathJax is ready
  useEffect(() => {
    const checkReady = () => {
      if (window.TEXT_TO_ML && window.MathJax?.OutputJax?.SVG) {
        setIsReady(true);
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  }, []);

  const presets = [
    { label: 'Simple Fraction', value: '\\frac{2}{3}' },
    { label: 'Nested Fraction', value: '\\frac{\\frac{a}{b}}{c}' },
    { label: 'Complex Fraction', value: '\\frac{\\sin(x)}{\\cos(x)}' },
    { label: 'Square Root', value: '\\sqrt{x}' },
    { label: 'Overline', value: '\\overline{abc}' },
    { label: 'Underline', value: '\\underline{xyz}' },
    { label: 'Mixed', value: '\\frac{\\sqrt{a}}{\\overline{b}}' },
  ];

  // Helper to get all attributes of an element as object
  const getAttributes = (elem) => {
    const attrs = {};
    for (const attr of elem.attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  };

  const analyzeStructure = () => {
    if (!isReady) {
      setError('MathJax not ready yet');
      return;
    }

    setError(null);
    setStructureLog([]);

    try {
      // Render LaTeX to SVG
      const mathText = "\\displaystyle{" + latex + "}";
      const scriptTag = { text: mathText, type: '' };
      const parsedObj = window.TEXT_TO_ML.Translate(scriptTag);

      parsedObj['display'] = 'block';
      parsedObj['inputID'] = 'scratchpad';

      const scriptEL = document.getElementById("inputjaxForm");
      scriptEL.MathJax = {
        elementJax: {
          root: parsedObj.root,
          originalText: mathText,
          inputID: 'scratchpad',
          SVG: { isHidden: true, cwidth: 70966.4, em: 16.6, ex: 7.18, lineWidth: 10000000 },
          outputJax: "SVG",
          inputJax: 'TeX'
        },
        state: 4, checked: 1, newID: 100
      };

      document.getElementById('scratchpad-Frame').innerHTML = '';
      window.MathJax.OutputJax['SVG'].Process(scriptEL, {});

      const svg = document.getElementById('scratchpad-Frame').innerHTML;
      setRawSvg(svg);

      // Parse SVG using native DOM
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');

      const logs = [];
      const rects = doc.querySelectorAll('rect');

      rects.forEach((rect, i) => {
        const rectLog = {
          index: i,
          type: 'rect',
          attributes: getAttributes(rect),
          parents: [],
          siblings: []
        };

        // Walk up parent chain
        let current = rect.parentElement;
        let depth = 0;
        while (current && depth < 8) {
          const tagName = current.tagName;
          if (!tagName || tagName === 'html' || tagName === 'body') break;

          rectLog.parents.push({
            depth,
            tag: tagName,
            'data-mml-node': current.getAttribute('data-mml-node'),
            'data-c': current.getAttribute('data-c'),
            class: current.getAttribute('class'),
            meta: current.getAttribute('meta'),
          });

          current = current.parentElement;
          depth++;
        }

        // Get siblings
        const parent = rect.parentElement;
        if (parent) {
          Array.from(parent.children).forEach((sib, si) => {
            if (sib.tagName !== 'rect') {
              rectLog.siblings.push({
                index: si,
                tag: sib.tagName,
                meta: sib.getAttribute('meta'),
                'data-mml-node': sib.getAttribute('data-mml-node'),
              });
            }
          });
        }

        logs.push(rectLog);
      });

      setStructureLog(logs);

    } catch (e) {
      setError(e.message);
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '15px', maxWidth: '100%', height: '100vh', overflow: 'auto', fontSize: '14px' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>MathJax SVG Structure Analyzer</h3>

      {!isReady && (
        <div style={{ padding: '8px', background: '#fff3cd', borderRadius: '4px', marginBottom: '10px' }}>
          Loading MathJax...
        </div>
      )}

      {/* Input Section */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          style={{
            width: '300px',
            padding: '8px',
            fontSize: '14px',
            fontFamily: 'monospace',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          placeholder="Enter LaTeX"
        />
        <button
          onClick={analyzeStructure}
          disabled={!isReady}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            background: isReady ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isReady ? 'pointer' : 'not-allowed'
          }}
        >
          Analyze
        </button>
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setLatex(preset.value)}
            style={{
              padding: '6px 10px',
              fontSize: '13px',
              background: latex === preset.value ? '#007bff' : '#f0f0f0',
              color: latex === preset.value ? 'white' : '#333',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '8px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      {/* Results */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        {/* Raw SVG */}
        <div style={{ flex: 1 }}>
          <strong>Raw SVG:</strong>
          <div style={{
            background: '#f5f5f5',
            padding: '8px',
            borderRadius: '4px',
            maxHeight: '120px',
            overflow: 'auto',
            fontSize: '11px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            marginTop: '5px'
          }}>
            {rawSvg || 'Click "Analyze"'}
          </div>
        </div>

        {/* Rendered Preview */}
        <div style={{ minWidth: '200px' }}>
          <strong>Preview:</strong>
          <div
            style={{
              background: '#fff',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginTop: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            dangerouslySetInnerHTML={{ __html: rawSvg }}
          />
        </div>
      </div>

      {/* Structure Analysis */}
      {structureLog.length > 0 && (
        <div>
          <strong>RECT Elements ({structureLog.length}):</strong>

          {structureLog.map((log, idx) => (
            <div
              key={idx}
              style={{
                background: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px',
                marginTop: '10px'
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <strong>RECT #{log.index}</strong> —
                x={log.attributes.x}, y={log.attributes.y}, w={log.attributes.width}, h={log.attributes.height}
              </div>

              {/* Parent Chain Table */}
              <table style={{ borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '5px 8px', border: '1px solid #ddd', textAlign: 'left' }}>Depth</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #ddd', textAlign: 'left' }}>Tag</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #ddd', textAlign: 'left' }}>data-mml-node</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #ddd', textAlign: 'left' }}>class</th>
                  </tr>
                </thead>
                <tbody>
                  {log.parents.map((p, pi) => (
                    <tr key={pi} style={{ background: p['data-mml-node'] ? '#d4edda' : 'white' }}>
                      <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>{p.depth}</td>
                      <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>{p.tag}</td>
                      <td style={{ padding: '4px 8px', border: '1px solid #ddd', fontWeight: p['data-mml-node'] ? 'bold' : 'normal', color: p['data-mml-node'] ? '#155724' : '#999' }}>
                        {p['data-mml-node'] || '-'}
                      </td>
                      <td style={{ padding: '4px 8px', border: '1px solid #ddd', color: p.class ? 'inherit' : '#999' }}>{p.class || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Siblings */}
              {log.siblings.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Siblings:</strong> {log.siblings.map(s => s.tag + (s['data-mml-node'] ? `[${s['data-mml-node']}]` : '')).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Key */}
      <div style={{ marginTop: '15px', padding: '10px', background: '#e7f3ff', borderRadius: '4px' }}>
        <strong>Look for:</strong> data-mml-node = <code style={{ background: '#fff', padding: '2px 4px' }}>mfrac</code> (fraction),
        <code style={{ background: '#fff', padding: '2px 4px', marginLeft: '5px' }}>msqrt</code> (sqrt),
        <code style={{ background: '#fff', padding: '2px 4px', marginLeft: '5px' }}>mover</code> (overline)
      </div>
    </div>
  );
}
