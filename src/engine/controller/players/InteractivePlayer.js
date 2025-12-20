/**
 * InteractivePlayer
 *
 * Handles step-by-step command playback with navigation controls.
 * Internal strategy used by CommandController - not exposed directly.
 */
import { TweenMax } from 'gsap';

export class InteractivePlayer {
    constructor(controller) {
        this.controller = controller;
        this.currentCommandIndex = 0;
        this.playState = 'idle';         // 'idle' | 'playing' - session state
        this.animatingState = 'none';    // 'none' | 'active' | 'paused'
        this.onStateChange = null;
    }

    get commandExecutor() {
        return this.controller.commandExecutor;
    }

    get totalCommands() {
        return this.commandExecutor.getCommandCount();
    }

    /**
     * Check if a command at given index can be animated
     */
    _canPlayAt(index) {
        const command = this.commandExecutor.commands[index];
        if (!command) return false;
        const expressionId = command.getExpressionId();
        const canPlayInfo = this.controller.canPlayInfos.find(info => info.id === expressionId);
        return canPlayInfo?.canPlay ?? true;
    }

    /**
     * Find next playable command starting from given index
     * @returns index of playable command, or -1 if none found
     */
    _findNextPlayable(fromIndex) {
        for (let i = fromIndex; i < this.totalCommands; i++) {
            if (this._canPlayAt(i)) return i;
        }
        return -1;
    }

    /**
     * Find previous playable command before given index
     * @returns index of playable command, or -1 if none found
     */
    _findPreviousPlayable(beforeIndex) {
        for (let i = beforeIndex - 1; i >= 0; i--) {
            if (this._canPlayAt(i)) return i;
        }
        return -1;
    }

    /**
     * Count total playable commands
     */
    _getPlayableCount() {
        let count = 0;
        for (let i = 0; i < this.totalCommands; i++) {
            if (this._canPlayAt(i)) count++;
        }
        return count;
    }

    /**
     * Get current playable index (how many playable commands completed)
     */
    _getPlayableIndex() {
        let count = 0;
        for (let i = 0; i < this.currentCommandIndex; i++) {
            if (this._canPlayAt(i)) count++;
        }
        return count;
    }

    async start() {
        const success = await this.controller.prepareCommands(this.controller.commandModels);
        if (success) {
            this.currentCommandIndex = 0;
            this.playState = 'idle';
            this.animatingState = 'none';
            this._notifyStateChange();
        }
        return success;
    }

    stop() {
        TweenMax.killAll();
        this.playState = 'idle';
        this.animatingState = 'none';
        this.commandExecutor.stop();
        this._notifyStateChange();
    }

    /**
     * Stop animation, kill all tweens, and instantly draw up to the last command.
     */
    async stopAndDraw() {
        TweenMax.killAll();
        this.playState = 'idle';
        this.animatingState = 'none';

        await this.controller.prepareCommands(this.controller.commandModels);

        if (this.currentCommandIndex > 0) {
            await this.commandExecutor.drawTo(this.currentCommandIndex);
        }

        this._notifyStateChange();
    }

    pause() {
        if (this.animatingState === 'active') {
            this.animatingState = 'paused';
            this.controller.pause();
            this._notifyStateChange();
        }
    }

    resume() {
        if (this.animatingState === 'paused') {
            this.animatingState = 'active';
            this.controller.resume();
            this._notifyStateChange();
        }
    }

    async playNext() {
        if (!this.canNext()) return;

        // If currently animating, kill tweens and skip to next playable
        if (this.animatingState === 'active' || this.animatingState === 'paused') {
            TweenMax.killAll();
            this.animatingState = 'none';

            // currentCommandIndex is the one animating, find next after it
            const nextPlayableIndex = this._findNextPlayable(this.currentCommandIndex + 1);
            if (nextPlayableIndex !== -1) {
                await this.resetUpTo(nextPlayableIndex);
                this.currentCommandIndex = nextPlayableIndex + 1;
                this._notifyStateChange();
            } else {
                // No more playable, just finish current
                await this.resetUpTo(this.currentCommandIndex);
                this.currentCommandIndex++;
                this.playState = 'idle';
                this._notifyStateChange();
            }
            return;
        }

        // Enter playing state
        this.playState = 'playing';

        // DirectPlay non-playable commands, animate next playable
        while (this.canNext()) {
            if (this._canPlayAt(this.currentCommandIndex)) {
                this.animatingState = 'active';
                this._notifyStateChange();

                await this.controller.playCommand(this.currentCommandIndex);

                this.animatingState = 'none';
                this.currentCommandIndex++;
                this._notifyStateChange();
                return;
            } else {
                const command = this.commandExecutor.commands[this.currentCommandIndex];
                await this.commandExecutor.initCommand(command);
                command.directPlay();
                this.currentCommandIndex++;
            }
        }

        // No more commands to play
        this.playState = 'idle';
        this._notifyStateChange();
    }

    /**
     * Reset and replay up to a specific index.
     * Clears canvas, re-prepares commands, directPlays up to index, then animates index.
     * @param {number} index - The command index to animate
     */
    async resetUpTo(index) {
        if (index < 0 || index >= this.totalCommands) return;

        // Clear and re-prepare
        await this.controller.prepareCommands(this.controller.commandModels);

        // DirectPlay commands 0 to index-1 (instant, no animation)
        if (index > 0) {
            await this.commandExecutor.drawTo(index);
        }

        // Animate the command at index
        this.playState = 'playing';
        this.animatingState = 'active';
        this._notifyStateChange();

        await this.controller.playCommand(index);

        this.animatingState = 'none';
        this.currentCommandIndex = index;
        this._notifyStateChange();
    }

    async playPrevious() {
        if (!this.canPrevious()) return;

        // If currently animating, kill tweens first
        if (this.animatingState !== 'none') {
            TweenMax.killAll();
            this.animatingState = 'none';
        }

        const targetIndex = this._findPreviousPlayable(this.currentCommandIndex);

        if (targetIndex === -1) {
            // No playable command found, go to start
            await this.controller.prepareCommands(this.controller.commandModels);
            this.currentCommandIndex = 0;
            this.playState = 'idle';
            this._notifyStateChange();
            return;
        }

        await this.resetUpTo(targetIndex);
    }

    async goTo(index) {
        if (index < 0 || index >= this.totalCommands) return;

        if (this._canPlayAt(index)) {
            await this.resetUpTo(index);
            this.currentCommandIndex = index + 1;
            this._notifyStateChange();
        } else {
            // Non-playable - directPlay up to and including index
            await this.controller.prepareCommands(this.controller.commandModels);
            await this.commandExecutor.drawTo(index + 1);
            this.currentCommandIndex = index + 1;
            this._notifyStateChange();
        }
    }

    canNext() {
        return this._findNextPlayable(this.currentCommandIndex) !== -1;
    }

    canPrevious() {
        return this._findPreviousPlayable(this.currentCommandIndex) !== -1;
    }

    getState() {
        return {
            currentIndex: this._getPlayableIndex(),
            totalCommands: this._getPlayableCount(),
            playState: this.playState,           // 'idle' | 'playing'
            animatingState: this.animatingState, // 'none' | 'active' | 'paused'
            canNext: this.canNext(),
            canPrevious: this.canPrevious()
        };
    }

    _notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.getState());
        }
    }
}
