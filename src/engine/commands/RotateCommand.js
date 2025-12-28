/**
 * RotateCommand - Command for rendering rotated shape(s)
 *
 * Supports two modes:
 * - Single shape: Uses delegate commands (PointCommand, LineCommand, etc.) to create shape.
 * - Multi-shape: Creates child RotateCommands and plays them in parallel.
 *
 * For animated mode: creates shape without animation, then plays RotateEffect.
 * For static mode: delegate command creates and shows shape normally.
 *
 * Dependency tracking: When dependentRotatedData is provided, creates RotateCommands
 * for each dependent using pre-computed rotated data.
 */
import { BaseCommand } from './BaseCommand.js';
import { PointCommand } from './PointCommand.js';
import { LineCommand } from './LineCommand.js';
import { VectorCommand } from './VectorCommand.js';
import { CircleCommand } from './CircleCommand.js';
import { PolygonCommand } from './PolygonCommand.js';
import { RotateEffect } from '../../effects/rotate-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';
import { ShapeCollection } from '../../geom/ShapeCollection.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';
import { GEOMETRY_TYPES } from '../expression-parser/expressions/IntersectExpression.js';

export class RotateCommand extends BaseCommand {
    /**
     * Create a rotate command
     *
     * Single shape mode:
     * @param {Object} graphExpression - The graph expression
     * @param {string} originalShapeVarName - Variable name of original shape (for registry lookup)
     * @param {Object} rotatedData - Computed rotated coordinates
     * @param {string} originalShapeName - Original shape name ('point', 'line', 'vector', etc.)
     * @param {string} originalShapeType - GEOMETRY_TYPES value
     * @param {number} angle - Rotation angle in degrees
     * @param {Object} center - Rotation center {x, y}
     * @param {Object} options - Additional options
     * @param {Array} dependentRotatedData - Pre-computed rotated data for dependents
     *
     * Multi-shape mode:
     * @param {Object} graphExpression - The graph expression
     * @param {Array} shapeDataArray - Array of shape data objects
     * @param {number} angle - Rotation angle in degrees
     * @param {Object} center - Rotation center {x, y}
     * @param {Object} options - Additional options with isMultiShape: true
     */
    constructor(graphExpression, originalShapeVarNameOrArray, rotatedDataOrAngle, originalShapeNameOrCenter, originalShapeType, angle, center, options = {}, dependentRotatedData = []) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;

        // Detect multi-shape mode from options
        if (typeof rotatedDataOrAngle === 'number' && typeof originalShapeNameOrCenter === 'object' && originalShapeNameOrCenter.x !== undefined) {
            // Multi-shape mode: constructor(graphExpression, shapeDataArray, angle, center, options)
            this.isMultiShape = true;
            this.shapeDataArray = originalShapeVarNameOrArray;  // Array of shape data
            this.angle = rotatedDataOrAngle;
            this.center = originalShapeNameOrCenter;
            this.options = originalShapeType || {};
            this.dependentRotatedData = [];

            // Single shape fields not used
            this.originalShapeVarName = null;
            this.rotatedData = null;
            this.originalShapeName = null;
            this.originalShapeType = null;

            // Multi-shape tracking
            this.childCommands = [];
        } else {
            // Single shape mode: constructor(graphExpression, varName, data, name, type, angle, center, options, dependentRotatedData)
            this.isMultiShape = false;
            this.originalShapeVarName = originalShapeVarNameOrArray;
            this.rotatedData = rotatedDataOrAngle;
            this.originalShapeName = originalShapeNameOrCenter;
            this.originalShapeType = originalShapeType;
            this.angle = angle;
            this.center = center;
            this.options = options;
            this.dependentRotatedData = dependentRotatedData;

            // Multi-shape fields not used
            this.shapeDataArray = null;
            this.childCommands = [];  // Will hold dependent commands
        }

