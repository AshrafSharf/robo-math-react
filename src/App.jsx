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

  // Render LaTeX in text section
  const renderLatex = (latexContent) => {
    const roboCanvas = roboCanvasRef.current;
    if (!roboCanvas || !roboCanvas.diagram) return;

    // Clear text section only (not graphics)
    const textSection = roboCanvas.getTextSection();
    if (textSection) {
      textSection.innerHTML = '';
    }

    if (!latexContent || latexContent.trim() === '') {
      mathComponentRef.current = null;
      return;
    }

    // Create math text at position (1, 1) in logical coordinates
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
