/**
 * TranslateCommand - Command for rendering a translated shape
 *
 * Uses delegate commands (PointCommand, LineCommand, etc.) to create shapes.
 * For animated mode: creates shape without animation, then plays TranslateEffect.
 * For static mode: delegate command creates and shows shape normally.
 */
import { BaseCommand } from './BaseCommand.js';
import { PointCommand } from './PointCommand.js';
import { LineCommand } from './LineCommand.js';
import { VectorCommand } from './VectorCommand.js';
import { CircleCommand } from './CircleCommand.js';
import { PolygonCommand } from './PolygonCommand.js';
import { TranslateEffect } from '../../effects/translate-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class TranslateCommand extends BaseCommand {
    /**
     * Create a translate command
     * @param {Object} graphExpression - The graph expression
     * @param {string} originalShapeVarName - Variable name of original shape (for registry lookup)
     * @param {Object} translatedData - Computed translated coordinates
     * @param {string} originalShapeName - Original shape name ('point', 'line', 'vec', etc.)
     * @param {string} originalShapeType - GEOMETRY_TYPES value
     * @param {number} dx - Translation in x direction
     * @param {number} dy - Translation in y direction
     * @param {Object} options - Additional options
     */
    constructor(graphExpression, originalShapeVarName, translatedData, originalShapeName, originalShapeType, dx, dy, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.originalShapeVarName = originalShapeVarName;
        this.translatedData = translatedData;
        this.originalShapeName = originalShapeName;
        this.originalShapeType = originalShapeType;
        this.dx = dx;
        this.dy = dy;
        this.options = options;

        // Set during init/play
        this.originalShape = null;
        this.translatedShape = null;
        this.delegateCommand = null;
    }

    /**
     * Initialize - look up original shape and store references
     * @returns {Promise}
     */
    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('translate'));
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

        // Look up original shape from registry - required for translation animation
        this.originalShape = this.commandContext.shapeRegistry[this.originalShapeVarName];
        if (!this.originalShape) {
            throw new Error(`TranslateCommand: original shape '${this.originalShapeVarName}' not found in registry`);
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
                return new PointCommand(this.graphExpression, this.translatedData.point);
            case 'line':
                return new LineCommand(this.graphExpression, this.translatedData.start, this.translatedData.end);
            case 'vec':
                return new VectorCommand(this.graphExpression, this.translatedData.start, this.translatedData.end);
            case 'circle':
                return new CircleCommand(this.graphExpression, this.translatedData.center, this.translatedData.radius);
            case 'polygon':
                return new PolygonCommand(this.graphExpression, this.translatedData.vertices);
            default:
                throw new Error(`TranslateCommand: unsupported shape type '${this.originalShapeName}'`);
        }
    }

    /**
     * Play animation - create shape, then play translation effect
     * @returns {Promise}
     */
    async play() {
        // Create translated shape via delegate command
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }
        await this.delegateCommand.init(this.commandContext);

        this.translatedShape = this.delegateCommand.commandResult;
        this.commandResult = this.translatedShape;

        // Hide translated shape, will be shown by translation animation
        this.translatedShape.hide();

        // Play translation effect with model-space dx, dy
        const effect = new TranslateEffect(this.originalShape, this.translatedShape, this.dx, this.dy);
        await effect.play();
    }

    /**
     * Direct play (no animation) - use delegate command to create and show translated shape
     * @returns {Promise}
     */
    async directPlay() {
        // Create translated shape via delegate command
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }

        await this.delegateCommand.init(this.commandContext);

        this.translatedShape = this.delegateCommand.commandResult;
        this.commandResult = this.translatedShape;
    }

    /**
     * Replay animation on existing shape
     * @returns {Promise}
     */
    async playSingle() {
        // Hide translated shape and replay animation
        this.translatedShape.hide();

        // Play translation effect with model-space dx, dy
        const effect = new TranslateEffect(this.originalShape, this.translatedShape, this.dx, this.dy);
        return effect.play();
    }

    /**
     * Get label position based on shape type
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        switch (this.originalShapeName) {
            case 'point':
                return this.translatedData.point;
            case 'line':
            case 'vec':
                // Midpoint of line
                return {
                    x: (this.translatedData.start.x + this.translatedData.end.x) / 2,
                    y: (this.translatedData.start.y + this.translatedData.end.y) / 2
                };
            case 'circle':
                return this.translatedData.center;
            case 'polygon':
                // Centroid
                const verts = this.translatedData.vertices;
                const n = verts.length - 1; // Exclude closing point
                const sumX = verts.slice(0, n).reduce((s, v) => s + v.x, 0);
                const sumY = verts.slice(0, n).reduce((s, v) => s + v.y, 0);
                return { x: sumX / n, y: sumY / n };
            default:
                return { x: 0, y: 0 };
        }
    }
}
