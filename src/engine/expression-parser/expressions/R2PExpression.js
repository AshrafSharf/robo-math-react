/**
 * R2PExpression - gets a point at a ratio/proportion along a line
 *
 * Syntax:
 *   r2p(graph, line, ratio)      - point at ratio along line (0=start, 1=end)
 *   r2p(graph, p1, p2, ratio)    - point at ratio between two points
 *
 * Returns two coordinate values (x, y). When used standalone, renders as a point.
 * Ratio can be outside [0,1] for extrapolation.
 *
 * Examples:
 *   L = line(g, 0, 0, 10, 0)
 *   r2p(g, L, 0.5)               // point at (5, 0) - midpoint
 *   r2p(g, L, 0.25)              // point at (2.5, 0) - quarter way
 *   r2p(g, L, 1.5)               // point at (15, 0) - extrapolated
 *   r2p(g, A, B, 0.3)            // point 30% from A to B
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { PointCommand } from '../../commands/PointCommand.js';
import { GeomUtil } from '../../../geom/GeomUtil.js';

export class R2PExpression extends AbstractArithmeticExpression {
    static NAME = 'r2p';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x, y]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('r2p() requires: r2p(graph, line, ratio) or r2p(graph, p1, p2, ratio)');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('r2p() requires graph as first argument');
        }

        let start, end, ratio;

        if (this.subExpressions.length === 3) {
            // r2p(graph, line, ratio)
            const sourceExpr = this._getResolvedExpression(context, this.subExpressions[1]);
            const ratioExpr = this._getResolvedExpression(context, this.subExpressions[2]);

            const startVal = sourceExpr.getStartValue ? sourceExpr.getStartValue() : sourceExpr.getVariableAtomicValues().slice(0, 2);
            const endVal = sourceExpr.getEndValue ? sourceExpr.getEndValue() : sourceExpr.getVariableAtomicValues().slice(2, 4);

            if (startVal.length < 2 || endVal.length < 2) {
                this.dispatchError('r2p() requires a line, arc, or vector expression');
            }

            start = { x: startVal[0], y: startVal[1] };
            end = { x: endVal[0], y: endVal[1] };

            const ratioValues = ratioExpr.getVariableAtomicValues();
            ratio = ratioValues[0];

        } else if (this.subExpressions.length >= 4) {
            // r2p(graph, p1, p2, ratio)
            const p1Expr = this._getResolvedExpression(context, this.subExpressions[1]);
            const p2Expr = this._getResolvedExpression(context, this.subExpressions[2]);
            const ratioExpr = this._getResolvedExpression(context, this.subExpressions[3]);

            const p1Values = p1Expr.getVariableAtomicValues();
            const p2Values = p2Expr.getVariableAtomicValues();

            if (p1Values.length < 2 || p2Values.length < 2) {
                this.dispatchError('r2p() requires point expressions with x, y coordinates');
            }

            start = { x: p1Values[0], y: p1Values[1] };
            end = { x: p2Values[0], y: p2Values[1] };

            const ratioValues = ratioExpr.getVariableAtomicValues();
            ratio = ratioValues[0];
        }

        const point = GeomUtil.pointAtProportion(start, end, ratio);
        this.coordinates = [point.x, point.y];
    }

    getName() {
        return R2PExpression.NAME;
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
        return `r2p(${this.coordinates[0]}, ${this.coordinates[1]})`;
    }

    toCommand(options = {}) {
        return new PointCommand(this.graphExpression, this.getPoint(), options);
    }

    canPlay() {
        return true;
    }
}
