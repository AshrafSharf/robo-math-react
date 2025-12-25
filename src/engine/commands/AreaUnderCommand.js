/**
 * AreaUnderCommand - Command for rendering the area under a plot curve
 *
 * Creates a filled polygon between the curve and the x-axis (y=0).
 */
import { BaseCommand } from './BaseCommand.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class AreaUnderCommand extends BaseCommand {
    /**
     * Create an area under command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Function} compiledFunction - Pre-compiled function f(x) => y
     * @param {number} xmin - Minimum x value for the area
     * @param {number} xmax - Maximum x value for the area
     * @param {string} fillColor - Fill color (default 'blue')
     * @param {number} fillOpacity - Fill opacity 0-1 (default 0.3)
     * @param {Object} options - Additional options
     */
    constructor(graphExpression, compiledFunction, xmin, xmax, fillColor = 'blue', fillOpacity = 0.3, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.compiledFunction = compiledFunction;
        this.xmin = xmin;
        this.xmax = xmax;
        this.fillColor = fillColor;
        this.fillOpacity = fillOpacity;
        this.samples = options.samples || 200;
    }

    /**
     * Create area polygon shape via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Clear any existing shape before creating new one
        this.clear();

        // Resolve grapher from expression
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('areaunder'));
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

        // Sample points from the function
        const vertices = this._generateVertices();

        const options = {
            label: this.labelName,
            fill: this.fillColor,
            fillOpacity: this.fillOpacity,
            strokeWidth: 0  // No stroke on the filled area
        };

        // Use polygon to draw the filled area
        this.commandResult = this.diagram2d.polygon(
            this.graphContainer,
            vertices,
            this.fillColor,  // stroke color (not visible with strokeWidth: 0)
            options
        );
    }

    /**
     * Generate polygon vertices for the area under the curve
     * @returns {Array<{x: number, y: number}>}
     */
    _generateVertices() {
        const vertices = [];
        const step = (this.xmax - this.xmin) / this.samples;

        // Start at baseline (xmin, 0)
        vertices.push({ x: this.xmin, y: 0 });

        // Sample points along the curve
        for (let x = this.xmin; x <= this.xmax; x += step) {
            const y = this.compiledFunction(x);
            if (isFinite(y)) {
                vertices.push({ x, y });
            }
        }

        // Make sure we include the endpoint
        const yEnd = this.compiledFunction(this.xmax);
        if (isFinite(yEnd)) {
            // Only add if not already added (floating point comparison)
            const lastVertex = vertices[vertices.length - 1];
            if (Math.abs(lastVertex.x - this.xmax) > 1e-10) {
                vertices.push({ x: this.xmax, y: yEnd });
            }
        }

        // End at baseline (xmax, 0)
        vertices.push({ x: this.xmax, y: 0 });

        // Close polygon back to start
        vertices.push({ x: this.xmin, y: 0 });

        return vertices;
    }

    /**
     * Get label position at center of the area
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        const midX = (this.xmin + this.xmax) / 2;
        const midY = this.compiledFunction(midX);
        return { x: midX, y: midY / 2 };
    }

    /**
     * Replay animation - clear old shape, recreate, then animate
     * @returns {Promise}
     */
    async playSingle() {
        // Clear old shape and recreate with current data
        await this.doInit();

        if (!this.commandResult) return;

        const shapeContainers = this.commandResult.getShapeContainers();
        if (!shapeContainers || shapeContainers.length === 0) return;

        return new Promise((resolve) => {
            shapeContainers.forEach(container => {
                const node = container.node;
                TweenMax.fromTo(node, 0.5,
                    { opacity: 0 },
                    { opacity: 1, ease: Power2.easeOut, onComplete: resolve }
                );
            });
        });
    }

    /**
     * Direct play - clear old shape, recreate, then show
     */
    doDirectPlay() {
        // doInit already called clear(), so shape is recreated fresh
        if (this.commandResult) {
            this.commandResult.renderEndState();
            this.commandResult.show();
        }
    }
}
