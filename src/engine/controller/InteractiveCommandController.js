/**
 * InteractiveCommandController
 *
 * Extends CommandEditorController for step-by-step command playback.
 * Only adds: index tracking, playNext/playPrevious navigation.
 * All execution logic delegates to parent.
 */
import { CommandEditorController } from './CommandEditorController.js';

export class InteractiveCommandController extends CommandEditorController {
    constructor(roboCanvas, options = {}) {
        super(roboCanvas, options);

        // Interactive state - this is ALL we add
        this.currentCommandIndex = 0;  // Number of commands shown
        this.totalCommands = 0;
        this.isPlaying = false;
        this.stopRequested = false;

        // Callback for UI state updates
        this.onStateChange = null;
    }

    /**
     * Initialize for interactive playback.
     * Sets up commands without drawing, ready for step-by-step.
     * @returns {boolean} True if initialization succeeded
     */
    async initialize() {
        if (!this.roboCanvas) {
            return false;
        }

        // Use parent's prepareCommands - sets up without drawing
        const success = await this.prepareCommands(this.commandModels);
        if (!success) {
            return false;
        }

        // Get command count
        this.totalCommands = this.commandExecutor.getCommandCount();
        this.currentCommandIndex = 0;

        this._notifyStateChange();
        return true;
    }

    /**
     * Play the next command, increment index.
     */
    async playNext() {
        if (!this.canNextPlay()) {
            return;
        }

        this.isExecuting = true;
        this._notifyStateChange();

        // Use parent's playCommand (init + animate)
        await this.playCommand(this.currentCommandIndex);

        this.currentCommandIndex++;
        this.isExecuting = false;
        this._notifyStateChange();
    }

    /**
     * Play the previous command.
     * Clear all, directPlay up to targetIndex, then animate targetIndex.
     */
    async playPrevious() {
        if (!this.canPreviousPlay()) {
            return;
        }

        this.isExecuting = true;
        this._notifyStateChange();

        // Index of command to animate (the "previous" one)
        const targetIndex = this.currentCommandIndex - 1;

        // Re-prepare commands (clears and sets up fresh)
        await this.prepareCommands(this.commandModels);

        // DirectPlay commands 0 to targetIndex-1 (instant)
        if (targetIndex > 0) {
            await this.commandExecutor.drawTo(targetIndex);
        }

        // Animate the target command
        await this.playCommand(targetIndex);

        this.currentCommandIndex = targetIndex + 1;
        this.isExecuting = false;
        this._notifyStateChange();
    }

    /**
     * Start continuous playback from current position.
     */
    async play() {
        if (this.isPlaying) {
            return;
        }

        this.isPlaying = true;
        this.stopRequested = false;
        this._notifyStateChange();

        while (this.canNextPlay() && !this.stopRequested) {
            await this.playNext();
        }

        this.isPlaying = false;
        this._notifyStateChange();
    }

    /**
     * Stop continuous playback.
     */
    stop() {
        this.stopRequested = true;
        this.isPlaying = false;
        super.stop();
        this._notifyStateChange();
    }

    canNextPlay() {
        return this.currentCommandIndex < this.totalCommands;
    }

    canPreviousPlay() {
        return this.currentCommandIndex > 0;
    }

    getCurrentState() {
        return {
            currentIndex: this.currentCommandIndex,
            totalCommands: this.totalCommands,
            isPlaying: this.isPlaying,
            isExecuting: this.isExecuting,
            canNext: this.canNextPlay(),
            canPrevious: this.canPreviousPlay()
        };
    }

    _notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.getCurrentState());
        }
    }

    destroy() {
        this.stop();
        super.destroy();
    }
}
