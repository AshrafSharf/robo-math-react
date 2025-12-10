/**
 * SUBVExpression - creates the result vector of subtracting two vectors
 *
 * Syntax:
 *   subv(graph, vecA, vecB)              - subtract vectors (A - B), result starts at origin
 *   subv(graph, vecA, vecB, point)       - subtract vectors, result starts at point
 *   subv(graph, vecA, vecB, x, y)        - subtract vectors, result starts at (x, y)
 *
 * Returns the mathematical difference a - b as a vector.
 *
 * Examples:
 *   A = vec(g, 0, 0, 3, 2)
 *   B = vec(g, 0, 0, 1, 1)
 *   subv(g, A, B)                        // result: (0,0) -> (2,1)
 *   subv(g, A, B, point(g, 1, 1))        // result: (1,1) -> (3,2)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { VectorUtil } from '../../../geom/VectorUtil.js';

export class SUBVExpression extends AbstractNonArithmeticExpression {
    static NAME = 'subv';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('subv() requires: subv(graph, vectorA, vectorB)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('subv() requires graph as first argument');
        }

        // Second arg is vector A
        const vecAExpr = this._getResolvedExpression(context, this.subExpressions[1]);
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
                resultStart = { x: fourthValues[0], y: fourthValues[1] };
            } else if (this.subExpressions.length >= 5) {
                const fifthArg = this._getResolvedExpression(context, this.subExpressions[4]);
                resultStart = {
                    x: fourthValues[0],
                    y: fifthArg.getVariableAtomicValues()[0]
                };
            }
        }

        const result = VectorUtil.subtractVectors(aStart, aEnd, bStart, bEnd, resultStart);
        this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
    }

    getName() { return SUBVExpression.NAME; }
    getGeometryType() { return 'line'; }
    getVariableAtomicValues() { return this.coordinates.slice(); }
    getStartValue() { return [this.coordinates[0], this.coordinates[1]]; }
    getEndValue() { return [this.coordinates[2], this.coordinates[3]]; }

    toCommand(options = {}) {
        const start = { x: this.coordinates[0], y: this.coordinates[1] };
        const end = { x: this.coordinates[2], y: this.coordinates[3] };
        return new VectorCommand(this.graphExpression, start, end, options);
    }

    canPlay() { return true; }
}
