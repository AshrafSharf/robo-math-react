/**
 * Reverse3DCommand - Command for creating a reversed (flipped) 3D vector
 *
 * Creates a NEW vector with opposite direction.
 * Animation: shows reversed vector growing from the pivot point.
 * Pen follows the tip as it grows outward.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateVectorSlide } from '../../../3d/common/animator/vector_slide_animator.js';

export class Reverse3DCommand extends Base3DCommand {
    constructor(vectorExpression, originalShapeVarName, reversedCoords, options = {}) {
        super();
        this.vectorExpression = vectorExpression;
        this.originalShapeVarName = originalShapeVarName;
        this.reversedCoords = reversedCoords;
        this.options = options;

        this.graphContainer = null;
        this.reversedShape = null;
        this.originalStart = null;
        this.originalEnd = null;
        this.reversedStart = null;
        this.reversedEnd = null;
    }

    async doInit() {
        const graphExpression = this.vectorExpression.graphExpression;
        if (!graphExpression || typeof graphExpression.getGrapher !== 'function') {
            throw new Error('reverse3d() requires a vector3d with a valid g3d graph');
        }

        this.graphContainer = graphExpression.getGrapher();
        if (!this.graphContainer) {
            throw new Error('reverse3d() graph not initialized');
        }

        // Get original vector coordinates
        const origCoords = this.vectorExpression.getVariableAtomicValues();
        this.originalStart = { x: origCoords[0], y: origCoords[1], z: origCoords[2] };
        this.originalEnd = { x: origCoords[3], y: origCoords[4], z: origCoords[5] };

        // Extract reversed vector start/end from coords
        this.reversedStart = {
            x: this.reversedCoords[0],
            y: this.reversedCoords[1],
            z: this.reversedCoords[2]
        };
        this.reversedEnd = {
            x: this.reversedCoords[3],
            y: this.reversedCoords[4],
            z: this.reversedCoords[5]
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
                this.reversedStart,
                this.reversedEnd,
                createVector,
                scene,
                {
                    duration: 2,
                    onComplete: (finalVector) => {
                        this.reversedShape = finalVector;
                        this.commandResult = finalVector;
                        resolve();
                    }
                }
            );
        });
    }

    async directPlay() {
        this.reversedShape = this.graphContainer.diagram3d.vector(
            this.reversedStart,
            this.reversedEnd,
            '',
            this.options.styleOptions?.color
        );
        this.commandResult = this.reversedShape;
    }

    async playSingle() {
        const scene = this.graphContainer.getScene();

        if (this.reversedShape) {
            scene.remove(this.reversedShape);
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
                this.reversedStart,
                this.reversedEnd,
                createVector,
                scene,
                {
                    duration: 2,
                    onComplete: (finalVector) => {
                        this.reversedShape = finalVector;
                        this.commandResult = finalVector;
                        resolve();
                    }
                }
            );
        });
    }

    getLabelPosition() {
        return {
            x: (this.reversedCoords[0] + this.reversedCoords[3]) / 2,
            y: (this.reversedCoords[1] + this.reversedCoords[4]) / 2,
            z: (this.reversedCoords[2] + this.reversedCoords[5]) / 2
        };
    }
}
