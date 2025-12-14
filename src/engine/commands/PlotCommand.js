/**
 * PlotCommand - Command for rendering a function plot
 *
 * Creates a plot shape via diagram.plot()
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class PlotCommand extends BaseCommand {
    /**
     * Create a plot command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {string} equation - The equation to plot (e.g., "x^2", "sin(x)")
     * @param {number} domainMin - Minimum x value (or null to use graph's xRange)
     * @param {number} domainMax - Maximum x value (or null to use graph's xRange)
     * @param {Object} scope - Variable values for math.js evaluation (e.g., {a: 10, b: 5})
     * @param {Object} options - Additional options {strokeWidth}
     */
    constructor(graphExpression, equation, domainMin = null, domainMax = null, scope = {}, options = {}) {
        super();
        this.graphExpression = graphExpression; // Resolved at init time
        this.graphContainer = null; // Set at init time
        this.equation = equation;
        this.domainMin = domainMin;
        this.domainMax = domainMax;
        this.scope = scope;  // Variable scope for math.js
        this.strokeWidth = options.strokeWidth || null;
    }

    /**
     * Create plot shape via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time (after g2d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('plot'));
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

        // Use graph's xRange if domain not specified
        let minX = this.domainMin;
        let maxX = this.domainMax;

        if (minX === null || maxX === null) {
            // Try to get xRange from graphContainer
            if (this.graphContainer && this.graphContainer.options) {
                const xRange = this.graphContainer.options.xRange || [-10, 10];
                if (minX === null) minX = xRange[0];
                if (maxX === null) maxX = xRange[1];
            } else {
                // Default fallback
                if (minX === null) minX = -10;
                if (maxX === null) maxX = 10;
            }
        }

        const options = {
            label: this.labelName
        };

        if (this.strokeWidth) {
            options.strokeWidth = this.strokeWidth;
        }

        this.commandResult = this.diagram2d.plot(
            this.graphContainer,
            this.equation,
            minX,
            maxX,
            this.scope,
            this.color,
            options
        );
    }

    /**
     * Get the equation being plotted
     * @returns {string}
     */
    getEquation() {
        return this.equation;
    }

    /**
     * Get the domain
     * @returns {{min: number, max: number}}
     */
    getDomain() {
        return { min: this.domainMin, max: this.domainMax };
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
