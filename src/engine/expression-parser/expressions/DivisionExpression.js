/**
 * Division expression
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';

export class DivisionExpression extends AbstractArithmeticExpression {
    constructor(lhsExpression, rhsExpression) {
        super();
        this.lhsExpression = lhsExpression;
        this.rhsExpression = rhsExpression;
    }

    resolve(context) {
        this.lhsExpression.resolve(context);
        this.rhsExpression.resolve(context);

        
        this.resultantExpression = this.lhsExpression.divide(this.rhsExpression);
    }

    getName() {
        return '/';
    }
}
