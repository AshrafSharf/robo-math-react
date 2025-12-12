import React, { useState, useRef, useCallback } from 'react';
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
  onToggleSidebar,
  isSidebarCollapsed,
  errors = [],
  canPlayInfos = []
}) => {
  const [commands, setCommands] = useState([createCommand(1)]);
  const [selectedId, setSelectedId] = useState(1);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const selectedCommandRef = useRef(null);

  // Update commands and notify parent
  // Controller handles debouncing internally - no throttle needed here
  const updateCommands = useCallback((newCommands) => {
    setCommands(newCommands);
    onChange?.(newCommands);
  }, [onChange]);

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

    // Trigger direct play if expression changed
    if (updates.expression !== undefined) {
      const command = newCommands.find(c => c.id === id);
      onExecute?.(command);
    }
  }, [commands, updateCommands, onExecute]);

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
    onPlaySingle?.(command);
  }, [onPlaySingle]);

  // Play all commands with animation
  const handlePlayAll = useCallback(() => {
    setIsExecuting(true);
    setIsPaused(false);
    onPlayAll?.();
  }, [onPlayAll]);

  // Stop execution
  const handleStop = useCallback(() => {
    setIsExecuting(false);
    setIsPaused(false);
    onStop?.();
  }, [onStop]);

  // Pause execution
  const handlePause = useCallback(() => {
    setIsPaused(true);
    onPause?.();
  }, [onPause]);

  // Resume execution
  const handleResume = useCallback(() => {
    setIsPaused(false);
    onResume?.();
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
    onToggleSidebar?.();
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
    setSelectedId(newCommands[0]?.id || 1);
  }, [commands, updateCommands]);

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
      <div className={`robo-cmd-editor ${isSidebarCollapsed ? 'collapsed' : ''}`} ref={containerRef}>
        <div className="robo-cmdeditor-container robo-animate">
          <CommandMenuBar
            onPlayAll={handlePlayAll}
            onStop={handleStop}
            onPause={handlePause}
            onResume={handleResume}
            onDeleteAll={handleDeleteAll}
            onImport={handleOpenImport}
            onToggleSidebar={handleToggleSidebar}
            isExecuting={isExecuting}
            isPaused={isPaused}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          <div className="robo-cmd-panel" id="cmd-panel">
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
                    errors={errors}
                    canPlayInfos={canPlayInfos}
                  />
                  <NewCommandButton onClick={() => addCommand()} />
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {settingsPanelOpen && (
          <SettingsPanel
            command={commands.find(c => c.id === selectedId)}
            onUpdate={(updates) => updateCommand(selectedId, updates)}
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
