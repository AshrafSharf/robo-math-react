/**
 * PlayContext manages the execution context for effects
 */
export class PlayContext {
    constructor(durationInSeconds, resolve, reject) {
        this.durationInSeconds = durationInSeconds;
        this.resolve = resolve;
        this.reject = reject;
    }

    onComplete(err) {
        if (err) {
            this.reject(err);
        } else {
            this.resolve();
        }
    }
}