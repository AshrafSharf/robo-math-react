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
import { SettingsRecoveryService } from './components/CommandEditor/utils/SettingsRecoveryService';

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
    controller,
    handleExecute,
    handleExecuteAll,
    handlePlaySingle,
    handlePlayAll,
    handleChange,
    handleChangeImmediate,
    handleStop,
    handlePause,
    handleResume,
    redrawSingle,
    handleExpressionFocus,
    handleExpressionBlur,
    errors,
    canPlayInfos,
    clearAndRerender,
    // Playback state (single source of truth)
    playback
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

  // Keep lesson pages updated for copy expression support
  useEffect(() => {
    if (!controller) return;
    const currentPageIndex = lesson.pages.findIndex(p => p.id === activePage.id);
    controller.setLessonPages(lesson.pages, currentPageIndex);
  }, [lesson.pages, activePage.id, controller]);

  // Clear and re-execute when page changes
  useEffect(() => {
    if (!roboCanvas || prevPageIdRef.current === activePage.id) return;

    prevPageIdRef.current = activePage.id;
    roboCanvas.clearAll();
    clearAndRerender();

    if (activePage.commands?.length > 0) {
      handleChangeImmediate(activePage.commands);
    }
  }, [activePage.id, activePage.commands, roboCanvas, clearAndRerender, handleChangeImmediate]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle commands change from CommandEditor
  const handleCommandsChange = useCallback((commands) => {
    updatePageCommands(activePage.id, commands);
  }, [activePage.id, updatePageCommands]);

  // Handle import from ImportModal
  const handleOpenImport = useCallback(() => {
    SettingsRecoveryService.getInstance().storeSettings(activePage.commands);
    setImportModalOpen(true);
  }, [activePage.commands]);

  const handleImport = useCallback((lines) => {
    const recoveryService = SettingsRecoveryService.getInstance();

    // Create commands for each line with recovered settings
    const newCommands = lines.map((expression, index) => {
      const cmd = createCommand(index + 1);
      cmd.expression = expression;
      return recoveryService.recoverSettings(cmd);
    });

    // Clear snapshot after recovery
    recoveryService.clearSnapshot();

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
        <LessonHeader />
      </div>

      {/* Main Shell */}
      <div className="robo-shell-main">
        {/* Command Editor with Popup Support */}
        <CommandEditorWithPopup
          commands={activePage.commands}
          onCommandsChange={handleCommandsChange}
          onExecute={handleExecute}
          onExecuteAll={handleExecuteAll}
          onPlaySingle={handlePlaySingle}
          onPlayAll={handlePlayAll}
          onStop={handleStop}
          onPause={handlePause}
          onResume={handleResume}
          onChange={handleChange}
          onRedrawSingle={redrawSingle}
          onExpressionFocus={handleExpressionFocus}
          onExpressionBlur={handleExpressionBlur}
          onToggleSidebar={handleToggleSidebar}
          onClearCanvas={clearAndRerender}
          isSidebarCollapsed={isSidebarCollapsed}
          errors={errors}
          canPlayInfos={canPlayInfos}
          playback={playback}
        />

        {/* Canvas Area with Tab Bar */}
        <div className="canvas-area">
          <PageTabBar
            isSidebarCollapsed={isSidebarCollapsed}
            isPlaybackActive={playback.isActive}
            showGrid={showGrid}
            onShowGridChange={setShowGrid}
            onOpenImport={handleOpenImport}
          />
          <div
            ref={containerRef}
            className={`robo-shell-main-playsurface ${isSidebarCollapsed ? 'expanded' : ''}`}
          >
            <AnnotationLayer onLayerReady={handleAnnotationLayerReady} />
            <RoboCanvasGridOverlay
              pixelsPerUnit={25}
              visible={showGrid}
            />
            {/* Floating Play Button */}
            <button
              className="canvas-play-fab"
              onClick={handlePlayAll}
              title="Play All"
              disabled={playback.isActive || !controller?.roboCanvas}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
        initialExpressions={activePage.commands?.map(cmd => cmd.expression) || []}
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
