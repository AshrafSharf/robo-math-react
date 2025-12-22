/**
 * CommandEditorController
 *
 * Pure JS controller for command editing and execution.
 * Manages its own state - completely decoupled from React.
 * Emits events for state changes that UI can subscribe to.
 */
import { TweenMax } from 'gsap';
import { ExpressionPipelineService } from '../services/ExpressionPipelineService.js';
import { ExpressionContext } from '../expression-parser/core/ExpressionContext.js';
import { CommandContext } from '../context/CommandContext.js';
import { CommandExecutor } from '../context/CommandExecutor.js';
import { AutoPlayer } from './players/AutoPlayer.js';
import { InteractivePlayer } from './players/InteractivePlayer.js';

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

        // Lesson pages for copy expression support
        this.lessonPages = [];
        this.currentPageIndex = 0;

        // Event callbacks - UI subscribes to these
        this.onStateChange = null;  // Called on any state change
        this.onInteractiveStateChange = null;  // Called on interactive player state change

        // Internal players (NOT exposed directly)
        this._autoPlayer = new AutoPlayer(this);
        this._interactivePlayer = new InteractivePlayer(this);

        // Wire up interactive player state changes
        this._interactivePlayer.onStateChange = (state) => {
            if (this.onInteractiveStateChange) {
                this.onInteractiveStateChange(state);
            }
        };
    }

    // ============================================
    // State Management
    // ============================================

    getState() {
        return {
            errors: this.errors,
            canPlayInfos: this.canPlayInfos,
            isExecuting: this.isExecuting
        };
    }

    _notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.getState());
        }
    }

    // ============================================
    // Canvas and Context
    // ============================================

    setRoboCanvas(roboCanvas) {
        this.roboCanvas = roboCanvas;
    }

    setLessonPages(pages, currentPageIndex) {
        this.lessonPages = pages || [];
        this.currentPageIndex = currentPageIndex || 0;
    }

    getDiagram() {
        return this.roboCanvas?.diagram || null;
    }

    clearAndReset() {
        if (this.roboCanvas) {
            this.roboCanvas.clearAll();
        }
        this.expressionContext = new ExpressionContext();
        this.commandExecutor.clearCommands();
    }

    // ============================================
    // Command Input (debounced execution)
    // ============================================

    setCommandModels(commandModels) {
        this.commandModels = commandModels;
        this._scheduleExecution();
    }

    _scheduleExecution() {
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
        this._debounceTimer = setTimeout(() => {
            this._debounceTimer = null;
            this.executeAll(this.commandModels);
        }, this.debounceMs);
    }

    // Execute immediately without debouncing (for page switches)
    executeAllImmediate(commandModels) {
        this.cancelPendingExecution();
        this.commandModels = commandModels;
        this.executeAll(commandModels);
    }

    cancelPendingExecution() {
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
            this._debounceTimer = null;
        }
    }

    // ============================================
    // Latex Variables
    // ============================================

    _getLatexVariableModels() {
        try {
            const stored = localStorage.getItem(LATEX_VARIABLES_KEY);
            if (!stored) return [];

            const variables = JSON.parse(stored);
            if (!Array.isArray(variables)) return [];

            return variables
                .filter(v => v.variable && v.variable.trim())
                .map((v, index) => ({
                    id: -(index + 1),
                    expression: `${v.variable} = "${v.latex}"`,
                    color: null,
                    fillColor: null,
                    strokeWidth: 2,
                    speed: 5,
                    label: false,
                    isLatexVariable: true
                }));
        } catch (e) {
            console.error('Failed to load latex variables:', e);
            return [];
        }
    }

    // ============================================
    // Command Preparation (no drawing)
    // ============================================

    async prepareCommands(commandModels) {
        if (!this.roboCanvas) {
            console.warn('Cannot prepare: roboCanvas not set');
            return false;
        }

        this.commandModels = commandModels;

        const latexVarModels = this._getLatexVariableModels();
        const allModels = [...latexVarModels, ...commandModels];

        const newContext = new ExpressionContext();
        // Set up context for copy expression support
        newContext.pages = this.lessonPages;
        newContext.currentPageIndex = this.currentPageIndex;
        newContext.pipelineService = this.pipelineService;

        const pipelineResult = this.pipelineService.processCommandList(allModels, newContext);

        this.errors = pipelineResult.errors;
        this.canPlayInfos = pipelineResult.canPlayInfos;

        if (pipelineResult.errors.length > 0 || pipelineResult.commands.length === 0) {
            this._notifyStateChange();
            return false;
        }

        this.clearAndReset();
        this.expressionContext = newContext;

        const diagram = this.getDiagram();
        const pen = this.roboCanvas?.penTracer || null;
        const commandContext = new CommandContext(diagram.coordinateMapper, diagram.canvasSection, pen);
        commandContext.annotationLayer = this.roboCanvas.getAnnotationLayer();
        commandContext.expressionContext = newContext;

        this.commandExecutor.setDiagram2d(diagram);
        this.commandExecutor.setCommands(pipelineResult.commands);
        this.commandExecutor.setCommandContext(commandContext);

        this.commandExecutor.setOnError((error, command, index) => {
            this.errors = [...this.errors, { index, error }];
            this._notifyStateChange();
        });

        this._notifyStateChange();
        return true;
    }

    // ============================================
    // Normal Execution (instant draw)
    // ============================================

    async executeAll(commandModels) {
        const success = await this.prepareCommands(commandModels);
        if (!success) return;

        await this.commandExecutor.drawAll();
        this._notifyStateChange();
    }

    // ============================================
    // Single Command Playback
    // ============================================

    async playCommand(index) {
        const command = this.commandExecutor.commands[index];
        if (!command) {
            console.warn('Command not found at index:', index);
            return;
        }

        await this.commandExecutor.initCommand(command);
        await command.play();
    }

    async playSingle(commandId) {
        const commandIndex = this.commandExecutor.commands.findIndex(
            cmd => cmd.getExpressionId() === commandId
        );

        if (commandIndex === -1) {
            console.warn('Command not found:', commandId);
            return;
        }

        await this.commandExecutor.playSingle(commandIndex);
    }

    // ============================================
    // Full Playback (animated)
    // ============================================

    async playAll() {
        if (!this.roboCanvas) {
            console.warn('Cannot play: roboCanvas not set');
            return;
        }

        const success = await this.prepareCommands(this.commandModels);
        if (!success) return;

        this.isExecuting = true;
        this._notifyStateChange();

        await this.commandExecutor.playAll();

        this.isExecuting = false;
        this._notifyStateChange();
    }

    async playUpTo(commandId) {
        if (!this.roboCanvas) {
            console.warn('Cannot play: roboCanvas not set');
            return;
        }

        const success = await this.prepareCommands(this.commandModels);
        if (!success) return;

        const commandIndex = this.commandExecutor.commands.findIndex(
            cmd => cmd.getExpressionId() === commandId
        );

        if (commandIndex === -1) {
            console.warn('Command not found:', commandId);
            return;
        }

        const hasErrorsUpTo = this.errors.some(e => e.index <= commandIndex);
        if (hasErrorsUpTo) return;

        this.isExecuting = true;
        this._notifyStateChange();

        await this.commandExecutor.playUpTo(commandIndex);

        this.isExecuting = false;
        this._notifyStateChange();
    }

    // ============================================
    // Other Controls
    // ============================================

    stop() {
        this.commandExecutor.stop();
        this.isExecuting = false;
        this._notifyStateChange();
    }

    pause() {
        TweenMax.pauseAll();
    }

    resume() {
        TweenMax.resumeAll();
    }

    async redrawSingle(expressionId, styleOptions) {
        return this.commandExecutor.redrawSingle(expressionId, styleOptions);
    }

    // ============================================
    // Auto Mode API
    // ============================================

    async startAutoPlay() {
        return this._autoPlayer.start();
    }

    async playAllAuto() {
        return this._autoPlayer.playAll();
    }

    async playUpToAuto(index) {
        return this._autoPlayer.playUpTo(index);
    }

    async playSingleAuto(index) {
        return this._autoPlayer.playSingle(index);
    }

    pauseAuto() {
        this._autoPlayer.pause();
    }

    resumeAuto() {
        this._autoPlayer.resume();
    }

    stopAuto() {
        this._autoPlayer.stop();
    }

    // ============================================
    // Interactive Mode API
    // ============================================

    async startInteractivePlay() {
        return this._interactivePlayer.start();
    }

    async playNextInteractive() {
        return this._interactivePlayer.playNext();
    }

    async playPreviousInteractive() {
        return this._interactivePlayer.playPrevious();
    }

    async playInteractive() {
        return this._interactivePlayer.playNext();
    }

    stopInteractive() {
        this._interactivePlayer.stop();
    }

    async stopAndDrawInteractive() {
        return this._interactivePlayer.stopAndDraw();
    }

    pauseInteractive() {
        this._interactivePlayer.pause();
    }

    resumeInteractive() {
        this._interactivePlayer.resume();
    }

    async goToInteractive(index) {
        return this._interactivePlayer.goTo(index);
    }

    getInteractiveState() {
        return this._interactivePlayer.getState();
    }

    // ============================================
    // Cleanup
    // ============================================

    destroy() {
        this.cancelPendingExecution();
        this.stop();
        this.commandExecutor.clearCommands();
        this.expressionContext = null;
        this.roboCanvas = null;
    }
}
