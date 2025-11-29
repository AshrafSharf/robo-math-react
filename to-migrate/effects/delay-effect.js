import { BaseEffect } from './base-effect.js';

/**
 * DelayEffect creates a delay in the animation sequence
 */
export class DelayEffect extends BaseEffect {
    constructor(delayInSecs) {
        super();
        this.delayInSecs = delayInSecs;
    }

    toEndState() {
        // Nothing to do for delay effect end state
    }

    doPlay(playContext) {
        const localHandler = (err) => {
            this.scheduleComplete();
            playContext.onComplete(err);
        };
        
        try {
            setTimeout(() => {
                localHandler();
            }, this.delayInSecs * 1000);
        } catch (e) {
            localHandler(e);
        }
    }

    show() {
        // Nothing to show for delay effect
    }

    hide() {
        // Nothing to hide for delay effect
    }
}