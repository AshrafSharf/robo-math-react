/**
 * RotateCommand - Command for rendering a rotated shape
 *
 * Uses delegate commands (PointCommand, LineCommand, etc.) to create shapes.
 * For animated mode: creates shape without animation, then plays RotateEffect.
 * For static mode: delegate command creates and shows shape normally.
 */
import { BaseCommand } from './BaseCommand.js';
import { PointCommand } from './PointCommand.js';
import { LineCommand } from './LineCommand.js';
import { VectorCommand } from './VectorCommand.js';
import { CircleCommand } from './CircleCommand.js';
import { PolygonCommand } from './PolygonCommand.js';
import { RotateEffect } from '../../effects/rotate-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class RotateCommand extends BaseCommand {
    /**
     * Create a rotate command
     * @param {Object} graphExpression - The graph expression
     * @param {string} originalShapeVarName - Variable name of original shape (for registry lookup)
     * @param {Object} rotatedData - Computed rotated coordinates
     * @param {string} originalShapeName - Original shape name ('point', 'line', 'vec', etc.)
     * @param {string} originalShapeType - GEOMETRY_TYPES value
     * @param {number} angle - Rotation angle in degrees
     * @param {Object} center - Rotation center {x, y}
     * @param {Object} options - Additional options
     */
    constructor(graphExpression, originalShapeVarName, rotatedData, originalShapeName, originalShapeType, angle, center, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.originalShapeVarName = originalShapeVarName;
        this.rotatedData = rotatedData;
        this.originalShapeName = originalShapeName;
        this.originalShapeType = originalShapeType;
        this.angle = angle;
        this.center = center;
        this.options = options;

        // Set during init/play
        this.originalShape = null;
        this.rotatedShape = null;
        this.delegateCommand = null;
    }

    /**
     * Initialize - look up original shape and store references
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

        // Look up original shape from registry - required for rotation animation
        this.originalShape = this.commandContext.shapeRegistry[this.originalShapeVarName];
        if (!this.originalShape) {
            throw new Error(`RotateCommand: original shape '${this.originalShapeVarName}' not found in registry`);
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
                return new PointCommand(this.graphExpression, this.rotatedData.point);
            case 'line':
                return new LineCommand(this.graphExpression, this.rotatedData.start, this.rotatedData.end);
            case 'vec':
                return new VectorCommand(this.graphExpression, this.rotatedData.start, this.rotatedData.end);
            case 'circle':
                return new CircleCommand(this.graphExpression, this.rotatedData.center, this.rotatedData.radius);
            case 'polygon':
                return new PolygonCommand(this.graphExpression, this.rotatedData.vertices);
            default:
                throw new Error(`RotateCommand: unsupported shape type '${this.originalShapeName}'`);
        }
    }

    /**
     * Play animation - create shape, then play rotation effect
     * @returns {Promise}
     */
    async play() {
        // Create rotated shape via delegate command
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }
        await this.delegateCommand.init(this.commandContext);

        this.rotatedShape = this.delegateCommand.commandResult;
        this.commandResult = this.rotatedShape;

        // Hide rotated shape, will be shown by rotation animation
        this.rotatedShape.hide();

        // Play rotation effect with model-space center
        // RotateEffect animates in model space and regenerates paths, so no view conversion needed
        const effect = new RotateEffect(this.originalShape, this.rotatedShape, this.angle, this.center);
        await effect.play();
    }

    /**
     * Direct play (no animation) - use delegate command to create and show rotated shape
     * @returns {Promise}
     */
    async directPlay() {
        // Create rotated shape via delegate command
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }

        await this.delegateCommand.init(this.commandContext);

        this.rotatedShape = this.delegateCommand.commandResult;
        this.commandResult = this.rotatedShape;
    }

    /**
     * Replay animation on existing shape
     * @returns {Promise}
     */
    async playSingle() {
        // Hide rotated shape and replay animation
        this.rotatedShape.hide();

        // Play rotation effect with model-space center
        const effect = new RotateEffect(this.originalShape, this.rotatedShape, this.angle, this.center);
        return effect.play();
    }

    /**
     * Get label position based on shape type
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        switch (this.originalShapeName) {
            case 'point':
                return this.rotatedData.point;
            case 'line':
            case 'vec':
                // Midpoint of line
                return {
                    x: (this.rotatedData.start.x + this.rotatedData.end.x) / 2,
                    y: (this.rotatedData.start.y + this.rotatedData.end.y) / 2
                };
            case 'circle':
                return this.rotatedData.center;
            case 'polygon':
                // Centroid
                const verts = this.rotatedData.vertices;
                const n = verts.length - 1; // Exclude closing point
                const sumX = verts.slice(0, n).reduce((s, v) => s + v.x, 0);
                const sumY = verts.slice(0, n).reduce((s, v) => s + v.y, 0);
                return { x: sumX / n, y: sumY / n };
            default:
                return { x: 0, y: 0 };
        }
    }
}
