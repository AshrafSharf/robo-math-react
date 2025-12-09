/**
 * StartPointExpression - extracts the start point from a line/arc/polygon expression
 *
 * Syntax options:
 *   st(lineOrArcOrPolygon)       - uses grapher from the source expression
 *   st(graph, lineOrArcOrPolygon) - uses explicit grapher
 *
 * Returns two coordinate values (x, y). When used standalone, renders as a point.
 *
 * Examples:
 *   L = line(g, 0, 0, 5, 5)
 *   st(L)              // renders a point at (0, 0), uses g from L
 *   st(g2, L)          // renders a point at (0, 0) on graph g2
 *   line(g, st(L1), ed(L2))  // st() provides coordinates, doesn't render
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
        if (this.subExpressions.length < 1) {
            this.dispatchError('st() requires an expression (line, arc, or polygon)');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // Determine if first arg is a grapher or the source expression
        // st(g, L) - 2 args, first is grapher
        // st(L) - 1 arg, grapher comes from L
        if (this.subExpressions.length >= 2 && this.isGraphExpression(this.subExpressions[0])) {
            this.graphExpression = this.subExpressions[0];
            this.sourceExpression = this.subExpressions[1];
        } else {
            this.sourceExpression = this.subExpressions[0];
            // Graph will be derived from source expression in getGrapher()
        }

        // Get start value from the expression
        const startValue = this.getPointValues(this.sourceExpression);

        if (startValue.length < 2) {
            this.dispatchError('st() requires an expression with at least 2 coordinate values (line, arc, or polygon)');
        }

        this.coordinates = [startValue[0], startValue[1]];
    }

    /**
     * Check if expression is a graph expression (g2d)
     */
    isGraphExpression(expr) {
        // Check if it's a Graph2DExpression or has getGrapher that returns a grapher
        return expr && expr.getName && expr.getName() === 'g2d';
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

    /**
     * Get the grapher - uses explicit graph if provided, otherwise from source expression
     */
    getGrapher() {
        // If explicit graph was provided, use it
        if (this.graphExpression && typeof this.graphExpression.getGrapher === 'function') {
            return this.graphExpression.getGrapher();
        }
        // Otherwise derive from source expression
        if (this.sourceExpression && typeof this.sourceExpression.getGrapher === 'function') {
            return this.sourceExpression.getGrapher();
        }
        return null;
    }

    /**
     * Create a PointCommand - st() renders as a point when used standalone
     */
    toCommand(options = {}) {
        return new PointCommand(this.getGrapher(), this.getPoint(), options);
    }

    /**
     * st() can be played (animated) when used standalone
     */
    canPlay() {
        return true;
    }
}
