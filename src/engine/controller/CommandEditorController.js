/**
 * CommandEditorController
 *
 * Pure JS controller for command editing and execution.
 * Owns all execution logic - completely decoupled from React.
 */
import { ExpressionPipelineService } from '../services/ExpressionPipelineService.js';
import { ExpressionContext } from '../expression-parser/core/ExpressionContext.js';
import { CommandContext } from '../context/CommandContext.js';
import { CommandExecutor } from '../context/CommandExecutor.js';

export class CommandEditorController {
    constructor(roboCanvas) {
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

        // Event callbacks
        this.onErrorsChange = null;
        this.onCanPlayInfosChange = null;
        this.onExecutingChange = null;
    }

    /**
     * Set the roboCanvas reference
     */
    setRoboCanvas(roboCanvas) {
        this.roboCanvas = roboCanvas;
    }

    /**
     * Update command models (called on every change, before debounced execution)
     */
    setCommandModels(commandModels) {
        this.commandModels = commandModels;
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

        // Create fresh context for variable resolution
        const freshExprContext = new ExpressionContext();

        // Process all commands through pipeline
        const pipelineResult = this.pipelineService.processCommandList(
            commandModels,
            freshExprContext
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
        this.expressionContext = freshExprContext;

        // Create command context
        const commandContext = new CommandContext(
            this.getDiagram(),
            null,
            freshExprContext
        );

        // Set up executor
        this.commandExecutor.setCommands(pipelineResult.commands);
        this.commandExecutor.setCommandContext(commandContext);

        // Set up error handler
        this.commandExecutor.setOnError((error, command, index) => {
            this._setErrors([...this.errors, { index, error }]);
        });

        // Execute (static mode - instant draw)
        await this.commandExecutor.drawAll();
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

        // Clear and switch to animated diagram
        this.roboCanvas.clearAll();
        this.roboCanvas.useAnimatedDiagram();

        // Re-process to get fresh commands (needed because we cleared)
        const freshExprContext = new ExpressionContext();
        const pipelineResult = this.pipelineService.processCommandList(
            this.commandModels,
            freshExprContext
        );

        this._setErrors(pipelineResult.errors);
        this._setCanPlayInfos(pipelineResult.canPlayInfos);

        // Find command index by expressionId AFTER reprocessing
        const commandIndex = pipelineResult.commands.findIndex(
            cmd => cmd.getExpressionId() === commandId
        );

        if (commandIndex === -1) {
            console.warn('Command not found:', commandId);
            this.roboCanvas.useStaticDiagram();
            return;
        }

        // Abort if errors up to this index
        const hasErrorsUpTo = pipelineResult.errors.some(e => e.index <= commandIndex);
        if (hasErrorsUpTo) {
            this.roboCanvas.useStaticDiagram();
            return;
        }

        this.expressionContext = freshExprContext;

        // Create command context with animated diagram
        const commandContext = new CommandContext(
            this.getDiagram(),
            null,
            freshExprContext
        );

        // Set up executor
        this.commandExecutor.setCommands(pipelineResult.commands);
        this.commandExecutor.setCommandContext(commandContext);

        this.commandExecutor.setOnError((error, command, index) => {
            this._setErrors([...this.errors, { index, error }]);
        });

        // Play up to command
        this._setExecuting(true);

        await this.commandExecutor.playUpTo(commandIndex);

        this._setExecuting(false);
        // Stay in animated mode - shapes remain visible
        // Next user action (typing) will trigger executeAll which resets to static mode
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
        this.stop();
        this.commandExecutor.clearCommands();
        this.expressionContext = null;
        this.roboCanvas = null;
    }
}
