/**
 * VecSumExpression - creates the result vector of adding two vectors
 *
 * Syntax:
 *   vecsum(graph, vecA, vecB)              - add vectors, result starts at origin
 *   vecsum(graph, vecA, vecB, point)       - add vectors, result starts at point
 *   vecsum(graph, vecA, vecB, x, y)        - add vectors, result starts at (x, y)
 *
 * Returns the mathematical sum a + b as a vector.
 *
 * Examples:
 *   A = vector(g, 0, 0, 3, 0)
 *   B = vector(g, 0, 0, 0, 2)
 *   vecsum(g, A, B)                        // result: (0,0) -> (3,2)
 *   vecsum(g, A, B, point(g, 1, 1))        // result: (1,1) -> (4,3)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { LineCommand } from '../../commands/LineCommand.js';
import { VectorUtil } from '../../../geom/VectorUtil.js';

export class VecSumExpression extends AbstractNonArithmeticExpression {
    static NAME = 'vecsum';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
        this.inputType = 'vec'; // 'vec' or 'line'
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('vecsum() requires: vecsum(graph, vectorA, vectorB)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('vecsum() requires graph as first argument');
        }

        // Second arg is vector A - detect input type
        const vecAExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        this.inputType = vecAExpr.getName() === 'line' ? 'line' : 'vec';
        const aStartVal = vecAExpr.getStartValue ? vecAExpr.getStartValue() : vecAExpr.getVariableAtomicValues().slice(0, 2);
        const aEndVal = vecAExpr.getEndValue ? vecAExpr.getEndValue() : vecAExpr.getVariableAtomicValues().slice(2, 4);

        const aStart = { x: aStartVal[0], y: aStartVal[1] };
        const aEnd = { x: aEndVal[0], y: aEndVal[1] };

        // Third arg is vector B
        const vecBExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const bStartVal = vecBExpr.getStartValue ? vecBExpr.getStartValue() : vecBExpr.getVariableAtomicValues().slice(0, 2);
        const bEndVal = vecBExpr.getEndValue ? vecBExpr.getEndValue() : vecBExpr.getVariableAtomicValues().slice(2, 4);

        const bStart = { x: bStartVal[0], y: bStartVal[1] };
        const bEnd = { x: bEndVal[0], y: bEndVal[1] };

        // Optional fourth+ args define result start point
        let resultStart = null;
        if (this.subExpressions.length >= 4) {
            const fourthArg = this._getResolvedExpression(context, this.subExpressions[3]);
            const fourthValues = fourthArg.getVariableAtomicValues();

            if (fourthValues.length >= 2) {
                // Point expression
                resultStart = { x: fourthValues[0], y: fourthValues[1] };
            } else if (this.subExpressions.length >= 5) {
                // Two numbers (x, y)
                const fifthArg = this._getResolvedExpression(context, this.subExpressions[4]);
                resultStart = {
                    x: fourthValues[0],
                    y: fifthArg.getVariableAtomicValues()[0]
                };
            }
        }

        // Use VectorUtil to add vectors
        const result = VectorUtil.addVectors(aStart, aEnd, bStart, bEnd, resultStart);

        this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
    }

    getName() {
        return VecSumExpression.NAME;
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
        return `vecsum[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
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
