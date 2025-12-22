/**
 * ShiftTo3DCommand - Command for shifting a 3D vector or line to a new position
 *
 * Creates a NEW vector/line at the target position, preserving direction and magnitude.
 * Animation: shows vector/line sliding from original to target position.
 * Pen follows the tail (start point) of the vector/line.
 *
 * @class ShiftTo3DCommand
 * @extends Base3DCommand
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateVectorSlide } from '../../../3d/common/animator/vector_slide_animator.js';

export class ShiftTo3DCommand extends Base3DCommand {
    /**
     * @param {Object} vectorExpression - The original vector/line expression
     * @param {string} originalShapeVarName - Variable name of the original shape
     * @param {Object} targetPosition - Target position {x, y, z}
     * @param {number[]} shiftedCoords - Shifted coordinates [x1, y1, z1, x2, y2, z2]
     * @param {string} inputType - 'vector3d' or 'line3d'
     * @param {Object} options - Styling and other options
     */
    constructor(vectorExpression, originalShapeVarName, targetPosition, shiftedCoords, inputType = 'vector3d', options = {}) {
        super();
        this.vectorExpression = vectorExpression;
        this.originalShapeVarName = originalShapeVarName;
        this.targetPosition = targetPosition;
        this.shiftedCoords = shiftedCoords;
        this.inputType = inputType; // 'vector3d' or 'line3d'
        this.options = options;

        this.graphContainer = null;
        this.shiftedShape = null;
        this.originalStart = null;
        this.originalEnd = null;
        this.shiftedStart = null;
        this.shiftedEnd = null;
    }

    async doInit() {
        const graphExpression = this.vectorExpression.graphExpression;
        if (!graphExpression || typeof graphExpression.getGrapher !== 'function') {
            throw new Error('shiftTo3d() requires a vector3d or line3d with a valid g3d graph');
        }

        this.graphContainer = graphExpression.getGrapher();
        if (!this.graphContainer) {
            throw new Error('shiftTo3d() graph not initialized');
        }

        // Get model values from expression [x1, y1, z1, x2, y2, z2]
        const origCoords = this.vectorExpression.getVariableAtomicValues();
        this.originalStart = { x: origCoords[0], y: origCoords[1], z: origCoords[2] };
        this.originalEnd = { x: origCoords[3], y: origCoords[4], z: origCoords[5] };

        // Final shifted position
        this.shiftedStart = {
            x: this.shiftedCoords[0],
            y: this.shiftedCoords[1],
            z: this.shiftedCoords[2]
        };
        this.shiftedEnd = {
            x: this.shiftedCoords[3],
            y: this.shiftedCoords[4],
            z: this.shiftedCoords[5]
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
                this.shiftedStart,
                this.shiftedEnd,
                createShape,
                scene,
                {
                    duration: 2,
                    onComplete: (finalShape) => {
                        this.shiftedShape = finalShape;
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
            this.shiftedShape = this.graphContainer.diagram3d.lineByTwoPoints(
                this.shiftedStart,
                this.shiftedEnd,
                styleOptions.color,
                { strokeWidth: styleOptions.strokeWidth }
            );
        } else {
            this.shiftedShape = this.graphContainer.diagram3d.vector(
                this.shiftedStart,
                this.shiftedEnd,
                '',
                styleOptions.color,
                {
                    shaftRadius: styleOptions.strokeWidth,
                    headLength: styleOptions.headLength,
                    headRadius: styleOptions.headRadius
                }
            );
        }
        this.commandResult = this.shiftedShape;
    }

    async playSingle() {
        const scene = this.graphContainer.getScene();

        if (this.shiftedShape) {
            scene.remove(this.shiftedShape);
        }

        return this.play();
    }

    getLabelPosition() {
        return {
            x: (this.shiftedCoords[0] + this.shiftedCoords[3]) / 2,
            y: (this.shiftedCoords[1] + this.shiftedCoords[4]) / 2,
            z: (this.shiftedCoords[2] + this.shiftedCoords[5]) / 2
        };
    }
}
