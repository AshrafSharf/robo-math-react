/**
 * PerpShiftExpression - shifts a vector perpendicular to its direction
 *
 * Syntax:
 *   perpshift(graph, vec, distance)    - shift vector perpendicular by distance
 *   perpshift(graph, line, distance)   - shift line perpendicular by distance (returns vector)
 *
 * Positive distance shifts to the left (CCW), negative to the right (CW).
 *
 * Examples:
 *   V = vector(g, 0, 0, 3, 0)
 *   perpshift(g, V, 1)                 // vector shifted 1 unit upward (perpendicular)
 *   perpshift(g, V, -1)                // vector shifted 1 unit downward
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PerpShiftCommand } from '../../commands/PerpShiftCommand.js';
import { VectorUtil } from '../../../geom/VectorUtil.js';

export class PerpShiftExpression extends AbstractNonArithmeticExpression {
    static NAME = 'perpshift';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
        this.originalShapeVarName = null;
        this.dx = 0;
        this.dy = 0;
        this.inputType = 'vec'; // 'vec' or 'line'
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('perpshift() requires: perpshift(graph, vector, distance)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('perpshift() requires graph as first argument');
        }

        // Second arg is vector/line - detect input type and store variable name
        const sourceExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        this.inputType = sourceExpr.getName() === 'line' ? 'line' : 'vec';
        this.originalShapeVarName = this.subExpressions[1].variableName || sourceExpr.variableName;

        const startVal = sourceExpr.getStartValue ? sourceExpr.getStartValue() : sourceExpr.getVariableAtomicValues().slice(0, 2);
        const endVal = sourceExpr.getEndValue ? sourceExpr.getEndValue() : sourceExpr.getVariableAtomicValues().slice(2, 4);

        const start = { x: startVal[0], y: startVal[1] };
        const end = { x: endVal[0], y: endVal[1] };

        // Third arg is distance
        const distExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const distance = distExpr.getVariableAtomicValues()[0];

        // Compute perpendicular dx, dy (90° CCW rotation of unit vector × distance)
        const dir = VectorUtil.getUnitVector(start, end);
        this.dx = -dir.y * distance;  // perpendicular x = -y
        this.dy = dir.x * distance;   // perpendicular y = x

        // Use VectorUtil to shift perpendicular
        const result = VectorUtil.shiftPerpendicular(start, end, distance);

        this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
    }

    getName() {
        return PerpShiftExpression.NAME;
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
        return `perpshift[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    toCommand(options = {}) {
        const shiftedData = {
            start: { x: this.coordinates[0], y: this.coordinates[1] },
            end: { x: this.coordinates[2], y: this.coordinates[3] }
        };
        return new PerpShiftCommand(
            this.graphExpression,
            this.originalShapeVarName,
            shiftedData,
            this.dx,
            this.dy,
            this.inputType,
            options
        );
    }

    canPlay() {
        return true;
    }
}
