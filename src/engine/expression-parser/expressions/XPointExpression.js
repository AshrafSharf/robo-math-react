/**
 * XPointExpression - extracts the x coordinate from a point expression
 *
 * Syntax: x(point) or x(pointVariable)
 * Returns a single numeric value that can be used in arithmetic operations.
 *
 * Examples:
 *   P = point(3, 5)
 *   x(P)           // returns 3
 *   x(P) + 2       // returns 5 (arithmetic supported)
 *   x(point(7, 9)) // returns 7 (inline point)
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { NoOpCommand } from '../../commands/NoOpCommand.js';

export class XPointExpression extends AbstractArithmeticExpression {
    static NAME = 'x';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.value = 0;
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

        if (coordinates.length < 2) {
            this.dispatchError('x() requires a point expression with at least 2 coordinate values');
        }

        this.assignValue(coordinates);
    }

    /**
     * Assign the extracted value from coordinates
     * Override in YPointExpression to get y coordinate
     */
    assignValue(coordinates) {
        this.value = coordinates[0];
    }

    getName() {
        return XPointExpression.NAME;
    }

    /**
     * Get the extracted numeric value
     * @returns {number}
     */
    getValue() {
        return this.value;
    }

    getVariableAtomicValues() {
        return [this.value];
    }

    /**
     * Get friendly string representation
     */
    getFriendlyToStr() {
        return `x = ${this.value}`;
    }

    /**
     * Returns NoOpCommand - x() doesn't render anything
     */
    toCommand() {
        return new NoOpCommand();
    }
}
