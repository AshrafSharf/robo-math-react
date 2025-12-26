/**
 * TranslateEffect - Animates translation of a shape using GSAP
 *
 * Animates in model coordinate space to correctly handle non-uniform X/Y scales.
 * 1. Clone the original shape visually
 * 2. Animate by translating model coordinates and regenerating the SVG path
 * 3. When done, show the real translated shape and remove the clone
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

export class TranslateEffect extends BaseEffect {
    /**
     * @param {Object} originalShape - The original shape (stays visible)
     * @param {Object} translatedShape - The translated shape to show at end
     * @param {number} dx - Translation in x direction (model coordinates)
     * @param {number} dy - Translation in y direction (model coordinates)
     * @param {Object} options - Animation options {duration}
     */
    constructor(originalShape, translatedShape, dx, dy, options = {}) {
        super();
        this.originalShape = originalShape;
        this.translatedShape = translatedShape;
        this.dx = dx;
        this.dy = dy;
        this.duration = options.duration || 0.8; // Seconds for GSAP
        this.clone = null;
        this.tween = null;
    }

    show() {
        // Don't show anything here - handled in doPlay
    }

    hide() {
        this.translatedShape.hide();
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
        this.translatedShape.renderEndState();
        this.translatedShape.show();
    }

    toStartState() {
        this.hide();
    }

    /**
     * Animate the translation using GSAP with model-space interpolation
     */
    doPlay(playContext) {
        const originalElement = getCloneableElement(this.originalShape);

        if (!originalElement) {
            console.error('TranslateEffect: No element to clone from original shape');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        const originalCoords = this.originalShape.modelCoordinates;
        const graphsheet2d = this.originalShape.graphsheet2d;

        if (!originalCoords || !graphsheet2d) {
            console.error('TranslateEffect: Missing modelCoordinates or graphsheet2d on original shape');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        this.clone = cloneElement(originalElement);
        // Ensure clone is visible for animation (original may be hidden)
        this.clone.show();
        const clonePath = getPathElement(this.clone);

        if (!clonePath) {
            console.error('TranslateEffect: Could not find path element in clone');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        const self = this;
        const targetDx = this.dx;
        const targetDy = this.dy;
        const animData = { progress: 0 };

        // Use shape's own generatePathForCoordinates if available
        const shape = this.originalShape;

        this.tween = TweenMax.to(animData, this.duration, {
            progress: 1,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                // Translate model coordinates
                const translatedCoords = [];
                const currentDx = animData.progress * targetDx;
                const currentDy = animData.progress * targetDy;

                // Translate x,y pairs (skip non-coordinate values like radius for circles)
                const coordPairs = shape.getCoordinatePairCount ? shape.getCoordinatePairCount() : Math.floor(originalCoords.length / 2);
                for (let i = 0; i < coordPairs; i++) {
                    translatedCoords.push(originalCoords[i * 2] + currentDx);
                    translatedCoords.push(originalCoords[i * 2 + 1] + currentDy);
                }
                // Copy remaining non-coordinate values (e.g., radius for circles)
                for (let i = coordPairs * 2; i < originalCoords.length; i++) {
                    translatedCoords.push(originalCoords[i]);
                }

                // Let shape generate path for these coordinates
                const pathStr = shape.generatePathForCoordinates(translatedCoords);
                updatePath(clonePath, pathStr);
            },
            onComplete: () => {
                removeElement(self.clone);
                self.clone = null;
                self.tween = null;
                self.translatedShape.renderEndState();
                self.translatedShape.show();
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
        this.translatedShape.remove();
    }
}
