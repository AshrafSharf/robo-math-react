import React, { useState, useEffect, useRef, useCallback } from 'react';
import CommandEditorWithPopup from './components/CommandEditor/CommandEditorWithPopup';
import RoboCanvasGridOverlay from './components/RoboCanvasGridOverlay';
import AnnotationLayer from './components/AnnotationLayer';
import ImportModal from './components/CommandEditor/components/ImportModal/ImportModal';
import './App.css';
import { RoboCanvas } from './RoboCanvas.js';
import { useCommandExecution } from './hooks/useCommandExecution.js';
import { IntrepreterFunctionTable } from './engine/expression-parser/core/IntrepreterFunctionTable.js';
import { LessonProvider, useLesson, useLessonPersistence, PageTabBar, LessonHeader } from './lesson';
import { ExpressionFocusManager } from './engine/focus/index.js';
import { createCommand } from './components/CommandEditor/utils/commandModel';

function AppContent() {
  const { lesson, activePage, updatePageCommands, setLesson } = useLesson();
  const { loadFromStorage } = useLessonPersistence(lesson, setLesson);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [roboCanvas, setRoboCanvas] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const containerRef = useRef(null);
  const prevPageIdRef = useRef(activePage.id);

  // Initialize expression function table once
  useEffect(() => {
    IntrepreterFunctionTable.populateFunctionTable();
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setLesson(stored);
    }
  }, []);

  // Command execution hook
  const {
    handleExecute: hookHandleExecute,
    handleExecuteAll: hookHandleExecuteAll,
    handlePlaySingle: hookHandlePlaySingle,
    handlePlayAll: hookHandlePlayAll,
    handleChange: hookHandleChange,
    handleStop: hookHandleStop,
    handlePause: hookHandlePause,
    handleResume: hookHandleResume,
    redrawSingle: hookRedrawSingle,
    handleExpressionFocus: hookHandleExpressionFocus,
    handleExpressionBlur: hookHandleExpressionBlur,
    errors,
    canPlayInfos,
    clearAndRerender,
    isExecuting
  } = useCommandExecution(roboCanvas, {
    debounceMs: 500
  });

  // Initialize ExpressionFocusManager
  const focusManagerRef = useRef(null);
  useEffect(() => {
    focusManagerRef.current = new ExpressionFocusManager();
    focusManagerRef.current.start();

    return () => {
      if (focusManagerRef.current) {
        focusManagerRef.current.stop();
        focusManagerRef.current = null;
      }
    };
  }, []);

  // Clear and re-execute when page changes
  useEffect(() => {
    if (!roboCanvas || prevPageIdRef.current === activePage.id) return;

    prevPageIdRef.current = activePage.id;
    roboCanvas.clearAll();
    clearAndRerender();

    if (activePage.commands?.length > 0) {
      hookHandleChange(activePage.commands);
    }
  }, [activePage.id, activePage.commands, roboCanvas, clearAndRerender, hookHandleChange]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle commands change from CommandEditor
  const handleCommandsChange = useCallback((commands) => {
    updatePageCommands(activePage.id, commands);
  }, [activePage.id, updatePageCommands]);

  // Handle import from ImportModal
  const handleOpenImport = useCallback(() => {
    setImportModalOpen(true);
  }, []);

  const handleImport = useCallback((lines) => {
    // Create commands for each line
    const newCommands = lines.map((expression, index) => {
      const cmd = createCommand(index + 1);
      cmd.expression = expression;
      return cmd;
    });

    // Replace all commands with imported ones
    updatePageCommands(activePage.id, newCommands);
  }, [activePage.id, updatePageCommands]);

  // Callback when annotation layer SVG is ready
  const handleAnnotationLayerReady = useCallback((svgElement) => {
    if (roboCanvas) {
      roboCanvas.setAnnotationLayer(svgElement);
    }
  }, [roboCanvas]);

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
        <LessonHeader showGrid={showGrid} onShowGridChange={setShowGrid} onOpenImport={handleOpenImport} />
      </div>

      {/* Main Shell */}
      <div className="robo-shell-main">
        {/* Command Editor with Popup Support */}
        <CommandEditorWithPopup
          commands={activePage.commands}
          onCommandsChange={handleCommandsChange}
          onExecute={hookHandleExecute}
          onExecuteAll={hookHandleExecuteAll}
          onPlaySingle={hookHandlePlaySingle}
          onPlayAll={hookHandlePlayAll}
          onStop={hookHandleStop}
          onPause={hookHandlePause}
          onResume={hookHandleResume}
          onChange={hookHandleChange}
          onRedrawSingle={hookRedrawSingle}
          onExpressionFocus={hookHandleExpressionFocus}
          onExpressionBlur={hookHandleExpressionBlur}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          isExecuting={isExecuting}
          errors={errors}
          canPlayInfos={canPlayInfos}
        />

        {/* Canvas Area with Tab Bar */}
        <div className="canvas-area">
          <PageTabBar isSidebarCollapsed={isSidebarCollapsed} />
          <div
            ref={containerRef}
            className={`robo-shell-main-playsurface ${isSidebarCollapsed ? 'expanded' : ''}`}
          >
            <AnnotationLayer onLayerReady={handleAnnotationLayerReady} />
            <RoboCanvasGridOverlay
              pixelsPerUnit={25}
              visible={showGrid}
            />
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}

function App() {
  return (
    <LessonProvider>
      <AppContent />
    </LessonProvider>
  );
}

export default App;
