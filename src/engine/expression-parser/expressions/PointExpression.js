/**
 * Point expression - represents a 2D point
 *
 * Syntax options:
 *   point(graph, x, y)     - using graph with separate x and y values
 *   point(graph, expr)     - using an expression that returns 2 values (e.g., st(line), ed(line))
 *
 * Examples:
 *   point(g, 3, 5)         // point at (3, 5)
 *   point(g, st(L))        // point at start of line L
 *   point(g, ed(L))        // point at end of line L
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { NumericExpression } from './NumericExpression.js';
import { PointCommand } from '../../commands/PointCommand.js';
import { point_error_messages } from '../core/ErrorMessages.js';

export class PointExpression extends AbstractArithmeticExpression {
    static NAME = 'point';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.point = { x: 0, y: 0 };
        this.graphExpression = null; // Reference to graph expression
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(point_error_messages.MISSING_ARGS());
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(point_error_messages.GRAPH_REQUIRED());
        }

        // Collect coordinates from remaining args
        // - point(g, x, y) - separate numeric values
        // - point(g, expr) - expression returning 2 values (e.g., st(line), ed(line))
        const coordinates = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);

            const resultExpression = this.subExpressions[i];
            const atomicValues = resultExpression.getVariableAtomicValues();

            for (let j = 0; j < atomicValues.length; j++) {
                coordinates.push(atomicValues[j]);
            }
        }

        if (coordinates.length !== 2) {
            this.dispatchError(point_error_messages.WRONG_COORD_COUNT(coordinates.length));
        }

        this.point = { x: coordinates[0], y: coordinates[1] };
    }

    // getGrapher() inherited from AbstractArithmeticExpression

    getName() {
        return PointExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'point'
     */
    getGeometryType() {
        return 'point';
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
            this.dispatchError(point_error_messages.DIVIDE_BY_POINT());
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
            this.dispatchError(point_error_messages.MULTIPLY_BY_POINT());
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
        this.dispatchError(point_error_messages.POWER_NOT_SUPPORTED());
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
        return new PointCommand(this.graphExpression, this.getPoint(), options);
    }

    /**
     * Points can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
