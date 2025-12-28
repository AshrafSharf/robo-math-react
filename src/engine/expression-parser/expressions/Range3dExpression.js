/**
 * Range3dExpression - Bundle 3 range expressions for x, y, z axes
 *
 * Syntax: range3d(xRange, yRange, zRange)
 *
 * Example:
 *   range3d(range(-10, 10), range(-10, 10), range(-5, 5))
 *   range3d(range(-2*pi, 2*pi, pi/4, "trig"), range(-10, 10), range(-5, 5))
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { RangeExpression } from './RangeExpression.js';
import { VariableReferenceExpression } from './VariableReferenceExpression.js';

/**
 * Unwrap a variable reference to get the underlying expression
 */
function unwrapExpression(expr) {
    if (expr instanceof VariableReferenceExpression) {
        return expr.variableValueExpression;
    }
    return expr;
}

export class Range3dExpression extends AbstractNonArithmeticExpression {
    static NAME = 'range3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.xRange = null;
        this.yRange = null;
        this.zRange = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('range3d() requires 3 range expressions: range3d(xRange, yRange, zRange)');
        }

        let rangeIndex = 0;
        for (const exprRaw of this.subExpressions) {
            exprRaw.resolve(context);
            const expr = unwrapExpression(exprRaw);

            if (expr instanceof RangeExpression) {
                if (rangeIndex === 0) {
                    this.xRange = expr;
                } else if (rangeIndex === 1) {
                    this.yRange = expr;
                } else if (rangeIndex === 2) {
                    this.zRange = expr;
                }
                rangeIndex++;
            }
        }

        if (!this.xRange || !this.yRange || !this.zRange) {
            this.dispatchError('range3d() requires exactly 3 range expressions for x, y, and z axes');
        }
    }

    getName() {
        return Range3dExpression.NAME;
    }

    getXRange() {
        return this.xRange;
    }

    getYRange() {
        return this.yRange;
    }

    getZRange() {
        return this.zRange;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
