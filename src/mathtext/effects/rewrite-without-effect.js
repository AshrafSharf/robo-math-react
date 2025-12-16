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
        // No-op - strokes are already in their correct state
    }

    doPlay(playContext) {
        const localHandler = (e) => {
            this.scheduleComplete();
            playContext.onComplete(e);
        };

        this.mathComponent.rewriteWithoutSelectionAnimate(this.selectionUnits, localHandler);
    }
}
