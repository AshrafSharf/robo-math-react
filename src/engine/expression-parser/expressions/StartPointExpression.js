/**
 * StartPointExpression - extracts the start point from a shape expression
 *
 * Syntax:
 *   start(graph, shape) - graph with source expression
 *
 * Supported shapes: line, vector, circle, arc, polygon (via PointAtRatioAdapter)
 *
 * Returns two coordinate values (x, y). When used standalone, renders as a point.
 * Uses PointAtRatioAdapter with ratio=0 for consistent behavior across all shapes.
 *
 * Examples:
 *   L = line(g, 0, 0, 5, 5)
 *   start(g, L)              // renders a point at (0, 0)
 *   start(g, circle(g, 3, 0, 0))  // rightmost point of circle (ratio 0)
 *   line(g, start(g, L1), end(g, L2))  // start() provides coordinates
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { PointCommand } from '../../commands/PointCommand.js';
import { PointAtRatioAdapter } from '../../adapters/PointAtRatioAdapter.js';

export class StartPointExpression extends AbstractArithmeticExpression {
    static NAME = 'start';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x, y]
        this.sourceExpression = null; // The line/arc/polygon expression
        this.graphExpression = null;  // Explicit or derived graph expression
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('start() requires graph and source expression: start(graph, shape)');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('start() requires graph as first argument');
        }

        // Second arg is the source expression
        this.sourceExpression = this._getResolvedExpression(context, this.subExpressions[1]);

        // Use PointAtRatioAdapter with ratio for consistent behavior
        try {
            const adapter = PointAtRatioAdapter.for(this.sourceExpression);
            const point = adapter.getPointAtRatio(this.getRatio());
            this.coordinates = [point.x, point.y];
        } catch (error) {
            this.dispatchError(`start() error: ${error.message}`);
        }
    }

    /**
     * Get the ratio for this expression (0 for start, 1 for end)
     * Override in EndPointExpression to return 1
     */
    getRatio() {
        return 0;
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
        return `start(${this.coordinates[0]}, ${this.coordinates[1]})`;
    }

    // getGrapher() inherited from AbstractArithmeticExpression

    /**
     * Create a PointCommand - start() renders as a point when used standalone
     */
    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        return new PointCommand(this.graphExpression, this.getPoint(), mergedOptions);
    }

    /**
     * start() can be played (animated) when used standalone
     */
    canPlay() {
        return true;
    }
}
