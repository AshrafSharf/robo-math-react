/**
 * VectorCommand - Command for rendering a vector (arrow)
 *
 * Creates a vector shape via diagram.vector()
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class VectorCommand extends BaseCommand {
    /**
     * Create a vector command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} startPoint - Start position {x, y}
     * @param {Object} endPoint - End position {x, y}
     * @param {Object} options - Additional options {strokeWidth}
     */
    constructor(graphExpression, startPoint, endPoint, options = {}) {
        super();
        this.graphExpression = graphExpression; // Resolved at init time
        this.graphContainer = null; // Set at init time
        this.startPoint = startPoint; // {x, y}
        this.endPoint = endPoint;     // {x, y}
        this.strokeWidth = options.strokeWidth || null;
    }

    /**
     * Create vector shape via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time (after g2d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('vec'));
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

        const options = {
            label: this.labelName
        };

        if (this.strokeWidth) {
            options.strokeWidth = this.strokeWidth;
        }

        this.commandResult = this.diagram2d.vector(
            this.graphContainer,
            this.startPoint,
            this.endPoint,
            this.color,
            options
        );
    }

    /**
     * Get label position at midpoint of vector
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        return {
            x: (this.startPoint.x + this.endPoint.x) / 2,
            y: (this.startPoint.y + this.endPoint.y) / 2
        };
    }

    /**
     * Get start point
     * @returns {{x: number, y: number}}
     */
    getStartPoint() {
        return this.startPoint;
    }

    /**
     * Get end point
     * @returns {{x: number, y: number}}
     */
    getEndPoint() {
        return this.endPoint;
    }

    /**
     * Get vector as direction (dx, dy)
     * @returns {{x: number, y: number}}
     */
    getDirection() {
        return {
            x: this.endPoint.x - this.startPoint.x,
            y: this.endPoint.y - this.startPoint.y
        };
    }

    /**
     * Get vector magnitude (length)
     * @returns {number}
     */
    getMagnitude() {
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Replay animation on existing shape
     * @returns {Promise}
     */
    async playSingle() {
        if (!this.commandResult) return;

        this.commandResult.hide();
        const effect = new MathShapeEffect(this.commandResult);
        return effect.play();
    }
}
