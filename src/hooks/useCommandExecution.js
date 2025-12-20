/**
 * useCommandExecution Hook
 *
 * Thin React bridge to CommandEditorController.
 * Just subscribes to controller events and triggers React re-renders.
 * All logic lives in the controller.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { CommandEditorController } from '../engine/controller/CommandEditorController.js';
import { FOCUS_EVENT, BLUR_EVENT } from '../engine/focus/index.js';
import { LATEX_VARS_CHANGED_EVENT } from '../components/CommandEditor/CommandEditor.jsx';

export function useCommandExecution(roboCanvas, options = {}) {
    const { debounceMs = 500 } = options;

    // Controller state (mirrored from controller for React re-renders)
    const [state, setState] = useState({
        errors: [],
        canPlayInfos: [],
        isExecuting: false
    });

    // Track focused expression
    const focusedExpressionIdRef = useRef(null);

    // Controller instance
    const controllerRef = useRef(null);

    // Initialize controller once
    if (!controllerRef.current) {
        controllerRef.current = new CommandEditorController(null, { debounceMs });
    }

    const controller = controllerRef.current;

    // Update roboCanvas when it changes
    useEffect(() => {
        controller.setRoboCanvas(roboCanvas);
    }, [roboCanvas, controller]);

    // Subscribe to controller state changes
    useEffect(() => {
        controller.onStateChange = (newState) => {
            setState(newState);
        };

        return () => {
            controller.onStateChange = null;
        };
    }, [controller]);

    // Listen for latex variable changes
    useEffect(() => {
        const handleLatexVarsChange = () => {
            if (controller.commandModels.length > 0) {
                controller.executeAll(controller.commandModels);
            }
        };
        document.addEventListener(LATEX_VARS_CHANGED_EVENT, handleLatexVarsChange);

        return () => {
            document.removeEventListener(LATEX_VARS_CHANGED_EVENT, handleLatexVarsChange);
        };
    }, [controller]);

    // Focus handling
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

    const handleExpressionFocus = useCallback((expressionId) => {
        focusedExpressionIdRef.current = expressionId;
        setActiveShape(expressionId);
    }, [setActiveShape]);

    const handleExpressionBlur = useCallback(() => {
        focusedExpressionIdRef.current = null;
        document.dispatchEvent(new CustomEvent(BLUR_EVENT));
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            controller.destroy();
        };
    }, [controller]);

    // ============================================
    // Handler wrappers (delegate to controller)
    // ============================================

    const handleExecute = useCallback((commandModels) => {
        controller.executeAll(commandModels);
    }, [controller]);

    const handleExecuteAll = useCallback((commandModels) => {
        controller.executeAll(commandModels);
    }, [controller]);

    const handlePlaySingle = useCallback((commandId) => {
        controller.playSingle(commandId);
    }, [controller]);

    const handlePlayAll = useCallback(() => {
        controller.playAll();
    }, [controller]);

    const handleChange = useCallback((commandModels) => {
        controller.setCommandModels(commandModels);
    }, [controller]);

    const handleStop = useCallback(() => {
        controller.stop();
    }, [controller]);

    const handlePause = useCallback(() => {
        controller.pause();
    }, [controller]);

    const handleResume = useCallback(() => {
        controller.resume();
    }, [controller]);

    const redrawSingle = useCallback((expressionId, styleOptions) => {
        return controller.redrawSingle(expressionId, styleOptions);
    }, [controller]);

    const clearAndRerender = useCallback(() => {
        controller.clearAndReset();
    }, [controller]);

    return {
        // State (from controller)
        ...state,

        // Controller reference
        controller,

        // Handler wrappers for legacy API
        handleExecute,
        handleExecuteAll,
        handlePlaySingle,
        handlePlayAll,
        handleChange,
        handleStop,
        handlePause,
        handleResume,
        redrawSingle,
        clearAndRerender,

        // Focus handlers
        handleExpressionFocus,
        handleExpressionBlur
    };
}
