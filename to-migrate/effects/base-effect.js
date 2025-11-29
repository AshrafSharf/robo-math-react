import { ITweenEffect } from './ITweenEffect.js';
import { PlayContext } from './play-context.js';

/**
 * Base class for all effects
 */
export class BaseEffect extends ITweenEffect {
    constructor() {
        super();
        this.parent = null;
        this.paused = false;
    }

    reset() {
        // Override in subclasses if needed
    }

    stop() {
        // Override in subclasses if needed
    }

    add(childTween) {
        throw new Error('Command Tween doesn\'t have children');
    }

    onComplete() {
        if (this.parent) {
            this.parent.onComplete(this);
        }
    }

    toEndState() {
        throw new Error('Not implemented');
    }

    /**
     * Schedule completion with a timeout
     * Should not call onComplete immediately as this will affect the state management in sequence controller
     */
    scheduleComplete(timeoutValue = 300) {
        setTimeout(() => {
            this.onComplete();
        }, timeoutValue);
    }

    show() {
        throw new Error('BaseEffect does not have an implementation of show.');
    }

    hide() {
        throw new Error('BaseEffect does not have an implementation of "hide"');
    }

    play(options = {}) {
        // Support both number (duration) and object with onComplete
        let durationInSeconds = 1;
        let onComplete = () => {};
        
        if (typeof options === 'number') {
            durationInSeconds = options;
        } else if (typeof options === 'object') {
            durationInSeconds = options.durationInSeconds || 1;
            onComplete = options.onComplete || (() => {});
        }
        
        this.show();
        const playContext = new PlayContext(durationInSeconds, onComplete, () => {});
        this.doPlay(playContext);
    }

    doPlay(playContext) {
        throw new Error('BaseEffect does not have an implementation of "doPlay"');
    }
}