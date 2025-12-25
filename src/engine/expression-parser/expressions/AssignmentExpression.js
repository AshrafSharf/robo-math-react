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

        const variableExp = this.lhsExpression;
        const variableName = variableExp.getVariableName();

        // Set label on RHS before resolving (for dependency traversal)
        if (typeof this.rhsExpression.setLabel === 'function') {
            this.rhsExpression.setLabel(variableName);
        }

        this.rhsExpression.resolve(context);
        context.addReference(variableName, this.rhsExpression);
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

    /**
     * Assignment expressions can play if their RHS expression can play.
     * @returns {boolean}
     */
    canPlay() {
        return this.rhsExpression && typeof this.rhsExpression.canPlay === 'function'
            ? this.rhsExpression.canPlay()
            : false;
    }
}
