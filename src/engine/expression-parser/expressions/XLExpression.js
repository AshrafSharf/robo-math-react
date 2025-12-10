/**
 * XLExpression - extends a line by a proportion or in both directions
 *
 * Syntax:
 *   xl(graph, line, proportion)                    - extend from end (1.5 = 50% longer)
 *   xl(graph, line, startProportion, endProportion) - extend both directions
 *   xl(graph, p1, p2, proportion)                  - extend line defined by two points
 *   xl(graph, p1, p2, startProp, endProp)          - extend both from two points
 *
 * Returns line coordinates [x1, y1, x2, y2]. When used standalone, renders as a line.
 *
 * Proportion meanings:
 *   - proportion > 1: extends beyond end point
 *   - proportion < 1: shortens the line
 *   - startProportion < 0: extends backward from start
 *   - endProportion > 1: extends forward from end
 *
 * Examples:
 *   L = line(g, 0, 0, 4, 0)
 *   xl(g, L, 1.5)              // extends to (6, 0) - 50% longer
 *   xl(g, L, 2)                // extends to (8, 0) - double length
 *   xl(g, L, -0.5, 1.5)        // extends both: start to (-2, 0), end to (6, 0)
 *   xl(g, A, B, 1.25)          // line from A extended 25% past B
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { LineCommand } from '../../commands/LineCommand.js';
import { LineUtil } from '../../../geom/LineUtil.js';

export class XLExpression extends AbstractNonArithmeticExpression {
    static NAME = 'xl';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('xl() requires: xl(graph, line, proportion) or xl(graph, p1, p2, proportion)');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('xl() requires graph as first argument');
        }

        // Determine argument pattern
        const secondArg = this._getResolvedExpression(context, this.subExpressions[1]);
        const secondArgValues = secondArg.getVariableAtomicValues();

        // Check if second arg is a line (has 4 coords) or a point (has 2 coords)
        const isLineArg = secondArgValues.length >= 4 ||
            (secondArg.getStartValue && secondArg.getEndValue &&
             secondArg.getStartValue().length >= 2 && secondArg.getEndValue().length >= 2);

        let start, end;

        if (isLineArg) {
            // Pattern: xl(graph, line, ...)
            const startVal = secondArg.getStartValue ? secondArg.getStartValue() : secondArgValues.slice(0, 2);
            const endVal = secondArg.getEndValue ? secondArg.getEndValue() : secondArgValues.slice(2, 4);
            start = { x: startVal[0], y: startVal[1] };
            end = { x: endVal[0], y: endVal[1] };

            if (this.subExpressions.length === 3) {
                // xl(graph, line, proportion)
                const propExpr = this._getResolvedExpression(context, this.subExpressions[2]);
                const proportion = propExpr.getVariableAtomicValues()[0];

                const result = LineUtil.extend(start, end, proportion);
                this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
            } else {
                // xl(graph, line, startProp, endProp)
                const startPropExpr = this._getResolvedExpression(context, this.subExpressions[2]);
                const endPropExpr = this._getResolvedExpression(context, this.subExpressions[3]);
                const startProp = startPropExpr.getVariableAtomicValues()[0];
                const endProp = endPropExpr.getVariableAtomicValues()[0];

                const result = LineUtil.extendBoth(start, end, startProp, endProp);
                this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
            }
        } else {
            // Pattern: xl(graph, p1, p2, ...)
            const p1Expr = secondArg;
            const p2Expr = this._getResolvedExpression(context, this.subExpressions[2]);

            const p1Values = p1Expr.getVariableAtomicValues();
            const p2Values = p2Expr.getVariableAtomicValues();

            start = { x: p1Values[0], y: p1Values[1] };
            end = { x: p2Values[0], y: p2Values[1] };

            if (this.subExpressions.length === 4) {
                // xl(graph, p1, p2, proportion)
                const propExpr = this._getResolvedExpression(context, this.subExpressions[3]);
                const proportion = propExpr.getVariableAtomicValues()[0];

                const result = LineUtil.extend(start, end, proportion);
                this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
            } else if (this.subExpressions.length >= 5) {
                // xl(graph, p1, p2, startProp, endProp)
                const startPropExpr = this._getResolvedExpression(context, this.subExpressions[3]);
                const endPropExpr = this._getResolvedExpression(context, this.subExpressions[4]);
                const startProp = startPropExpr.getVariableAtomicValues()[0];
                const endProp = endPropExpr.getVariableAtomicValues()[0];

                const result = LineUtil.extendBoth(start, end, startProp, endProp);
                this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
            } else {
                this.dispatchError('xl() with two points requires proportion: xl(graph, p1, p2, proportion)');
            }
        }
    }

    getName() {
        return XLExpression.NAME;
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
        return `xl[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    toCommand(options = {}) {
        const pts = this.getLinePoints();
        return new LineCommand(this.graphExpression, pts[0], pts[1], options);
    }

    canPlay() {
        return true;
    }
}
