/**
 * EndPointExpression - extracts the end point from a shape expression
 *
 * Syntax:
 *   end(graph, shape) - graph with source expression
 *
 * Supported shapes: line, vector, circle, arc, polygon (via PointAtRatioAdapter)
 *
 * Returns two coordinate values (x, y). When used standalone, renders as a point.
 * Uses PointAtRatioAdapter with ratio=1 for consistent behavior across all shapes.
 *
 * Examples:
 *   L = line(g, 0, 0, 5, 5)
 *   end(g, L)              // renders a point at (5, 5)
 *   end(g, arc(g, ...))    // end point of arc (ratio 1)
 *   line(g, start(g, L1), end(g, L2))  // end() provides coordinates
 */
import { StartPointExpression } from './StartPointExpression.js';

export class EndPointExpression extends StartPointExpression {
    static NAME = 'end';

    constructor(subExpressions) {
        super(subExpressions);
    }

    /**
     * Override to return ratio 1 (end point)
     */
    getRatio() {
        return 1;
    }

    getName() {
        return EndPointExpression.NAME;
    }

    /**
     * Get friendly string representation
     */
    getFriendlyToStr() {
        return `end(${this.coordinates[0]}, ${this.coordinates[1]})`;
    }
}
