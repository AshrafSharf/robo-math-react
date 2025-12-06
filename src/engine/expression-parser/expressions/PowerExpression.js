/**
 * Power expression
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';

export class PowerExpression extends AbstractArithmeticExpression {
    constructor(lhsExpression, rhsExpression) {
        super();
        this.lhsExpression = lhsExpression;
        this.rhsExpression = rhsExpression;
    }

    resolve(context) {
        this.lhsExpression.resolve(context);
        this.rhsExpression.resolve(context);

        this.resultantExpression = this.lhsExpression.power(this.rhsExpression);
    }

    getName() {
        return '^';
    }
}
