import { WriteOnlyEffect } from './write-only-effect.js';

/**
 * WriteWithoutEffect handles write animation excluding specific parts of math components
 */
export class WriteWithoutEffect extends WriteOnlyEffect {
    constructor(mathComponent, selectionUnits) {
        super(mathComponent, selectionUnits, false);
    }

    toEndState() {
        this.mathComponent.disableStroke();
        const remainingNodes = this.mathComponent.excludeTweenNodes(this.selectionUnits);
        remainingNodes.forEach((tweenableNode) => {
            tweenableNode.enableStroke();
        });
    }

    doPlay(playContext) {
        const localHandler = (e) => {
            this.scheduleComplete();
            playContext.onComplete(e);
        };
        
        // First, disable all strokes to start fresh
        this.mathComponent.disableStroke();
        
        // Write everything except the selections
        this.mathComponent.writeWithoutSelectionAnimate(this.selectionUnits, localHandler);
    }
}