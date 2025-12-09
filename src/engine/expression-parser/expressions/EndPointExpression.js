/**
 * EndPointExpression - extracts the end point from a line/arc/polygon expression
 *
 * Syntax options:
 *   ed(lineOrArcOrPolygon)       - uses grapher from the source expression
 *   ed(graph, lineOrArcOrPolygon) - uses explicit grapher
 *
 * Returns two coordinate values (x, y). When used standalone, renders as a point.
 *
 * Examples:
 *   L = line(g, 0, 0, 5, 5)
 *   ed(L)              // renders a point at (5, 5), uses g from L
 *   ed(g2, L)          // renders a point at (5, 5) on graph g2
 *   line(g, st(L1), ed(L2))  // ed() provides coordinates, doesn't render
 */
import { StartPointExpression } from './StartPointExpression.js';

export class EndPointExpression extends StartPointExpression {
    static NAME = 'ed';

    constructor(subExpressions) {
        super(subExpressions);
    }

    /**
     * Override to get end values instead of start values
     */
    getPointValues(resultExpression) {
        if (typeof resultExpression.getEndValue === 'function') {
            return resultExpression.getEndValue();
        }
        // Fallback to last two atomic values
        const atomicValues = resultExpression.getVariableAtomicValues();
        const len = atomicValues.length;
        return [atomicValues[len - 2], atomicValues[len - 1]];
    }

    getName() {
        return EndPointExpression.NAME;
    }

    /**
     * Get friendly string representation
     */
    getFriendlyToStr() {
        return `ed(${this.coordinates[0]}, ${this.coordinates[1]})`;
    }
}
