/**
 * CircleCommand - Command for rendering a circle
 *
 * Creates a circle shape via diagram.circle()
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class CircleCommand extends BaseCommand {
    /**
     * Create a circle command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} center - Center position {x, y}
     * @param {number} radius - Circle radius
     * @param {Object} options - Additional options {strokeWidth, fill}
     */
    constructor(graphExpression, center, radius, options = {}) {
        super();
        this.graphExpression = graphExpression; // Resolved at init time
        this.graphContainer = null; // Set at init time
        this.center = center; // {x, y}
        this.radius = radius;
        this.strokeWidth = options.strokeWidth || null;
        this.fill = options.fill || null;
    }

    /**
     * Create circle shape via diagram
     * @returns {Promise}
     */
    async doInit() {
        const { diagram } = this.commandContext;

        // Resolve grapher from expression at init time (after g2d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('circle'));
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
        if (this.fill) {
            options.fill = this.fill;
        }

        this.commandResult = await diagram.circle(
            this.graphContainer,
            this.center,
            this.radius,
            this.color,
            options
        );
    }

    /**
     * Get label position at center of circle
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        return {
            x: this.center.x,
            y: this.center.y
        };
    }

    /**
     * Get center point
     * @returns {{x: number, y: number}}
     */
    getCenter() {
        return this.center;
    }

    /**
     * Get radius
     * @returns {number}
     */
    getRadius() {
        return this.radius;
    }

    /**
     * Get circle diameter
     * @returns {number}
     */
    getDiameter() {
        return this.radius * 2;
    }

    /**
     * Get circle circumference
     * @returns {number}
     */
    getCircumference() {
        return 2 * Math.PI * this.radius;
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
