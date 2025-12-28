/**
 * ScaleCommand - Command for rendering scaled shape(s)
 *
 * Supports two modes:
 * - Single shape: Uses delegate commands (PointCommand, LineCommand, etc.) to create shape.
 * - Multi-shape: Creates child ScaleCommands and plays them in parallel.
 *
 * For animated mode: creates shape without animation, then plays ScaleEffect.
 * For static mode: delegate command creates and shows shape normally.
 */
import { BaseCommand } from './BaseCommand.js';
import { PointCommand } from './PointCommand.js';
import { LineCommand } from './LineCommand.js';
import { VectorCommand } from './VectorCommand.js';
import { CircleCommand } from './CircleCommand.js';
import { PolygonCommand } from './PolygonCommand.js';
import { ScaleEffect } from '../../effects/scale-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';
import { ShapeCollection } from '../../geom/ShapeCollection.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';
import { GEOMETRY_TYPES } from '../expression-parser/expressions/IntersectExpression.js';

export class ScaleCommand extends BaseCommand {
    /**
     * Create a scale command
     *
     * Single shape mode:
     * @param {Object} graphExpression - The graph expression
     * @param {string} originalShapeVarName - Variable name of original shape (for registry lookup)
     * @param {Object} scaledData - Computed scaled coordinates
     * @param {string} originalShapeName - Original shape name ('point', 'line', 'vector', etc.)
     * @param {string} originalShapeType - GEOMETRY_TYPES value
     * @param {number} scaleFactor - Scale factor
     * @param {Object} center - Scale center {x, y}
     * @param {Object} options - Additional options
     *
     * Multi-shape mode:
     * @param {Object} graphExpression - The graph expression
     * @param {Array} shapeDataArray - Array of shape data objects
     * @param {number} scaleFactor - Scale factor
     * @param {Object} center - Scale center {x, y}
     * @param {Object} options - Additional options with isMultiShape: true
     */
    constructor(graphExpression, originalShapeVarNameOrArray, scaledDataOrFactor, originalShapeNameOrCenter, originalShapeType, scaleFactor, center, options = {}, dependentScaledData = []) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;

        // Detect multi-shape mode from options
        if (typeof scaledDataOrFactor === 'number' && typeof originalShapeNameOrCenter === 'object' && originalShapeNameOrCenter.x !== undefined) {
            // Multi-shape mode: constructor(graphExpression, shapeDataArray, scaleFactor, center, options)
            this.isMultiShape = true;
            this.shapeDataArray = originalShapeVarNameOrArray;  // Array of shape data
            this.scaleFactor = scaledDataOrFactor;
            this.center = originalShapeNameOrCenter;
            this.options = originalShapeType || {};
            this.dependentScaledData = [];

            // Single shape fields not used
            this.originalShapeVarName = null;
            this.scaledData = null;
            this.originalShapeName = null;
            this.originalShapeType = null;

            // Multi-shape tracking
            this.childCommands = [];
        } else {
            // Single shape mode: constructor(graphExpression, varName, data, name, type, factor, center, options, dependentScaledData)
            this.isMultiShape = false;
            this.originalShapeVarName = originalShapeVarNameOrArray;
            this.scaledData = scaledDataOrFactor;
            this.originalShapeName = originalShapeNameOrCenter;
            this.originalShapeType = originalShapeType;
            this.scaleFactor = scaleFactor;
            this.center = center;
            this.options = options;
            this.dependentScaledData = dependentScaledData;

            // Multi-shape fields not used
            this.shapeDataArray = null;
            this.childCommands = [];  // Will hold dependent commands
        }

