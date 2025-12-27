/**
 * MidExpression - calculates the midpoint/center based on input type
 *
 * Syntax:
 *   mid(graph, point1, point2)  - midpoint between two points
 *   mid(graph, line)            - midpoint of a line/arc/vector
 *   mid(graph, circle)          - center of a circle
 *   mid(graph, polygon)         - incenter for triangle, centroid for other polygons
 *
 * Returns two coordinate values (x, y). When used standalone, renders as a point.
 *
 * Examples:
 *   A = point(g, 0, 0)
 *   B = point(g, 4, 4)
 *   mid(g, A, B)              // midpoint at (2, 2)
 *   L = line(g, 0, 0, 6, 6)
 *   mid(g, L)                 // midpoint at (3, 3)
 *   C = circle(g, 2, 3, 4)
 *   mid(g, C)                 // center at (3, 4)
 *   T = polygon(g, 0, 0, 4, 0, 2, 3)
 *   mid(g, T)                 // incenter of triangle
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { PointCommand } from '../../commands/PointCommand.js';
import { GeomUtil } from '../../../geom/GeomUtil.js';
import { TriangleUtil } from '../../../geom/TriangleUtil.js';

export class MidExpression extends AbstractArithmeticExpression {
    static NAME = 'mid';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x, y]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('mid() requires at least graph and one argument: mid(graph, shape) or mid(graph, p1, p2)');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('mid() requires graph as first argument');
        }

        if (this.subExpressions.length === 2) {
            // mid(graph, shape) - behavior depends on shape type
            const sourceExpr = this._getResolvedExpression(context, this.subExpressions[1]);
            const shapeName = sourceExpr.getName();

            if (shapeName === 'circle') {
                // Circle: return center
                const values = sourceExpr.getVariableAtomicValues(); // [cx, cy, radius]
                this.coordinates = [values[0], values[1]];

            } else if (shapeName === 'arc') {
                // Arc: return center of the arc's circle
                // Arc stores [startX, startY, endX, endY, rx, ry] or similar
                // For now, return midpoint of arc endpoints
                const startVal = sourceExpr.getStartValue ? sourceExpr.getStartValue() : sourceExpr.getVariableAtomicValues().slice(0, 2);
                const endVal = sourceExpr.getEndValue ? sourceExpr.getEndValue() : sourceExpr.getVariableAtomicValues().slice(2, 4);
                const midpoint = GeomUtil.getMidpoint(
                    { x: startVal[0], y: startVal[1] },
                    { x: endVal[0], y: endVal[1] }
                );
                this.coordinates = [midpoint.x, midpoint.y];

            } else if (shapeName === 'polygon') {
                // Polygon: check if triangle (3 vertices)
                const values = sourceExpr.getVariableAtomicValues();
                const vertices = this._getVertices(values);

                if (vertices.length === 3 || (vertices.length === 4 && this._isClosed(vertices))) {
                    // Triangle: return incenter
                    const v = vertices.length === 4 ? vertices.slice(0, 3) : vertices;
                    const incenter = TriangleUtil.incenter(v[0], v[1], v[2]);
                    this.coordinates = [incenter.x, incenter.y];
                } else {
                    // Other polygon: return centroid
                    const centroid = this._calculateCentroid(vertices);
                    this.coordinates = [centroid.x, centroid.y];
                }

            } else {
                // Line, vector, or other shape with start/end: return midpoint
                const startVal = sourceExpr.getStartValue ? sourceExpr.getStartValue() : sourceExpr.getVariableAtomicValues().slice(0, 2);
                const endVal = sourceExpr.getEndValue ? sourceExpr.getEndValue() : sourceExpr.getVariableAtomicValues().slice(2, 4);

                if (startVal.length < 2 || endVal.length < 2) {
                    this.dispatchError('mid() requires an expression with at least 2 coordinate values');
                }

                const midpoint = GeomUtil.getMidpoint(
                    { x: startVal[0], y: startVal[1] },
                    { x: endVal[0], y: endVal[1] }
                );
                this.coordinates = [midpoint.x, midpoint.y];
            }

        } else if (this.subExpressions.length >= 3) {
            // mid(graph, p1, p2) - midpoint between two points
            const p1Expr = this._getResolvedExpression(context, this.subExpressions[1]);
            const p2Expr = this._getResolvedExpression(context, this.subExpressions[2]);

            const p1Values = p1Expr.getVariableAtomicValues();
            const p2Values = p2Expr.getVariableAtomicValues();

            if (p1Values.length < 2 || p2Values.length < 2) {
                this.dispatchError('mid() requires point expressions with x, y coordinates');
            }

            const midpoint = GeomUtil.getMidpoint(
                { x: p1Values[0], y: p1Values[1] },
                { x: p2Values[0], y: p2Values[1] }
            );
            this.coordinates = [midpoint.x, midpoint.y];
        }
    }

    /**
     * Convert flat coordinate array to vertex objects
     */
    _getVertices(coords) {
        const vertices = [];
        for (let i = 0; i < coords.length; i += 2) {
            vertices.push({ x: coords[i], y: coords[i + 1] });
        }
        return vertices;
    }

    /**
     * Check if polygon is closed (first vertex == last vertex)
     */
    _isClosed(vertices) {
        if (vertices.length < 2) return false;
        const first = vertices[0];
        const last = vertices[vertices.length - 1];
        return Math.abs(first.x - last.x) < 1e-10 && Math.abs(first.y - last.y) < 1e-10;
    }

    /**
     * Calculate centroid of a polygon
     */
    _calculateCentroid(vertices) {
        // Remove closing vertex if present
        const verts = this._isClosed(vertices) ? vertices.slice(0, -1) : vertices;

        let sumX = 0;
        let sumY = 0;
        for (const v of verts) {
            sumX += v.x;
            sumY += v.y;
        }

        return {
            x: sumX / verts.length,
            y: sumY / verts.length
        };
    }

    getName() {
        return MidExpression.NAME;
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    getStartValue() {
        return this.coordinates.slice();
    }

    getEndValue() {
        return this.coordinates.slice();
    }

    getPoint() {
        return { x: this.coordinates[0], y: this.coordinates[1] };
    }

    getFriendlyToStr() {
        return `mid(${this.coordinates[0]}, ${this.coordinates[1]})`;
    }

    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        return new PointCommand(this.graphExpression, this.getPoint(), mergedOptions);
    }

    canPlay() {
        return true;
    }
}
