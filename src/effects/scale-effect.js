/**
 * ScaleEffect - Animates scaling of a shape using GSAP
 *
 * Animates in model coordinate space to correctly handle non-uniform X/Y scales.
 * 1. Clone the original shape visually
 * 2. Animate by scaling model coordinates around center and regenerating the SVG path
 * 3. When done, show the real scaled shape and remove the clone
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

export class ScaleEffect extends BaseEffect {
    /**
     * @param {Object} originalShape - The original shape (stays visible)
     * @param {Object} scaledShape - The scaled shape to show at end
     * @param {number} scaleFactor - Scale factor
     * @param {Object} center - Scale center {x, y} (model coordinates)
     * @param {Object} options - Animation options {duration}
     */
    constructor(originalShape, scaledShape, scaleFactor, center, options = {}) {
        super();
        this.originalShape = originalShape;
        this.scaledShape = scaledShape;
        this.scaleFactor = scaleFactor;
        this.center = center;
        this.duration = options.duration || 0.8; // Seconds for GSAP
        this.clone = null;
        this.tween = null;
    }

    show() {
        // Don't show anything here - handled in doPlay
    }

    hide() {
        this.scaledShape.hide();
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
        this.scaledShape.renderEndState();
        this.scaledShape.show();
    }

    toStartState() {
        this.hide();
    }

    /**
     * Animate the scaling using GSAP with model-space interpolation
     */
    doPlay(playContext) {
        const originalElement = getCloneableElement(this.originalShape);

        if (!originalElement) {
            console.error('ScaleEffect: No element to clone from original shape');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        const originalCoords = this.originalShape.modelCoordinates;
        const graphsheet2d = this.originalShape.graphsheet2d;

        if (!originalCoords || !graphsheet2d) {
            console.error('ScaleEffect: Missing modelCoordinates or graphsheet2d on original shape');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        this.clone = cloneElement(originalElement);
        // Ensure clone is visible for animation (original may be hidden)
        this.clone.show();
        const clonePath = getPathElement(this.clone);

        if (!clonePath) {
            console.error('ScaleEffect: Could not find path element in clone');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        const self = this;
        const targetScaleFactor = this.scaleFactor;
        const centerX = this.center.x;
        const centerY = this.center.y;
        const animData = { progress: 0 };

        // Use shape's own generatePathForCoordinates if available
        const shape = this.originalShape;

        this.tween = TweenMax.to(animData, this.duration, {
            progress: 1,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                // Interpolate scale factor from 1 to target
                const currentScaleFactor = 1 + animData.progress * (targetScaleFactor - 1);

                // Scale model coordinates around center
                const scaledCoords = [];

                // Scale x,y pairs (skip non-coordinate values like radius for circles)
                const coordPairs = shape.getCoordinatePairCount ? shape.getCoordinatePairCount() : Math.floor(originalCoords.length / 2);
                for (let i = 0; i < coordPairs; i++) {
                    const x = originalCoords[i * 2];
                    const y = originalCoords[i * 2 + 1];
                    // Scale around center: newX = centerX + (x - centerX) * scale
                    scaledCoords.push(centerX + (x - centerX) * currentScaleFactor);
                    scaledCoords.push(centerY + (y - centerY) * currentScaleFactor);
                }

                // Handle remaining non-coordinate values (e.g., radius for circles)
                for (let i = coordPairs * 2; i < originalCoords.length; i++) {
                    // Scale radius values (like for circles)
                    scaledCoords.push(originalCoords[i] * Math.abs(currentScaleFactor));
                }

                // Let shape generate path for these coordinates
                const pathStr = shape.generatePathForCoordinates(scaledCoords);
                updatePath(clonePath, pathStr);
            },
            onComplete: () => {
                removeElement(self.clone);
                self.clone = null;
                self.tween = null;
                self.scaledShape.renderEndState();
                self.scaledShape.show();
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
        this.scaledShape.remove();
    }
}
