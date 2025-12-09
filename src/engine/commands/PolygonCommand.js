/**
 * PolygonCommand - Command for rendering a polygon
 *
 * Creates a polygon shape via diagram.polygon()
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';

export class PolygonCommand extends BaseCommand {
    /**
     * Create a polygon command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Array<{x: number, y: number}>} vertices - Array of vertex positions
     * @param {Object} options - Additional options {strokeWidth, fill}
     */
    constructor(graphExpression, vertices, options = {}) {
        super();
        this.graphExpression = graphExpression; // Resolved at init time
        this.graphContainer = null; // Set at init time
        this.vertices = vertices; // [{x, y}, ...]
        this.strokeWidth = options.strokeWidth || null;
        this.fill = options.fill || null;
    }

    /**
     * Create polygon shape via diagram
     * @returns {Promise}
     */
    async doInit() {
        const { diagram } = this.commandContext;

        // Resolve grapher from expression at init time (after g2d command has run)
        if (!this.graphExpression) {
            const err = new Error('Polygon requires a graph container as first argument. Use: polygon(g, point1, point2, point3, ...)');
            err.expressionId = this.expressionId;
            throw err;
        }

        if (typeof this.graphExpression.getGrapher !== 'function') {
            const err = new Error('First argument must be a graph variable (from g2d)');
            err.expressionId = this.expressionId;
            throw err;
        }

        this.graphContainer = this.graphExpression.getGrapher();
        if (!this.graphContainer) {
            const err = new Error('Graph container not initialized. Ensure g2d() is called before polygon()');
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

        this.commandResult = await diagram.polygon(
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
