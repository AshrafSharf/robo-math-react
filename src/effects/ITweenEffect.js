/**
 * Interface for tween effects (implemented as a base class in JavaScript)
 */
export class ITweenEffect {
    constructor() {
        this.parent = null;
        this.paused = false;
    }

    play(durationInSeconds) {
        throw new Error('play method must be implemented');
    }

    show() {
        throw new Error('show method must be implemented');
    }

    hide() {
        throw new Error('hide method must be implemented');
    }

    toEndState() {
        throw new Error('toEndState method must be implemented');
    }

    stop() {
        throw new Error('stop method must be implemented');
    }

    add(childTween) {
        throw new Error('add method must be implemented');
    }

    onComplete(completedTween) {
        throw new Error('onComplete method must be implemented');
    }
}