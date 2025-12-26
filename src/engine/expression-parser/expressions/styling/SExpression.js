/**
 * SExpression - StrokeWidth styling expression
 *
 * Syntax: s(2), s(1.5)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class SExpression extends AbstractNonArithmeticExpression {
    static NAME = 's';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.strokeWidthValue = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('s() requires a stroke width value: s(2)');
        }

        const widthExpr = this.subExpressions[0];
        widthExpr.resolve(context);

        const values = widthExpr.getVariableAtomicValues();
        if (values.length > 0 && typeof values[0] === 'number') {
            this.strokeWidthValue = values[0];
        } else {
            this.dispatchError('s() requires a numeric stroke width');
        }
    }

    getName() {
        return SExpression.NAME;
    }

    getStrokeWidthValue() {
        return this.strokeWidthValue;
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
