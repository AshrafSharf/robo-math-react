import React, { useState, useEffect, useRef } from 'react';
import CommandEditor from './components/CommandEditor';
import './App.css';
import { RoboCanvas } from './RoboCanvas.js';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const roboCanvasRef = useRef(null);
  const containerRef = useRef(null);

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
          textWidthPercent: 40,
          graphWidthPercent: 60,
          logicalWidth: 8,
          logicalHeight: 16,
          graphOptions: {
            showGrid: true,
            xRange: [-10, 10],
            yRange: [-10, 10]
          }
        });

        await roboCanvas.init();
        roboCanvas.useStaticDiagram(); // Start with static mode

        roboCanvasRef.current = roboCanvas;
        console.log('App: RoboCanvas initialized successfully');
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

  // Test button handlers
  const handleTestMathText = async () => {
    console.log('Test: Drawing math text');
    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas) return;

    // Use the single diagram instance
    roboCanvas.diagram.mathText(
      'f(x) = x^2 + 2x + 1',
      2, 3,
      { fontSize: 36, stroke: '#d9534f' }
    );
  };

  const handleTestPoint = () => {
    console.log('Test: Drawing point');
    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas) return;

    // Use the single diagram instance
    roboCanvas.diagram.point({x: 0, y: 0}, 'red', { radius: 6 });
  };

  const handleTestLine = () => {
    console.log('Test: Drawing line');
    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas) return;

    // Use the single diagram instance
    roboCanvas.diagram.line({x: -5, y: -5}, {x: 5, y: 5}, 'blue', { strokeWidth: 2 });
  };

  const handleClearAll = () => {
    console.log('Test: Clear all');
    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas) return;
    roboCanvas.clearAll();
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

      {/* Test Controls */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <button onClick={handleTestMathText} style={{
          padding: '8px 16px',
          border: '1px solid #007bff',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          Test Math Text
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
          Test Point
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
          Test Line
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
        <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
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
          style={{
            position: 'relative',
            width: '100%',
            height: '100%'
          }}
        />
      </div>
    </div>
  );
}

export default App;
