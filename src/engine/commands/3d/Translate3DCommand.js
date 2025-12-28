/**
 * Translate3DCommand - Command for translating 3D shape(s) by (dx, dy, dz)
 *
 * Creates NEW shape(s) at the translated position.
 * Animation: shows shape(s) sliding along a linear path.
 * Original shape(s) remain visible.
 *
 * Supports both single shape and multi-shape modes.
 * Multi-shape mode returns a Shape3DCollection.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animateSlide } from '../../../3d/common/animator/slide_animator.js';
import { Shape3DCollection } from '../../../geom/Shape3DCollection.js';
import { ExpressionOptionsRegistry } from '../../expression-parser/core/ExpressionOptionsRegistry.js';

export class Translate3DCommand extends Base3DCommand {
    /**
     * Constructor supports two signatures:
     *
     * Single shape mode:
     *   new Translate3DCommand(shapeExpression, varName, delta, handler, originalPoints, translatedPoints, options, dependentTranslatedData)
     *
     * Multi-shape mode:
     *   new Translate3DCommand(graphExpression, shapeDataArray, delta, options)
     *   where options.isMultiShape = true
     */
    constructor(...args) {
        super();

        const lastArg = args[args.length - 1];
        this.isMultiShape = lastArg?.isMultiShape === true;

        if (this.isMultiShape) {
            // Multi-shape mode: (graphExpression, shapeDataArray, delta, options)
            this.graphExpression = args[0];
            this.shapeDataArray = args[1];
            this.delta = args[2];
            this.options = args[3] || {};

            this.graphContainer = null;
            this.translatedShapes = [];
            this.dependentTranslatedData = [];
            this.childCommands = [];
        } else {
            // Single shape mode: (shapeExpression, varName, delta, handler, originalPoints, translatedPoints, options, dependentTranslatedData)
            this.shapeExpression = args[0];
            this.originalShapeVarName = args[1];
            this.delta = args[2];
            this.handler = args[3];
            this.originalPoints = args[4];
            this.translatedPoints = args[5];
            this.options = args[6] || {};
            this.dependentTranslatedData = args[7] || [];

            this.graphContainer = null;
            this.translatedShape = null;
            this.childCommands = [];
        }
    }

    async doInit() {
        if (this.isMultiShape) {
            if (!this.graphExpression || typeof this.graphExpression.getGrapher !== 'function') {
                throw new Error('translate3d() requires shapes with a valid g3d graph');
            }
            this.graphContainer = this.graphExpression.getGrapher();
        } else {
            const graphExpression = this.shapeExpression.graphExpression;
            if (!graphExpression || typeof graphExpression.getGrapher !== 'function') {
                throw new Error('translate3d() requires a shape with a valid g3d graph');
            }
            this.graphContainer = graphExpression.getGrapher();
        }

        if (!this.graphContainer) {
            throw new Error('translate3d() graph not initialized');
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

        for (const { label, handler, originalPoints, translatedPoints } of this.dependentTranslatedData) {
            // Get style options for this shape type
            const geomType = handler.getGeometryType();
            const defaults = ExpressionOptionsRegistry.get(geomType);
            const styleOptions = {
                ...defaults.styleOptions,
                ...(this.options.styleOptions || {})
            };

            // Create child command for this dependent
            const childCmd = new Translate3DCommand(
                this.shapeExpression,  // Use same shape expression for graph access
                label,
                this.delta,
                handler,
                originalPoints,
                translatedPoints,
                { styleOptions }
                // No dependentTranslatedData for children (avoid infinite recursion)
            );
            await childCmd.init(this.commandContext);
            this.childCommands.push(childCmd);
        }
    }

    async _playSingleShape() {
        const scene = this.graphContainer.getScene();
        const diagram3d = this.graphContainer.diagram3d;
        const styleOptions = this.options.styleOptions || {};

        const getTranslatedState = (progress) => {
            return this.handler.getTranslatedState(this.originalPoints, this.delta, progress);
        };

        const createShape = (state) => {
            return this.handler.createShape(diagram3d, state, styleOptions);
        };

        // If we have dependents, create child commands and play all in parallel
        if (this.dependentTranslatedData && this.dependentTranslatedData.length > 0) {
            await this._createDependentCommands();

            // Create animation promises for main shape and all dependents
            const mainPromise = new Promise((resolve) => {
                animateSlide(
                    getTranslatedState,
                    createShape,
                    scene,
                    {
                        duration: 2,
                        onComplete: (finalShape) => {
                            this.translatedShape = finalShape;
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
            const allShapes = [this.translatedShape, ...this.childCommands.map(cmd => cmd.commandResult)];
            this.commandResult = new Shape3DCollection(allShapes);
        } else {
            // No dependents - just play the main shape
            return new Promise((resolve) => {
                animateSlide(
                    getTranslatedState,
                    createShape,
                    scene,
                    {
                        duration: 2,
                        onComplete: (finalShape) => {
                            this.translatedShape = finalShape;
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

        const animationPromises = this.shapeDataArray.map((shapeData, index) => {
            const { handler, originalPoints } = shapeData;

            const geomType = handler.getGeometryType();
            const defaults = ExpressionOptionsRegistry.get(geomType);
            const styleOptions = {
                ...defaults.styleOptions,
                ...(this.options.styleOptions || {})
            };

            const getTranslatedState = (progress) => {
                return handler.getTranslatedState(originalPoints, this.delta, progress);
            };

            const createShape = (state) => {
                return handler.createShape(diagram3d, state, styleOptions);
            };

            return new Promise((resolve) => {
                animateSlide(
                    getTranslatedState,
                    createShape,
                    scene,
                    {
                        duration: 2,
                        onComplete: (finalShape) => {
                            this.translatedShapes[index] = finalShape;
                            resolve(finalShape);
                        }
                    }
                );
            });
        });

        await Promise.all(animationPromises);
        this.commandResult = new Shape3DCollection(this.translatedShapes);
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

        const finalState = this.handler.getTranslatedState(this.originalPoints, this.delta, 1);
        this.translatedShape = this.handler.createShape(diagram3d, finalState, styleOptions);

        // If we have dependents, create and direct-play child commands
        if (this.dependentTranslatedData && this.dependentTranslatedData.length > 0) {
            await this._createDependentCommands();
            for (const cmd of this.childCommands) {
                await cmd.directPlay();
            }

            // Collect all shapes
            const allShapes = [this.translatedShape, ...this.childCommands.map(cmd => cmd.commandResult)];
            this.commandResult = new Shape3DCollection(allShapes);
        } else {
            this.commandResult = this.translatedShape;
        }
    }

    async _directPlayMultiShape() {
        const diagram3d = this.graphContainer.diagram3d;

        this.translatedShapes = this.shapeDataArray.map((shapeData) => {
            const { handler, originalPoints } = shapeData;

            const geomType = handler.getGeometryType();
            const defaults = ExpressionOptionsRegistry.get(geomType);
            const styleOptions = {
                ...defaults.styleOptions,
                ...(this.options.styleOptions || {})
            };

            const finalState = handler.getTranslatedState(originalPoints, this.delta, 1);
            return handler.createShape(diagram3d, finalState, styleOptions);
        });

        this.commandResult = new Shape3DCollection(this.translatedShapes);
    }

    async playSingle() {
        if (this.isMultiShape) {
            const scene = this.graphContainer.getScene();
            for (const shape of this.translatedShapes) {
                if (shape) scene.remove(shape);
            }
            this.translatedShapes = [];
            return this._playMultiShape();
        }

        const scene = this.graphContainer.getScene();
        if (this.translatedShape) {
            scene.remove(this.translatedShape);
        }

        // Also remove child command shapes
        if (this.childCommands && this.childCommands.length > 0) {
            for (const cmd of this.childCommands) {
                if (cmd.translatedShape) {
                    scene.remove(cmd.translatedShape);
                }
            }
            this.childCommands = [];
        }

        return this._playSingleShape();
    }

    getLabelPosition() {
        if (this.isMultiShape && this.translatedShapes.length > 0) {
            const firstShapeData = this.shapeDataArray[0];
            const pts = firstShapeData.translatedPoints;
            if (pts.length >= 2) {
                return {
                    x: (pts[0].x + pts[1].x) / 2,
                    y: (pts[0].y + pts[1].y) / 2,
                    z: (pts[0].z + pts[1].z) / 2
                };
            }
            return pts[0] || { x: 0, y: 0, z: 0 };
        }

        if (this.translatedPoints && this.translatedPoints.length >= 2) {
            return {
                x: (this.translatedPoints[0].x + this.translatedPoints[1].x) / 2,
                y: (this.translatedPoints[0].y + this.translatedPoints[1].y) / 2,
                z: (this.translatedPoints[0].z + this.translatedPoints[1].z) / 2
            };
        }
        return this.translatedPoints?.[0] || { x: 0, y: 0, z: 0 };
    }
}
