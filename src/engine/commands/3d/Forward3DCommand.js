/**
 * Forward3DCommand - Command for creating and animating a 3D vector sliding forward
 *
 * Creates a NEW vector at the forward-shifted position.
 * Animation: shows vector sliding from original to forward position.
 * Pen follows the tail (start point) of the vector.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateVectorSlide } from '../../../3d/common/animator/vector_slide_animator.js';

export class Forward3DCommand extends Base3DCommand {
    constructor(vectorExpression, originalShapeVarName, scalar, inputType = 'vec', options = {}) {
        super();
        this.vectorExpression = vectorExpression;
        this.originalShapeVarName = originalShapeVarName;
        this.scalar = scalar;
        this.inputType = inputType; // 'vector3d' or 'line3d'
        this.options = options;

        this.graphContainer = null;
        this.forwardShape = null;
        this.vectorStart = null;
        this.vectorEnd = null;
        this.forwardStart = null;
        this.forwardEnd = null;
    }

    async doInit() {
        const graphExpression = this.vectorExpression.graphExpression;
        if (!graphExpression || typeof graphExpression.getGrapher !== 'function') {
            throw new Error('forward3d() requires a vector3d or line3d with a valid g3d graph');
        }

        this.graphContainer = graphExpression.getGrapher();
        if (!this.graphContainer) {
            throw new Error('forward3d() graph not initialized');
        }

        // Get model values from expression [x1, y1, z1, x2, y2, z2]
        const coords = this.vectorExpression.getVariableAtomicValues();
        this.vectorStart = { x: coords[0], y: coords[1], z: coords[2] };
        this.vectorEnd = { x: coords[3], y: coords[4], z: coords[5] };

        // Calculate direction and forward offset
        const direction = {
            x: this.vectorEnd.x - this.vectorStart.x,
            y: this.vectorEnd.y - this.vectorStart.y,
            z: this.vectorEnd.z - this.vectorStart.z
        };
        this.offset = {
            x: direction.x * this.scalar,
            y: direction.y * this.scalar,
            z: direction.z * this.scalar
        };

        // Forward vector position
        this.forwardStart = {
            x: this.vectorStart.x + this.offset.x,
            y: this.vectorStart.y + this.offset.y,
            z: this.vectorStart.z + this.offset.z
        };
        this.forwardEnd = {
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
                this.forwardStart,
                this.forwardEnd,
                createShape,
                scene,
                {
                    duration: 2,
                    onComplete: (finalShape) => {
                        this.forwardShape = finalShape;
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
            this.forwardShape = this.graphContainer.diagram3d.lineByTwoPoints(
                this.forwardStart,
                this.forwardEnd,
                styleOptions.color,
                { strokeWidth: styleOptions.strokeWidth }
            );
        } else {
            this.forwardShape = this.graphContainer.diagram3d.vector(
                this.forwardStart,
                this.forwardEnd,
                '',
                styleOptions.color,
                {
                    shaftRadius: styleOptions.strokeWidth,
                    headLength: styleOptions.headLength,
                    headRadius: styleOptions.headRadius
                }
            );
        }
        this.commandResult = this.forwardShape;
    }

    async playSingle() {
        const scene = this.graphContainer.getScene();

        if (this.forwardShape) {
            scene.remove(this.forwardShape);
        }

        return this.play();
    }

    getLabelPosition() {
        return {
            x: (this.forwardStart.x + this.forwardEnd.x) / 2,
            y: (this.forwardStart.y + this.forwardEnd.y) / 2,
            z: (this.forwardStart.z + this.forwardEnd.z) / 2
        };
    }
}
