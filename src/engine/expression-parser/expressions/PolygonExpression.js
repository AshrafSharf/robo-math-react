/**
 * Polygon expression - represents a 2D polygon
 *
 * Syntax options:
 *   polygon(graph, point1, point2, point3, ...) - graph with points
 *   polygon(graph, x1, y1, x2, y2, x3, y3, ...) - graph with coordinates
 *
 * Requires at least 3 points (6 coordinate values).
 * The polygon is auto-closed if the first and last points differ.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PolygonCommand } from '../../commands/PolygonCommand.js';
import { polygon_error_messages } from '../core/ErrorMessages.js';

export class PolygonExpression extends AbstractNonArithmeticExpression {
    static NAME = 'polygon';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2, x3, y3, ...]
        this.graphExpression = null; // Reference to graph expression
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(polygon_error_messages.MISSING_ARGS());
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(polygon_error_messages.GRAPH_REQUIRED());
        }

        // Remaining args are coordinates
        this.coordinates = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);

            const resultExpression = this.subExpressions[i];
            const atomicValues = resultExpression.getVariableAtomicValues();

            for (let j = 0; j < atomicValues.length; j++) {
                this.coordinates.push(atomicValues[j]);
            }
        }

        if (this.coordinates.length < 6) {
            this.dispatchError(polygon_error_messages.WRONG_COORD_COUNT(this.coordinates.length));
        }

        if (this.coordinates.length % 2 !== 0) {
            this.dispatchError(polygon_error_messages.ODD_COORDINATES(this.coordinates.length));
        }

        // Auto-close polygon if needed
        this.joinPointsIfRequired();
    }

    /**
     * Close the polygon if first and last points are not the same
     */
    joinPointsIfRequired() {
        const firstX = this.coordinates[0];
        const firstY = this.coordinates[1];
        const lastX = this.coordinates[this.coordinates.length - 2];
        const lastY = this.coordinates[this.coordinates.length - 1];

        // Already closed
        if (firstX === lastX && firstY === lastY) {
            return;
        }

        // Close the polygon
        this.coordinates.push(firstX);
        this.coordinates.push(firstY);
    }

    // getGrapher() inherited from AbstractNonArithmeticExpression

    getName() {
        return PolygonExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'polygon'
     */
    getGeometryType() {
        return 'polygon';
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    /**
     * Get vertices as array of point objects
     * @returns {Array<{x: number, y: number}>}
     */
    getVertices() {
        const vertices = [];
        for (let i = 0; i < this.coordinates.length; i += 2) {
            vertices.push({
                x: this.coordinates[i],
                y: this.coordinates[i + 1]
            });
        }
        return vertices;
    }

    /**
     * Get the number of sides (edges)
     * @returns {number}
     */
    getNumSides() {
        // Vertices include the closing point, so unique vertices = length/2 - 1
        return Math.floor(this.coordinates.length / 2) - 1;
    }

    /**
     * Get perimeter (sum of all edge lengths)
     * @returns {number}
     */
    getPerimeter() {
        const vertices = this.getVertices();
        let perimeter = 0;
        for (let i = 0; i < vertices.length - 1; i++) {
            const dx = vertices[i + 1].x - vertices[i].x;
            const dy = vertices[i + 1].y - vertices[i].y;
            perimeter += Math.sqrt(dx * dx + dy * dy);
        }
        return perimeter;
    }

    /**
     * Get centroid (center of mass) of the polygon
     * @returns {{x: number, y: number}}
     */
    getCentroid() {
        const vertices = this.getVertices();
        // Exclude the closing point for centroid calculation
        const n = vertices.length - 1;
        let sumX = 0;
        let sumY = 0;
        for (let i = 0; i < n; i++) {
            sumX += vertices[i].x;
            sumY += vertices[i].y;
        }
        return {
            x: sumX / n,
            y: sumY / n
        };
    }

    getStartValue() {
        return [this.coordinates[0], this.coordinates[1]];
    }

    getEndValue() {
        // Last unique point (before closing point)
        const len = this.coordinates.length;
        return [this.coordinates[len - 4], this.coordinates[len - 3]];
    }

    /**
     * Get friendly string representation
     */
    getFriendlyToStr() {
        const numSides = this.getNumSides();
        const vertices = this.getVertices();
        const vertexStr = vertices.slice(0, -1).map(v => `(${v.x}, ${v.y})`).join(', ');
        return `Polygon[${numSides} sides: ${vertexStr}]`;
    }

    /**
     * Create a PolygonCommand from this expression
     * @param {Object} options - Command options {strokeWidth, fill}
     * @returns {PolygonCommand}
     */
    toCommand(options = {}) {
        const vertices = this.getVertices();
        return new PolygonCommand(this.graphExpression, vertices, options);
    }

    /**
     * Polygons can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
