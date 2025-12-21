/**
 * PerpShift3DCommand - Command for animating a 3D vector shifting perpendicular to its direction
 *
 * Creates a NEW vector at the shifted position.
 * Animation: shows vector sliding from original to perpendicular-shifted position.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateVectorSlide } from '../../../3d/common/animator/vector_slide_animator.js';

export class PerpShift3DCommand extends Base3DCommand {
    /**
     * Create a perpshift3d command
     * @param {Object} vectorExpression - The source vector expression
     * @param {string} originalShapeVarName - Variable name for source vector
     * @param {Object} vecStart - Original start point {x, y, z}
     * @param {Object} vecEnd - Original end point {x, y, z}
     * @param {Object} shiftedStart - Shifted start point {x, y, z}
     * @param {Object} shiftedEnd - Shifted end point {x, y, z}
     * @param {string} inputType - 'vec' or 'line'
     * @param {Object} options - Style options
     */
    constructor(vectorExpression, originalShapeVarName, vecStart, vecEnd, shiftedStart, shiftedEnd, inputType, options = {}) {
        super();
        this.vectorExpression = vectorExpression;
        this.originalShapeVarName = originalShapeVarName;
        this.vecStart = vecStart;
        this.vecEnd = vecEnd;
        this.shiftedStart = shiftedStart;
        this.shiftedEnd = shiftedEnd;
        this.inputType = inputType;
        this.options = options;

        this.graphContainer = null;
        this.shiftedShape = null;
    }

    async doInit() {
        const graphExpression = this.vectorExpression.graphExpression;
        if (!graphExpression || typeof graphExpression.getGrapher !== 'function') {
            throw new Error('perpshift3d() requires a vector3d/line3d with a valid g3d graph');
        }

        this.graphContainer = graphExpression.getGrapher();
        if (!this.graphContainer) {
            throw new Error('perpshift3d() graph not initialized');
        }
    }

    async play() {
        const scene = this.graphContainer.getScene();
        const diagram3d = this.graphContainer.diagram3d;
        const styleOptions = this.options.styleOptions || {};

        const createShape = (start, end) => {
            if (this.inputType === 'line3d') {
                return diagram3d.lineByTwoPoints(start, end, styleOptions.color, {
                    strokeWidth: styleOptions.strokeWidth
                });
            }
            return diagram3d.vector(start, end, '', styleOptions.color, {
                shaftRadius: styleOptions.strokeWidth,
                headLength: styleOptions.headLength,
                headRadius: styleOptions.headRadius
            });
        };

        return new Promise((resolve) => {
            animateVectorSlide(
                this.vecStart,
                this.vecEnd,
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
        const diagram3d = this.graphContainer.diagram3d;
        const styleOptions = this.options.styleOptions || {};

        if (this.inputType === 'line3d') {
            this.shiftedShape = diagram3d.lineByTwoPoints(
                this.shiftedStart,
                this.shiftedEnd,
                styleOptions.color,
                { strokeWidth: styleOptions.strokeWidth }
            );
        } else {
            this.shiftedShape = diagram3d.vector(
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
            x: (this.shiftedStart.x + this.shiftedEnd.x) / 2,
            y: (this.shiftedStart.y + this.shiftedEnd.y) / 2,
            z: (this.shiftedStart.z + this.shiftedEnd.z) / 2
        };
    }
}
