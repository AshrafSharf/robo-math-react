/**
 * Move3DCommand - Command for creating and animating a 3D vector moving to a new position
 *
 * Creates a NEW vector at the target position.
 * Animation: shows vector sliding from original to target position.
 * Pen follows the tail (start point) of the vector.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateVectorSlide } from '../../../3d/common/animator/vector_slide_animator.js';

export class Move3DCommand extends Base3DCommand {
    constructor(vectorExpression, originalShapeVarName, targetPosition, movedCoords, options = {}) {
        super();
        this.vectorExpression = vectorExpression;
        this.originalShapeVarName = originalShapeVarName;
        this.targetPosition = targetPosition;
        this.movedCoords = movedCoords;
        this.options = options;

        this.graphContainer = null;
        this.movedShape = null;
        this.originalStart = null;
        this.originalEnd = null;
        this.movedStart = null;
        this.movedEnd = null;
    }

    async doInit() {
        const graphExpression = this.vectorExpression.graphExpression;
        if (!graphExpression || typeof graphExpression.getGrapher !== 'function') {
            throw new Error('move3d() requires a vector3d with a valid g3d graph');
        }

        this.graphContainer = graphExpression.getGrapher();
        if (!this.graphContainer) {
            throw new Error('move3d() graph not initialized');
        }

        // Get model values from expression [x1, y1, z1, x2, y2, z2]
        const origCoords = this.vectorExpression.getVariableAtomicValues();
        this.originalStart = { x: origCoords[0], y: origCoords[1], z: origCoords[2] };
        this.originalEnd = { x: origCoords[3], y: origCoords[4], z: origCoords[5] };

        // Final moved position
        this.movedStart = {
            x: this.movedCoords[0],
            y: this.movedCoords[1],
            z: this.movedCoords[2]
        };
        this.movedEnd = {
            x: this.movedCoords[3],
            y: this.movedCoords[4],
            z: this.movedCoords[5]
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
                this.originalStart,
                this.originalEnd,
                this.movedStart,
                this.movedEnd,
                createVector,
                scene,
                {
                    duration: 2,
                    onComplete: (finalVector) => {
                        this.movedShape = finalVector;
                        this.commandResult = finalVector;
                        resolve();
                    }
                }
            );
        });
    }

    async directPlay() {
        this.movedShape = this.graphContainer.diagram3d.vector(
            this.movedStart,
            this.movedEnd,
            '',
            this.options.styleOptions?.color
        );
        this.commandResult = this.movedShape;
    }

    async playSingle() {
        const scene = this.graphContainer.getScene();

        if (this.movedShape) {
            scene.remove(this.movedShape);
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
                this.originalStart,
                this.originalEnd,
                this.movedStart,
                this.movedEnd,
                createVector,
                scene,
                {
                    duration: 2,
                    onComplete: (finalVector) => {
                        this.movedShape = finalVector;
                        this.commandResult = finalVector;
                        resolve();
                    }
                }
            );
        });
    }

    getLabelPosition() {
        return {
            x: (this.movedCoords[0] + this.movedCoords[3]) / 2,
            y: (this.movedCoords[1] + this.movedCoords[4]) / 2,
            z: (this.movedCoords[2] + this.movedCoords[5]) / 2
        };
    }
}
