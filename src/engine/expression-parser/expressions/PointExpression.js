/**
 * Point expression - represents a 2D point
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { NumericExpression } from './NumericExpression.js';
import { PointCommand } from '../../commands/PointCommand.js';

export class PointExpression extends AbstractArithmeticExpression {
    static NAME = 'point';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.point = { x: 0, y: 0 };
    }

    resolve(context) {
        const coordinates = [];

        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);

            const resultExpression = this.subExpressions[i];
            const atomicValues = resultExpression.getVariableAtomicValues();

            for (let j = 0; j < atomicValues.length; j++) {
                coordinates.push(atomicValues[j]);
            }
        }

        if (coordinates.length !== 2) {
            this.dispatchError('Point expression must have two coordinates');
        }

        this.point = { x: coordinates[0], y: coordinates[1] };
    }

    getName() {
        return PointExpression.NAME;
    }

    getPoint() {
        return this.point;
    }

    add(otherExpression) {
        const otherVal = this.extractPointValue('add', otherExpression);
        const resultantPt = {
            x: this.point.x + otherVal.x,
            y: this.point.y + otherVal.y
        };

        const numericExpression1 = new NumericExpression(resultantPt.x);
        const numericExpression2 = new NumericExpression(resultantPt.y);
        return this.resolvedPointExpression(numericExpression1, numericExpression2);
    }

    subtract(otherExpression) {
        const otherVal = this.extractPointValue('subtract', otherExpression);
        const resultantPt = {
            x: this.point.x - otherVal.x,
            y: this.point.y - otherVal.y
        };

        const numericExpression1 = new NumericExpression(resultantPt.x);
        const numericExpression2 = new NumericExpression(resultantPt.y);
        return this.resolvedPointExpression(numericExpression1, numericExpression2);
    }

    divide(otherExpression) {
        if (otherExpression.getVariableAtomicValues().length > 1) {
            this.dispatchError('Point can only be divided by a scalar');
        }

        const divisor = otherExpression.getVariableAtomicValues()[0];
        const resultPt = {
            x: this.point.x / divisor,
            y: this.point.y / divisor
        };

        const numericExpression1 = new NumericExpression(resultPt.x);
        const numericExpression2 = new NumericExpression(resultPt.y);

        return this.resolvedPointExpression(numericExpression1, numericExpression2);
    }

    multiply(otherExpression) {
        if (otherExpression.getVariableAtomicValues().length > 1) {
            this.dispatchError('Point can only be multiplied by a scalar');
        }

        const scaleBy = otherExpression.getVariableAtomicValues()[0];
        const resultPt = {
            x: this.point.x * scaleBy,
            y: this.point.y * scaleBy
        };

        const numericExpression1 = new NumericExpression(resultPt.x);
        const numericExpression2 = new NumericExpression(resultPt.y);

        return this.resolvedPointExpression(numericExpression1, numericExpression2);
    }

    power(otherExpression) {
        this.dispatchError('Power for Point not supported');
        return null;
    }

    resolvedPointExpression(numericExpression1, numericExpression2) {
        const newResolvedPointExpression = new PointExpression([numericExpression1, numericExpression2]);
        newResolvedPointExpression.point = {
            x: numericExpression1.getNumericValue(),
            y: numericExpression2.getNumericValue()
        };
        return newResolvedPointExpression;
    }

    extractPointValue(operName, otherExpression) {
        const coordinates = [];
        const atomicValues = otherExpression.getVariableAtomicValues();

        for (let j = 0; j < atomicValues.length; j++) {
            coordinates.push(atomicValues[j]);
        }

        if (coordinates.length !== 2) {
            throw new Error(`To ${operName} the Expression must have 2 coordinate values`);
        }

        return { x: coordinates[0], y: coordinates[1] };
    }

    getVariableAtomicValues() {
        const pt = this.getPoint();
        return [pt.x, pt.y];
    }

    getFriendlyToStr() {
        const pt = this.getPoint();
        return `(${pt.x},${pt.y})`;
    }

    /**
     * Create a PointCommand from this expression
     * @param {Object} options - Command options {radius}
     * @returns {PointCommand}
     */
    toCommand(options = {}) {
        return new PointCommand(this.getPoint(), options);
    }
}
