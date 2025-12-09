/**
 * useCommandExecution Hook
 *
 * Thin React bridge to CommandEditorController.
 * All execution logic lives in the controller - this hook just bridges to React state.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { CommandEditorController } from '../engine/controller/CommandEditorController.js';
import { useDebounce } from './useDebounce.js';

/**
 * Hook for connecting CommandEditor to the execution system
 *
 * @param {RoboCanvas} roboCanvas - RoboCanvas instance
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce delay (default: 500ms)
 * @returns {Object} Hook return value
 */
export function useCommandExecution(roboCanvas, options = {}) {
    const { debounceMs = 500 } = options;

    // React state (UI only)
    const [isExecuting, setIsExecuting] = useState(false);
    const [errors, setErrors] = useState([]);
    const [canPlayInfos, setCanPlayInfos] = useState([]);

    // Controller instance (single ref, not recreated)
    const controllerRef = useRef(null);

    // Initialize controller once
    if (!controllerRef.current) {
        controllerRef.current = new CommandEditorController(null);
    }

    const controller = controllerRef.current;

    // Update roboCanvas reference when it changes
    useEffect(() => {
        controller.setRoboCanvas(roboCanvas);
    }, [roboCanvas, controller]);

    // Wire up controller callbacks to React state
    useEffect(() => {
        controller.onErrorsChange = setErrors;
        controller.onCanPlayInfosChange = setCanPlayInfos;
        controller.onExecutingChange = setIsExecuting;

        return () => {
            controller.onErrorsChange = null;
            controller.onCanPlayInfosChange = null;
            controller.onExecutingChange = null;
        };
    }, [controller]);

    // Debounced execute
    const [debouncedExecute, cancelDebounce] = useDebounce(
        (commandModels) => controller.executeAll(commandModels),
        debounceMs
    );

    /**
     * Handle command change (from input)
     * Updates command models immediately, triggers debounced execution
     */
    const handleChange = useCallback((commandModels) => {
        controller.setCommandModels(commandModels);  // Immediate update
        debouncedExecute(commandModels);              // Debounced execution
    }, [debouncedExecute, controller]);

    /**
     * Handle single command execution (from direct input)
     */
    const handleExecute = useCallback((command) => {
        // This is handled via handleChange with debounce
    }, []);

    /**
     * Handle play single command
     */
    const handlePlaySingle = useCallback((commandModel) => {
        cancelDebounce();
        controller.playSingle(commandModel.id);
    }, [cancelDebounce, controller]);

    /**
     * Handle play up to command
     */
    const handlePlayUpTo = useCallback((commandModel) => {
        cancelDebounce();
        controller.playUpTo(commandModel.id);
    }, [cancelDebounce, controller]);

    /**
     * Handle execute all
     */
    const handleExecuteAll = useCallback((commandModels) => {
        cancelDebounce();
        controller.executeAll(commandModels);
    }, [cancelDebounce, controller]);

    /**
     * Handle stop
     */
    const handleStop = useCallback(() => {
        controller.stop();
    }, [controller]);

    /**
     * Handle pause
     */
    const handlePause = useCallback(() => {
        controller.pause();
    }, [controller]);

    /**
     * Handle resume
     */
    const handleResume = useCallback(() => {
        controller.resume();
    }, [controller]);

    /**
     * Clear and rerender
     */
    const clearAndRerender = useCallback(() => {
        controller.clearAndReset();
    }, [controller]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            controller.destroy();
        };
    }, [controller]);

    return {
        // State
        isExecuting,
        errors,
        canPlayInfos,

        // Handlers
        handleExecute,
        handleExecuteAll,
        handlePlaySingle,
        handlePlayUpTo,
        handleChange,
        handleStop,
        handlePause,
        handleResume,
        clearAndRerender,

        // Direct controller access (if needed)
        controller
    };
}
