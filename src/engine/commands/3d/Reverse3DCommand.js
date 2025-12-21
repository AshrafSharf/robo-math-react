/**
 * Reverse3DCommand - Command for creating a reversed (flipped) 3D vector or line
 *
 * Creates a NEW vector/line with opposite direction.
 * Animation: shows reversed shape growing from the pivot point.
 * Pen follows the tip as it grows outward.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateVectorSlide } from '../../../3d/common/animator/vector_slide_animator.js';

export class Reverse3DCommand extends Base3DCommand {
    constructor(vectorExpression, originalShapeVarName, reversedCoords, inputType = 'vector3d', options = {}) {
        super();
        this.vectorExpression = vectorExpression;
        this.originalShapeVarName = originalShapeVarName;
        this.reversedCoords = reversedCoords;
        this.inputType = inputType; // 'vector3d' or 'line3d'
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
            throw new Error('reverse3d() requires a vector3d or line3d with a valid g3d graph');
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
                this.originalStart,
                this.originalEnd,
                this.reversedStart,
                this.reversedEnd,
                createShape,
                scene,
                {
                    duration: 2,
                    onComplete: (finalShape) => {
                        this.reversedShape = finalShape;
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
            this.reversedShape = this.graphContainer.diagram3d.lineByTwoPoints(
                this.reversedStart,
                this.reversedEnd,
                styleOptions.color,
                { strokeWidth: styleOptions.strokeWidth }
            );
        } else {
            this.reversedShape = this.graphContainer.diagram3d.vector(
                this.reversedStart,
                this.reversedEnd,
                '',
                styleOptions.color,
                {
                    shaftRadius: styleOptions.strokeWidth,
                    headLength: styleOptions.headLength,
                    headRadius: styleOptions.headRadius
                }
            );
        }
        this.commandResult = this.reversedShape;
    }

    async playSingle() {
        const scene = this.graphContainer.getScene();

        if (this.reversedShape) {
            scene.remove(this.reversedShape);
        }

        return this.play();
    }

    getLabelPosition() {
        return {
            x: (this.reversedCoords[0] + this.reversedCoords[3]) / 2,
            y: (this.reversedCoords[1] + this.reversedCoords[4]) / 2,
            z: (this.reversedCoords[2] + this.reversedCoords[5]) / 2
        };
    }
}
