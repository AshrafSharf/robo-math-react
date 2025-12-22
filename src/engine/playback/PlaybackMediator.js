import { TweenMax } from 'gsap';

/**
 * PlaybackMediator - Single source of truth for all playback state
 *
 * States: 'idle' | 'playing' | 'paused'
 * Sources: 'playAll' | 'playSingle' | 'interactive'
 */
class PlaybackMediator {
    constructor() {
        this.state = 'idle';          // 'idle' | 'playing' | 'paused'
        this.activeSource = null;     // { type: string, commandId?: number }
        this.listeners = new Set();
        this.controller = null;
    }

    setController(controller) {
        this.controller = controller;
    }

    /**
     * Request to start playback
     * @returns {boolean} true if allowed
     */
    requestPlay(source) {
        if (this.state !== 'idle') {
            return false;
        }
        this.state = 'playing';
        this.activeSource = source;
        this._notify();
        return true;
    }

    /**
     * Pause current playback
     */
    pause() {
        if (this.state !== 'playing') return;
        this.state = 'paused';
        TweenMax.pauseAll();
        this._notify();
    }

    /**
     * Resume paused playback
     */
    resume() {
        if (this.state !== 'paused') return;
        this.state = 'playing';
        TweenMax.resumeAll();
        this._notify();
    }

    /**
     * Stop playback and draw final state
     */
    async stop() {
        if (this.state === 'idle') return;

        TweenMax.killAll();

        if (this.controller?.commandExecutor) {
            await this.controller.commandExecutor.drawAll();
        }

        this.state = 'idle';
        this.activeSource = null;
        this._notify();
    }

    /**
     * Notify playback completed naturally
     */
    notifyComplete() {
        this.state = 'idle';
        this.activeSource = null;
        this._notify();
    }

    /**
     * Get current state for UI
     */
    getState() {
        return {
            state: this.state,
            isIdle: this.state === 'idle',
            isPlaying: this.state === 'playing',
            isPaused: this.state === 'paused',
            isActive: this.state !== 'idle',
            isInteractiveActive: this.activeSource?.type === 'interactive',
            activeSource: this.activeSource
        };
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    _notify() {
        const state = this.getState();
        this.listeners.forEach(cb => cb(state));
    }
}

export const playbackMediator = new PlaybackMediator();
