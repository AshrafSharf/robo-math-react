/**
 * useCommandExecution Hook
 *
 * Thin React bridge to CommandEditorController.
 * All execution logic lives in the controller - this hook just bridges to React state.
 * Debouncing is handled by the controller, not by React.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { CommandEditorController } from '../engine/controller/CommandEditorController.js';
import { FOCUS_EVENT, BLUR_EVENT } from '../engine/focus/index.js';

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

    // Track currently focused expression for re-dispatch after execution
    const focusedExpressionIdRef = useRef(null);

    // Controller instance (single ref, not recreated)
    const controllerRef = useRef(null);

    // Initialize controller once with debounce config
    if (!controllerRef.current) {
        controllerRef.current = new CommandEditorController(null, { debounceMs });
    }

    const controller = controllerRef.current;

    // Update roboCanvas reference when it changes
    useEffect(() => {
        controller.setRoboCanvas(roboCanvas);
    }, [roboCanvas, controller]);

    // Dispatch active shape event to update focus indicator
    const setActiveShape = useCallback((expressionId) => {
        if (expressionId === null) return;

        const command = controller.commandExecutor.commands.find(
            c => c.getExpressionId() === expressionId
        );

        document.dispatchEvent(new CustomEvent(FOCUS_EVENT, {
            detail: {
                expressionId,
                shape: command?.getCommandResult() || null,
                canvasSection: roboCanvas?.canvasSection,
                annotationLayer: roboCanvas?.getAnnotationLayer(),
                scene3d: null
            }
        }));
    }, [controller, roboCanvas]);

    // Wire up controller callbacks to React state
    useEffect(() => {
        controller.onErrorsChange = setErrors;
        controller.onCanPlayInfosChange = setCanPlayInfos;
        controller.onExecutingChange = setIsExecuting;

        // Update active shape after execution completes (shapes may have moved/recreated)
        controller.onExecutionComplete = () => {
            if (focusedExpressionIdRef.current !== null) {
                setActiveShape(focusedExpressionIdRef.current);
            }
        };

        return () => {
            controller.onErrorsChange = null;
            controller.onCanPlayInfosChange = null;
            controller.onExecutingChange = null;
            controller.onExecutionComplete = null;
        };
    }, [controller, setActiveShape]);

    /**
     * Handle command change (from input)
     * Controller handles debouncing internally
     */
    const handleChange = useCallback((commandModels) => {
        controller.setCommandModels(commandModels);
    }, [controller]);

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
        controller.cancelPendingExecution();
        controller.playSingle(commandModel.id);
    }, [controller]);

    /**
     * Handle play up to command
     */
    const handlePlayUpTo = useCallback((commandModel) => {
        controller.cancelPendingExecution();
        controller.playUpTo(commandModel.id);
    }, [controller]);

    /**
     * Handle play all commands with animation
     */
    const handlePlayAll = useCallback(() => {
        controller.cancelPendingExecution();
        controller.playAll();
    }, [controller]);

    /**
     * Handle execute all
     */
    const handleExecuteAll = useCallback((commandModels) => {
        controller.cancelPendingExecution();
        controller.executeAll(commandModels);
    }, [controller]);

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

    /**
     * Redraw a single command with new style options
     */
    const redrawSingle = useCallback((expressionId, styleOptions) => {
        return controller.redrawSingle(expressionId, styleOptions);
    }, [controller]);

    /**
     * Handle expression input focus - track focused expression and show indicator
     * @param {number} expressionId - The expression/command ID
     */
    const handleExpressionFocus = useCallback((expressionId) => {
        focusedExpressionIdRef.current = expressionId;
        setActiveShape(expressionId);
    }, [setActiveShape]);

    /**
     * Handle expression input blur - clear focus tracking and hide indicator
     */
    const handleExpressionBlur = useCallback(() => {
        focusedExpressionIdRef.current = null;
        document.dispatchEvent(new CustomEvent(BLUR_EVENT));
    }, []);

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
        handlePlayAll,
        handleChange,
        handleStop,
        handlePause,
        handleResume,
        clearAndRerender,
        redrawSingle,
        handleExpressionFocus,
        handleExpressionBlur,

        // Direct controller access (if needed)
        controller
    };
}
