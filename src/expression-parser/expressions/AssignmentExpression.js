/**
 * Assignment expression - assigns a value to a variable
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VariableReferenceExpression } from './VariableReferenceExpression.js';

export class AssignmentExpression extends AbstractNonArithmeticExpression {
    static NAME = 'assignment';

    constructor(lhsExpression, rhsExpression) {
        super();
        this.lhsExpression = lhsExpression;
        this.rhsExpression = rhsExpression;
    }

    resolve(context) {
        if (this.lhsExpression.getName() !== VariableReferenceExpression.NAME) {
            throw new Error('Left side of the variable must be a name');
        }

        // Don't call the lhs resolve, it is simply a string
        this.rhsExpression.resolve(context);

        const resRhs = this.rhsExpression;
        const variableExp = this.lhsExpression;
        const variableName = variableExp.getVariableName();

        context.addReference(variableName, resRhs);
    }

    alwaysExecute() {
        return this.rhsExpression.alwaysExecute();
    }

    getName() {
        return AssignmentExpression.NAME;
    }

    getComparableExpression() {
        return this.rhsExpression;
    }

    getLabel() {
        if (this.lhsExpression.getName() !== VariableReferenceExpression.NAME) {
            return '';
        }

        const variableReferenceExpression = this.lhsExpression;
        const labelName = variableReferenceExpression.getVariableName();

        return labelName;
    }
}
