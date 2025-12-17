import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import CommandMenuBar from './components/CommandMenuBar/CommandMenuBar';
import CommandList from './components/CommandList/CommandList';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import NewCommandButton from './components/NewCommandButton/NewCommandButton';
import ImportModal from './components/ImportModal/ImportModal';
import { CommandProvider } from './context/CommandContext';
import { createCommand, getNextId } from './utils/commandModel';
import './CommandEditor.css';

/**
 * Main CommandEditor component
 * A React-based command editor with drag & drop, autocomplete, and settings
 */
const CommandEditor = ({
  onExecute,
  onExecuteAll,
  onPlaySingle,
  onPlayAll,
  onStop,
  onPause,
  onResume,
  onChange,
  onRedrawSingle,
  onToggleSidebar,
  onPopupMode,
  onRestoreToSidebar,
  isSidebarCollapsed,
  isPopupMode,
  errors = [],
  canPlayInfos = [],
  // Controlled mode props
  commands: externalCommands,
  onCommandsChange,
  // Popup focus/blur handlers (injected by PopupContainer)
  popupInputFocused,
  onPopupInputFocus,
  onPopupInputBlur,
  // Expression focus handlers (for ExpressionFocusManager)
  onExpressionFocus,
  onExpressionBlur
}) => {
  // Use external commands if provided (controlled mode), otherwise local state
  const [localCommands, setLocalCommands] = useState([createCommand(1)]);
  const commands = externalCommands ?? localCommands;
  const [selectedId, setSelectedId] = useState(1);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const containerRef = useRef(null);
  const selectedCommandRef = useRef(null);

  // Reset selectedId when external commands change (e.g., page switch)
  useEffect(() => {
    if (externalCommands && externalCommands.length > 0) {
      // If current selectedId is not in new commands, select first command
      if (!externalCommands.some(c => c.id === selectedId)) {
        setSelectedId(externalCommands[0].id);
      }
    }
  }, [externalCommands]);

  // Update commands and notify parent
  // Controller handles debouncing internally - no throttle needed here
  const updateCommands = useCallback((newCommands) => {
    // If in controlled mode, call external handler; otherwise update local state
    if (onCommandsChange) {
      onCommandsChange(newCommands);
    } else {
      setLocalCommands(newCommands);
    }
    if (onChange) onChange(newCommands);
  }, [onChange, onCommandsChange]);

  // Add new command
  const addCommand = useCallback((afterId = null) => {
    const newId = getNextId(commands);
    const newCommand = createCommand(newId);

    if (afterId) {
      const index = commands.findIndex(c => c.id === afterId);
      const newCommands = [...commands];
      newCommands.splice(index + 1, 0, newCommand);
      updateCommands(newCommands);
    } else {
      updateCommands([...commands, newCommand]);
    }
    setSelectedId(newId);
  }, [commands, updateCommands]);

  // Delete command
  const deleteCommand = useCallback((id) => {
    if (commands.length === 1) {
      // Reset to empty command instead of deleting last one
      updateCommands([createCommand(1)]);
      setSelectedId(1);
    } else {
      updateCommands(commands.filter(c => c.id !== id));
    }
  }, [commands, updateCommands]);

  // Update command
  const updateCommand = useCallback((id, updates) => {
    const newCommands = commands.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    updateCommands(newCommands);
  }, [commands, updateCommands]);

  // Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = commands.findIndex(item => item.id === active.id);
      const newIndex = commands.findIndex(item => item.id === over.id);
      const newCommands = arrayMove(commands, oldIndex, newIndex);
      updateCommands(newCommands);
    }
  }, [commands, updateCommands]);

  // Play single command with animation
  const handlePlaySingle = useCallback((command) => {
    if (onPlaySingle) onPlaySingle(command);
  }, [onPlaySingle]);

  // Play all commands with animation
  const handlePlayAll = useCallback(() => {
    setIsExecuting(true);
    setIsPaused(false);
    if (onPlayAll) onPlayAll();
  }, [onPlayAll]);

  // Stop execution
  const handleStop = useCallback(() => {
    setIsExecuting(false);
    setIsPaused(false);
    if (onStop) onStop();
  }, [onStop]);

  // Pause execution
  const handlePause = useCallback(() => {
    setIsPaused(true);
    if (onPause) onPause();
  }, [onPause]);

  // Resume execution
  const handleResume = useCallback(() => {
    setIsPaused(false);
    if (onResume) onResume();
  }, [onResume]);

  // Open settings panel
  const handleSettingsClick = useCallback((id) => {
    setSelectedId(id);
    setSettingsPanelOpen(true);

    // Store reference to the selected command element for positioning
    setTimeout(() => {
      const element = document.querySelector(`.robo-cmditem .cmd-expression[data-id="${id}"]`);
      if (element) {
        selectedCommandRef.current = element.closest('.robo-cmditem');
      }
    }, 0);
  }, []);

  // Delete all commands
  const handleDeleteAll = useCallback(() => {
    updateCommands([createCommand(1)]);
    setSelectedId(1);
  }, [updateCommands]);

  // Toggle sidebar visibility
  const handleToggleSidebar = useCallback(() => {
    if (onToggleSidebar) onToggleSidebar();
  }, [onToggleSidebar]);

  // Open import modal
  const handleOpenImport = useCallback(() => {
    setImportModalOpen(true);
  }, []);

  // Import expressions from modal
  const handleImport = useCallback((lines) => {
    // Create commands for each line
    let currentId = getNextId(commands);
    const newCommands = lines.map((expression, index) => {
      const cmd = createCommand(currentId + index);
      cmd.expression = expression;
      return cmd;
    });

    // Replace all commands with imported ones
    updateCommands(newCommands);
    setSelectedId(newCommands[0] ? newCommands[0].id : 1);
  }, [commands, updateCommands]);

  // Determine CSS class based on mode
  const editorClass = isPopupMode
    ? 'robo-cmd-editor popup-mode'
    : `robo-cmd-editor ${isSidebarCollapsed ? 'collapsed' : ''}`;

  return (
    <CommandProvider value={{
      commands,
      selectedId,
      setSelectedId,
      addCommand,
      deleteCommand,
      updateCommand,
      isExecuting
    }}>
      <div className={editorClass} ref={containerRef}>
        <div className="robo-cmdeditor-container robo-animate">
          <CommandMenuBar
            onPlayAll={handlePlayAll}
            onStop={handleStop}
            onPause={handlePause}
            onResume={handleResume}
            onDeleteAll={handleDeleteAll}
            onImport={handleOpenImport}
            onToggleSidebar={handleToggleSidebar}
            onPopupMode={onPopupMode}
            isExecuting={isExecuting}
            isPaused={isPaused}
            isSidebarCollapsed={isSidebarCollapsed}
            isPopupMode={isPopupMode}
          />

          <div className={`robo-cmd-panel ${isInputFocused ? 'input-focused' : ''}`} id="cmd-panel">
            <div className="robo-cmd-scroll-wrapper">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={commands.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="robo-cmdlist" id="sortable">
                    <CommandList
                      commands={commands}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                      onUpdate={updateCommand}
                      onDelete={deleteCommand}
                      onPlaySingle={handlePlaySingle}
                      onSettingsClick={handleSettingsClick}
                      onAddCommand={addCommand}
                      onInputFocus={(expressionId) => {
                        setIsInputFocused(true);
                        // Also notify popup container if in popup mode
                        if (isPopupMode && onPopupInputFocus) {
                          onPopupInputFocus();
                        }
                        // Notify expression focus manager
                        if (onExpressionFocus) {
                          onExpressionFocus(expressionId);
                        }
                      }}
                      onInputBlur={(expressionId) => {
                        // Delay to check if focus moved to another input in the list
                        setTimeout(() => {
                          const activeEl = document.activeElement;
                          const isStillInEditor = activeEl?.closest('.robo-cmd-panel');
                          if (!isStillInEditor) {
                            setIsInputFocused(false);
                            // Also notify popup container if in popup mode
                            if (isPopupMode && onPopupInputBlur) {
                              onPopupInputBlur();
                            }
                            // Notify expression focus manager
                            if (onExpressionBlur) {
                              onExpressionBlur(expressionId);
                            }
                          }
                        }, 100);
                      }}
                      errors={errors}
                      canPlayInfos={canPlayInfos}
                    />
                    <NewCommandButton onClick={() => addCommand()} />
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>

        {settingsPanelOpen && (
          <SettingsPanel
            command={commands.find(c => c.id === selectedId)}
            onUpdate={(updates) => {
              const currentCmd = commands.find(c => c.id === selectedId);
              if (currentCmd) {
                updateCommand(selectedId, updates);
              }
            }}
            onRedrawSingle={(styleOptions) => {
              if (onRedrawSingle) {
                onRedrawSingle(selectedId, styleOptions);
              }
            }}
            onClose={() => setSettingsPanelOpen(false)}
            anchorElement={selectedCommandRef.current || containerRef.current}
          />
        )}

        <ImportModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImport={handleImport}
        />
      </div>
    </CommandProvider>
  );
};

export default CommandEditor;
