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
    removeElement,
    generateLinePath
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
        const clonePath = getPathElement(this.clone);

        if (!clonePath) {
            console.error('TranslateEffect: Could not find path element in clone');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        console.log('TranslateEffect: Starting GSAP animation', {
            dx: this.dx,
            dy: this.dy,
            duration: this.duration
        });

        const self = this;
        const targetDx = this.dx;
        const targetDy = this.dy;
        const animData = { progress: 0 };

        this.tween = TweenMax.to(animData, this.duration, {
            progress: 1,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                // Translate each point in model space
                const translatedCoords = [];
                const currentDx = animData.progress * targetDx;
                const currentDy = animData.progress * targetDy;

                for (let i = 0; i < originalCoords.length; i += 2) {
                    const x = originalCoords[i] + currentDx;
                    const y = originalCoords[i + 1] + currentDy;
                    translatedCoords.push(x, y);
                }

                // Convert to view coordinates and regenerate path
                const viewCoords = [];
                for (let i = 0; i < translatedCoords.length; i += 2) {
                    viewCoords.push(graphsheet2d.toViewX(translatedCoords[i]));
                    viewCoords.push(graphsheet2d.toViewY(translatedCoords[i + 1]));
                }

                updatePath(clonePath, generateLinePath(viewCoords));
            },
            onComplete: () => {
                console.log('TranslateEffect: GSAP animation complete');
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
