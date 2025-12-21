/**
 * ScaleCommand - Command for rendering a scaled shape
 *
 * Uses delegate commands (PointCommand, LineCommand, etc.) to create shapes.
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

export class ScaleCommand extends BaseCommand {
    /**
     * Create a scale command
     * @param {Object} graphExpression - The graph expression
     * @param {string} originalShapeVarName - Variable name of original shape (for registry lookup)
     * @param {Object} scaledData - Computed scaled coordinates
     * @param {string} originalShapeName - Original shape name ('point', 'line', 'vector', etc.)
     * @param {string} originalShapeType - GEOMETRY_TYPES value
     * @param {number} scaleFactor - Scale factor
     * @param {Object} center - Scale center {x, y}
     * @param {Object} options - Additional options
     */
    constructor(graphExpression, originalShapeVarName, scaledData, originalShapeName, originalShapeType, scaleFactor, center, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.originalShapeVarName = originalShapeVarName;
        this.scaledData = scaledData;
        this.originalShapeName = originalShapeName;
        this.originalShapeType = originalShapeType;
        this.scaleFactor = scaleFactor;
        this.center = center;
        this.options = options;

        // Set during init/play
        this.originalShape = null;
        this.scaledShape = null;
        this.delegateCommand = null;
    }

    /**
     * Initialize - look up original shape and store references
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

        // Look up original shape from registry - required for scale animation
        this.originalShape = this.commandContext.shapeRegistry[this.originalShapeVarName];
        if (!this.originalShape) {
            throw new Error(`ScaleCommand: original shape '${this.originalShapeVarName}' not found in registry`);
        }
    }

    /**
     * Create delegate command based on shape type
     * @returns {BaseCommand}
     * @private
     */
    _createDelegateCommand() {
        switch (this.originalShapeName) {
            case 'point':
                return new PointCommand(this.graphExpression, this.scaledData.point);
            case 'line':
                return new LineCommand(this.graphExpression, this.scaledData.start, this.scaledData.end);
            case 'vector':
                return new VectorCommand(this.graphExpression, this.scaledData.start, this.scaledData.end);
            case 'circle':
                return new CircleCommand(this.graphExpression, this.scaledData.center, this.scaledData.radius);
            case 'polygon':
                return new PolygonCommand(this.graphExpression, this.scaledData.vertices);
            default:
                throw new Error(`ScaleCommand: unsupported shape type '${this.originalShapeName}'`);
        }
    }

    /**
     * Play animation - create shape, then play scale effect
     * @returns {Promise}
     */
    async play() {
        // Create scaled shape via delegate command
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
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
     * Direct play (no animation) - use delegate command to create and show scaled shape
     * @returns {Promise}
     */
    async directPlay() {
        // Create scaled shape via delegate command
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }

        await this.delegateCommand.init(this.commandContext);

        this.scaledShape = this.delegateCommand.commandResult;
        this.commandResult = this.scaledShape;
    }

    /**
     * Replay animation on existing shape
     * @returns {Promise}
     */
    async playSingle() {
        // Hide scaled shape and replay animation
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
}
