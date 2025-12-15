/**
 * ParametricPlotCommand - Command for rendering a parametric function plot
 *
 * Creates a parametric plot shape via diagram.parametricPlot()
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class ParametricPlotCommand extends BaseCommand {
    /**
     * Create a parametric plot command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {string} xEquation - The x(t) equation (e.g., "cos(t)", "r*cos(t)")
     * @param {string} yEquation - The y(t) equation (e.g., "sin(t)", "r*sin(t)")
     * @param {number} tMin - Minimum t value
     * @param {number} tMax - Maximum t value
     * @param {Object} scope - Variable values for math.js evaluation (e.g., {r: 5, a: 2})
     * @param {Object} options - Additional options {strokeWidth, samples}
     */
    constructor(graphExpression, xEquation, yEquation, tMin = 0, tMax = 2 * Math.PI, scope = {}, options = {}) {
        super();
        this.graphExpression = graphExpression; // Resolved at init time
        this.graphContainer = null; // Set at init time
        this.xEquation = xEquation;
        this.yEquation = yEquation;
        this.tMin = tMin;
        this.tMax = tMax;
        this.scope = scope;  // Variable scope for math.js
        this.strokeWidth = options.strokeWidth || null;
        this.samples = options.samples || null;
    }

    /**
     * Create parametric plot shape via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time (after g2d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('paraplot'));
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
        if (this.samples) {
            options.samples = this.samples;
        }

        this.commandResult = this.diagram2d.parametricPlot(
            this.graphContainer,
            this.xEquation,
            this.yEquation,
            this.tMin,
            this.tMax,
            this.scope,
            this.color,
            options
        );
    }

    /**
     * Get the x equation being plotted
     * @returns {string}
     */
    getXEquation() {
        return this.xEquation;
    }

    /**
     * Get the y equation being plotted
     * @returns {string}
     */
    getYEquation() {
        return this.yEquation;
    }

    /**
     * Get the t range
     * @returns {{min: number, max: number}}
     */
    getTRange() {
        return { min: this.tMin, max: this.tMax };
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
