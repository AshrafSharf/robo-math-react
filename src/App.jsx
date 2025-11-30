import React, { useState, useEffect, useRef } from 'react';
import CommandEditor from './components/CommandEditor';
import './App.css';
import { RoboCanvas } from './RoboCanvas.js';
import { AnimationSpeedManager } from './mathtext/animation-speed-manager.js';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [latexInput, setLatexInput] = useState('w_k = \\sqrt[n]{r}\\Bigl(\\cos\\Bigl(\\frac{\\bbox[0px]{\\theta + 2k\\pi}}{n}\\Bigr)+i\\sin\\Bigl(\\frac{\\theta + 2k\\pi}{n}\\Bigr)\\Bigr),\\quad k=0,1,\\dots,n-1');
  const [speed, setSpeed] = useState(1.0);
  const roboCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const mathComponentRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Component name management (for testing)
  const componentsMapRef = useRef({});  // { name: component }
  const [componentsCount, setComponentsCount] = useState(0);  // For triggering re-renders
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [componentName, setComponentName] = useState('');  // For operations
  const [createType, setCreateType] = useState('graph');  // 'graph' or 'text'

  // Form state for creating components
  const [newName, setNewName] = useState('');
  const [newCol, setNewCol] = useState('0');
  const [newRow, setNewRow] = useState('0');
  const [newWidth, setNewWidth] = useState('600');
  const [newHeight, setNewHeight] = useState('400');
  const [newLatex, setNewLatex] = useState('x^2');

  const handleExecute = (command) => {
    console.log('Execute command:', command);
  };

  const handleExecuteAll = (commands) => {
    console.log('Execute all commands:', commands);
  };

  const handleStop = () => {
    console.log('Stop execution');
  };

  const handlePause = () => {
    console.log('Pause execution');
  };

  const handleResume = () => {
    console.log('Resume execution');
  };

  const handleChange = (commands) => {
    console.log('Commands updated:', commands);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Initialize RoboCanvas after container is mounted
  useEffect(() => {
    // Only initialize if container ref is available and we haven't initialized yet
    if (!containerRef.current || roboCanvasRef.current) return;

    console.log('App: Starting RoboCanvas initialization...');

    const initRoboCanvas = async () => {
      try {
        const roboCanvas = new RoboCanvas(containerRef.current, {
          canvasWidth: 1200,
          logicalWidth: 8,
          logicalHeight: 200
        });

        await roboCanvas.init();
        roboCanvas.useStaticDiagram(); // Start with static mode

        roboCanvasRef.current = roboCanvas;
        console.log('App: RoboCanvas initialized successfully');

        // Render initial latex after canvas is ready
        renderLatex(latexInput);
      } catch (error) {
        console.error('App: RoboCanvas initialization failed', error);
        alert(`Failed to initialize RoboCanvas: ${error.message}`);
      }
    };

    initRoboCanvas();

    return () => {
      if (roboCanvasRef.current) {
        roboCanvasRef.current.destroy();
        roboCanvasRef.current = null;
      }
    };
  }, []); // Empty dependency array - run only once

  // Create component handler
  const handleCreateComponent = () => {
    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas || !newName.trim()) {
      alert('Please enter a component name');
      return;
    }

    if (componentsMapRef.current[newName]) {
      alert(`Component "${newName}" already exists`);
      return;
    }

    const col = parseFloat(newCol);
    const row = parseFloat(newRow);

    if (createType === 'graph') {
      const width = parseFloat(newWidth);
      const height = parseFloat(newHeight);

      const gc = roboCanvas.diagram.graphContainer(col, row, {
        width,
        height,
        showGrid: true,
        xRange: [-10, 10],
        yRange: [-10, 10]
      });

      componentsMapRef.current[newName] = gc;
      console.log(`Created graph container: ${newName}`);
    } else {
      const mathComponent = roboCanvas.diagram.mathText(newLatex, col, row, {
        fontSize: 32,
        stroke: '#000000'
      });

      componentsMapRef.current[newName] = mathComponent;
      console.log(`Created math text: ${newName}`);
    }

    // Reset form and close modal
    setNewName('');
    setNewCol('0');
    setNewRow('0');
    setShowCreateModal(false);
    setComponentsCount(prev => prev + 1);  // Trigger re-render
  };

  // Test button handlers - use named components
  const handleWriteMathText = () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }

    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas) return;

    // Scroll to component first (external scroll logic)
    roboCanvas.scrollToComponent(component);

    // Then call the clean diagram method
    roboCanvas.diagram.writeMathText(component);
  };

  const handleTestPoint = () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }

    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas) return;

    // Scroll to graph container first (external scroll logic)
    roboCanvas.scrollToComponent(component);

    // Then draw on the named graph container
    roboCanvas.diagram.point(component, {x: 0, y: 0}, 'red', { radius: 6 });
  };

  const handleTestLine = () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }

    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas) return;

    // Scroll to graph container first (external scroll logic)
    roboCanvas.scrollToComponent(component);

    // Then draw on the named graph container
    roboCanvas.diagram.line(component, {x: -5, y: -5}, {x: 5, y: 5}, 'blue', { strokeWidth: 2 });
  };

  const handleClearAll = () => {
    console.log('Test: Clear all');
    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas) return;
    roboCanvas.clearAll();
    // Clear components map
    componentsMapRef.current = {};
    setComponentsCount(0);  // Trigger re-render
  };

  const handleToggleAnimated = (e) => {
    const checked = e.target.checked;
    setIsAnimated(checked);
    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas) return;

    // Clear all existing shapes and text
    roboCanvas.clearAll();

    if (checked) {
      roboCanvas.useAnimatedDiagram();
      console.log('✅ Switched to Animated mode');
    } else {
      roboCanvas.useStaticDiagram();
      console.log('✅ Switched to Static mode');
    }
  };

  // Render LaTeX in canvas section
  const renderLatex = (latexContent) => {
    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas || !roboCanvas.diagram) return;

    // Clear canvas section (all content)
    const canvasSection = roboCanvas.getCanvasSection();
    if (canvasSection) {
      canvasSection.innerHTML = '';
    }

    if (!latexContent || latexContent.trim() === '') {
      mathComponentRef.current = null;
      return;
    }

    // Create math text cell at position (1, 1) in logical coordinates
    const mathComponent = roboCanvas.diagram.mathText(latexContent, 1, 1, {
      fontSize: 40,
      stroke: '#000000'
    });

    // Store reference for animation controls
    mathComponentRef.current = mathComponent;
  };

  // Handle LaTeX input change with debouncing
  const handleLatexChange = (e) => {
    const value = e.target.value;
    setLatexInput(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      renderLatex(value);
    }, 500);
  };

  // Write with pen animation - using diagram API
  const handleWriteWithPen = () => {
    const roboCanvas = roboCanvasRef.current;
    const mathComponent = mathComponentRef.current;
    if (!roboCanvas || !roboCanvas.diagram || !mathComponent) return;

    // Scroll to component first (external scroll logic)
    roboCanvas.scrollToComponent(mathComponent);

    // Then write the mathtext
    roboCanvas.diagram.writeMathText(mathComponent);
  };

  // Hide marked parts - using diagram API
  const handleHideBBox = () => {
    const roboCanvas = roboCanvasRef.current;
    const mathComponent = mathComponentRef.current;
    if (!roboCanvas || !roboCanvas.diagram || !mathComponent) return;

    roboCanvas.diagram.hideMathTextParts(mathComponent);
  };

  // Write only marked parts - using diagram API
  const handleWriteOnlyBBox = () => {
    const roboCanvas = roboCanvasRef.current;
    const mathComponent = mathComponentRef.current;
    if (!roboCanvas || !roboCanvas.diagram || !mathComponent) return;

    roboCanvas.diagram.writeOnlyMathTextParts(mathComponent);
  };

  // Write without marked parts - using diagram API
  const handleWriteWithoutBBox = () => {
    const roboCanvas = roboCanvasRef.current;
    const mathComponent = mathComponentRef.current;
    if (!roboCanvas || !roboCanvas.diagram || !mathComponent) return;

    roboCanvas.diagram.writeWithoutMathTextParts(mathComponent);
  };

  // Handle speed change
  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    AnimationSpeedManager.setSpeedMultiplier(newSpeed);
  };

  return (
    <div id="robo" className="robo-compass-div">
      {/* Top Header */}
      <div className="robo-compass-header navbar navbar-inverse">
        <div className="navbar-header robo-logo">
          <a className="navbar-brand" href="/">
            <h3 style={{ margin: 0, color: 'white', display: 'inline-block' }}>Robo Math</h3>
          </a>
        </div>
      </div>

      {/* Write Animation Controls */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* LaTeX Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '100px' }}>LaTeX Input:</label>
          <textarea
            value={latexInput}
            onChange={handleLatexChange}
            style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'vertical',
              minHeight: '60px'
            }}
            placeholder="Enter LaTeX code..."
          />
        </div>

        {/* Write Animation Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleWriteWithPen} style={{
            padding: '8px 16px',
            border: '1px solid #007bff',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Write with Pen
          </button>

          <button onClick={handleHideBBox} style={{
            padding: '8px 16px',
            border: '1px solid #6c757d',
            backgroundColor: '#6c757d',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Hide BBox
          </button>

          <button onClick={handleWriteOnlyBBox} style={{
            padding: '8px 16px',
            border: '1px solid #28a745',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Write Only BBox
          </button>

          <button onClick={handleWriteWithoutBBox} style={{
            padding: '8px 16px',
            border: '1px solid #17a2b8',
            backgroundColor: '#17a2b8',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Write Without BBox
          </button>

          {/* Speed Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Speed:</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={handleSpeedChange}
              style={{ width: '120px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontFamily: 'monospace', minWidth: '45px' }}>
              {speed.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      {/* Component Management Controls */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button onClick={() => setShowCreateModal(true)} style={{
          padding: '8px 16px',
          border: '1px solid #6f42c1',
          backgroundColor: '#6f42c1',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          + Create Component
        </button>

        <div style={{
          padding: '6px 12px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#495057'
        }}>
          Components: {Object.keys(componentsMapRef.current).join(', ') || 'none'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Use Component:</label>
          <input
            type="text"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            placeholder="e.g., graph1, text1"
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              width: '150px'
            }}
          />
        </div>

        <button onClick={handleWriteMathText} style={{
          padding: '8px 16px',
          border: '1px solid #007bff',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          Write MathText
        </button>
        <button onClick={handleTestPoint} style={{
          padding: '8px 16px',
          border: '1px solid #28a745',
          backgroundColor: '#28a745',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          Draw Point
        </button>
        <button onClick={handleTestLine} style={{
          padding: '8px 16px',
          border: '1px solid #17a2b8',
          backgroundColor: '#17a2b8',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          Draw Line
        </button>
        <button onClick={handleClearAll} style={{
          padding: '8px 16px',
          border: '1px solid #6c757d',
          backgroundColor: '#6c757d',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          Clear All
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '14px' }}>Static</span>
          <input
            type="checkbox"
            checked={isAnimated}
            onChange={handleToggleAnimated}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '14px' }}>Animated</span>
        </div>
      </div>

      {/* Main Shell */}
      <div className="robo-shell-main">
        {/* Command Editor */}
        <CommandEditor
          onExecute={handleExecute}
          onExecuteAll={handleExecuteAll}
          onStop={handleStop}
          onPause={handlePause}
          onResume={handleResume}
          onChange={handleChange}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Play Surface - RoboCanvas Container */}
        <div
          ref={containerRef}
          className={`robo-shell-main-playsurface ${isSidebarCollapsed ? 'expanded' : ''}`}
        />
      </div>

      {/* Create Component Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Create Component</h2>

            {/* Type Selection */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                Component Type:
              </label>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    value="graph"
                    checked={createType === 'graph'}
                    onChange={(e) => setCreateType(e.target.value)}
                  />
                  Graph Container
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    value="text"
                    checked={createType === 'text'}
                    onChange={(e) => setCreateType(e.target.value)}
                  />
                  MathText
                </label>
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Name:
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., graph1, text1"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Position */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Column (X):
                </label>
                <input
                  type="number"
                  value={newCol}
                  onChange={(e) => setNewCol(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Row (Y):
                </label>
                <input
                  type="number"
                  value={newRow}
                  onChange={(e) => setNewRow(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Graph-specific options */}
            {createType === 'graph' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Width:
                  </label>
                  <input
                    type="number"
                    value={newWidth}
                    onChange={(e) => setNewWidth(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Height:
                  </label>
                  <input
                    type="number"
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* MathText-specific options */}
            {createType === 'text' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  LaTeX Content:
                </label>
                <input
                  type="text"
                  value={newLatex}
                  onChange={(e) => setNewLatex(e.target.value)}
                  placeholder="e.g., x^2 + 2x + 1"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                />
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #6c757d',
                  backgroundColor: 'white',
                  color: '#6c757d',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateComponent}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #6f42c1',
                  backgroundColor: '#6f42c1',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
