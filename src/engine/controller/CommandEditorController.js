/**
 * CommandEditorController
 *
 * Pure JS controller for command editing and execution.
 * Owns all execution logic - completely decoupled from React.
 * Handles its own debouncing internally.
 */
import { ExpressionPipelineService } from '../services/ExpressionPipelineService.js';
import { ExpressionContext } from '../expression-parser/core/ExpressionContext.js';
import { CommandContext } from '../context/CommandContext.js';
import { CommandExecutor } from '../context/CommandExecutor.js';

const LATEX_VARIABLES_KEY = 'robomath-latex-variables';

export class CommandEditorController {
    constructor(roboCanvas, options = {}) {
        this.roboCanvas = roboCanvas;

        // Core services
        this.pipelineService = new ExpressionPipelineService();
        this.commandExecutor = new CommandExecutor();
        this.expressionContext = new ExpressionContext();

        // State
        this.commandModels = [];
        this.errors = [];
        this.canPlayInfos = [];
        this.isExecuting = false;

        // Debounce config
        this.debounceMs = options.debounceMs ?? 500;
        this._debounceTimer = null;

        // Event callbacks
        this.onErrorsChange = null;
        this.onCanPlayInfosChange = null;
        this.onExecutingChange = null;
        this.onExecutionComplete = null;  // Called after commands finish executing
    }

    /**
     * Set the roboCanvas reference
     */
    setRoboCanvas(roboCanvas) {
        this.roboCanvas = roboCanvas;
    }

    /**
     * Update command models and trigger debounced execution
     * This is the main entry point for input changes
     */
    setCommandModels(commandModels) {
        this.commandModels = commandModels;
        this._scheduleExecution();
    }

    /**
     * Schedule debounced execution
     * @private
     */
    _scheduleExecution() {
        // Clear any pending execution
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }

