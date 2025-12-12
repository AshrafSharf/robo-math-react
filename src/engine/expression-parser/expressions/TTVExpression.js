/**
 * TTVExpression - positions vector B so its tail is at vector A's tip (tail-to-tip)
 *
 * Syntax:
 *   ttv(graph, vecA, vecB)       - place vecB's tail at vecA's tip
 *
 * Returns a copy of vecB positioned with its start at vecA's end.
 * Useful for vector addition visualization (tip-to-tail method).
 *
 * Examples:
 *   A = vec(g, 0, 0, 3, 0)       // horizontal vector
 *   B = vec(g, 0, 0, 0, 2)       // vertical vector
 *   ttv(g, A, B)                 // B positioned at tip of A: (3,0) -> (3,2)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { TTVCommand } from '../../commands/TTVCommand.js';
import { VectorUtil } from '../../../geom/VectorUtil.js';

export class TTVExpression extends AbstractNonArithmeticExpression {
    static NAME = 'ttv';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
        this.originalShapeVarName = null;  // Vector B's variable name
        this.dx = 0;
        this.dy = 0;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('ttv() requires: ttv(graph, vectorA, vectorB)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('ttv() requires graph as first argument');
        }

        // Second arg is vector A (target - where we want to attach B)
        const vecAExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const aStartVal = vecAExpr.getStartValue ? vecAExpr.getStartValue() : vecAExpr.getVariableAtomicValues().slice(0, 2);
        const aEndVal = vecAExpr.getEndValue ? vecAExpr.getEndValue() : vecAExpr.getVariableAtomicValues().slice(2, 4);

        const aStart = { x: aStartVal[0], y: aStartVal[1] };
        const aEnd = { x: aEndVal[0], y: aEndVal[1] };

        // Third arg is vector B (source - the one we're moving) - store variable name for registry lookup
        const vecBExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        this.originalShapeVarName = this.subExpressions[2].variableName || vecBExpr.variableName;

        const bStartVal = vecBExpr.getStartValue ? vecBExpr.getStartValue() : vecBExpr.getVariableAtomicValues().slice(0, 2);
        const bEndVal = vecBExpr.getEndValue ? vecBExpr.getEndValue() : vecBExpr.getVariableAtomicValues().slice(2, 4);

        const bStart = { x: bStartVal[0], y: bStartVal[1] };
        const bEnd = { x: bEndVal[0], y: bEndVal[1] };

        // Compute translation: B's tail moves to A's tip
        this.dx = aEnd.x - bStart.x;
        this.dy = aEnd.y - bStart.y;

        // Use VectorUtil to place B's tail at A's tip
        const result = VectorUtil.tailAtTip(aStart, aEnd, bStart, bEnd);

        this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
    }

    getName() {
        return TTVExpression.NAME;
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
        return `ttv[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    toCommand(options = {}) {
        const shiftedData = {
            start: { x: this.coordinates[0], y: this.coordinates[1] },
            end: { x: this.coordinates[2], y: this.coordinates[3] }
        };
        return new TTVCommand(
            this.graphExpression,
            this.originalShapeVarName,
            shiftedData,
            this.dx,
            this.dy,
            options
        );
    }

    canPlay() {
        return true;
    }
}
