/**
 * PolarlineExpression - creates a line using polar coordinates (length and angle)
 *
 * Syntax:
 *   polarline(graph, length, angleDeg)              - line from origin
 *   polarline(graph, length, angleDeg, fromX, fromY) - line from specified point
 *   polarline(graph, length, angleDeg, fromPoint)   - line from point expression
 *
 * Returns line coordinates [x1, y1, x2, y2]. When used standalone, renders as a line.
 * Angle is in degrees: 0=right, 90=up, 180=left, 270=down
 *
 * Examples:
 *   polarline(g, 5, 0)                // horizontal line from (0,0) to (5,0)
 *   polarline(g, 3, 90)               // vertical line from (0,0) to (0,3)
 *   polarline(g, 4, 45)               // diagonal line at 45 degrees
 *   polarline(g, 5, 30, 1, 2)         // line from (1,2) at 30 degrees
 *   polarline(g, 5, 60, A)            // line from point A at 60 degrees
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { LineCommand } from '../../commands/LineCommand.js';
import { LineUtil } from '../../../geom/LineUtil.js';

export class PolarlineExpression extends AbstractNonArithmeticExpression {
    static NAME = 'polarline';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('polarline() requires: polarline(graph, length, angle) or polarline(graph, length, angle, fromX, fromY)');
        }

        // Resolve all subexpressions first, separating styling
        const styleExprs = [];
        const resolvedExprs = [];

        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this.subExpressions[i];

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                resolvedExprs.push(expr);
            }
        }

        this._parseStyleExpressions(styleExprs);

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, resolvedExprs[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('polarline() requires graph as first argument');
        }

        // Get length and angle
        const lengthExpr = this._getResolvedExpression(context, resolvedExprs[1]);
        const angleExpr = this._getResolvedExpression(context, resolvedExprs[2]);

        const length = lengthExpr.getVariableAtomicValues()[0];
        const angleDeg = angleExpr.getVariableAtomicValues()[0];

        // Determine origin point
        let origin = { x: 0, y: 0 };

        if (resolvedExprs.length === 4) {
            // polarline(graph, length, angle, fromPoint)
            const fromExpr = this._getResolvedExpression(context, resolvedExprs[3]);
            const fromValues = fromExpr.getVariableAtomicValues();
            origin = { x: fromValues[0], y: fromValues[1] };
        } else if (resolvedExprs.length >= 5) {
            // polarline(graph, length, angle, fromX, fromY)
            const fromXExpr = this._getResolvedExpression(context, resolvedExprs[3]);
            const fromYExpr = this._getResolvedExpression(context, resolvedExprs[4]);
            origin = {
                x: fromXExpr.getVariableAtomicValues()[0],
                y: fromYExpr.getVariableAtomicValues()[0]
            };
        }

        const result = LineUtil.fromPolar(length, angleDeg, origin);
        this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
    }

    getName() {
        return PolarlineExpression.NAME;
    }

    getGeometryType() {
        return 'line';
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    getLinePoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1] },
            { x: this.coordinates[2], y: this.coordinates[3] }
        ];
    }

    getLine() {
        return {
            start: { x: this.coordinates[0], y: this.coordinates[1] },
            end: { x: this.coordinates[2], y: this.coordinates[3] }
        };
    }

    getStartValue() {
        return [this.coordinates[0], this.coordinates[1]];
    }

    getEndValue() {
        return [this.coordinates[2], this.coordinates[3]];
    }

    getFriendlyToStr() {
        const pts = this.getLinePoints();
        return `polarline[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    toCommand(options = {}) {
        const pts = this.getLinePoints();
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        return new LineCommand(this.graphExpression, pts[0], pts[1], mergedOptions);
    }

    canPlay() {
        return true;
    }
}