        // Schedule new execution
        this._debounceTimer = setTimeout(() => {
            this._debounceTimer = null;
            this.executeAll(this.commandModels);
        }, this.debounceMs);
    }

    /**
     * Cancel any pending debounced execution
     */
    cancelPendingExecution() {
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
            this._debounceTimer = null;
        }
    }

    /**
     * Get current diagram from canvas
     */
    getDiagram() {
        return this.roboCanvas?.diagram || null;
    }

    /**
     * Clear canvas and reset context
     */
    clearAndReset() {
        if (this.roboCanvas) {
            this.roboCanvas.clearAll();
        }
        this.expressionContext = new ExpressionContext();
        this.commandExecutor.clearCommands();
    }

    /**
     * Get latex variable command models from localStorage
     * These are prepended to user commands so variables are defined first
     * @private
     */
    _getLatexVariableModels() {
        try {
            const stored = localStorage.getItem(LATEX_VARIABLES_KEY);
            if (!stored) return [];

            const variables = JSON.parse(stored);
            if (!Array.isArray(variables)) return [];

            // Convert to command models with negative IDs to avoid conflicts
            return variables
                .filter(v => v.variable && v.variable.trim())
                .map((v, index) => ({
                    id: -(index + 1),  // Negative IDs for latex vars
                    expression: `${v.variable} = "${v.latex}"`,
                    // No styling for variable definitions
                    color: null,
                    fillColor: null,
                    strokeWidth: 2,
                    speed: 5,
                    label: false,
                    isLatexVariable: true  // Mark for identification
                }));
        } catch (e) {
            console.error('Failed to load latex variables:', e);
            return [];
        }
    }

    /**
     * Execute all commands from scratch
     * Flow: parse → resolve → toCommand → (if no errors) → clear → execute
     * @returns {Promise}
     */
    async executeAll(commandModels) {
        if (!this.roboCanvas) {
            console.warn('Cannot execute: roboCanvas not set');
            return;
        }

        this.commandModels = commandModels;

        // Get latex variable models and prepend to user commands
        const latexVarModels = this._getLatexVariableModels();
        const allModels = [...latexVarModels, ...commandModels];

        // Create fresh context for variable resolution
        const newContext = new ExpressionContext();

        // Process all commands through pipeline
        const pipelineResult = this.pipelineService.processCommandList(
            allModels,
            newContext
        );

        // Update state
        this._setErrors(pipelineResult.errors);
        this._setCanPlayInfos(pipelineResult.canPlayInfos);

        // If any errors, abort - don't clear canvas
        if (pipelineResult.errors.length > 0 || pipelineResult.commands.length === 0) {
            return;
        }

        // Clear after successful compilation
        this.clearAndReset();
        this.expressionContext = newContext;

        // Create command context with layout dependencies
        const diagram = this.getDiagram();
        const pen = this.roboCanvas?.penTracer || null;
        const commandContext = new CommandContext(diagram.coordinateMapper, diagram.canvasSection, pen);
        commandContext.annotationLayer = this.roboCanvas.getAnnotationLayer();
        commandContext.expressionContext = newContext;

        // Set up executor
        this.commandExecutor.setDiagram2d(diagram);
        this.commandExecutor.setCommands(pipelineResult.commands);
        this.commandExecutor.setCommandContext(commandContext);

        // Set up error handler
        this.commandExecutor.setOnError((error, command, index) => {
            this._setErrors([...this.errors, { index, error }]);
        });

        // Execute (static mode - instant draw)
        await this.commandExecutor.drawAll();

        // Notify listeners that execution is complete
        if (this.onExecutionComplete) {
            this.onExecutionComplete();
        }
    }

    /**
     * Play single command - replay animation on existing shape
     * Non-destructive, idempotent
     * @returns {Promise}
     */
    async playSingle(commandId) {
        // Find command by expressionId
        const commandIndex = this.commandExecutor.commands.findIndex(
            cmd => cmd.getExpressionId() === commandId
        );

        if (commandIndex === -1) {
            console.warn('Command not found:', commandId);
            return;
        }

        await this.commandExecutor.playSingle(commandIndex);
    }

    /**
     * Play all commands with animation up to and including the given command
     * @returns {Promise}
     */
    async playUpTo(commandId) {
        if (!this.roboCanvas) {
            console.warn('Cannot play: roboCanvas not set');
            return;
        }

        // Clear canvas
        this.roboCanvas.clearAll();

        // Get latex variable models and prepend to user commands
        const latexVarModels = this._getLatexVariableModels();
        const allModels = [...latexVarModels, ...this.commandModels];

        // Re-process to get fresh commands (needed because we cleared)
        const newContext = new ExpressionContext();
        const pipelineResult = this.pipelineService.processCommandList(
            allModels,
            newContext
        );

        this._setErrors(pipelineResult.errors);
        this._setCanPlayInfos(pipelineResult.canPlayInfos);

        // Find command index by expressionId AFTER reprocessing
        const commandIndex = pipelineResult.commands.findIndex(
            cmd => cmd.getExpressionId() === commandId
        );

        if (commandIndex === -1) {
            console.warn('Command not found:', commandId);
            return;
        }

        // Abort if errors up to this index
        const hasErrorsUpTo = pipelineResult.errors.some(e => e.index <= commandIndex);
        if (hasErrorsUpTo) {
            return;
        }

        this.expressionContext = newContext;

        // Create command context with layout dependencies
        const diagram = this.getDiagram();
        const pen = this.roboCanvas?.penTracer || null;
        const commandContext = new CommandContext(diagram.coordinateMapper, diagram.canvasSection, pen);
        commandContext.annotationLayer = this.roboCanvas.getAnnotationLayer();
        commandContext.expressionContext = newContext;

        // Clear old commands before setting new ones (removes old DOM elements)
        this.commandExecutor.clearCommands();

        // Set up executor
        this.commandExecutor.setDiagram2d(diagram);
        this.commandExecutor.setCommands(pipelineResult.commands);
        this.commandExecutor.setCommandContext(commandContext);

        this.commandExecutor.setOnError((error, command, index) => {
            this._setErrors([...this.errors, { index, error }]);
        });

        // Play up to command
        this._setExecuting(true);

        await this.commandExecutor.playUpTo(commandIndex);

        this._setExecuting(false);
    }

    /**
     * Play all commands with animation
     * @returns {Promise}
     */
    async playAll() {
        if (!this.roboCanvas) {
            console.warn('Cannot play: roboCanvas not set');
            return;
        }

        // Clear canvas
        this.roboCanvas.clearAll();

        // Get latex variable models and prepend to user commands
        const latexVarModels = this._getLatexVariableModels();
        const allModels = [...latexVarModels, ...this.commandModels];

        // Re-process to get fresh commands
        const newContext = new ExpressionContext();
        const pipelineResult = this.pipelineService.processCommandList(
            allModels,
            newContext
        );

        this._setErrors(pipelineResult.errors);
        this._setCanPlayInfos(pipelineResult.canPlayInfos);

        // Abort if errors
        if (pipelineResult.errors.length > 0 || pipelineResult.commands.length === 0) {
            return;
        }

        this.expressionContext = newContext;

        // Create command context with layout dependencies
        const diagram = this.getDiagram();
        const pen = this.roboCanvas?.penTracer || null;
        const commandContext = new CommandContext(diagram.coordinateMapper, diagram.canvasSection, pen);
        commandContext.annotationLayer = this.roboCanvas.getAnnotationLayer();
        commandContext.expressionContext = newContext;

        // Clear old commands before setting new ones (removes old DOM elements)
        this.commandExecutor.clearCommands();

        // Set up executor
        this.commandExecutor.setDiagram2d(diagram);
        this.commandExecutor.setCommands(pipelineResult.commands);
        this.commandExecutor.setCommandContext(commandContext);

        this.commandExecutor.setOnError((error, command, index) => {
            this._setErrors([...this.errors, { index, error }]);
        });

        // Play all commands
        this._setExecuting(true);

        await this.commandExecutor.playAll();

        this._setExecuting(false);
    }

    /**
     * Redraw a single command with new style options
     * @param {number} expressionId - The expression ID
     * @param {Object} styleOptions - Style options {color, fill, strokeWidth}
     * @returns {Promise<boolean>} True if command was redrawn
     */
    async redrawSingle(expressionId, styleOptions) {
        return this.commandExecutor.redrawSingle(expressionId, styleOptions);
    }

    /**
     * Stop execution
     */
    stop() {
        this.commandExecutor.stop();
        this._setExecuting(false);
    }

    /**
     * Pause execution
     */
    pause() {
        this.commandExecutor.pause();
    }

    /**
     * Resume execution
     * @returns {Promise}
     */
    async resume() {
        return this.commandExecutor.resume();
    }

    /**
     * Get current errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Get canPlay infos
     */
    getCanPlayInfos() {
        return this.canPlayInfos;
    }

    /**
     * Check if executing
     */
    getIsExecuting() {
        return this.isExecuting;
    }

    // ============================================
    // Private state update methods with callbacks
    // ============================================

    _setErrors(errors) {
        this.errors = errors;
        if (this.onErrorsChange) {
            this.onErrorsChange(errors);
        }
    }

    _setCanPlayInfos(canPlayInfos) {
        this.canPlayInfos = canPlayInfos;
        if (this.onCanPlayInfosChange) {
            this.onCanPlayInfosChange(canPlayInfos);
        }
    }

    _setExecuting(isExecuting) {
        this.isExecuting = isExecuting;
        if (this.onExecutingChange) {
            this.onExecutingChange(isExecuting);
        }
    }

    /**
     * Clean up
     */
    destroy() {
        this.cancelPendingExecution();
        this.stop();
        this.commandExecutor.clearCommands();
        this.expressionContext = null;
        this.roboCanvas = null;
    }
}
