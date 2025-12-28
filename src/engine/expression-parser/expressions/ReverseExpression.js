/**
 * ReverseExpression - creates a reversed vector at a new starting point
 *
 * Syntax:
 *   reverse(graph, vec, point)       - reverse vector and place at point
 *   reverse(graph, vec, x, y)        - reverse vector and place at (x, y)
 *   reverse(graph, line, point)      - reverse line as vector at point
 *
 * Returns a new vector with opposite direction at the new starting point.
 * Useful for vector subtraction visualization: a - b = a + (-b)
 *
 * Examples:
 *   V = vector(g, 0, 0, 3, 2)
 *   reverse(g, V, point(g, 1, 1))    // reversed V starting at (1, 1)
 *   reverse(g, V, 2, 3)              // reversed V starting at (2, 3)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { LineCommand } from '../../commands/LineCommand.js';
import { VectorUtil } from '../../../geom/VectorUtil.js';

export class ReverseExpression extends AbstractNonArithmeticExpression {
    static NAME = 'reverse';
    static isVectorType = true;

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
        this.inputType = 'vec'; // 'vec' or 'line'
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('reverse() requires: reverse(graph, vector, point) or reverse(graph, vector, x, y)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('reverse() requires graph as first argument');
        }

        // Second arg is vector/line - detect input type
        const sourceExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        this.inputType = sourceExpr.getName() === 'line' ? 'line' : 'vec';
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
            this.dispatchError('reverse() requires a point or (x, y) coordinates for new start');
        }

        // Use VectorUtil to reverse at new position
        const result = VectorUtil.reverseAt(start, end, newStart);

        this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
    }

    getName() {
        return ReverseExpression.NAME;
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
        return `reverse[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    toCommand(options = {}) {
        const pts = this.getVectorPoints();
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        if (this.inputType === 'line') {
            return new LineCommand(this.graphExpression, pts[0], pts[1], mergedOptions);
        }
        return new VectorCommand(this.graphExpression, pts[0], pts[1], mergedOptions);
    }

    canPlay() {
        return true;
    }
}
