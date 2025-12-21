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
    constructor(graphExpression, originalShapeVarNameOrArray, scaledDataOrFactor, originalShapeNameOrCenter, originalShapeType, scaleFactor, center, options = {}) {
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

            // Single shape fields not used
            this.originalShapeVarName = null;
            this.scaledData = null;
            this.originalShapeName = null;
            this.originalShapeType = null;

            // Multi-shape tracking
            this.childCommands = [];
        } else {
            // Single shape mode: constructor(graphExpression, varName, data, name, type, factor, center, options)
            this.isMultiShape = false;
            this.originalShapeVarName = originalShapeVarNameOrArray;
            this.scaledData = scaledDataOrFactor;
            this.originalShapeName = originalShapeNameOrCenter;
            this.originalShapeType = originalShapeType;
            this.scaleFactor = scaleFactor;
            this.center = center;
            this.options = options;

            // Multi-shape fields not used
            this.shapeDataArray = null;
            this.childCommands = null;
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
        return {
            stroke: s.stroke,
            strokeWidth: s['stroke-width'],
            fill: s.fill,
            fillOpacity: s['fill-opacity']
        };
    }

    /**
     * Create delegate command based on shape type
     * @returns {BaseCommand}
     * @private
     */
    _createDelegateCommand() {
        const styleOptions = this._getStyleOptionsFromOriginal();

        switch (this.originalShapeName) {
            case 'point':
                return new PointCommand(this.graphExpression, this.scaledData.point, styleOptions);
            case 'line':
                return new LineCommand(this.graphExpression, this.scaledData.start, this.scaledData.end, styleOptions);
            case 'vector':
                return new VectorCommand(this.graphExpression, this.scaledData.start, this.scaledData.end, styleOptions);
            case 'circle':
                return new CircleCommand(this.graphExpression, this.scaledData.center, this.scaledData.radius, styleOptions);
            case 'polygon':
                return new PolygonCommand(this.graphExpression, this.scaledData.vertices, styleOptions);
            default:
                throw new Error(`ScaleCommand: unsupported shape type '${this.originalShapeName}'`);
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
            this.options
        );
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

        // Single shape mode: existing behavior
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

        // Play scale effect with model-space center
        // ScaleEffect animates in model space and regenerates paths, so no view conversion needed
        const effect = new ScaleEffect(this.originalShape, this.scaledShape, this.scaleFactor, this.center);
        await effect.play();
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

        // Single shape mode: existing behavior
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
    }

    /**
     * Replay animation on existing shape(s)
     * @returns {Promise}
     */
    async playSingle() {
        if (this.isMultiShape) {
            // Multi-shape mode: replay all child commands in parallel
            const wasPenActive = RoboEventManager.isPenActive();
            RoboEventManager.setPenActive(false);
            try {
                await Promise.all(this.childCommands.map(cmd => cmd.playSingle()));
            } finally {
                RoboEventManager.setPenActive(wasPenActive);
            }
            return;
        }

        // Single shape mode: existing behavior
        this.scaledShape.hide();

        // Play scale effect with model-space center
        const effect = new ScaleEffect(this.originalShape, this.scaledShape, this.scaleFactor, this.center);
        return effect.play();
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
        if (this.isMultiShape && this.childCommands) {
            for (const cmd of this.childCommands) {
                cmd.clear();
            }
        }
        super.clear();
    }
}
