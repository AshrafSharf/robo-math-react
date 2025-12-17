/**
 * ReflectEffect - Animates reflection of a shape across a line using GSAP
 *
 * Animates in model coordinate space to correctly handle non-uniform X/Y scales.
 * 1. Clone the original shape visually
 * 2. Animate by interpolating model coordinates from original to reflected
 * 3. When done, show the real reflected shape and remove the clone
 */
import { BaseEffect } from './base-effect.js';
import { TweenMax } from 'gsap';
import {
    cloneElement,
    getCloneableElement,
    getPathElement,
    updatePath,
    removeElement
} from '../utils/svg-utils.js';

export class ReflectEffect extends BaseEffect {
    /**
     * @param {Object} originalShape - The original shape (stays visible)
     * @param {Object} reflectedShape - The reflected shape to show at end
     * @param {Object} reflectedCoords - The final reflected model coordinates
     * @param {Object} options - Animation options {duration}
     */
    constructor(originalShape, reflectedShape, reflectedCoords, options = {}) {
        super();
        this.originalShape = originalShape;
        this.reflectedShape = reflectedShape;
        this.reflectedCoords = reflectedCoords;
        this.duration = options.duration || 0.8; // Seconds for GSAP
        this.clone = null;
        this.tween = null;
    }

    show() {
        // Don't show anything here - handled in doPlay
    }

    hide() {
        this.reflectedShape.hide();
        if (this.clone) {
            removeElement(this.clone);
            this.clone = null;
        }
    }

    toEndState() {
        if (this.clone) {
            removeElement(this.clone);
            this.clone = null;
        }
        this.reflectedShape.renderEndState();
        this.reflectedShape.show();
    }

    toStartState() {
        this.hide();
    }

    /**
     * Animate the reflection using GSAP with model-space interpolation
     */
    doPlay(playContext) {
        const originalElement = getCloneableElement(this.originalShape);

        if (!originalElement) {
            console.error('ReflectEffect: No element to clone from original shape');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        const originalCoords = this.originalShape.modelCoordinates;
        const graphsheet2d = this.originalShape.graphsheet2d;

        if (!originalCoords || !graphsheet2d) {
            console.error('ReflectEffect: Missing modelCoordinates or graphsheet2d on original shape');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        this.clone = cloneElement(originalElement);
        const clonePath = getPathElement(this.clone);

        if (!clonePath) {
            console.error('ReflectEffect: Could not find path element in clone');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        const self = this;
        const animData = { progress: 0 };

        // Use shape's own generatePathForCoordinates
        const shape = this.originalShape;
        const targetCoords = this.reflectedCoords;

        this.tween = TweenMax.to(animData, this.duration, {
            progress: 1,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                // Interpolate between original and reflected coordinates
                const interpolatedCoords = [];
                const t = animData.progress;

                for (let i = 0; i < originalCoords.length; i++) {
                    const original = originalCoords[i];
                    const target = targetCoords[i];
                    interpolatedCoords.push(original + t * (target - original));
                }

                // Let shape generate path for these coordinates
                const pathStr = shape.generatePathForCoordinates(interpolatedCoords);
                updatePath(clonePath, pathStr);
            },
            onComplete: () => {
                removeElement(self.clone);
                self.clone = null;
                self.tween = null;
                self.reflectedShape.renderEndState();
                self.reflectedShape.show();
                playContext.onComplete();
            }
        });
    }

    stop() {
        super.stop();
        if (this.tween) {
            this.tween.kill();
            this.tween = null;
        }
        if (this.clone) {
            removeElement(this.clone);
            this.clone = null;
        }
    }

    remove() {
        if (this.clone) {
            removeElement(this.clone);
            this.clone = null;
        }
        this.reflectedShape.remove();
    }
}
