/**
 * Backward3DCommand - Command for creating and animating a 3D vector sliding backward
 *
 * Creates a NEW vector at the backward-shifted position.
 * Animation: shows vector sliding from original to backward position.
 * Pen follows the tail (start point) of the vector.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateVectorSlide } from '../../../3d/common/animator/vector_slide_animator.js';

export class Backward3DCommand extends Base3DCommand {
    constructor(vectorExpression, originalShapeVarName, scalar, inputType = 'vec', options = {}) {
        super();
        this.vectorExpression = vectorExpression;
        this.originalShapeVarName = originalShapeVarName;
        this.scalar = scalar;
        this.inputType = inputType; // 'vector3d' or 'line3d'
        this.options = options;

        this.graphContainer = null;
        this.backwardShape = null;
        this.vectorStart = null;
        this.vectorEnd = null;
        this.backwardStart = null;
        this.backwardEnd = null;
    }

    async doInit() {
        const graphExpression = this.vectorExpression.graphExpression;
        if (!graphExpression || typeof graphExpression.getGrapher !== 'function') {
            throw new Error('backward3d() requires a vector3d or line3d with a valid g3d graph');
        }

        this.graphContainer = graphExpression.getGrapher();
        if (!this.graphContainer) {
            throw new Error('backward3d() graph not initialized');
        }

        // Get model values from expression [x1, y1, z1, x2, y2, z2]
        const coords = this.vectorExpression.getVariableAtomicValues();
        this.vectorStart = { x: coords[0], y: coords[1], z: coords[2] };
        this.vectorEnd = { x: coords[3], y: coords[4], z: coords[5] };

        // Calculate direction and backward offset (negative)
        const direction = {
            x: this.vectorEnd.x - this.vectorStart.x,
            y: this.vectorEnd.y - this.vectorStart.y,
            z: this.vectorEnd.z - this.vectorStart.z
        };
        this.offset = {
            x: -direction.x * this.scalar,
            y: -direction.y * this.scalar,
            z: -direction.z * this.scalar
        };

        // Backward vector position
        this.backwardStart = {
            x: this.vectorStart.x + this.offset.x,
            y: this.vectorStart.y + this.offset.y,
            z: this.vectorStart.z + this.offset.z
        };
        this.backwardEnd = {
            x: this.vectorEnd.x + this.offset.x,
            y: this.vectorEnd.y + this.offset.y,
            z: this.vectorEnd.z + this.offset.z
        };
    }

    async play() {
        const scene = this.graphContainer.getScene();
        const styleOptions = this.options.styleOptions || {};

        const createShape = (start, end) => {
            if (this.inputType === 'line3d') {
                return this.graphContainer.diagram3d.lineByTwoPoints(start, end, styleOptions.color, {
                    strokeWidth: styleOptions.strokeWidth
                });
            }
            return this.graphContainer.diagram3d.vector(start, end, '', styleOptions.color, {
                shaftRadius: styleOptions.strokeWidth,
                headLength: styleOptions.headLength,
                headRadius: styleOptions.headRadius
            });
        };

        return new Promise((resolve) => {
            animateVectorSlide(
                this.vectorStart,
                this.vectorEnd,
                this.backwardStart,
                this.backwardEnd,
                createShape,
                scene,
                {
                    duration: 2,
                    onComplete: (finalShape) => {
                        this.backwardShape = finalShape;
                        this.commandResult = finalShape;
                        resolve();
                    }
                }
            );
        });
    }

    async directPlay() {
        const styleOptions = this.options.styleOptions || {};

        if (this.inputType === 'line3d') {
            this.backwardShape = this.graphContainer.diagram3d.lineByTwoPoints(
                this.backwardStart,
                this.backwardEnd,
                styleOptions.color,
                { strokeWidth: styleOptions.strokeWidth }
            );
        } else {
            this.backwardShape = this.graphContainer.diagram3d.vector(
                this.backwardStart,
                this.backwardEnd,
                '',
                styleOptions.color,
                {
                    shaftRadius: styleOptions.strokeWidth,
                    headLength: styleOptions.headLength,
                    headRadius: styleOptions.headRadius
                }
            );
        }
        this.commandResult = this.backwardShape;
    }

    async playSingle() {
        const scene = this.graphContainer.getScene();

        if (this.backwardShape) {
            scene.remove(this.backwardShape);
        }

        return this.play();
    }

    getLabelPosition() {
        return {
            x: (this.backwardStart.x + this.backwardEnd.x) / 2,
            y: (this.backwardStart.y + this.backwardEnd.y) / 2,
            z: (this.backwardStart.z + this.backwardEnd.z) / 2
        };
    }
}
