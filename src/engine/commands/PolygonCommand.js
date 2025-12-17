/**
 * PolygonCommand - Command for rendering a polygon
 *
 * Creates a polygon shape via diagram.polygon()
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class PolygonCommand extends BaseCommand {
    /**
     * Create a polygon command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Array<{x: number, y: number}>} vertices - Array of vertex positions
     * @param {Object} options - Additional options {strokeWidth, fill, fillOpacity}
     */
    constructor(graphExpression, vertices, options = {}) {
        super();
        this.graphExpression = graphExpression; // Resolved at init time
        this.graphContainer = null; // Set at init time
        this.vertices = vertices; // [{x, y}, ...]
        this.strokeWidth = options.strokeWidth ?? 2;
        this.fill = options.fill || null;
        this.fillOpacity = options.fillOpacity !== undefined ? options.fillOpacity : null;
    }

    /**
     * Create polygon shape via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time (after g2d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('polygon'));
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
        if (this.fill) {
            options.fill = this.fill;
        }
        if (this.fillOpacity !== null) {
            options.fillOpacity = this.fillOpacity;
        }

        this.commandResult = this.diagram2d.polygon(
            this.graphContainer,
            this.vertices,
            this.color,
            options
        );
    }

    /**
     * Get label position at centroid of polygon
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        return this.getCentroid();
    }

    /**
     * Get vertices
     * @returns {Array<{x: number, y: number}>}
     */
    getVertices() {
        return this.vertices;
    }

    /**
     * Get centroid (center of mass) of the polygon
     * @returns {{x: number, y: number}}
     */
    getCentroid() {
        // Exclude the closing point for centroid calculation
        const n = this.vertices.length - 1;
        let sumX = 0;
        let sumY = 0;
        for (let i = 0; i < n; i++) {
            sumX += this.vertices[i].x;
            sumY += this.vertices[i].y;
        }
        return {
            x: sumX / n,
            y: sumY / n
        };
    }

    /**
     * Get perimeter
     * @returns {number}
     */
    getPerimeter() {
        let perimeter = 0;
        for (let i = 0; i < this.vertices.length - 1; i++) {
            const dx = this.vertices[i + 1].x - this.vertices[i].x;
            const dy = this.vertices[i + 1].y - this.vertices[i].y;
            perimeter += Math.sqrt(dx * dx + dy * dy);
        }
        return perimeter;
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
