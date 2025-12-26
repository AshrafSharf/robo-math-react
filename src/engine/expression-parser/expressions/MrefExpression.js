/**
 * MrefExpression - Returns circled number for equation references
 *
 * Syntax:
 *   mref(number)
 *
 * Example:
 *   write(8, 4, "From " + mref(1) + " we get " + mref(2))
 *   // Renders: "From ① we get ②"
 *
 * Returns the circled unicode number (①②③...) for use in string concatenation.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { getCircledNumber } from './MeqExpression.js';

export class MrefExpression extends AbstractNonArithmeticExpression {
    static NAME = 'mref';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.refNumber = null;
        this.circledValue = '';
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('mref() requires 1 argument: mref(number)');
        }

        // Resolve the number argument
        const numExpr = this.subExpressions[0];
        numExpr.resolve(context);

        const resolvedExpr = this._getResolvedExpression(context, numExpr);
        if (resolvedExpr) {
            const values = resolvedExpr.getVariableAtomicValues();
            if (values.length > 0) {
                this.refNumber = Math.floor(values[0]);  // Ensure integer
                this.circledValue = getCircledNumber(this.refNumber);
            } else {
                this.dispatchError('mref() argument must be a number');
            }
        } else {
            this.dispatchError('mref() argument must be a number');
        }
    }

    getName() {
        return MrefExpression.NAME;
    }

    /**
     * Returns the circled number string for string concatenation
     */
    getStringValue() {
        return this.circledValue;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        // mref is not directly playable, it's used in string concatenation
        return null;
    }

    canPlay() {
        return false;
    }
}
