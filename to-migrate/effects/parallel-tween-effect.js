import { ITweenEffect } from './ITweenEffect.js';
import { PlayContext } from './play-context.js';

/**
 * ParallelTweenEffect executes child effects in parallel
 */
export class ParallelTweenEffect extends ITweenEffect {
    constructor() {
        super();
        this.id = '';
        this.parent = null;
        this.innerTweens = [];
        this.completedCount = 0;
        this.paused = false;
    }

    play(durationInSeconds = 1) {
        return new Promise((resolve, reject) => {
            const playContext = new PlayContext(durationInSeconds, resolve, reject);
            this.doPlay(playContext);
        });
    }

    doPlay(playContext) {
        const effects = this.innerTweens.map((itweenEffect) => {
            return itweenEffect.play(playContext.durationInSeconds);
        });
        
        Promise.all(effects)
            .then(() => {
                playContext.onComplete();
            })
            .catch((err) => {
                playContext.onComplete(err);
            });
    }

    stop() {
        this.innerTweens.forEach((itweenEffect) => itweenEffect.stop());
    }

    add(childTween) {
        childTween.parent = this;
        this.innerTweens.push(childTween);
    }

    onComplete() {
        this.completedCount++;
        if (this.completedCount === this.innerTweens.length) {
            if (this.parent) {
                this.parent.onComplete(this.parent);
            }
        }
    }

    toEndState() {
        this.innerTweens.forEach((itweenEffect) => itweenEffect.toEndState());
    }

    show() {
        // Implementation for show
    }

    hide() {
        // Implementation for hide
    }
}