import { BaseEffect } from './base-effect.js';

/**
 * ShowEffect handles show animation for math components
 */
export class ShowEffect extends BaseEffect {
    constructor(mathComponent) {
        super();
        this.mathComponent = mathComponent;
        this.animationType = 'f';
        this.styleObj = {};
    }

    toEndState() {
        if (this.mathComponent.updateStroke) {
            this.mathComponent.updateStroke(this.styleObj.stroke);
        }
        this.mathComponent.show(true);
    }

    doPlay(playContext) {
        const localHandler = () => {
            this.scheduleComplete();
            playContext.onComplete();
        };
        
        this.mathComponent.show(true);
        
        if (this.mathComponent.updateStroke) {
            this.mathComponent.updateStroke(this.styleObj.stroke);
        }
        
        this.mathComponent.fadeInAnimate(localHandler, this.animationType, playContext.durationInSeconds);
    }

    show() {
        this.mathComponent.show(true);
    }

    hide() {
        this.mathComponent.hide(true);
    }
}