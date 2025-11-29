import { BaseEffect } from './base-effect.js';

/**
 * HideEffect handles hide animation for math components
 */
export class HideEffect extends BaseEffect {
    constructor(mathComponent) {
        super();
        this.mathComponent = mathComponent;
        this.animationType = 'f';
        this.styleObj = {};
    }

    toEndState() {
        this.mathComponent.show(true);
    }

    doPlay(playContext) {
        const localHandler = () => {
            this.scheduleComplete();
            playContext.onComplete();
        };
        
        this.mathComponent.hide(true);
        this.mathComponent.fadeOutAnimate(localHandler, this.animationType, playContext.durationInSeconds);
    }

    show() {
        this.mathComponent.show(true);
    }

    hide() {
        this.mathComponent.hide(true);
    }
}