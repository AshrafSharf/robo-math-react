/**
 * VectorSlide3DEffect - Handles animation of 3D vector sliding operations
 *
 * Supports: slide (forward/backward), move, reverse
 * Pen follows the tail (start point) of the vector during animation
 */
import { BaseEffect } from '../base-effect.js';
import {
    animateVectorSlideByOffset,
    animateVectorMove,
    animateVectorReverse
} from '../../3d/common/animator/vector_slide_animator.js';

export class VectorSlide3DEffect extends BaseEffect {
    /**
     * @param {THREE.Object3D} vectorGroup - The Three.js vector group to animate
     * @param {string} operationType - Type of operation: 'slide', 'move', 'reverse'
     * @param {Object} options - Additional options
     * @param {Object} options.vectorStart - Start point {x, y, z} - MODEL coordinates
     * @param {Object} options.vectorEnd - End point {x, y, z} - MODEL coordinates (for reverse)
     * @param {Object} options.offset - Offset to slide by {x, y, z} (for slide)
     * @param {Object} options.fromPosition - Starting position for move operation
     * @param {Object} options.toPosition - Target position for move operation
     * @param {PenTracer} options.pen - Optional pen tracer for pen following
     * @param {THREE.Camera} options.camera - Camera for 3D projection
     * @param {HTMLElement} options.canvas - Renderer canvas element
     */
    constructor(vectorGroup, operationType = 'slide', options = {}) {
        super();
        this.vectorGroup = vectorGroup;
        this.operationType = operationType;
        this.vectorStart = options.vectorStart || null;
        this.vectorEnd = options.vectorEnd || null;
        this.offset = options.offset || null;
        this.fromPosition = options.fromPosition || null;
        this.toPosition = options.toPosition || null;
        this.pen = options.pen || null;
        this.camera = options.camera || null;
        this.canvas = options.canvas || null;
    }

    toEndState() {
        if (this.vectorGroup) {
            this.vectorGroup.visible = true;
        }
    }

    show() {
        if (this.vectorGroup) {
            this.vectorGroup.visible = true;
        }
    }

    hide() {
        if (this.vectorGroup) {
            this.vectorGroup.visible = false;
        }
    }

    doPlay(playContext) {
        try {
            const onComplete = () => {
                this.scheduleComplete();
                playContext.onComplete();
            };

            this.show();

            switch (this.operationType) {
                case 'slide':
                    if (!this.vectorStart || !this.offset) {
                        throw new Error('slide requires vectorStart and offset');
                    }
                    animateVectorSlideByOffset(this.vectorGroup, this.vectorStart, this.offset, {
                        duration: 2,
                        pen: this.pen,
                        camera: this.camera,
                        canvas: this.canvas,
                        onComplete
                    });
                    break;

                case 'move':
                    if (this.fromPosition && this.toPosition) {
                        animateVectorMove(this.vectorGroup, this.fromPosition, this.toPosition, {
                            duration: 2,
                            pen: this.pen,
                            camera: this.camera,
                            canvas: this.canvas,
                            onComplete
                        });
                    } else {
                        onComplete();
                    }
                    break;

                case 'reverse':
                    if (!this.vectorStart || !this.vectorEnd) {
                        throw new Error('reverse requires vectorStart and vectorEnd');
                    }
                    animateVectorReverse(this.vectorGroup, this.vectorStart, this.vectorEnd, {
                        duration: 2,
                        pen: this.pen,
                        camera: this.camera,
                        canvas: this.canvas,
                        onComplete
                    });
                    break;

                default:
                    onComplete();
            }
        } catch (e) {
            console.error('VectorSlide3DEffect.doPlay() error:', e);
            this.scheduleComplete();
            playContext.onComplete(e);
        }
    }
}
