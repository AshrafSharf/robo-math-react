import { BaseEffect } from '../../effects/base-effect.js';
import $ from '../utils/dom-query.js';

/**
 * WriteEffect handles write animation for math components
 */
export class WriteEffect extends BaseEffect {
    constructor(mathComponent) {
        super();
        this.mathComponent = mathComponent;
    }

    toEndState() {
        this.mathComponent.enableStroke();
    }

    /**
     * Called by BaseEffect.play() before doPlay().
     * Shows the container but keeps strokes hidden so animation can reveal them.
     *
     * Animation lifecycle:
     *   1. BaseEffect.play() calls show() - container visible, strokes hidden
     *   2. doPlay() runs writeAnimate() - strokes progressively enabled by animator
     */
    show() {
        this.mathComponent.showContainer();
    }

    hide() {
        this.mathComponent.hide();
    }

    doPlay(playContext) {
        // Make container visible (opacity, visibility) but keep strokes hidden for animation
        $(this.mathComponent.containerDOM).css({
            'display': 'block',
            'opacity': 1,
            'visibility': 'visible'
        });
        // Strokes remain disabled (stroke-dasharray) for writeAnimate to reveal
        
        // Delegate to the math component's writeAnimate method
        // This handles all the pen movement and path animation properly
        const localHandler = () => {
            // Call both to maintain compatibility
            this.scheduleComplete();
            playContext.onComplete();
        };

        this.mathComponent.writeAnimate(localHandler, playContext.durationInSeconds);
    }
}