        // Set during init/play
        this.originalShape = null;
        this.rotatedShape = null;
        this.delegateCommand = null;
    }

    /**
     * Initialize - look up original shape(s) and store references
     * @returns {Promise}
     */
    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('rotate'));
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
                    throw new Error(`RotateCommand: original shape '${shapeData.originalShapeVarName}' not found in registry`);
                }
            }
        } else {
            // Single shape mode: look up original shape from registry
            this.originalShape = this.commandContext.shapeRegistry[this.originalShapeVarName];
            if (!this.originalShape) {
                throw new Error(`RotateCommand: original shape '${this.originalShapeVarName}' not found in registry`);
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
            return new VectorCommand(this.graphExpression, this.rotatedData.start, this.rotatedData.end, styleOptions);
        }

        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return new PointCommand(this.graphExpression, this.rotatedData.point, styleOptions);
            case GEOMETRY_TYPES.LINE:
                return new LineCommand(this.graphExpression, this.rotatedData.start, this.rotatedData.end, styleOptions);
            case GEOMETRY_TYPES.CIRCLE:
                return new CircleCommand(this.graphExpression, this.rotatedData.center, this.rotatedData.radius, styleOptions);
            case GEOMETRY_TYPES.POLYGON:
                return new PolygonCommand(this.graphExpression, this.rotatedData.vertices, styleOptions);
            default:
                throw new Error(`RotateCommand: unsupported geometry type '${this.originalShapeType}'`);
        }
    }

    /**
     * Create a child RotateCommand for a single shape (used in multi-shape mode)
     * @param {Object} shapeData - Shape data from shapeDataArray
     * @returns {RotateCommand}
     * @private
     */
    _createChildCommand(shapeData) {
        return new RotateCommand(
            this.graphExpression,
            shapeData.originalShapeVarName,
            shapeData.rotatedData,
            shapeData.originalShapeName,
            shapeData.originalShapeType,
            this.angle,
            this.center,
            { ...this.options, isVectorType: shapeData.isVectorType }
        );
    }

    /**
     * Supported geometry types for rotation
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

        for (const { label, rotatedData, originalShapeName, originalShapeType, isVectorType } of this.dependentRotatedData) {
            // Create RotateCommand for this dependent using pre-computed data
            const childCmd = new RotateCommand(
                this.graphExpression,
                label,
                rotatedData,
                originalShapeName,
                originalShapeType,
                this.angle,
                this.center,
                { ...this.options, isVectorType }
            );
            childCmd.diagram2d = this.diagram2d;
            await childCmd.init(this.commandContext);

            this.childCommands.push(childCmd);
        }
    }

    /**
     * Play animation - create shape(s), then play rotation effect(s)
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
        const originalStroke = this.originalShape?.styleObj?.stroke;
        this.delegateCommand.setColor(originalStroke || this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }
        await this.delegateCommand.init(this.commandContext);

        this.rotatedShape = this.delegateCommand.commandResult;
        this.commandResult = this.rotatedShape;

        // Hide rotated shape, will be shown by rotation animation
        this.rotatedShape.hide();

        // If we have dependents, create commands for them
        if (this.dependentRotatedData && this.dependentRotatedData.length > 0) {
            await this._createAndPlayDependentCommands();

            // Disable pen during parallel animation
            const wasPenActive = RoboEventManager.isPenActive();
            RoboEventManager.setPenActive(false);
            try {
                // Play main shape effect and all dependent commands in parallel
                const mainEffect = new RotateEffect(this.originalShape, this.rotatedShape, this.angle, this.center);
                await Promise.all([
                    mainEffect.play(),
                    ...this.childCommands.map(cmd => cmd.play())
                ]);
            } finally {
                RoboEventManager.setPenActive(wasPenActive);
            }

            // Collect results as ShapeCollection
            const allShapes = [this.rotatedShape, ...this.childCommands.map(cmd => cmd.commandResult)];
            this.commandResult = new ShapeCollection(allShapes);
        } else {
            // No dependents - just play the rotation effect
            const effect = new RotateEffect(this.originalShape, this.rotatedShape, this.angle, this.center);
            await effect.play();
        }
    }

    /**
     * Direct play (no animation) - use delegate command to create and show rotated shape(s)
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
        const originalStroke = this.originalShape?.styleObj?.stroke;
        this.delegateCommand.setColor(originalStroke || this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }

        await this.delegateCommand.init(this.commandContext);
        await this.delegateCommand.directPlay();

        this.rotatedShape = this.delegateCommand.commandResult;
        this.commandResult = this.rotatedShape;

        // If we have dependents, create and direct-play them
        if (this.dependentRotatedData && this.dependentRotatedData.length > 0) {
            await this._createAndPlayDependentCommands();
            for (const cmd of this.childCommands) {
                await cmd.directPlay();
            }

            // Collect results as ShapeCollection
            const allShapes = [this.rotatedShape, ...this.childCommands.map(cmd => cmd.commandResult)];
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
        if (!this.rotatedShape) {
            await this.play();
            return;
        }

        this.rotatedShape.hide();

        // If we have dependents, replay them in parallel
        if (this.childCommands && this.childCommands.length > 0) {
            // Hide all dependent shapes
            for (const cmd of this.childCommands) {
                if (cmd.rotatedShape) {
                    cmd.rotatedShape.hide();
                }
            }

            const wasPenActive = RoboEventManager.isPenActive();
            RoboEventManager.setPenActive(false);
            try {
                const mainEffect = new RotateEffect(this.originalShape, this.rotatedShape, this.angle, this.center);
                await Promise.all([
                    mainEffect.play(),
                    ...this.childCommands.map(cmd => cmd.playSingle())
                ]);
            } finally {
                RoboEventManager.setPenActive(wasPenActive);
            }
        } else {
            // No dependents - just play the rotation effect
            const effect = new RotateEffect(this.originalShape, this.rotatedShape, this.angle, this.center);
            await effect.play();
        }
    }

    /**
     * Get label position based on shape type
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        if (this.isMultiShape) {
            if (this.childCommands && this.childCommands.length > 0) {
                return this.childCommands[0].getLabelPosition();
            }
            return { x: 0, y: 0 };
        }

        switch (this.originalShapeName) {
            case 'point':
                return this.rotatedData.point;
            case 'line':
            case 'vector':
                return {
                    x: (this.rotatedData.start.x + this.rotatedData.end.x) / 2,
                    y: (this.rotatedData.start.y + this.rotatedData.end.y) / 2
                };
            case 'circle':
                return this.rotatedData.center;
            case 'polygon':
                const verts = this.rotatedData.vertices;
                const n = verts.length - 1;
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
        this.rotatedShape = null;
        this.delegateCommand = null;
        super.clear();
    }
}
