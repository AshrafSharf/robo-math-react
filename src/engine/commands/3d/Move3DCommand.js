/**
 * Move3DCommand - Command for creating and animating a 3D vector or line moving to a new position
 *
 * Creates a NEW vector/line at the target position.
 * Animation: shows vector/line sliding from original to target position.
 * Pen follows the tail (start point) of the vector/line.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateVectorSlide } from '../../../3d/common/animator/vector_slide_animator.js';

export class Move3DCommand extends Base3DCommand {
    constructor(vectorExpression, originalShapeVarName, targetPosition, movedCoords, inputType = 'vector3d', options = {}) {
        super();
        this.vectorExpression = vectorExpression;
        this.originalShapeVarName = originalShapeVarName;
        this.targetPosition = targetPosition;
        this.movedCoords = movedCoords;
        this.inputType = inputType; // 'vector3d' or 'line3d'
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
            throw new Error('move3d() requires a vector3d or line3d with a valid g3d graph');
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
                this.movedStart,
                this.movedEnd,
                createShape,
                scene,
                {
                    duration: 2,
                    onComplete: (finalShape) => {
                        this.movedShape = finalShape;
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
            this.movedShape = this.graphContainer.diagram3d.lineByTwoPoints(
                this.movedStart,
                this.movedEnd,
                styleOptions.color,
                { strokeWidth: styleOptions.strokeWidth }
            );
        } else {
            this.movedShape = this.graphContainer.diagram3d.vector(
                this.movedStart,
                this.movedEnd,
                '',
                styleOptions.color,
                {
                    shaftRadius: styleOptions.strokeWidth,
                    headLength: styleOptions.headLength,
                    headRadius: styleOptions.headRadius
                }
            );
        }
        this.commandResult = this.movedShape;
    }

    async playSingle() {
        const scene = this.graphContainer.getScene();

        if (this.movedShape) {
            scene.remove(this.movedShape);
        }

        return this.play();
    }

    getLabelPosition() {
        return {
            x: (this.movedCoords[0] + this.movedCoords[3]) / 2,
            y: (this.movedCoords[1] + this.movedCoords[4]) / 2,
            z: (this.movedCoords[2] + this.movedCoords[5]) / 2
        };
    }
}
