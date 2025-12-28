/**
 * GridExpression - Grid styling configuration
 *
 * Syntax: grid(c(gray)), grid(c(gray), s(0.5))
 * Uses existing CExpression for color and SExpression for stroke width
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { CExpression } from './styling/CExpression.js';
import { SExpression } from './styling/SExpression.js';
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

export class GridExpression extends AbstractNonArithmeticExpression {
    static NAME = 'grid';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.color = null;
        this.strokeWidth = null;
    }

    resolve(context) {
        for (const exprRaw of this.subExpressions) {
            exprRaw.resolve(context);
            const expr = unwrapExpression(exprRaw);

            if (expr instanceof CExpression) {
                this.color = expr.getColorValue();
            } else if (expr instanceof SExpression) {
                this.strokeWidth = expr.getStrokeWidthValue();
            }
        }
    }

    getName() {
        return GridExpression.NAME;
    }

    getColor() {
        return this.color;
    }

    getStrokeWidth() {
        return this.strokeWidth;
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
