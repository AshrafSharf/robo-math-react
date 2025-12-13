/**
 * Math3DShapeEffect - Handles animation of 3D shapes (points, lines, etc.)
 *
 * Uses common animator classes, similar to how MathShapeEffect works for 2D.
 */
import { BaseEffect } from '../base-effect.js';
import { animatePointScale } from '../../3d/common/animator/point_animator.js';
import { animateLine } from '../../3d/common/animator/line_animator.js';

export class Math3DShapeEffect extends BaseEffect {
    /**
     * @param {THREE.Object3D} object3d - The Three.js object to animate
     * @param {string} shapeType - Type of shape: 'point', 'line', 'vector', etc.
     */
    constructor(object3d, shapeType = 'generic') {
        super();
        this.object3d = object3d;
        this.shapeType = shapeType;
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
                    animatePointScale(this.object3d, {
                        duration: 0.5,
                        onComplete
                    });
                    break;

                case 'line':
                    animateLine(this.object3d, {
                        duration: 0.8,
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
