/**
 * SCALEVExpression - scales a vector by a scalar multiplier
 *
 * Syntax:
 *   scalev(graph, vec, scalar)           - scale vector, result starts at origin
 *   scalev(graph, vec, scalar, point)    - scale vector, result starts at point
 *
 * Returns the scaled vector. Negative scalar reverses direction.
 *
 * Examples:
 *   V = vector(g, 0, 0, 2, 1)
 *   scalev(g, V, 2)                      // double length: (0,0) -> (4,2)
 *   scalev(g, V, -1)                     // reversed: (0,0) -> (-2,-1)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { VectorUtil } from '../../../geom/VectorUtil.js';

export class SCALEVExpression extends AbstractNonArithmeticExpression {
    static NAME = 'scalev';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = [];
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('scalev() requires: scalev(graph, vector, scalar)');
        }

        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('scalev() requires graph as first argument');
        }

        const vecExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const startVal = vecExpr.getStartValue ? vecExpr.getStartValue() : vecExpr.getVariableAtomicValues().slice(0, 2);
        const endVal = vecExpr.getEndValue ? vecExpr.getEndValue() : vecExpr.getVariableAtomicValues().slice(2, 4);

        const start = { x: startVal[0], y: startVal[1] };
        const end = { x: endVal[0], y: endVal[1] };

        const scalarExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const scalar = scalarExpr.getVariableAtomicValues()[0];

        let resultStart = null;
        if (this.subExpressions.length >= 4) {
            const fourthArg = this._getResolvedExpression(context, this.subExpressions[3]);
            const fourthValues = fourthArg.getVariableAtomicValues();
            if (fourthValues.length >= 2) {
                resultStart = { x: fourthValues[0], y: fourthValues[1] };
            }
        }

        const result = VectorUtil.scalarMultiply(start, end, scalar, resultStart);
        this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
    }

    getName() { return SCALEVExpression.NAME; }
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
