import { BaseEffect } from '../../effects/base-effect.js';

/**
 * RewriteWithoutEffect - Animates non-selected strokes on existing visible components.
 *
 * Key differences from WriteWithoutEffect:
 * - Does NOT change container visibility (container is already visible)
 * - Uses NonSelectionOrderTypeAnimator which disables only the strokes it will animate
 */
export class RewriteWithoutEffect extends BaseEffect {
    constructor(mathComponent, selectionUnits) {
        super();
        this.mathComponent = mathComponent;
        this.selectionUnits = selectionUnits || [];
    }

    show() {
        // No-op - container is already visible
    }

    hide() {
        // No-op - don't hide the container
    }

    toEndState() {
        // Enable all strokes except the selected ones (for directPlay after hide())
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

        this.mathComponent.rewriteWithoutSelectionAnimate(this.selectionUnits, localHandler);
    }
}