        // Set during init/play
        this.originalShape = null;
        this.scaledShape = null;
        this.delegateCommand = null;
    }

    /**
     * Initialize - look up original shape(s) and store references
     * @returns {Promise}
     */
    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('scale'));
            err.expressionId = this.expressionId;
            throw err;
        }

        if (typeof this.graphExpression.getGrapher !== 'function') {
            const varName = this.graphExpression.variableName || 'first argument';
            const err = new Error(common_error_messages.INVALID_GRAPH_TYPE(varName));
            err.expressionId = this.expressionId;
            throw err;
        }

        this.graphContainer = this.graphExpression.getGrapher();
        if (!this.graphContainer) {
            const varName = this.graphExpression.variableName || 'graph';
            const err = new Error(common_error_messages.GRAPH_NOT_INITIALIZED(varName));
            err.expressionId = this.expressionId;
            throw err;
        }

        if (this.isMultiShape) {
            // Multi-shape mode: validate all original shapes exist
            for (const shapeData of this.shapeDataArray) {
                const shape = this.commandContext.shapeRegistry[shapeData.originalShapeVarName];
                if (!shape) {
                    throw new Error(`ScaleCommand: original shape '${shapeData.originalShapeVarName}' not found in registry`);
                }
            }
        } else {
            // Single shape mode: look up original shape from registry
            this.originalShape = this.commandContext.shapeRegistry[this.originalShapeVarName];
            if (!this.originalShape) {
                throw new Error(`ScaleCommand: original shape '${this.originalShapeVarName}' not found in registry`);
            }
        }
    }

    /**
     * Extract style options from original shape's styleObj
     * @returns {Object} Style options for delegate commands
     * @private
     */
    _getStyleOptionsFromOriginal() {
        if (!this.originalShape || !this.originalShape.styleObj) {
            return {};
        }
        const s = this.originalShape.styleObj;
        const options = {
            stroke: s.stroke,
            strokeWidth: s['stroke-width'],
            fill: s.fill,
            fillOpacity: s['fill-opacity']
        };
        // Include radius for point shapes
        if (this.originalShape.pointRadius !== undefined) {
            options.radius = this.originalShape.pointRadius;
        }
        return options;
    }

    /**
     * Create delegate command based on shape type
     * @returns {BaseCommand}
     * @private
     */
    _createDelegateCommand() {
        const styleOptions = this._getStyleOptionsFromOriginal();

        // Vector types need VectorCommand (they return LINE geometry type but need arrowheads)
        if (this.options.isVectorType) {
            return new VectorCommand(this.graphExpression, this.scaledData.start, this.scaledData.end, styleOptions);
        }

        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return new PointCommand(this.graphExpression, this.scaledData.point, styleOptions);
            case GEOMETRY_TYPES.LINE:
                return new LineCommand(this.graphExpression, this.scaledData.start, this.scaledData.end, styleOptions);
            case GEOMETRY_TYPES.CIRCLE:
                return new CircleCommand(this.graphExpression, this.scaledData.center, this.scaledData.radius, styleOptions);
            case GEOMETRY_TYPES.POLYGON:
                return new PolygonCommand(this.graphExpression, this.scaledData.vertices, styleOptions);
            default:
                throw new Error(`ScaleCommand: unsupported geometry type '${this.originalShapeType}'`);
        }
    }

    /**
     * Create a child ScaleCommand for a single shape (used in multi-shape mode)
     * @param {Object} shapeData - Shape data from shapeDataArray
     * @returns {ScaleCommand}
     * @private
     */
    _createChildCommand(shapeData) {
        return new ScaleCommand(
            this.graphExpression,
            shapeData.originalShapeVarName,
            shapeData.scaledData,
            shapeData.originalShapeName,
            shapeData.originalShapeType,
            this.scaleFactor,
            this.center,
            { ...this.options, isVectorType: shapeData.isVectorType }
        );
    }

    /**
     * Supported geometry types for scaling
     */
    static SUPPORTED_TYPES = new Set([
        GEOMETRY_TYPES.POINT,
        GEOMETRY_TYPES.LINE,
        GEOMETRY_TYPES.CIRCLE,
        GEOMETRY_TYPES.POLYGON
    ]);

    /**
     * Create and initialize commands for dependents using pre-computed data
     * @returns {Promise}
     * @private
     */
    async _createAndPlayDependentCommands() {
        this.childCommands = [];

        for (const { label, scaledData, originalShapeName, originalShapeType, isVectorType } of this.dependentScaledData) {
            // Create ScaleCommand for this dependent using pre-computed data
            const childCmd = new ScaleCommand(
                this.graphExpression,
                label,
                scaledData,
                originalShapeName,
                originalShapeType,
                this.scaleFactor,
                this.center,
                { ...this.options, isVectorType }
            );
            childCmd.diagram2d = this.diagram2d;
            await childCmd.init(this.commandContext);

            this.childCommands.push(childCmd);
        }
    }

    /**
     * Play animation - create shape(s), then play scale effect(s)
     * @returns {Promise}
     */
    async play() {
        if (this.isMultiShape) {
            // Multi-shape mode: create child commands and play in parallel
            this.childCommands = this.shapeDataArray.map(shapeData => {
                const cmd = this._createChildCommand(shapeData);
                cmd.diagram2d = this.diagram2d;
                return cmd;
            });

            // Initialize all child commands
            await Promise.all(this.childCommands.map(cmd => cmd.init(this.commandContext)));

            // Disable pen during parallel animation
            const wasPenActive = RoboEventManager.isPenActive();
            RoboEventManager.setPenActive(false);
            try {
                // Play all in parallel
                await Promise.all(this.childCommands.map(cmd => cmd.play()));
            } finally {
                RoboEventManager.setPenActive(wasPenActive);
            }

            // Collect results as ShapeCollection
            this.commandResult = new ShapeCollection(
                this.childCommands.map(cmd => cmd.commandResult)
            );
            return;
        }

        // Single shape mode: create delegate command for main shape
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        // Use original shape's stroke color, fallback to command color
        const originalStroke = this.originalShape?.styleObj?.stroke;
        this.delegateCommand.setColor(originalStroke || this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }
        await this.delegateCommand.init(this.commandContext);

        this.scaledShape = this.delegateCommand.commandResult;
        this.commandResult = this.scaledShape;

        // Hide scaled shape, will be shown by scale animation
        this.scaledShape.hide();

        // If we have dependents, create commands for them
        if (this.dependentScaledData && this.dependentScaledData.length > 0) {
            await this._createAndPlayDependentCommands();

            // Disable pen during parallel animation
            const wasPenActive = RoboEventManager.isPenActive();
            RoboEventManager.setPenActive(false);
            try {
                // Play main shape effect and all dependent commands in parallel
                const mainEffect = new ScaleEffect(this.originalShape, this.scaledShape, this.scaleFactor, this.center);
                await Promise.all([
                    mainEffect.play(),
                    ...this.childCommands.map(cmd => cmd.play())
                ]);
            } finally {
                RoboEventManager.setPenActive(wasPenActive);
            }

            // Collect results as ShapeCollection
            const allShapes = [this.scaledShape, ...this.childCommands.map(cmd => cmd.commandResult)];
            this.commandResult = new ShapeCollection(allShapes);
        } else {
            // No dependents - just play the scale effect
            const effect = new ScaleEffect(this.originalShape, this.scaledShape, this.scaleFactor, this.center);
            await effect.play();
        }
    }

    /**
     * Direct play (no animation) - use delegate command to create and show scaled shape(s)
     * @returns {Promise}
     */
    async directPlay() {
        if (this.isMultiShape) {
            // Multi-shape mode: create and direct-play child commands
            this.childCommands = this.shapeDataArray.map(shapeData => {
                const cmd = this._createChildCommand(shapeData);
                cmd.diagram2d = this.diagram2d;
                return cmd;
            });

            // Initialize and direct-play all child commands
            for (const cmd of this.childCommands) {
                await cmd.init(this.commandContext);
                await cmd.directPlay();
            }

            // Collect results as ShapeCollection
            this.commandResult = new ShapeCollection(
                this.childCommands.map(cmd => cmd.commandResult)
            );
            return;
        }

        // Single shape mode
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        // Use original shape's stroke color, fallback to command color
        const originalStroke = this.originalShape?.styleObj?.stroke;
        this.delegateCommand.setColor(originalStroke || this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }

        await this.delegateCommand.init(this.commandContext);
        await this.delegateCommand.directPlay();

        this.scaledShape = this.delegateCommand.commandResult;
        this.commandResult = this.scaledShape;

        // If we have dependents, create and direct-play them
        if (this.dependentScaledData && this.dependentScaledData.length > 0) {
            await this._createAndPlayDependentCommands();
            for (const cmd of this.childCommands) {
                await cmd.directPlay();
            }

            // Collect results as ShapeCollection
            const allShapes = [this.scaledShape, ...this.childCommands.map(cmd => cmd.commandResult)];
            this.commandResult = new ShapeCollection(allShapes);
        }
    }

    /**
     * Replay animation on existing shape(s)
     * @returns {Promise}
     */
    async playSingle() {
        if (this.isMultiShape) {
            // Multi-shape mode: replay all child commands in parallel
            if (!this.childCommands || this.childCommands.length === 0) {
                await this.play();
                return;
            }
            const wasPenActive = RoboEventManager.isPenActive();
            RoboEventManager.setPenActive(false);
            try {
                await Promise.all(this.childCommands.map(cmd => cmd.playSingle()));
            } finally {
                RoboEventManager.setPenActive(wasPenActive);
            }
            return;
        }

        // Single shape mode
        if (!this.scaledShape) {
            await this.play();
            return;
        }

        this.scaledShape.hide();

        // If we have dependents, replay them in parallel
        if (this.childCommands && this.childCommands.length > 0) {
            // Hide all dependent shapes
            for (const cmd of this.childCommands) {
                if (cmd.scaledShape) {
                    cmd.scaledShape.hide();
                }
            }

            const wasPenActive = RoboEventManager.isPenActive();
            RoboEventManager.setPenActive(false);
            try {
                const mainEffect = new ScaleEffect(this.originalShape, this.scaledShape, this.scaleFactor, this.center);
                await Promise.all([
                    mainEffect.play(),
                    ...this.childCommands.map(cmd => cmd.playSingle())
                ]);
            } finally {
                RoboEventManager.setPenActive(wasPenActive);
            }
        } else {
            // No dependents - just play the scale effect
            const effect = new ScaleEffect(this.originalShape, this.scaledShape, this.scaleFactor, this.center);
            await effect.play();
        }
    }

    /**
     * Get label position based on shape type
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        if (this.isMultiShape) {
            // For multi-shape, return position of first shape
            if (this.childCommands && this.childCommands.length > 0) {
                return this.childCommands[0].getLabelPosition();
            }
            return { x: 0, y: 0 };
        }

        switch (this.originalShapeName) {
            case 'point':
                return this.scaledData.point;
            case 'line':
            case 'vector':
                // Midpoint of line
                return {
                    x: (this.scaledData.start.x + this.scaledData.end.x) / 2,
                    y: (this.scaledData.start.y + this.scaledData.end.y) / 2
                };
            case 'circle':
                return this.scaledData.center;
            case 'polygon':
                // Centroid
                const verts = this.scaledData.vertices;
                const n = verts.length - 1; // Exclude closing point
                const sumX = verts.slice(0, n).reduce((s, v) => s + v.x, 0);
                const sumY = verts.slice(0, n).reduce((s, v) => s + v.y, 0);
                return { x: sumX / n, y: sumY / n };
            default:
                return { x: 0, y: 0 };
        }
    }

    /**
     * Clear the command and child commands
     */
    clear() {
        if (this.childCommands && this.childCommands.length > 0) {
            for (const cmd of this.childCommands) {
                cmd.clear();
            }
        }
        // Reset state so playSingle works correctly after clear
        this.childCommands = [];
        this.originalShape = null;
        this.scaledShape = null;
        this.delegateCommand = null;
        super.clear();
    }
}
