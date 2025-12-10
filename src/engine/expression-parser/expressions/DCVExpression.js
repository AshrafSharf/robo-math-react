/**
 * DCVExpression - decomposes a vector into parallel or perpendicular component
 *
 * Syntax:
 *   dcv(graph, vecSource, vecReference)           - parallel component (default)
 *   dcv(graph, vecSource, vecReference, "perp")   - perpendicular component
 *
 * Returns the decomposed component as a vector.
 *
 * Examples:
 *   A = vec(g, 0, 0, 2, 2)               // diagonal vector
 *   B = vec(g, 0, 0, 3, 0)               // horizontal reference
 *   dcv(g, A, B)                         // parallel component of A along B
 *   dcv(g, A, B, "perp")                 // perpendicular component
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { VectorUtil } from '../../../geom/VectorUtil.js';

export class DCVExpression extends AbstractNonArithmeticExpression {
    static NAME = 'dcv';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = [];
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('dcv() requires: dcv(graph, vectorSource, vectorReference)');
        }

        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('dcv() requires graph as first argument');
        }

        // Source vector to decompose
        const vecAExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const aStartVal = vecAExpr.getStartValue ? vecAExpr.getStartValue() : vecAExpr.getVariableAtomicValues().slice(0, 2);
        const aEndVal = vecAExpr.getEndValue ? vecAExpr.getEndValue() : vecAExpr.getVariableAtomicValues().slice(2, 4);
        const aStart = { x: aStartVal[0], y: aStartVal[1] };
        const aEnd = { x: aEndVal[0], y: aEndVal[1] };

        // Reference vector
        const vecBExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const bStartVal = vecBExpr.getStartValue ? vecBExpr.getStartValue() : vecBExpr.getVariableAtomicValues().slice(0, 2);
        const bEndVal = vecBExpr.getEndValue ? vecBExpr.getEndValue() : vecBExpr.getVariableAtomicValues().slice(2, 4);
        const bStart = { x: bStartVal[0], y: bStartVal[1] };
        const bEnd = { x: bEndVal[0], y: bEndVal[1] };

        // Check for "perp" flag
        let isPerp = false;
        if (this.subExpressions.length >= 4) {
            const fourthArg = this._getResolvedExpression(context, this.subExpressions[3]);
            // Check if it's a string "perp" or numeric 1 for perpendicular
            const values = fourthArg.getVariableAtomicValues();
            if (values[0] === 1 || values[0] === 'perp') {
                isPerp = true;
            }
        }

        const result = VectorUtil.decompose(aStart, aEnd, bStart, bEnd);
        const component = isPerp ? result.perpendicular : result.parallel;

        this.coordinates = [component.start.x, component.start.y, component.end.x, component.end.y];
    }

    getName() { return DCVExpression.NAME; }
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
