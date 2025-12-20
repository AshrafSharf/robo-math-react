/**
 * AutoPlayer
 *
 * Handles automated continuous playback of commands.
 * Internal strategy used by CommandController - not exposed directly.
 */
export class AutoPlayer {
    constructor(controller) {
        this.controller = controller;
        this.onStateChange = null;
    }

    get commandExecutor() {
        return this.controller.commandExecutor;
    }

    async start() {
        await this.controller.prepareCommands(this.controller.commandModels);
        this._notifyStateChange();
    }

    stop() {
        this.commandExecutor.stop();
        this._notifyStateChange();
    }

    async playAll() {
        await this.start();
        await this.commandExecutor.playAll();
        this._notifyStateChange();
    }

    async playUpTo(index) {
        await this.start();
        await this.commandExecutor.playUpTo(index);
        this._notifyStateChange();
    }

    async playSingle(index) {
        await this.commandExecutor.playSingle(index);
    }

    pause() {
        this.controller.pause();
    }

    resume() {
        this.controller.resume();
    }

    getState() {
        return {
            isPlaying: this.commandExecutor.isPlaying,
            isPaused: this.commandExecutor.isPaused
        };
    }

    _notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.getState());
        }
    }
}
