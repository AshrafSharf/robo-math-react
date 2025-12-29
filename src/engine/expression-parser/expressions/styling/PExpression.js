/**
 * PExpression - Precision styling expression for tables
 *
 * Syntax: p(2), p(4) - number of decimal places
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class PExpression extends AbstractNonArithmeticExpression {
    static NAME = 'p';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.precisionValue = 2;  // Default
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('p() requires a precision value: p(2)');
        }

        const precExpr = this.subExpressions[0];
        precExpr.resolve(context);

        const values = precExpr.getVariableAtomicValues();
        if (values.length > 0 && typeof values[0] === 'number') {
            this.precisionValue = Math.max(0, Math.floor(values[0]));
        } else {
            this.dispatchError('p() requires a numeric precision value');
        }
    }

    getName() {
        return PExpression.NAME;
    }

    getValue() {
        return this.precisionValue;
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
