/**
 * Math3DShapeEffect - Handles animation of 3D shapes (points, lines, etc.)
 *
 * Uses common animator classes, similar to how MathShapeEffect works for 2D.
 */
import { BaseEffect } from '../base-effect.js';
import { animatePointScale, fadeInPoint } from '../../3d/common/animator/point_animator.js';
import { animateLine } from '../../3d/common/animator/line_animator.js';
import { animateVector } from '../../3d/common/animator/vector_animator.js';
import { animatePolygon } from '../../3d/common/animator/polygon_animator.js';
import { fadeInSolid } from '../../3d/common/animator/solid_animator.js';

export class Math3DShapeEffect extends BaseEffect {
    /**
     * @param {THREE.Object3D} object3d - The Three.js object to animate
     * @param {string} shapeType - Type of shape: 'point', 'line', 'vector', etc.
     * @param {Object} options - Additional options
     * @param {PenTracer} options.pen - Optional pen tracer for pen following
     * @param {THREE.Camera} options.camera - Camera for 3D projection
     * @param {HTMLElement} options.canvas - Renderer canvas element
     */
    constructor(object3d, shapeType = 'generic', options = {}) {
        super();
        this.object3d = object3d;
        this.shapeType = shapeType;
        this.pen = options.pen || null;
        this.camera = options.camera || null;
        this.canvas = options.canvas || null;
    }

    toEndState() {
        if (this.object3d) {
            this.object3d.visible = true;
        }
    }

    show() {
        if (this.object3d) {
            this.object3d.visible = true;
        }
    }

    hide() {
        if (this.object3d) {
            this.object3d.visible = false;
        }
    }

    doPlay(playContext) {
        try {
            const onComplete = () => {
                this.scheduleComplete();
                playContext.onComplete();
            };

            this.show();

            switch (this.shapeType) {
                case 'point':
                    fadeInPoint(this.object3d, {
                        duration: 2,
                        pen: this.pen,
                        camera: this.camera,
                        canvas: this.canvas,
                        onComplete
                    });
                    break;

                case 'line':
                    animateLine(this.object3d, {
                        duration: 2,
                        pen: this.pen,
                        camera: this.camera,
                        canvas: this.canvas,
                        onComplete
                    });
                    break;

                case 'vector':
                    animateVector(this.object3d, {
                        duration: 2,
                        pen: this.pen,
                        camera: this.camera,
                        canvas: this.canvas,
                        onComplete
                    });
                    break;

                case 'polygon':
                    animatePolygon(this.object3d, {
                        duration: 1.5,
                        pen: this.pen,
                        camera: this.camera,
                        canvas: this.canvas,
                        onComplete
                    });
                    break;

                // 3D solid primitives - fade in animation
                case 'solid':
                case 'sphere':
                case 'cylinder':
                case 'cube':
                case 'cone':
                case 'torus':
                case 'prism':
                case 'frustum':
                case 'pyramid':
                    fadeInSolid(this.object3d, {
                        duration: 2.0,
                        onComplete
                    });
                    break;

                default:
                    onComplete();
            }
        } catch (e) {
            console.error('Math3DShapeEffect.doPlay() error:', e);
            this.scheduleComplete();
            playContext.onComplete(e);
        }
    }
}
