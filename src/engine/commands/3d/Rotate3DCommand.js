/**
 * Rotate3DCommand - Command for rotating 3D shape(s) around an axis
 *
 * Creates NEW shape(s) at the rotated position.
 * Animation: shows shape(s) rotating along an arc path.
 * Original shape(s) remain visible.
 *
 * Supports both single shape and multi-shape modes.
 * Multi-shape mode returns a Shape3DCollection.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateArc } from '../../../3d/common/animator/arc_animator.js';
import { rotatePoints3D } from '../../../3d/common/rotation_utils.js';
import { Shape3DCollection } from '../../../geom/Shape3DCollection.js';
import { ExpressionOptionsRegistry } from '../../expression-parser/core/ExpressionOptionsRegistry.js';

export class Rotate3DCommand extends Base3DCommand {
    /**
     * Constructor supports two signatures:
     *
     * Single shape mode:
     *   new Rotate3DCommand(shapeExpression, varName, angle, axis, handler, originalPoints, rotatedPoints, options, dependentRotatedData)
     *
     * Multi-shape mode:
     *   new Rotate3DCommand(graphExpression, shapeDataArray, angle, axis, options)
     *   where options.isMultiShape = true
     */
    constructor(...args) {
        super();

        // Detect mode by checking if options.isMultiShape is true
        const lastArg = args[args.length - 1];
        this.isMultiShape = lastArg?.isMultiShape === true;

        if (this.isMultiShape) {
            // Multi-shape mode: (graphExpression, shapeDataArray, angle, axis, options)
            this.graphExpression = args[0];
            this.shapeDataArray = args[1];
            this.angle = args[2];
            this.axis = args[3];
            this.options = args[4] || {};

            this.graphContainer = null;
            this.rotatedShapes = []; // Array of created shapes
            this.dependentRotatedData = [];
            this.childCommands = [];
        } else {
            // Single shape mode: (shapeExpression, varName, angle, axis, handler, originalPoints, rotatedPoints, options, dependentRotatedData)
            this.shapeExpression = args[0];
            this.originalShapeVarName = args[1];
            this.angle = args[2];
            this.axis = args[3];
            this.handler = args[4];
            this.originalPoints = args[5];
            this.rotatedPoints = args[6];
            this.options = args[7] || {};
            this.dependentRotatedData = args[8] || [];

            this.graphContainer = null;
            this.rotatedShape = null;
            this.childCommands = [];
        }
    }

    async doInit() {
        if (this.isMultiShape) {
            // Get graph container from graphExpression
            if (!this.graphExpression || typeof this.graphExpression.getGrapher !== 'function') {
                throw new Error('rotate3d() requires shapes with a valid g3d graph');
            }
            this.graphContainer = this.graphExpression.getGrapher();
        } else {
            // Get graph container from shape expression
            const graphExpression = this.shapeExpression.graphExpression;
            if (!graphExpression || typeof graphExpression.getGrapher !== 'function') {
                throw new Error('rotate3d() requires a shape with a valid g3d graph');
            }
            this.graphContainer = graphExpression.getGrapher();
        }

        if (!this.graphContainer) {
            throw new Error('rotate3d() graph not initialized');
        }
    }

    async play() {
        if (this.isMultiShape) {
            return this._playMultiShape();
        }
        return this._playSingleShape();
    }

    /**
     * Create child commands for dependents using pre-computed data
     * @private
     */
    async _createDependentCommands() {
        this.childCommands = [];
        const diagram3d = this.graphContainer.diagram3d;

        for (const { label, handler, originalPoints, rotatedPoints } of this.dependentRotatedData) {
            // Get style options for this shape type
            const geomType = handler.getGeometryType();
            const defaults = ExpressionOptionsRegistry.get(geomType);
            const styleOptions = {
                ...defaults.styleOptions,
                ...(this.options.styleOptions || {})
            };

            // Create child command for this dependent
            const childCmd = new Rotate3DCommand(
                this.shapeExpression,  // Use same shape expression for graph access
                label,
                this.angle,
                this.axis,
                handler,
                originalPoints,
                rotatedPoints,
                { styleOptions }
                // No dependentRotatedData for children (avoid infinite recursion)
            );
            await childCmd.init(this.commandContext);
            this.childCommands.push(childCmd);
        }
    }

    async _playSingleShape() {
        const scene = this.graphContainer.getScene();
        const diagram3d = this.graphContainer.diagram3d;
        const styleOptions = this.options.styleOptions || {};

        const getRotatedState = (currentAngle) => {
            return this.handler.getRotatedState(this.originalPoints, this.axis, currentAngle);
        };

        const createShape = (state) => {
            return this.handler.createShape(diagram3d, state, styleOptions);
        };

        // If we have dependents, create child commands and play all in parallel
        if (this.dependentRotatedData && this.dependentRotatedData.length > 0) {
            await this._createDependentCommands();

            // Create animation promises for main shape and all dependents
            const mainPromise = new Promise((resolve) => {
                animateArc(
                    getRotatedState,
                    createShape,
                    this.angle,
                    scene,
                    {
                        duration: 2,
                        onComplete: (finalShape) => {
                            this.rotatedShape = finalShape;
                            resolve();
                        }
                    }
                );
            });

            // Play all in parallel
            await Promise.all([
                mainPromise,
                ...this.childCommands.map(cmd => cmd.play())
            ]);

            // Collect all shapes
            const allShapes = [this.rotatedShape, ...this.childCommands.map(cmd => cmd.commandResult)];
            this.commandResult = new Shape3DCollection(allShapes);
        } else {
            // No dependents - just play the main shape
            return new Promise((resolve) => {
                animateArc(
                    getRotatedState,
                    createShape,
                    this.angle,
                    scene,
                    {
                        duration: 2,
                        onComplete: (finalShape) => {
                            this.rotatedShape = finalShape;
                            this.commandResult = finalShape;
                            resolve();
                        }
                    }
                );
            });
        }
    }

    async _playMultiShape() {
        const scene = this.graphContainer.getScene();
        const diagram3d = this.graphContainer.diagram3d;

        // Create promises for each shape animation
        const animationPromises = this.shapeDataArray.map((shapeData, index) => {
            const { handler, originalPoints } = shapeData;

            // Get style options for this shape type
            const geomType = handler.getGeometryType();
            const defaults = ExpressionOptionsRegistry.get(geomType);
            const styleOptions = {
                ...defaults.styleOptions,
                ...(this.options.styleOptions || {})
            };

            const getRotatedState = (currentAngle) => {
                return handler.getRotatedState(originalPoints, this.axis, currentAngle);
            };

            const createShape = (state) => {
                return handler.createShape(diagram3d, state, styleOptions);
            };

            return new Promise((resolve) => {
                animateArc(
                    getRotatedState,
                    createShape,
                    this.angle,
                    scene,
                    {
                        duration: 2,
                        onComplete: (finalShape) => {
                            this.rotatedShapes[index] = finalShape;
                            resolve(finalShape);
                        }
                    }
                );
            });
        });

        // Wait for all animations to complete
        await Promise.all(animationPromises);

        // Return collection
        this.commandResult = new Shape3DCollection(this.rotatedShapes);
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

        const finalState = this.handler.getRotatedState(this.originalPoints, this.axis, this.angle);
        this.rotatedShape = this.handler.createShape(diagram3d, finalState, styleOptions);

        // If we have dependents, create and direct-play child commands
        if (this.dependentRotatedData && this.dependentRotatedData.length > 0) {
            await this._createDependentCommands();
            for (const cmd of this.childCommands) {
                await cmd.directPlay();
            }

            // Collect all shapes
            const allShapes = [this.rotatedShape, ...this.childCommands.map(cmd => cmd.commandResult)];
            this.commandResult = new Shape3DCollection(allShapes);
        } else {
            this.commandResult = this.rotatedShape;
        }
    }

    async _directPlayMultiShape() {
        const diagram3d = this.graphContainer.diagram3d;

        this.rotatedShapes = this.shapeDataArray.map((shapeData) => {
            const { handler, originalPoints } = shapeData;

            const geomType = handler.getGeometryType();
            const defaults = ExpressionOptionsRegistry.get(geomType);
            const styleOptions = {
                ...defaults.styleOptions,
                ...(this.options.styleOptions || {})
            };

            const finalState = handler.getRotatedState(originalPoints, this.axis, this.angle);
            return handler.createShape(diagram3d, finalState, styleOptions);
        });

        this.commandResult = new Shape3DCollection(this.rotatedShapes);
    }

    async playSingle() {
        if (this.isMultiShape) {
            // Remove existing shapes
            const scene = this.graphContainer.getScene();
            for (const shape of this.rotatedShapes) {
                if (shape) scene.remove(shape);
            }
            this.rotatedShapes = [];
            return this._playMultiShape();
        }

        // Single shape mode
        const scene = this.graphContainer.getScene();
        if (this.rotatedShape) {
            scene.remove(this.rotatedShape);
        }

        // Also remove child command shapes
        if (this.childCommands && this.childCommands.length > 0) {
            for (const cmd of this.childCommands) {
                if (cmd.rotatedShape) {
                    scene.remove(cmd.rotatedShape);
                }
            }
            this.childCommands = [];
        }

        return this._playSingleShape();
    }

    getLabelPosition() {
        if (this.isMultiShape && this.rotatedShapes.length > 0) {
            // Use first shape's position
            const firstShapeData = this.shapeDataArray[0];
            const pts = firstShapeData.rotatedPoints;
            if (pts.length >= 2) {
                return {
                    x: (pts[0].x + pts[1].x) / 2,
                    y: (pts[0].y + pts[1].y) / 2,
                    z: (pts[0].z + pts[1].z) / 2
                };
            }
            return pts[0] || { x: 0, y: 0, z: 0 };
        }

        if (this.rotatedPoints && this.rotatedPoints.length >= 2) {
            return {
                x: (this.rotatedPoints[0].x + this.rotatedPoints[1].x) / 2,
                y: (this.rotatedPoints[0].y + this.rotatedPoints[1].y) / 2,
                z: (this.rotatedPoints[0].z + this.rotatedPoints[1].z) / 2
            };
        }
        return this.rotatedPoints?.[0] || { x: 0, y: 0, z: 0 };
    }
}
