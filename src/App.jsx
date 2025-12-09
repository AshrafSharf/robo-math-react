import React, { useState, useEffect, useRef } from 'react';
import CommandEditor from './components/CommandEditor';
import RoboCanvasGridOverlay from './components/RoboCanvasGridOverlay';
import './App.css';
import { RoboCanvas } from './RoboCanvas.js';
import { useCommandExecution } from './hooks/useCommandExecution.js';
import { IntrepreterFunctionTable } from './engine/expression-parser/core/IntrepreterFunctionTable.js';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [roboCanvas, setRoboCanvas] = useState(null);
  const containerRef = useRef(null);

  // Initialize expression function table once
  useEffect(() => {
    IntrepreterFunctionTable.populateFunctionTable();
  }, []);

  // Command execution hook
  const {
    handleExecute: hookHandleExecute,
    handleExecuteAll: hookHandleExecuteAll,
    handlePlaySingle: hookHandlePlaySingle,
    handlePlayUpTo: hookHandlePlayUpTo,
    handleChange: hookHandleChange,
    handleStop: hookHandleStop,
    handlePause: hookHandlePause,
    handleResume: hookHandleResume,
    errors,
    canPlayInfos,
    clearAndRerender
  } = useCommandExecution(roboCanvas, {
    debounceMs: 500
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Initialize RoboCanvas
  useEffect(() => {
    if (!containerRef.current) return;

    let canvasInstance = null;
    let isMounted = true;

    const initRoboCanvas = async () => {
      try {
        canvasInstance = new RoboCanvas(containerRef.current, {
          canvasWidth: 1200,
          logicalWidth: 8,
          logicalHeight: 200
        });

        await canvasInstance.init();

        // Check if component is still mounted before updating state
        if (!isMounted) {
          canvasInstance.destroy();
          return;
        }

        canvasInstance.useStaticDiagram();
        setRoboCanvas(canvasInstance);
        console.log('App: RoboCanvas initialized');
      } catch (error) {
        console.error('App: RoboCanvas initialization failed', error);
        alert(`Failed to initialize RoboCanvas: ${error.message}`);
      }
    };

    initRoboCanvas();

    return () => {
      isMounted = false;
      if (canvasInstance) {
        canvasInstance.destroy();
        setRoboCanvas(null);
      }
    };
  }, []);

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
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: 'white', fontSize: '14px' }}>Grid</span>
          <a href="/test" style={{ color: '#aaa', fontSize: '12px', marginLeft: '20px' }}>Test Features</a>
        </div>
      </div>

      {/* Main Shell */}
      <div className="robo-shell-main">
        {/* Command Editor */}
        <CommandEditor
          onExecute={hookHandleExecute}
          onExecuteAll={hookHandleExecuteAll}
          onPlaySingle={hookHandlePlaySingle}
          onPlayUpTo={hookHandlePlayUpTo}
          onStop={hookHandleStop}
          onPause={hookHandlePause}
          onResume={hookHandleResume}
          onChange={hookHandleChange}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          errors={errors}
          canPlayInfos={canPlayInfos}
        />

        {/* Play Surface - RoboCanvas Container */}
        <div
          ref={containerRef}
          className={`robo-shell-main-playsurface ${isSidebarCollapsed ? 'expanded' : ''}`}
        >
          <RoboCanvasGridOverlay
            pixelsPerUnit={25}
            visible={showGrid}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
