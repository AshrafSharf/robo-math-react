/**
 * AxesExpression - Bundle axis ranges and grid options for g2d
 *
 * Syntax: axes(xRange, yRange), axes(xRange, yRange, grid)
 * Example: axes(range(-10,10), range(-5,5), grid(c(gray)))
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { RangeExpression } from './RangeExpression.js';
import { GridExpression } from './GridExpression.js';
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

export class AxesExpression extends AbstractNonArithmeticExpression {
    static NAME = 'axes';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.xRange = null;
        this.yRange = null;
        this.grid = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('axes() requires at least xRange and yRange');
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
                }
                rangeIndex++;
            } else if (expr instanceof GridExpression) {
                this.grid = expr;
            }
        }

        if (!this.xRange || !this.yRange) {
            this.dispatchError('axes() requires two range expressions for x and y axes');
        }
    }

    getName() {
        return AxesExpression.NAME;
    }

    getXRange() {
        return this.xRange;
    }

    getYRange() {
        return this.yRange;
    }

    getGrid() {
        return this.grid;
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
