/**
 * RotateEffect - Animates rotation of a shape using GSAP
 *
 * Animates in model coordinate space to correctly handle non-uniform X/Y scales.
 * 1. Clone the original shape visually
 * 2. Animate by rotating model coordinates and regenerating the SVG path
 * 3. When done, show the real rotated shape and remove the clone
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

export class RotateEffect extends BaseEffect {
    /**
     * @param {Object} originalShape - The original shape (stays visible)
     * @param {Object} rotatedShape - The rotated shape to show at end
     * @param {number} angle - Rotation angle in degrees (positive = CCW in math coords)
     * @param {Object} center - Rotation center in MODEL coordinates {x, y}
     * @param {Object} options - Animation options {duration}
     */
    constructor(originalShape, rotatedShape, angle, center, options = {}) {
        super();
        this.originalShape = originalShape;
        this.rotatedShape = rotatedShape;
        this.angle = angle;
        this.center = center; // Model coordinates
        this.duration = options.duration || 0.8; // Seconds for GSAP
        this.clone = null;
        this.tween = null;
    }

    show() {
        // Don't show anything here - handled in doPlay
    }

    hide() {
        this.rotatedShape.hide();
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
        this.rotatedShape.renderEndState();
        this.rotatedShape.show();
    }

    toStartState() {
        this.hide();
    }

    /**
     * Animate the rotation using GSAP with model-space interpolation
     */
    doPlay(playContext) {
        const originalElement = getCloneableElement(this.originalShape);

        if (!originalElement) {
            console.error('RotateEffect: No element to clone from original shape');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        const originalCoords = this.originalShape.modelCoordinates;
        const graphsheet2d = this.originalShape.graphsheet2d;

        if (!originalCoords || !graphsheet2d) {
            console.error('RotateEffect: Missing modelCoordinates or graphsheet2d on original shape');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        this.clone = cloneElement(originalElement);
        const clonePath = getPathElement(this.clone);

        if (!clonePath) {
            console.error('RotateEffect: Could not find path element in clone');
            this.toEndState();
            playContext.onComplete();
            return;
        }

        const self = this;
        const targetAngle = this.angle;
        const center = this.center;
        const animData = { angle: 0 };

        this.tween = TweenMax.to(animData, this.duration, {
            angle: targetAngle,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                const rotatedCoords = [];
                const angleRad = (animData.angle * Math.PI) / 180;
                const cos = Math.cos(angleRad);
                const sin = Math.sin(angleRad);

                for (let i = 0; i < originalCoords.length; i += 2) {
                    const x = originalCoords[i];
                    const y = originalCoords[i + 1];
                    const dx = x - center.x;
                    const dy = y - center.y;
                    const rotatedX = dx * cos - dy * sin + center.x;
                    const rotatedY = dx * sin + dy * cos + center.y;
                    rotatedCoords.push(rotatedX, rotatedY);
                }

                const viewCoords = [];
                for (let i = 0; i < rotatedCoords.length; i += 2) {
                    viewCoords.push(graphsheet2d.toViewX(rotatedCoords[i]));
                    viewCoords.push(graphsheet2d.toViewY(rotatedCoords[i + 1]));
                }

                updatePath(clonePath, generateLinePath(viewCoords));
            },
            onComplete: () => {
                removeElement(self.clone);
                self.clone = null;
                self.tween = null;
                self.rotatedShape.renderEndState();
                self.rotatedShape.show();
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
        this.rotatedShape.remove();
    }
}
