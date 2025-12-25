/**
 * ReflectCommand - Command for rendering a reflected shape
 *
 * Uses delegate commands (PointCommand, LineCommand, etc.) to create shapes.
 * For animated mode: creates shape without animation, then plays ReflectEffect.
 * For static mode: delegate command creates and shows shape normally.
 */
import { BaseCommand } from './BaseCommand.js';
import { PointCommand } from './PointCommand.js';
import { LineCommand } from './LineCommand.js';
import { VectorCommand } from './VectorCommand.js';
import { CircleCommand } from './CircleCommand.js';
import { PolygonCommand } from './PolygonCommand.js';
import { ReflectEffect } from '../../effects/reflect-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class ReflectCommand extends BaseCommand {
    /**
     * Create a reflect command
     * @param {Object} graphExpression - The graph expression
     * @param {string} originalShapeVarName - Variable name of original shape (for registry lookup)
     * @param {Object} reflectedData - Computed reflected coordinates
     * @param {string} originalShapeName - Original shape name ('point', 'line', 'vector', etc.)
     * @param {string} originalShapeType - GEOMETRY_TYPES value
     * @param {Object} linePoints - The line used for reflection {start, end}
     * @param {Object} options - Additional options
     */
    constructor(graphExpression, originalShapeVarName, reflectedData, originalShapeName, originalShapeType, linePoints, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.originalShapeVarName = originalShapeVarName;
        this.reflectedData = reflectedData;
        this.originalShapeName = originalShapeName;
        this.originalShapeType = originalShapeType;
        this.linePoints = linePoints;
        this.options = options;

        // Set during init/play
        this.originalShape = null;
        this.reflectedShape = null;
        this.delegateCommand = null;
    }

    /**
     * Initialize - look up original shape and store references
     * @returns {Promise}
     */
    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('reflect'));
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

        // Look up original shape from registry - required for reflection animation
        this.originalShape = this.commandContext.shapeRegistry[this.originalShapeVarName];
        if (!this.originalShape) {
            throw new Error(`ReflectCommand: original shape '${this.originalShapeVarName}' not found in registry`);
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

        switch (this.originalShapeName) {
            case 'point':
                return new PointCommand(this.graphExpression, this.reflectedData.point, styleOptions);
            case 'line':
                return new LineCommand(this.graphExpression, this.reflectedData.start, this.reflectedData.end, styleOptions);
            case 'vector':
                return new VectorCommand(this.graphExpression, this.reflectedData.start, this.reflectedData.end, styleOptions);
            case 'circle':
                return new CircleCommand(this.graphExpression, this.reflectedData.center, this.reflectedData.radius, styleOptions);
            case 'polygon':
                return new PolygonCommand(this.graphExpression, this.reflectedData.vertices, styleOptions);
            default:
                throw new Error(`ReflectCommand: unsupported shape type '${this.originalShapeName}'`);
        }
    }

    /**
     * Get reflected model coordinates array for animation
     * @returns {Array<number>}
     * @private
     */
    _getReflectedCoords() {
        switch (this.originalShapeName) {
            case 'point':
                return [this.reflectedData.point.x, this.reflectedData.point.y];
            case 'line':
            case 'vector':
                return [
                    this.reflectedData.start.x, this.reflectedData.start.y,
                    this.reflectedData.end.x, this.reflectedData.end.y
                ];
            case 'circle':
                return [
                    this.reflectedData.center.x, this.reflectedData.center.y,
                    this.reflectedData.radius
                ];
            case 'polygon':
                return this.reflectedData.vertices.flatMap(v => [v.x, v.y]);
            default:
                return [];
        }
    }

    /**
     * Play animation - create shape, then play reflection effect
     * @returns {Promise}
     */
    async play() {
        // Create reflected shape via delegate command
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }
        await this.delegateCommand.init(this.commandContext);

        this.reflectedShape = this.delegateCommand.commandResult;
        this.commandResult = this.reflectedShape;

        // Hide reflected shape, will be shown by reflection animation
        this.reflectedShape.hide();

        // Play reflection effect
        const reflectedCoords = this._getReflectedCoords();
        const effect = new ReflectEffect(this.originalShape, this.reflectedShape, reflectedCoords);
        await effect.play();
    }

    /**
     * Direct play (no animation) - use delegate command to create and show reflected shape
     * @returns {Promise}
     */
    async directPlay() {
        // Create reflected shape via delegate command
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }

        await this.delegateCommand.init(this.commandContext);

        this.reflectedShape = this.delegateCommand.commandResult;
        this.commandResult = this.reflectedShape;
    }

    /**
     * Replay animation on existing shape
     * @returns {Promise}
     */
    async playSingle() {
        // Hide reflected shape and replay animation
        this.reflectedShape.hide();

        // Play reflection effect
        const reflectedCoords = this._getReflectedCoords();
        const effect = new ReflectEffect(this.originalShape, this.reflectedShape, reflectedCoords);
        return effect.play();
    }

    /**
     * Get label position based on shape type
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        switch (this.originalShapeName) {
            case 'point':
                return this.reflectedData.point;
            case 'line':
            case 'vector':
                // Midpoint of line
                return {
                    x: (this.reflectedData.start.x + this.reflectedData.end.x) / 2,
                    y: (this.reflectedData.start.y + this.reflectedData.end.y) / 2
                };
            case 'circle':
                return this.reflectedData.center;
            case 'polygon':
                // Centroid
                const verts = this.reflectedData.vertices;
                const n = verts.length - 1; // Exclude closing point
                const sumX = verts.slice(0, n).reduce((s, v) => s + v.x, 0);
                const sumY = verts.slice(0, n).reduce((s, v) => s + v.y, 0);
                return { x: sumX / n, y: sumY / n };
            default:
                return { x: 0, y: 0 };
        }
    }
}
