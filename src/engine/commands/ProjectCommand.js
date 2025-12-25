/**
 * ProjectCommand - Command for rendering a projected point
 *
 * Uses PointCommand as delegate to create the projected point.
 * For animated mode: creates point without animation, then plays ProjectEffect.
 * For static mode: delegate command creates and shows point normally.
 */
import { BaseCommand } from './BaseCommand.js';
import { PointCommand } from './PointCommand.js';
import { ProjectEffect } from '../../effects/project-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class ProjectCommand extends BaseCommand {
    /**
     * Create a project command
     * @param {Object} graphExpression - The graph expression
     * @param {string} originalPointVarName - Variable name of original point (for registry lookup)
     * @param {Object} projectedPoint - Computed projected point {x, y}
     * @param {Object} linePoints - The line used for projection {start, end}
     * @param {Object} options - Additional options
     */
    constructor(graphExpression, originalPointVarName, projectedPoint, linePoints, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.originalPointVarName = originalPointVarName;
        this.projectedPoint = projectedPoint;
        this.linePoints = linePoints;
        this.options = options;

        // Set during init/play
        this.originalShape = null;
        this.projectedShape = null;
        this.delegateCommand = null;
    }

    /**
     * Initialize - look up original point and store references
     * @returns {Promise}
     */
    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('project'));
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

        // Look up original point from registry - required for projection animation
        this.originalShape = this.commandContext.shapeRegistry[this.originalPointVarName];
        if (!this.originalShape) {
            throw new Error(`ProjectCommand: original point '${this.originalPointVarName}' not found in registry`);
        }
    }

    /**
     * Get projected model coordinates array for animation
     * @returns {Array<number>}
     * @private
     */
    _getProjectedCoords() {
        return [this.projectedPoint.x, this.projectedPoint.y];
    }

    /**
     * Extract style options from original shape
     * @returns {Object} Style options for delegate command
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
     * Play animation - create point, then play projection effect
     * @returns {Promise}
     */
    async play() {
        // Create projected point via delegate command
        const styleOptions = this._getStyleOptionsFromOriginal();
        this.delegateCommand = new PointCommand(this.graphExpression, this.projectedPoint, styleOptions);
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }
        await this.delegateCommand.init(this.commandContext);

        this.projectedShape = this.delegateCommand.commandResult;
        this.commandResult = this.projectedShape;

        // Hide projected point, will be shown by projection animation
        this.projectedShape.hide();

        // Play projection effect
        const projectedCoords = this._getProjectedCoords();
        const effect = new ProjectEffect(this.originalShape, this.projectedShape, projectedCoords);
        await effect.play();
    }

    /**
     * Direct play (no animation) - use delegate command to create and show projected point
     * @returns {Promise}
     */
    async directPlay() {
        // Create projected point via delegate command
        const styleOptions = this._getStyleOptionsFromOriginal();
        this.delegateCommand = new PointCommand(this.graphExpression, this.projectedPoint, styleOptions);
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }

        await this.delegateCommand.init(this.commandContext);

        this.projectedShape = this.delegateCommand.commandResult;
        this.commandResult = this.projectedShape;
    }

    /**
     * Replay animation on existing shape
     * @returns {Promise}
     */
    async playSingle() {
        // Hide projected point and replay animation
        this.projectedShape.hide();

        // Play projection effect
        const projectedCoords = this._getProjectedCoords();
        const effect = new ProjectEffect(this.originalShape, this.projectedShape, projectedCoords);
        return effect.play();
    }

    /**
     * Get label position
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        return this.projectedPoint;
    }
}
