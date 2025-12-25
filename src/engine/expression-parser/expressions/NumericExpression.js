/**
 * Numeric expression - represents a numeric value
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';

export class NumericExpression extends AbstractArithmeticExpression {
    static NAME = 'number';

    constructor(value) {
        super();
        this.value = value;
    }

    resolve(context) {
        // This is already a number, can't do anything beyond that
    }

    getName() {
        return NumericExpression.NAME;
    }

    getNumericValue() {
        return this.value;
    }

    add(otherExpression) {
        const otherValues = otherExpression.getVariableAtomicValues();

        if (otherValues.length === 1) {
            return new NumericExpression(this.value + otherValues[0]);
        }

        if (otherValues.length === 2) {
            // This is a point
            const PointExpression = this.constructor.PointExpression;
            return new PointExpression([
                new NumericExpression(this.value + otherValues[0]),
                new NumericExpression(this.value + otherValues[1])
            ]);
        }

        throw new Error('Cannot perform addition with Non Numerical values');
    }

    subtract(otherExpression) {
        const otherValues = otherExpression.getVariableAtomicValues();

        if (otherValues.length === 1) {
            return new NumericExpression(this.value - otherValues[0]);
        }

        if (otherValues.length === 2) {
            // This is a point
            const PointExpression = this.constructor.PointExpression;
            return new PointExpression([
                new NumericExpression(this.value - otherValues[0]),
                new NumericExpression(this.value - otherValues[1])
            ]);
        }

        throw new Error('Cannot perform subtraction with Non Numerical values');
    }

    divide(otherExpression) {
        const otherValues = otherExpression.getVariableAtomicValues();

        if (otherValues.length === 1) {
            return new NumericExpression(this.value / otherValues[0]);
        }

        if (otherValues.length === 2) {
            // This is a point
            const PointExpression = this.constructor.PointExpression;
            return new PointExpression([
                new NumericExpression(this.value / otherValues[0]),
                new NumericExpression(this.value / otherValues[1])
            ]);
        }

        throw new Error('Cannot perform division with Non Numerical values');
    }

    multiply(otherExpression) {
        const otherValues = otherExpression.getVariableAtomicValues();

        if (otherValues.length === 1) {
            return new NumericExpression(this.value * otherValues[0]);
        }

        if (otherValues.length === 2) {
            // This is a point with 2 values
            const PointExpression = this.constructor.PointExpression;
            return new PointExpression([
                new NumericExpression(this.value * otherValues[0]),
                new NumericExpression(this.value * otherValues[1])
            ]);
        }

        // For vectors (4 values) or 3D vectors (6 values), delegate to their multiply
        if (otherValues.length === 4 || otherValues.length === 6) {
            return otherExpression.multiply(this);
        }

        throw new Error('Cannot perform multiplication with Non Numerical values');
    }

    getVariableAtomicValues() {
        return [this.getNumericValue()];
    }
}

// Static reference to be set later to avoid circular dependencies
NumericExpression.PointExpression = null;
