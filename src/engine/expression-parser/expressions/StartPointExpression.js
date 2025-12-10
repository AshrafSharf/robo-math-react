/**
 * StartPointExpression - extracts the start point from a line/arc/polygon expression
 *
 * Syntax:
 *   st(graph, lineOrArcOrPolygon) - graph with source expression
 *
 * Returns two coordinate values (x, y). When used standalone, renders as a point.
 *
 * Examples:
 *   L = line(g, 0, 0, 5, 5)
 *   st(g, L)              // renders a point at (0, 0)
 *   line(g, st(g, L1), ed(g, L2))  // st() provides coordinates
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { PointCommand } from '../../commands/PointCommand.js';

export class StartPointExpression extends AbstractArithmeticExpression {
    static NAME = 'st';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x, y]
        this.sourceExpression = null; // The line/arc/polygon expression
        this.graphExpression = null;  // Explicit or derived graph expression
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('st() requires graph and source expression: st(graph, line/arc/polygon)');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('st() requires graph as first argument');
        }

        // Second arg is the source expression
        this.sourceExpression = this._getResolvedExpression(context, this.subExpressions[1]);

        // Get start value from the expression
        const startValue = this.getPointValues(this.sourceExpression);

        if (startValue.length < 2) {
            this.dispatchError('st() requires an expression with at least 2 coordinate values (line, arc, or polygon)');
        }

        this.coordinates = [startValue[0], startValue[1]];
    }

    /**
     * Get the point values from the expression
     * Override in EndPointExpression to get end values
     */
    getPointValues(resultExpression) {
        if (typeof resultExpression.getStartValue === 'function') {
            return resultExpression.getStartValue();
        }
        // Fallback to first two atomic values
        return resultExpression.getVariableAtomicValues().slice(0, 2);
    }

    getName() {
        return StartPointExpression.NAME;
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    getStartValue() {
        return this.coordinates.slice();
    }

    getEndValue() {
        return this.coordinates.slice();
    }

    /**
     * Get as point object
     * @returns {{x: number, y: number}}
     */
    getPoint() {
        return { x: this.coordinates[0], y: this.coordinates[1] };
    }

    /**
     * Get friendly string representation
     */
    getFriendlyToStr() {
        return `st(${this.coordinates[0]}, ${this.coordinates[1]})`;
    }

    // getGrapher() inherited from AbstractArithmeticExpression

    /**
     * Create a PointCommand - st() renders as a point when used standalone
     */
    toCommand(options = {}) {
        return new PointCommand(this.graphExpression, this.getPoint(), options);
    }

    /**
     * st() can be played (animated) when used standalone
     */
    canPlay() {
        return true;
    }
}
