/**
 * YPointExpression - extracts the y coordinate from a point expression
 *
 * Syntax: y(point) or y(pointVariable)
 * Returns a single numeric value that can be used in arithmetic operations.
 *
 * Examples:
 *   P = point(3, 5)
 *   y(P)           // returns 5
 *   y(P) * 2       // returns 10 (arithmetic supported)
 *   y(point(7, 9)) // returns 9 (inline point)
 */
import { XPointExpression } from './XPointExpression.js';

export class YPointExpression extends XPointExpression {
    static NAME = 'y';

    constructor(subExpressions) {
        super(subExpressions);
    }

    /**
     * Override to extract y coordinate (index 1)
     */
    assignValue(coordinates) {
        this.value = coordinates[1];
    }

    getName() {
        return YPointExpression.NAME;
    }

    /**
     * Get friendly string representation
     */
    getFriendlyToStr() {
        return `y = ${this.value}`;
    }
}
