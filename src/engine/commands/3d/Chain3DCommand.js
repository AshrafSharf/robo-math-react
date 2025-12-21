/**
 * Chain3DCommand - Command for animating a 3D vector sliding to tail-at-tip position
 *
 * Creates a NEW vector at the chained position.
 * Animation: shows vector sliding from original to chained position.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateVectorSlide } from '../../../3d/common/animator/vector_slide_animator.js';

export class Chain3DCommand extends Base3DCommand {
    /**
     * Create a chain3d command
     * @param {Object} vecBExpression - The vector B expression
     * @param {string} originalShapeVarName - Variable name for vector B
     * @param {Object} vecBStart - Original start point of B {x, y, z}
     * @param {Object} vecBEnd - Original end point of B {x, y, z}
     * @param {Object} chainedStart - Chained start point {x, y, z}
     * @param {Object} chainedEnd - Chained end point {x, y, z}
     * @param {string} inputType - 'vector3d' or 'line3d'
     * @param {Object} options - Style options
     */
    constructor(vecBExpression, originalShapeVarName, vecBStart, vecBEnd, chainedStart, chainedEnd, inputType, options = {}) {
        super();
        this.vecBExpression = vecBExpression;
        this.originalShapeVarName = originalShapeVarName;
        this.vecBStart = vecBStart;
        this.vecBEnd = vecBEnd;
        this.chainedStart = chainedStart;
        this.chainedEnd = chainedEnd;
        this.inputType = inputType;
        this.options = options;

        this.graphContainer = null;
        this.chainedShape = null;
    }

    async doInit() {
        const graphExpression = this.vecBExpression.graphExpression;
        if (!graphExpression || typeof graphExpression.getGrapher !== 'function') {
            throw new Error('chain3d() requires a vector3d/line3d with a valid g3d graph');
        }

        this.graphContainer = graphExpression.getGrapher();
        if (!this.graphContainer) {
            throw new Error('chain3d() graph not initialized');
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
                this.vecBStart,
                this.vecBEnd,
                this.chainedStart,
                this.chainedEnd,
                createShape,
                scene,
                {
                    duration: 2,
                    onComplete: (finalShape) => {
                        this.chainedShape = finalShape;
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
            this.chainedShape = diagram3d.lineByTwoPoints(
                this.chainedStart,
                this.chainedEnd,
                styleOptions.color,
                { strokeWidth: styleOptions.strokeWidth }
            );
        } else {
            this.chainedShape = diagram3d.vector(
                this.chainedStart,
                this.chainedEnd,
                '',
                styleOptions.color,
                {
                    shaftRadius: styleOptions.strokeWidth,
                    headLength: styleOptions.headLength,
                    headRadius: styleOptions.headRadius
                }
            );
        }
        this.commandResult = this.chainedShape;
    }

    async playSingle() {
        const scene = this.graphContainer.getScene();

        if (this.chainedShape) {
            scene.remove(this.chainedShape);
        }

        return this.play();
    }

    getLabelPosition() {
        return {
            x: (this.chainedStart.x + this.chainedEnd.x) / 2,
            y: (this.chainedStart.y + this.chainedEnd.y) / 2,
            z: (this.chainedStart.z + this.chainedEnd.z) / 2
        };
    }
}
