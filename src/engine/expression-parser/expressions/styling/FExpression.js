/**
 * FExpression - FontSize styling expression
 *
 * Syntax: f(24), f(35)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class FExpression extends AbstractNonArithmeticExpression {
    static NAME = 'f';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.fontSizeValue = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('f() requires a font size value: f(24)');
        }

        const sizeExpr = this.subExpressions[0];
        sizeExpr.resolve(context);

        const values = sizeExpr.getVariableAtomicValues();
        if (values.length > 0 && typeof values[0] === 'number') {
            this.fontSizeValue = values[0];
        } else {
            this.dispatchError('f() requires a numeric font size');
        }
    }

    getName() {
        return FExpression.NAME;
    }

    getFontSizeValue() {
        return this.fontSizeValue;
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
