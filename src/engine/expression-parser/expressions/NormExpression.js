/**
 * NormExpression - calculates normalized direction (unit vector)
 *
 * Syntax:
 *   norm(line)        - normalized direction of line/vector
 *   norm(p1, p2)      - normalized direction from p1 to p2
 *   norm(x, y)        - normalized direction of (x, y)
 *
 * Returns direction values [dx, dy] where dx² + dy² = 1.
 * Cannot be played standalone - it's just a calculation.
 *
 * Examples:
 *   L = line(g, 0, 0, 3, 4)
 *   norm(L)                    // returns (0.6, 0.8)
 *   norm(A, B)                 // normalized direction from A to B
 *   norm(3, 4)                 // returns (0.6, 0.8)
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';

export class NormExpression extends AbstractArithmeticExpression {
    static NAME = 'norm';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.direction = [0, 0]; // [dx, dy] normalized
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('norm() requires at least one argument');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        let dx, dy;

        if (this.subExpressions.length === 1) {
            // norm(line/vector)
            const sourceExpr = this._getResolvedExpression(context, this.subExpressions[0]);
            const result = this._getDirectionFromShape(sourceExpr);
            dx = result.dx;
            dy = result.dy;
        } else if (this.subExpressions.length >= 2) {
            // norm(p1, p2) or norm(x, y)
            const arg1 = this._getResolvedExpression(context, this.subExpressions[0]);
            const arg2 = this._getResolvedExpression(context, this.subExpressions[1]);
            const result = this._getDirectionFromArgs(arg1, arg2);
            dx = result.dx;
            dy = result.dy;
        }

        // Normalize
        const mag = Math.sqrt(dx * dx + dy * dy);
        if (mag < 1e-10) {
            this.dispatchError('norm() cannot compute unit vector of zero-magnitude vector');
        }

        this.direction = [dx / mag, dy / mag];
    }

    _getDirectionFromShape(sourceExpr) {
        const values = sourceExpr.getVariableAtomicValues();

        if (values.length >= 4) {
            // Has start and end points
            const startVal = sourceExpr.getStartValue ? sourceExpr.getStartValue() : values.slice(0, 2);
            const endVal = sourceExpr.getEndValue ? sourceExpr.getEndValue() : values.slice(2, 4);
            return {
                dx: endVal[0] - startVal[0],
                dy: endVal[1] - startVal[1]
            };
        } else if (values.length >= 2) {
            // Treat as vector (x, y)
            return { dx: values[0], dy: values[1] };
        }

        this.dispatchError('norm() requires an expression with coordinates');
    }

    _getDirectionFromArgs(arg1, arg2) {
        const values1 = arg1.getVariableAtomicValues();
        const values2 = arg2.getVariableAtomicValues();

        if (values1.length >= 2 && values2.length >= 2) {
            // Two points - direction from p1 to p2
            return {
                dx: values2[0] - values1[0],
                dy: values2[1] - values1[1]
            };
        } else if (values1.length === 1 && values2.length === 1) {
            // Two numbers - treat as vector (x, y)
            return { dx: values1[0], dy: values2[0] };
        }

        this.dispatchError('norm() arguments must be points or numbers');
    }

    getName() {
        return NormExpression.NAME;
    }

    getVariableAtomicValues() {
        return this.direction.slice();
    }

    getDirection() {
        return { x: this.direction[0], y: this.direction[1] };
    }

    getFriendlyToStr() {
        return `norm(${this.direction[0].toFixed(4)}, ${this.direction[1].toFixed(4)})`;
    }

    // norm() doesn't create a command - it's just a calculation
    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
