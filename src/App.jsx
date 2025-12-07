import React, { useState, useEffect, useRef } from 'react';
import CommandEditor from './components/CommandEditor';
import './App.css';
import { RoboCanvas } from './RoboCanvas.js';
import { useCommandExecution } from './hooks/useCommandExecution.js';
import { IntrepreterFunctionTable } from './engine/expression-parser/core/IntrepreterFunctionTable.js';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const roboCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const defaultGraphRef = useRef(null);

  // Initialize expression function table once
  useEffect(() => {
    IntrepreterFunctionTable.populateFunctionTable();
  }, []);

  // Command execution hook
  const {
    handleExecute: hookHandleExecute,
    handleExecuteAll: hookHandleExecuteAll,
    handleChange: hookHandleChange,
    handleStop: hookHandleStop,
    handlePause: hookHandlePause,
    handleResume: hookHandleResume,
    errors,
    setGraphContainer,
    clearAndRerender
  } = useCommandExecution(roboCanvasRef.current, {
    debounceMs: 500,
    useAnimatedMode: isAnimated
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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
        console.log('App: RoboCanvas initialized');

        // Create default graph container for command execution
        const defaultGraph = roboCanvas.diagram.graphContainer(0, 0, {
          width: 600,
          height: 400,
          showGrid: true,
          xRange: [-10, 10],
          yRange: [-10, 10]
        });
        defaultGraphRef.current = defaultGraph;
        setGraphContainer(defaultGraph);
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
  }, []);

  const handleToggleAnimated = (e) => {
    const newAnimated = e.target.checked;
    setIsAnimated(newAnimated);
    roboCanvasRef.current.clearAll();

    if (newAnimated) {
      roboCanvasRef.current.useAnimatedDiagram();
    } else {
      roboCanvasRef.current.useStaticDiagram();
    }

    clearAndRerender();
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
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
          <span style={{ color: 'white', fontSize: '14px' }}>Static</span>
          <input
            type="checkbox"
            checked={isAnimated}
            onChange={handleToggleAnimated}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: 'white', fontSize: '14px' }}>Animated</span>
          <a href="/test" style={{ color: '#aaa', fontSize: '12px', marginLeft: '20px' }}>Test Features</a>
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#ffebee',
          borderBottom: '1px solid #f44336'
        }}>
          {errors.map((err, i) => (
            <div key={i} style={{ color: '#c62828', fontSize: '14px' }}>
              Command {err.index + 1}: {err.error?.message || String(err.error)}
            </div>
          ))}
        </div>
      )}

      {/* Main Shell */}
      <div className="robo-shell-main">
        {/* Command Editor */}
        <CommandEditor
          onExecute={hookHandleExecute}
          onExecuteAll={hookHandleExecuteAll}
          onStop={hookHandleStop}
          onPause={hookHandlePause}
          onResume={hookHandleResume}
          onChange={hookHandleChange}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Play Surface - RoboCanvas Container */}
        <div
          ref={containerRef}
          className={`robo-shell-main-playsurface ${isSidebarCollapsed ? 'expanded' : ''}`}
        />
      </div>
    </div>
  );
}

export default App;
