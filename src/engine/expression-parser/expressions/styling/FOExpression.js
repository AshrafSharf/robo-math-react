/**
 * FOExpression - Fill Opacity styling expression
 *
 * Syntax: fo(0.5), fo(1)
 * Value should be between 0 (transparent) and 1 (opaque)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class FOExpression extends AbstractNonArithmeticExpression {
    static NAME = 'fo';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.fillOpacityValue = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('fo() requires an opacity value: fo(0.5)');
        }

        const opacityExpr = this.subExpressions[0];
        opacityExpr.resolve(context);

        const values = opacityExpr.getVariableAtomicValues();
        if (values.length > 0 && typeof values[0] === 'number') {
            this.fillOpacityValue = Math.max(0, Math.min(1, values[0]));
        } else {
            this.dispatchError('fo() requires a numeric opacity value (0-1)');
        }
    }

    getName() {
        return FOExpression.NAME;
    }

    getFillOpacityValue() {
        return this.fillOpacityValue;
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
