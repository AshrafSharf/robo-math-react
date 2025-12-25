/**
 * DistanceExpression - calculates distance/magnitude between points or length of shapes
 *
 * Syntax:
 *   distance(line)        - length of a line/vector/arc
 *   distance(p1, p2)      - distance between two points
 *   distance(x, y)        - magnitude of a vector (x, y)
 *
 * Returns a single numeric value. Cannot be played standalone.
 *
 * Examples:
 *   L = line(g, 0, 0, 3, 4)
 *   distance(L)                    // returns 5 (length of line)
 *   V = vector(g, 0, 0, 3, 4)
 *   distance(V)                    // returns 5 (length of vector)
 *   A = point(g, 0, 0)
 *   B = point(g, 6, 8)
 *   distance(A, B)                 // returns 10 (distance)
 *   distance(3, 4)                 // returns 5 (vector magnitude)
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { GeomUtil } from '../../../geom/GeomUtil.js';

export class DistanceExpression extends AbstractArithmeticExpression {
    static NAME = 'distance';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.value = 0;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('distance() requires at least one argument');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        if (this.subExpressions.length === 1) {
            // distance(line/vector) - get length of shape
            const sourceExpr = this._getResolvedExpression(context, this.subExpressions[0]);
            const values = sourceExpr.getVariableAtomicValues();

            if (values.length >= 4) {
                // Has start and end points (line, vector, etc.)
                const startVal = sourceExpr.getStartValue ? sourceExpr.getStartValue() : values.slice(0, 2);
                const endVal = sourceExpr.getEndValue ? sourceExpr.getEndValue() : values.slice(2, 4);

                this.value = GeomUtil.getMagnitude(
                    { x: startVal[0], y: startVal[1] },
                    { x: endVal[0], y: endVal[1] }
                );
            } else if (values.length >= 2) {
                // Treat as a vector (x, y) and get its magnitude
                this.value = Math.sqrt(values[0] * values[0] + values[1] * values[1]);
            } else if (values.length === 1) {
                // Just a number, return absolute value
                this.value = Math.abs(values[0]);
            } else {
                this.dispatchError('distance() requires an expression with coordinates');
            }

        } else if (this.subExpressions.length >= 2) {
            // distance(p1, p2) or distance(x, y)
            const arg1 = this._getResolvedExpression(context, this.subExpressions[0]);
            const arg2 = this._getResolvedExpression(context, this.subExpressions[1]);

            const values1 = arg1.getVariableAtomicValues();
            const values2 = arg2.getVariableAtomicValues();

            if (values1.length >= 2 && values2.length >= 2) {
                // Two points - calculate distance
                this.value = GeomUtil.getMagnitude(
                    { x: values1[0], y: values1[1] },
                    { x: values2[0], y: values2[1] }
                );
            } else if (values1.length === 1 && values2.length === 1) {
                // Two numbers - treat as vector (x, y)
                const x = values1[0];
                const y = values2[0];
                this.value = Math.sqrt(x * x + y * y);
            } else {
                this.dispatchError('distance() arguments must be points or numbers');
            }
        }
    }

    getName() {
        return DistanceExpression.NAME;
    }

    getVariableAtomicValues() {
        return [this.value];
    }

    getValue() {
        return this.value;
    }

    getFriendlyToStr() {
        return `distance(${this.value})`;
    }

    // distance() doesn't create a command - it's just a numeric value
    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
