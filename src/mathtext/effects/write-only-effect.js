import { BaseEffect } from '../../effects/base-effect.js';

/**
 * WriteOnlyEffect handles selective write animation for specific parts of math components
 */
export class WriteOnlyEffect extends BaseEffect {
    constructor(mathComponent, selectionUnits, includeAll) {
        super();
        this.mathComponent = mathComponent;
        this.selectionUnits = selectionUnits || [];
        this.includeAll = includeAll || false;
    }

    toEndState() {
        const nodesToPlay = this.mathComponent.includeTweenNodes(this.selectionUnits);
        this.mathComponent.updateSelectionStroke(this.selectionUnits);
        this.excludeOthers(this.mathComponent);
        nodesToPlay.forEach((tweenableNode) => {
            tweenableNode.enableStroke();
        });
    }

    excludeOthers(mathComponent) {
        mathComponent.disableStroke();
    }

    /**
     * Called by BaseEffect.play() before doPlay().
     * Shows the container but keeps strokes hidden so animation can reveal them.
     *
     * Animation lifecycle:
     *   1. BaseEffect.play() calls show() - container visible, strokes hidden
     *   2. doPlay() runs writeSelectionOnlyAnimate() - selected strokes enabled by animator
     */
    show() {
        this.mathComponent.showContainer();
    }

    hide() {
        this.mathComponent.hide(true);
    }

    doPlay(playContext) {
        const localHandler = (e) => {
            this.scheduleComplete();
            playContext.onComplete(e);
        };

        // Only play (render) the selections - others stay hidden from init
        this.mathComponent.writeSelectionOnlyAnimate(this.selectionUnits, this.includeAll, localHandler);
    }
}