import { BaseEffect } from '../base-effect.js';
import { TweenMax, Power2 } from 'gsap/all';

/**
 * ShapeDrawEffect handles draw animation without pen
 * The shape is progressively revealed but pen doesn't move
 */
export class ShapeDrawEffect extends BaseEffect {
    constructor(mathScriptShape) {
        super();
        this.mathScriptShape = mathScriptShape;
    }

    toEndState() {
        this.mathScriptShape.show();
        this.mathScriptShape.enableStroke();
    }

    show() {
        this.mathScriptShape.show();
        this.mathScriptShape.enableStroke();
    }

    hide() {
        this.mathScriptShape.hide();
    }

    doPlay(playContext) {
        try {
            console.log('ShapeDrawEffect playing for:', this.mathScriptShape.getShapeType());
            const localHandler = () => {
                this.scheduleComplete();
                playContext.onComplete();
            };

            // Show the shape first
            this.mathScriptShape.show();
            
            // Use DrawSVG to animate the stroke-dasharray
            if (this.mathScriptShape.primitiveShape && this.mathScriptShape.primitiveShape.node) {
                const path = this.mathScriptShape.primitiveShape.node;
                const length = path.getTotalLength ? path.getTotalLength() : 1000;
                console.log('Path length:', length);
                
                // Set initial state - hide the stroke
                path.style.strokeDasharray = `0 ${length}`;
                path.style.strokeDashoffset = '0';
                
                // Animate to final state - reveal the stroke
                TweenMax.to(path.style, 1, {
                    strokeDasharray: `${length} ${length}`,
                    ease: Power2.easeInOut,
                    onComplete: () => {
                        // Ensure stroke is fully visible at the end
                        this.mathScriptShape.enableStroke();
                        localHandler();
                    }
                });
            } else {
                console.log('No primitiveShape found, falling back');
                // Fallback - just show it
                this.mathScriptShape.enableStroke();
                localHandler();
            }
        } catch (e) {
            this.scheduleComplete();
            playContext.onComplete(e);
        }
    }
}