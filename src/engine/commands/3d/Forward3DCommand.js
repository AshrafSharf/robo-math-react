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
    constructor(vectorExpression, originalShapeVarName, scalar, options = {}) {
        super();
        this.vectorExpression = vectorExpression;
        this.originalShapeVarName = originalShapeVarName;
        this.scalar = scalar;
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
            throw new Error('forward3d() requires a vector3d with a valid g3d graph');
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
        const color = this.options.styleOptions?.color;
        const vectorOptions = {
            shaftRadius: this.options.styleOptions?.strokeWidth,
            headLength: this.options.styleOptions?.headLength,
            headRadius: this.options.styleOptions?.headRadius
        };

        const createVector = (start, end) => {
            return this.graphContainer.diagram3d.vector(start, end, '', color, vectorOptions);
        };

        return new Promise((resolve) => {
            animateVectorSlide(
                this.vectorStart,
                this.vectorEnd,
                this.forwardStart,
                this.forwardEnd,
                createVector,
                scene,
                {
                    duration: 2,
                    onComplete: (finalVector) => {
                        this.forwardShape = finalVector;
                        this.commandResult = finalVector;
                        resolve();
                    }
                }
            );
        });
    }

    async directPlay() {
        this.forwardShape = this.graphContainer.diagram3d.vector(
            this.forwardStart,
            this.forwardEnd,
            '',
            this.options.styleOptions?.color
        );
        this.commandResult = this.forwardShape;
    }

    async playSingle() {
        const scene = this.graphContainer.getScene();

        if (this.forwardShape) {
            scene.remove(this.forwardShape);
        }

        const color = this.options.styleOptions?.color;
        const vectorOptions = {
            shaftRadius: this.options.styleOptions?.strokeWidth,
            headLength: this.options.styleOptions?.headLength,
            headRadius: this.options.styleOptions?.headRadius
        };

        const createVector = (start, end) => {
            return this.graphContainer.diagram3d.vector(start, end, '', color, vectorOptions);
        };

        return new Promise((resolve) => {
            animateVectorSlide(
                this.vectorStart,
                this.vectorEnd,
                this.forwardStart,
                this.forwardEnd,
                createVector,
                scene,
                {
                    duration: 2,
                    onComplete: (finalVector) => {
                        this.forwardShape = finalVector;
                        this.commandResult = finalVector;
                        resolve();
                    }
                }
            );
        });
    }

    getLabelPosition() {
        return {
            x: (this.forwardStart.x + this.forwardEnd.x) / 2,
            y: (this.forwardStart.y + this.forwardEnd.y) / 2,
            z: (this.forwardStart.z + this.forwardEnd.z) / 2
        };
    }
}
