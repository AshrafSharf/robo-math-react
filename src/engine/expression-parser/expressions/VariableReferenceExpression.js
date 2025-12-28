/**
 * Variable reference expression - references a variable stored in the context
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { NumericExpression } from './NumericExpression.js';
import { common_error_messages } from '../core/ErrorMessages.js';

/**
 * System constants - known at parse time, available for immediate arithmetic
 */
const SYSTEM_CONSTANTS = {
    pi: Math.PI,
    e: Math.E
};

export class VariableReferenceExpression extends AbstractNonArithmeticExpression {
    static NAME = 'variable';

    constructor(variableName) {
        super();
        this.variableName = variableName;
        this.variableValueExpression = null;

        // Pre-resolve system constants so arithmetic works immediately
        if (SYSTEM_CONSTANTS[variableName] !== undefined) {
            this.variableValueExpression = new NumericExpression(SYSTEM_CONSTANTS[variableName]);
        }
    }

    resolve(context) {
        this.variableValueExpression = context.getReference(this.variableName);
    }

    add(otherExpression) {
        if (this.getVariableAtomicValues().length >= 1) {
            return this.variableValueExpression.add(otherExpression);
        }
        return null;
    }

    subtract(otherExpression) {
        if (this.getVariableAtomicValues().length >= 1) {
            return this.variableValueExpression.subtract(otherExpression);
        }
        return null;
    }

    divide(otherExpression) {
        if (this.getVariableAtomicValues().length >= 1) {
            return this.variableValueExpression.divide(otherExpression);
        }
        return null;
    }

    multiply(otherExpression) {
        if (this.getVariableAtomicValues().length >= 1) {
            return this.variableValueExpression.multiply(otherExpression);
        }
        return null;
    }

    power(otherExpression) {
        const exponentValue = otherExpression.getVariableAtomicValues()[0];

        if (this.getVariableAtomicValues().length >= 4) {
            // This means the referred LHS is a line expression (4 coordinates)
            const atomicValues = this.getVariableAtomicValues();

            // Calculate vector length (distance formula)
            const dx = atomicValues[2] - atomicValues[0];
            const dy = atomicValues[3] - atomicValues[1];
            const base = Math.sqrt(dx * dx + dy * dy);

            const result = Math.pow(base, exponentValue);
            return new NumericExpression(result);
        }

        if (this.getVariableAtomicValues().length >= 1) {
            // Just plain numeric
            const base = this.getVariableAtomicValues()[0];
            const result = Math.pow(base, exponentValue);
            return new NumericExpression(result);
        }

        return null;
    }

    getName() {
        return VariableReferenceExpression.NAME;
    }

    getVariableAtomicValues() {
        if (!this.variableValueExpression) {
            this.dispatchError(common_error_messages.VARIABLE_NOT_FOUND(this.variableName));
        }
        return this.variableValueExpression.getVariableAtomicValues();
    }

    getVariableName() {
        return this.variableName;
    }

    getStartValue() {
        return this.variableValueExpression.getStartValue();
    }

    getEndValue() {
        return this.variableValueExpression.getEndValue();
    }

    /**
     * Delegate getGrapher to the underlying expression (for Graph2DExpression)
     */
    getGrapher() {
        if (this.variableValueExpression && typeof this.variableValueExpression.getGrapher === 'function') {
            return this.variableValueExpression.getGrapher();
        }
        return null;
    }
}
