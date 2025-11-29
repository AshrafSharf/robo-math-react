import { ITweenEffect } from './ITweenEffect.js';
import { PlayContext } from './play-context.js';

/**
 * SequenceStepEffect executes child effects sequentially
 */
export class SequenceStepEffect extends ITweenEffect {
    constructor() {
        super();
        this.id = '';
        this.parent = null;
        this.innerTweens = [];
        this.completedCount = 0;
        this.directState = false;
        this.paused = false;
        this.playContext = null;
    }

    play(durationInSeconds = 1) {
        return new Promise((resolve, reject) => {
            this.playContext = new PlayContext(durationInSeconds, resolve, reject);
            this.doPlay(this.playContext);
        });
    }

    doPlay(playContext) {
        if (this.innerTweens[this.completedCount]) {
            this.innerTweens[this.completedCount].play(playContext.durationInSeconds);
        }
    }

    stop() {
        if (this.innerTweens[this.completedCount]) {
            this.innerTweens[this.completedCount].stop();
        }
    }

    add(childTween) {
        childTween.parent = this;
        childTween.hide();
        this.innerTweens.push(childTween);
    }

    addAll(children) {
        children.forEach((childTween) => {
            childTween.parent = this;
            childTween.hide();
            this.innerTweens.push(childTween);
        });
    }

    onComplete() {
        this.completedCount++;
        if (this.completedCount < this.innerTweens.length) {
            this.doPlay(this.playContext);
        }
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