/**
 * useCommandExecution Hook
 *
 * Connects CommandEditor to the expression parser and command execution system.
 * Manages the full pipeline: parse -> eval -> resolve -> toCommand -> execute
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { ExpressionPipelineService } from '../engine/services/ExpressionPipelineService.js';
import { ExpressionContext } from '../engine/expression-parser/core/ExpressionContext.js';
import { CommandContext } from '../engine/context/CommandContext.js';
import { CommandExecutor } from '../engine/context/CommandExecutor.js';
import { useDebounce } from './useDebounce.js';

/**
 * Hook for connecting CommandEditor to the execution system
 *
 * @param {RoboCanvas} roboCanvas - RoboCanvas instance
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce delay (default: 500ms)
 * @param {boolean} options.useAnimatedMode - Whether to use animated diagram
 * @returns {Object} Hook return value
 */
export function useCommandExecution(roboCanvas, options = {}) {
    const {
        debounceMs = 500,
        useAnimatedMode = false
    } = options;

    // State
    const [isExecuting, setIsExecuting] = useState(false);
    const [errors, setErrors] = useState([]);

    // Refs for mutable objects
    const pipelineServiceRef = useRef(new ExpressionPipelineService());
    const commandExecutorRef = useRef(new CommandExecutor());
    const expressionContextRef = useRef(new ExpressionContext());
    const lastCommandsRef = useRef([]);
    const roboCanvasRef = useRef(roboCanvas);

    // Keep roboCanvas ref up to date
    useEffect(() => {
        roboCanvasRef.current = roboCanvas;
    }, [roboCanvas]);

    /**
     * Get current diagram based on mode
     */
    const getDiagram = useCallback(() => {
        const canvas = roboCanvasRef.current;
        if (!canvas) return null;
        return canvas.diagram;
    }, []);

    /**
     * Clear canvas and reset context
     */
    const clearAndReset = useCallback(() => {
        const canvas = roboCanvasRef.current;
        if (canvas) {
            canvas.clearAll();
        }
        expressionContextRef.current = new ExpressionContext();
        commandExecutorRef.current.clearCommands();
    }, []);

    /**
     * Execute all commands from scratch
     * This is the core execution function
     * Flow: parse → resolve → toCommand → (if no errors) → clear → execute
     */
    const executeAllCommands = useCallback((commandModels) => {
        const canvas = roboCanvasRef.current;
        if (!canvas) {
            console.warn('Cannot execute: roboCanvas not set');
            return;
        }

        // Create fresh context for variable resolution
        const freshExprContext = new ExpressionContext();

        // Process all commands through pipeline (parse, resolve, toCommand)
        const pipelineResult = pipelineServiceRef.current.processCommandList(
            commandModels,
            freshExprContext
        );

        // Update errors state
        setErrors(pipelineResult.errors);

        // If any errors occurred during parse/resolve/toCommand, abort - don't clear canvas
        if (pipelineResult.errors.length > 0 || pipelineResult.commands.length === 0) {
            return;
        }

        // Only clear after successful compilation
        clearAndReset();
        expressionContextRef.current = freshExprContext;

        // Create command context (graphContainer is null - commands specify their own graph)
        const commandContext = new CommandContext(
            getDiagram(),
            null,  // No default graph - commands use their own via expression
            freshExprContext
        );

        // Set up executor
        const executor = commandExecutorRef.current;
        executor.setCommands(pipelineResult.commands);
        executor.setCommandContext(commandContext);

        // Set up error handler for execution errors
        executor.setOnError((error, command, index) => {
            setErrors(prev => [...prev, { index, error }]);
        });

        // Execute based on mode
        if (useAnimatedMode) {
            setIsExecuting(true);
            executor.setOnAllComplete(() => {
                setIsExecuting(false);
            });
            executor.playAll();
        } else {
            // Static mode: draw all instantly
            executor.drawAll();
        }

        // Store last commands for reference
        lastCommandsRef.current = commandModels;
    }, [getDiagram, clearAndReset, useAnimatedMode]);

    /**
     * Debounced version of executeAllCommands
     */
    const [debouncedExecute, cancelDebounce] = useDebounce(executeAllCommands, debounceMs);

    /**
     * Handle single command change (from expression edit)
     * Re-executes ALL commands due to potential dependencies
     */
    const handleExecute = useCallback((changedCommand) => {
        // Find this command in last commands and update
        let found = false;
        const updatedCommands = lastCommandsRef.current.map(cmd => {
            if (cmd.id === changedCommand.id) {
                found = true;
                return changedCommand;
            }
            return cmd;
        });

        // If it's a new command, add it
        if (!found) {
            updatedCommands.push(changedCommand);
        }

        lastCommandsRef.current = updatedCommands;

        // Use debounced execution
        debouncedExecute(updatedCommands);
    }, [debouncedExecute]);

    /**
     * Handle execute all (Play All button)
     */
    const handleExecuteAll = useCallback((commands) => {
        cancelDebounce();
        lastCommandsRef.current = commands;
        executeAllCommands(commands);
    }, [executeAllCommands, cancelDebounce]);

    /**
     * Handle onChange from CommandEditor
     */
    const handleChange = useCallback((commands) => {
        lastCommandsRef.current = commands;
        debouncedExecute(commands);
    }, [debouncedExecute]);

    /**
     * Handle stop
     */
    const handleStop = useCallback(() => {
        cancelDebounce();
        commandExecutorRef.current.stop();
        setIsExecuting(false);
    }, [cancelDebounce]);

    /**
     * Handle pause
     */
    const handlePause = useCallback(() => {
        commandExecutorRef.current.pause();
    }, []);

    /**
     * Handle resume
     */
    const handleResume = useCallback(() => {
        commandExecutorRef.current.resume();
    }, []);

    /**
     * Force clear and re-render
     */
    const clearAndRerender = useCallback(() => {
        if (lastCommandsRef.current.length > 0) {
            executeAllCommands(lastCommandsRef.current);
        }
    }, [executeAllCommands]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancelDebounce();
            commandExecutorRef.current.stop();
        };
    }, [cancelDebounce]);

    return {
        // Callbacks for CommandEditor
        handleExecute,
        handleExecuteAll,
        handleChange,
        handleStop,
        handlePause,
        handleResume,

        // State
        isExecuting,
        errors,
        executionContext: expressionContextRef.current,

        // Utilities
        clearAndRerender
    };
}
