import { WriteOnlyEffect } from './write-only-effect.js';

/**
 * ShowOnlyEffect handles selective show animation for specific parts of math components
 */
export class ShowOnlyEffect extends WriteOnlyEffect {
    constructor(mathComponent, selectionUnits, includeAll = false) {
        super(mathComponent, selectionUnits, includeAll);
    }

    doPlay(playContext) {
        const localHandler = () => {
            this.scheduleComplete();
            playContext.onComplete();
        };
        
        this.excludeOthers(this.mathComponent);
        // Only play (render) the selections
        this.mathComponent.updateSelectionStroke(this.selectionUnits);
        this.mathComponent.fadeInSelectionOnlyAnimate(this.selectionUnits, this.includeAll, localHandler);
    }
}