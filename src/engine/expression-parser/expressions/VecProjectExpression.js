/**
 * VecProjectExpression - projects one vector onto another
 *
 * Syntax:
 *   vecproject(graph, vecToProject, vecTarget)  - project vecToProject onto vecTarget
 *
 * Returns the projection (parallel component) as a vector.
 *
 * Examples:
 *   A = vector(g, 0, 0, 3, 0)            // horizontal vector
 *   B = vector(g, 0, 0, 2, 2)            // diagonal vector
 *   vecproject(g, B, A)                  // projection of B onto A
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { VectorUtil } from '../../../geom/VectorUtil.js';

export class VecProjectExpression extends AbstractNonArithmeticExpression {
    static NAME = 'vecproject';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = [];
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('vecproject() requires: vecproject(graph, vectorToProject, vectorTarget)');
        }

        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('vecproject() requires graph as first argument');
        }

        const vecAExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const aStartVal = vecAExpr.getStartValue ? vecAExpr.getStartValue() : vecAExpr.getVariableAtomicValues().slice(0, 2);
        const aEndVal = vecAExpr.getEndValue ? vecAExpr.getEndValue() : vecAExpr.getVariableAtomicValues().slice(2, 4);
        const aStart = { x: aStartVal[0], y: aStartVal[1] };
        const aEnd = { x: aEndVal[0], y: aEndVal[1] };

        const vecBExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const bStartVal = vecBExpr.getStartValue ? vecBExpr.getStartValue() : vecBExpr.getVariableAtomicValues().slice(0, 2);
        const bEndVal = vecBExpr.getEndValue ? vecBExpr.getEndValue() : vecBExpr.getVariableAtomicValues().slice(2, 4);
        const bStart = { x: bStartVal[0], y: bStartVal[1] };
        const bEnd = { x: bEndVal[0], y: bEndVal[1] };

        const result = VectorUtil.projectOnto(aStart, aEnd, bStart, bEnd);
        this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
    }

    getName() { return VecProjectExpression.NAME; }
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
