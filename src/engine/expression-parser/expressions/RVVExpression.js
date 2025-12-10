/**
 * RVVExpression - creates a reversed vector at a new starting point
 *
 * Syntax:
 *   rvv(graph, vec, point)       - reverse vector and place at point
 *   rvv(graph, vec, x, y)        - reverse vector and place at (x, y)
 *   rvv(graph, line, point)      - reverse line as vector at point
 *
 * Returns a new vector with opposite direction at the new starting point.
 * Useful for vector subtraction visualization: a - b = a + (-b)
 *
 * Examples:
 *   V = vec(g, 0, 0, 3, 2)
 *   rvv(g, V, point(g, 1, 1))    // reversed V starting at (1, 1)
 *   rvv(g, V, 2, 3)              // reversed V starting at (2, 3)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { VectorUtil } from '../../../geom/VectorUtil.js';

export class RVVExpression extends AbstractNonArithmeticExpression {
    static NAME = 'rvv';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('rvv() requires: rvv(graph, vector, point) or rvv(graph, vector, x, y)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('rvv() requires graph as first argument');
        }

        // Second arg is vector/line
        const sourceExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const startVal = sourceExpr.getStartValue ? sourceExpr.getStartValue() : sourceExpr.getVariableAtomicValues().slice(0, 2);
        const endVal = sourceExpr.getEndValue ? sourceExpr.getEndValue() : sourceExpr.getVariableAtomicValues().slice(2, 4);

        const start = { x: startVal[0], y: startVal[1] };
        const end = { x: endVal[0], y: endVal[1] };

        // Third+ args define new start point
        let newStart;
        const thirdArg = this._getResolvedExpression(context, this.subExpressions[2]);
        const thirdValues = thirdArg.getVariableAtomicValues();

        if (thirdValues.length >= 2) {
            // Point expression
            newStart = { x: thirdValues[0], y: thirdValues[1] };
        } else if (this.subExpressions.length >= 4) {
            // Two numbers (x, y)
            const fourthArg = this._getResolvedExpression(context, this.subExpressions[3]);
            newStart = {
                x: thirdValues[0],
                y: fourthArg.getVariableAtomicValues()[0]
            };
        } else {
            this.dispatchError('rvv() requires a point or (x, y) coordinates for new start');
        }

        // Use VectorUtil to reverse at new position
        const result = VectorUtil.reverseAt(start, end, newStart);

        this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
    }

    getName() {
        return RVVExpression.NAME;
    }

    getGeometryType() {
        return 'line';
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    getVectorPoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1] },
            { x: this.coordinates[2], y: this.coordinates[3] }
        ];
    }

    getVector() {
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
        const pts = this.getVectorPoints();
        return `rvv[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    toCommand(options = {}) {
        const pts = this.getVectorPoints();
        return new VectorCommand(this.graphExpression, pts[0], pts[1], options);
    }

    canPlay() {
        return true;
    }
}
