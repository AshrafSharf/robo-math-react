/**
 * PointAtRatioExpression - gets a point at a ratio/proportion along a shape's path
 *
 * Syntax:
 *   pointatratio(graph, shape, ratio)      - point at ratio along any shape
 *   pointatratio(graph, p1, p2, ratio)     - point at ratio between two points
 *
 * Supported shapes: line, vector, circle, arc, polygon
 *
 * Returns two coordinate values (x, y). When used standalone, renders as a point.
 * Ratio can be outside [0,1] for extrapolation (lines/vectors only).
 *
 * Examples:
 *   L = line(g, 0, 0, 10, 0)
 *   pointatratio(g, L, 0.5)               // midpoint of line
 *
 *   C = circle(g, 5, 0, 0)
 *   pointatratio(g, C, 0.25)              // point at 90° (top of circle)
 *
 *   P = polygon(g, 0, 0, 4, 0, 4, 3)
 *   pointatratio(g, P, 0.5)               // point halfway around perimeter
 *
 *   pointatratio(g, A, B, 0.3)            // point 30% from A to B
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { PointCommand } from '../../commands/PointCommand.js';
import { PointAtRatioAdapter } from '../../adapters/PointAtRatioAdapter.js';

export class PointAtRatioExpression extends AbstractArithmeticExpression {
    static NAME = 'pointatratio';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x, y]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('pointatratio() requires: pointatratio(graph, shape, ratio) or pointatratio(graph, p1, p2, ratio)');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('pointatratio() requires graph as first argument');
        }

        // Determine mode: shape or two-point
        const secondArg = this._getResolvedExpression(context, this.subExpressions[1]);
        const secondArgValues = secondArg.getVariableAtomicValues();

        // Check if second arg is a shape (more than 2 coords) or has a known shape type
        const shapeName = secondArg.getName ? secondArg.getName() : null;
        const isShapeArg = this._isShapeExpression(shapeName) ||
            (secondArgValues.length > 2 && shapeName !== 'point');

        if (isShapeArg) {
            // Mode 1: pointatratio(graph, shape, ratio)
            this._resolveShapeMode(context, secondArg);
        } else {
            // Mode 2: pointatratio(graph, p1, p2, ratio)
            this._resolveTwoPointMode(context);
        }
    }

    /**
     * Check if expression name represents a supported shape
     */
    _isShapeExpression(name) {
        const shapeTypes = [
            'line', 'extendline', 'polarline', 'hline', 'vline',
            'vector', 'polarvector',
            'circle', 'arc', 'polygon'
        ];
        return shapeTypes.includes(name);
    }

    /**
     * Resolve using shape adapter
     */
    _resolveShapeMode(context, shapeExpression) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('pointatratio() with shape requires: pointatratio(graph, shape, ratio)');
        }

        const ratioExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const ratioValues = ratioExpr.getVariableAtomicValues();
        const ratio = ratioValues[0];

        try {
            const adapter = PointAtRatioAdapter.for(shapeExpression);
            const point = adapter.getPointAtRatio(ratio);
            this.coordinates = [point.x, point.y];
        } catch (error) {
            this.dispatchError(error.message);
        }
    }

    /**
     * Resolve using two-point linear interpolation
     */
    _resolveTwoPointMode(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('pointatratio() with two points requires: pointatratio(graph, p1, p2, ratio)');
        }

        const p1Expr = this._getResolvedExpression(context, this.subExpressions[1]);
        const p2Expr = this._getResolvedExpression(context, this.subExpressions[2]);
        const ratioExpr = this._getResolvedExpression(context, this.subExpressions[3]);

        const p1Values = p1Expr.getVariableAtomicValues();
        const p2Values = p2Expr.getVariableAtomicValues();

        if (p1Values.length < 2 || p2Values.length < 2) {
            this.dispatchError('pointatratio() requires point expressions with x, y coordinates');
        }

        const start = { x: p1Values[0], y: p1Values[1] };
        const end = { x: p2Values[0], y: p2Values[1] };

        const ratioValues = ratioExpr.getVariableAtomicValues();
        const ratio = ratioValues[0];

        // Linear interpolation
        const point = {
            x: start.x + ratio * (end.x - start.x),
            y: start.y + ratio * (end.y - start.y)
        };

        this.coordinates = [point.x, point.y];
    }

    getName() {
        return PointAtRatioExpression.NAME;
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

    getPoint() {
        return { x: this.coordinates[0], y: this.coordinates[1] };
    }

    getFriendlyToStr() {
        return `pointatratio(${this.coordinates[0]}, ${this.coordinates[1]})`;
    }

    toCommand(options = {}) {
        return new PointCommand(this.graphExpression, this.getPoint(), options);
    }

    canPlay() {
        return true;
    }
}
