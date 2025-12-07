import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { RoboCanvas } from './RoboCanvas.js';
import { AnimationSpeedManager } from './mathtext/animation-speed-manager.js';

function TestFeatures() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const roboCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // Component name management
  const componentsMapRef = useRef({});
  const [componentsCount, setComponentsCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [componentName, setComponentName] = useState('');
  const [createType, setCreateType] = useState('graph');

  // Form state for creating components
  const [newName, setNewName] = useState('');
  const [newCol, setNewCol] = useState('0');
  const [newRow, setNewRow] = useState('0');
  const [newWidth, setNewWidth] = useState('600');
  const [newHeight, setNewHeight] = useState('400');
  const [newLatex, setNewLatex] = useState('x^2');

  // Initialize RoboCanvas
  useEffect(() => {
    if (!containerRef.current || roboCanvasRef.current) return;

    const initRoboCanvas = async () => {
      try {
        const roboCanvas = new RoboCanvas(containerRef.current, {
          canvasWidth: 1200,
          logicalWidth: 8,
          logicalHeight: 200
        });

        await roboCanvas.init();
        roboCanvas.useStaticDiagram();

        roboCanvasRef.current = roboCanvas;
        console.log('TestFeatures: RoboCanvas initialized');
      } catch (error) {
        console.error('TestFeatures: RoboCanvas initialization failed', error);
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
  }, []);

  // Create component handler
  const handleCreateComponent = () => {
    if (!newName.trim()) {
      alert('Please enter a component name');
      return;
    }

    const roboCanvas = roboCanvasRef.current;

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

    setNewName('');
    setNewCol('0');
    setNewRow('0');
    setShowCreateModal(false);
    setComponentsCount(prev => prev + 1);
  };

  // Test button handlers
  const handleWriteMathText = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }

    await roboCanvasRef.current.scrollToComponent(component);
    roboCanvasRef.current.diagram.writeMathText(component);
  };

  const handleTestPoint = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }

    await roboCanvasRef.current.scrollToComponent(component);
    roboCanvasRef.current.diagram.point(component, {x: 0, y: 0}, 'red', { radius: 6 });
  };

  const handleTestLine = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }

    await roboCanvasRef.current.scrollToComponent(component);
    roboCanvasRef.current.diagram.line(component, {x: -5, y: -5}, {x: 5, y: 5}, 'blue', { strokeWidth: 2 });
  };

  const handleClearAll = () => {
    roboCanvasRef.current.clearAll();
    componentsMapRef.current = {};
    setComponentsCount(0);
  };

  const handleToggleAnimated = (e) => {
    const newAnimated = e.target.checked;
    setIsAnimated(newAnimated);
    roboCanvasRef.current.clearAll();

    if (newAnimated) {
      roboCanvasRef.current.useAnimatedDiagram();
    } else {
      roboCanvasRef.current.useStaticDiagram();
    }
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
            <h3 style={{ margin: 0, color: 'white', display: 'inline-block' }}>Robo Math - Test Features</h3>
          </a>
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
            style={{ width: '100px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '14px', fontFamily: 'monospace', minWidth: '40px' }}>
            {speed.toFixed(1)}x
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '20px' }}>
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

      {/* Canvas Container */}
      <div className="robo-shell-main" style={{ top: 0 }}>
        <div
          ref={containerRef}
          className="robo-shell-main-playsurface expanded"
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
                <textarea
                  value={newLatex}
                  onChange={(e) => setNewLatex(e.target.value)}
                  placeholder="Enter LaTeX code, e.g., x^2 + 2x + 1"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    minHeight: '80px',
                    resize: 'vertical'
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

export default TestFeatures;
