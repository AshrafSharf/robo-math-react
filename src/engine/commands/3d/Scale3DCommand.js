/**
 * Scale3DCommand - Command for scaling 3D shape(s) by a factor
 *
 * Creates NEW shape(s) at the scaled position.
 * Animation: shows shape(s) growing/shrinking.
 * Original shape(s) remain visible.
 *
 * Supports both single shape and multi-shape modes.
 * Multi-shape mode returns a Shape3DCollection.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateScale } from '../../../3d/common/animator/scale_animator.js';
import { Shape3DCollection } from '../../../geom/Shape3DCollection.js';
import { ExpressionOptionsRegistry } from '../../expression-parser/core/ExpressionOptionsRegistry.js';

export class Scale3DCommand extends Base3DCommand {
    /**
     * Constructor supports two signatures:
     *
     * Single shape mode:
     *   new Scale3DCommand(shapeExpression, varName, scaleFactor, center, handler, originalPoints, scaledPoints, options)
     *
     * Multi-shape mode:
     *   new Scale3DCommand(graphExpression, shapeDataArray, scaleFactor, center, options)
     *   where options.isMultiShape = true
     */
    constructor(...args) {
        super();

        const lastArg = args[args.length - 1];
        this.isMultiShape = lastArg?.isMultiShape === true;

        if (this.isMultiShape) {
            // Multi-shape mode: (graphExpression, shapeDataArray, scaleFactor, center, options)
            this.graphExpression = args[0];
            this.shapeDataArray = args[1];
            this.scaleFactor = args[2];
            this.center = args[3];
            this.options = args[4] || {};

            this.graphContainer = null;
            this.scaledShapes = [];
        } else {
            // Single shape mode: (shapeExpression, varName, scaleFactor, center, handler, originalPoints, scaledPoints, options)
            this.shapeExpression = args[0];
            this.originalShapeVarName = args[1];
            this.scaleFactor = args[2];
            this.center = args[3];
            this.handler = args[4];
            this.originalPoints = args[5];
            this.scaledPoints = args[6];
            this.options = args[7] || {};

            this.graphContainer = null;
            this.scaledShape = null;
        }
    }

    async doInit() {
        if (this.isMultiShape) {
            if (!this.graphExpression || typeof this.graphExpression.getGrapher !== 'function') {
                throw new Error('scale3d() requires shapes with a valid g3d graph');
            }
            this.graphContainer = this.graphExpression.getGrapher();
        } else {
            const graphExpression = this.shapeExpression.graphExpression;
            if (!graphExpression || typeof graphExpression.getGrapher !== 'function') {
                throw new Error('scale3d() requires a shape with a valid g3d graph');
            }
            this.graphContainer = graphExpression.getGrapher();
        }

        if (!this.graphContainer) {
            throw new Error('scale3d() graph not initialized');
        }
    }

    async play() {
        if (this.isMultiShape) {
            return this._playMultiShape();
        }
        return this._playSingleShape();
    }

    async _playSingleShape() {
        const scene = this.graphContainer.getScene();
        const diagram3d = this.graphContainer.diagram3d;
        const styleOptions = this.options.styleOptions || {};

        const getScaledState = (progress) => {
            return this.handler.getScaledState(this.originalPoints, this.scaleFactor, this.center, progress);
        };

        const createShape = (state) => {
            return this.handler.createShape(diagram3d, state, styleOptions);
        };

        return new Promise((resolve) => {
            animateScale(
                getScaledState,
                createShape,
                scene,
                {
                    duration: 2,
                    onComplete: (finalShape) => {
                        this.scaledShape = finalShape;
                        this.commandResult = finalShape;
                        resolve();
                    }
                }
            );
        });
    }

    async _playMultiShape() {
        const scene = this.graphContainer.getScene();
        const diagram3d = this.graphContainer.diagram3d;

        const animationPromises = this.shapeDataArray.map((shapeData, index) => {
            const { handler, originalPoints } = shapeData;

            const geomType = handler.getGeometryType();
            const defaults = ExpressionOptionsRegistry.get(geomType);
            const styleOptions = {
                ...defaults.styleOptions,
                ...(this.options.styleOptions || {})
            };

            const getScaledState = (progress) => {
                return handler.getScaledState(originalPoints, this.scaleFactor, this.center, progress);
            };

            const createShape = (state) => {
                return handler.createShape(diagram3d, state, styleOptions);
            };

            return new Promise((resolve) => {
                animateScale(
                    getScaledState,
                    createShape,
                    scene,
                    {
                        duration: 2,
                        onComplete: (finalShape) => {
                            this.scaledShapes[index] = finalShape;
                            resolve(finalShape);
                        }
                    }
                );
            });
        });

        await Promise.all(animationPromises);
        this.commandResult = new Shape3DCollection(this.scaledShapes);
    }

    async directPlay() {
        if (this.isMultiShape) {
            return this._directPlayMultiShape();
        }
        return this._directPlaySingleShape();
    }

    async _directPlaySingleShape() {
        const diagram3d = this.graphContainer.diagram3d;
        const styleOptions = this.options.styleOptions || {};

        const finalState = this.handler.getScaledState(this.originalPoints, this.scaleFactor, this.center, 1);
        this.scaledShape = this.handler.createShape(diagram3d, finalState, styleOptions);
        this.commandResult = this.scaledShape;
    }

    async _directPlayMultiShape() {
        const diagram3d = this.graphContainer.diagram3d;

        this.scaledShapes = this.shapeDataArray.map((shapeData) => {
            const { handler, originalPoints } = shapeData;

            const geomType = handler.getGeometryType();
            const defaults = ExpressionOptionsRegistry.get(geomType);
            const styleOptions = {
                ...defaults.styleOptions,
                ...(this.options.styleOptions || {})
            };

            const finalState = handler.getScaledState(originalPoints, this.scaleFactor, this.center, 1);
            return handler.createShape(diagram3d, finalState, styleOptions);
        });

        this.commandResult = new Shape3DCollection(this.scaledShapes);
    }

    async playSingle() {
        if (this.isMultiShape) {
            const scene = this.graphContainer.getScene();
            for (const shape of this.scaledShapes) {
                if (shape) scene.remove(shape);
            }
            this.scaledShapes = [];
            return this._playMultiShape();
        }

        const scene = this.graphContainer.getScene();
        if (this.scaledShape) {
            scene.remove(this.scaledShape);
        }
        return this._playSingleShape();
    }

    getLabelPosition() {
        if (this.isMultiShape && this.scaledShapes.length > 0) {
            const firstShapeData = this.shapeDataArray[0];
            const pts = firstShapeData.scaledPoints;
            if (pts.length >= 2) {
                return {
                    x: (pts[0].x + pts[1].x) / 2,
                    y: (pts[0].y + pts[1].y) / 2,
                    z: (pts[0].z + pts[1].z) / 2
                };
            }
            return pts[0] || { x: 0, y: 0, z: 0 };
        }

        if (this.scaledPoints && this.scaledPoints.length >= 2) {
            return {
                x: (this.scaledPoints[0].x + this.scaledPoints[1].x) / 2,
                y: (this.scaledPoints[0].y + this.scaledPoints[1].y) / 2,
                z: (this.scaledPoints[0].z + this.scaledPoints[1].z) / 2
            };
        }
        return this.scaledPoints?.[0] || { x: 0, y: 0, z: 0 };
    }
}
