/**
 * ProjectEffect - Animates projection of a point onto a line using GSAP
 *
 * Animates in model coordinate space to correctly handle non-uniform X/Y scales.
 * 1. Clone the original point visually
 * 2. Animate point moving along perpendicular to projected position
 * 3. When done, show the real projected point and remove the clone
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

export class ProjectEffect extends BaseEffect {
    /**
     * @param {Object} originalPoint - The original point shape (stays visible)
     * @param {Object} projectedPoint - The projected point shape to show at end
     * @param {Object} projectedCoords - The final projected model coordinates [x, y]
     * @param {Object} options - Animation options {duration}
     */
    constructor(originalPoint, projectedPoint, projectedCoords, options = {}) {
        super();
        this.originalPoint = originalPoint;
        this.projectedPoint = projectedPoint;
        this.projectedCoords = projectedCoords;
        this.duration = options.duration || 0.8; // Seconds for GSAP
        this.clone = null;
        this.tween = null;
    }

    show() {
        // Don't show anything here - handled in doPlay
    }

    hide() {
        this.projectedPoint.hide();
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
        this.projectedPoint.renderEndState();
        this.projectedPoint.show();
    }

    toStartState() {
        this.hide();
    }

    /**
     * Animate the projection using GSAP with model-space interpolation
     */
    doPlay(playContext) {
        const originalElement = getCloneableElement(this.originalPoint);

        if (!originalElement) {
            console.error('ProjectEffect: No element to clone from original point');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        const originalCoords = this.originalPoint.modelCoordinates;
        const graphsheet2d = this.originalPoint.graphsheet2d;

        if (!originalCoords || !graphsheet2d) {
            console.error('ProjectEffect: Missing modelCoordinates or graphsheet2d on original point');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        this.clone = cloneElement(originalElement);
        // Ensure clone is visible for animation (original may be hidden)
        this.clone.show();
        const clonePath = getPathElement(this.clone);

        if (!clonePath) {
            console.error('ProjectEffect: Could not find path element in clone');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        const self = this;
        const animData = { progress: 0 };

        // Use shape's own generatePathForCoordinates
        const shape = this.originalPoint;
        const targetCoords = this.projectedCoords;

        this.tween = TweenMax.to(animData, this.duration, {
            progress: 1,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                // Interpolate between original and projected coordinates
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
                self.projectedPoint.renderEndState();
                self.projectedPoint.show();
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
        this.projectedPoint.remove();
    }
}
