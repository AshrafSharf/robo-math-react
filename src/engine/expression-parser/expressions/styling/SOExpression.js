/**
 * SOExpression - Stroke Opacity styling expression
 *
 * Syntax: so(0.5), so(1)
 * Value should be between 0 (transparent) and 1 (opaque)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class SOExpression extends AbstractNonArithmeticExpression {
    static NAME = 'so';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.strokeOpacityValue = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('so() requires an opacity value: so(0.5)');
        }

        const opacityExpr = this.subExpressions[0];
        opacityExpr.resolve(context);

        const values = opacityExpr.getVariableAtomicValues();
        if (values.length > 0 && typeof values[0] === 'number') {
            this.strokeOpacityValue = Math.max(0, Math.min(1, values[0]));
        } else {
            this.dispatchError('so() requires a numeric opacity value (0-1)');
        }
    }

    getName() {
        return SOExpression.NAME;
    }

    getStrokeOpacityValue() {
        return this.strokeOpacityValue;
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
