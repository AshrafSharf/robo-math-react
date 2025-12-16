import { BaseEffect } from '../../effects/base-effect.js';

/**
 * RewriteOnlyEffect - Animates only selected strokes on existing visible components.
 *
 * Key differences from WriteOnlyEffect:
 * - Does NOT change container visibility (container is already visible)
 * - Uses CustomOrderTypeAnimator which disables only the strokes it will animate
 */
export class RewriteOnlyEffect extends BaseEffect {
    constructor(mathComponent, selectionUnits, includeAll = false) {
        super();
        this.mathComponent = mathComponent;
        this.selectionUnits = selectionUnits || [];
        this.includeAll = includeAll;
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

        this.mathComponent.rewriteSelectionOnlyAnimate(this.selectionUnits, this.includeAll, localHandler);
    }
}
