/**
 * ParametricPlotCommand - Command for rendering a parametric function plot
 *
 * Creates a parametric plot shape via diagram.parametricPlotFunction()
 * Accepts pre-compiled functions for both x(t) and y(t).
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class ParametricPlotCommand extends BaseCommand {
    /**
     * Create a parametric plot command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Function} compiledXFunction - Pre-compiled x(t) function
     * @param {Function} compiledYFunction - Pre-compiled y(t) function
     * @param {number} tMin - Minimum t value
     * @param {number} tMax - Maximum t value
     * @param {string} xEquationString - Original x equation string for display/debugging
     * @param {string} yEquationString - Original y equation string for display/debugging
     * @param {Object} options - Additional options {strokeWidth, samples}
     */
    constructor(graphExpression, compiledXFunction, compiledYFunction, tMin = 0, tMax = 2 * Math.PI, xEquationString = '', yEquationString = '', options = {}) {
        super();
        this.graphExpression = graphExpression; // Resolved at init time
        this.graphContainer = null; // Set at init time
        this.compiledXFunction = compiledXFunction;  // Pre-compiled x(t) function
        this.compiledYFunction = compiledYFunction;  // Pre-compiled y(t) function
        this.xEquation = xEquationString;  // Keep for display/debugging
        this.yEquation = yEquationString;  // Keep for display/debugging
        this.tMin = tMin;
        this.tMax = tMax;
        this.strokeWidth = options.strokeWidth ?? 2;
        this.samples = options.samples || null;
        // Apply color from expression style options
        if (options.color) {
            this.setColor(options.color);
        }
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

        options.strokeWidth = this.strokeWidth;
        if (this.samples) {
            options.samples = this.samples;
        }

        // Use parametricPlotFunction with pre-compiled functions
        this.commandResult = this.diagram2d.parametricPlotFunction(
            this.graphContainer,
            this.compiledXFunction,
            this.compiledYFunction,
            this.tMin,
            this.tMax,
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
