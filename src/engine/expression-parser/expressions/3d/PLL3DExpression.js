/**
 * PLL3DExpression - creates a parallel line or vector through a point in 3D
 *
 * Syntax:
 *   pll3d(vec/line, point)          - parallel, same length as reference
 *   pll3d(vec/line, point, length)  - parallel with custom length
 *
 * Returns line3d if input is line3d, vector3d if input is vector3d.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 3, 2, 1)
 *   pll3d(V, point3d(g, 1, 1, 1))        // parallel vector at (1,1,1)
 *   pll3d(V, point3d(g, 1, 1, 1), 5)     // parallel vector with length 5
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Vector3DCommand } from '../../../commands/3d/Vector3DCommand.js';
import { Line3DCommand } from '../../../commands/3d/Line3DCommand.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class PLL3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'pll3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2] - the result parallel
        this.graphExpression = null;
        this.inputType = 'vector3d'; // 'vector3d' or 'line3d'
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(`pll3d() needs arguments.\nUsage: pll3d(vec/line, point) or pll3d(vec/line, point, length)`);
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg is vector3d or line3d reference
        const sourceExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const sourceType = sourceExpr.getGeometryType?.() || sourceExpr.getName();

        if (sourceType !== 'vector3d' && sourceType !== 'line3d') {
            this.dispatchError(`pll3d() requires a vector3d or line3d as first argument, got: ${sourceType}`);
        }

        this.inputType = sourceType;
        this.graphExpression = sourceExpr.graphExpression;

        // Get source line/vector coordinates
        const sourceCoords = sourceExpr.getVariableAtomicValues();
        const refStart = { x: sourceCoords[0], y: sourceCoords[1], z: sourceCoords[2] };
        const refEnd = { x: sourceCoords[3], y: sourceCoords[4], z: sourceCoords[5] };

        // Calculate direction and reference length
        const direction = {
            x: refEnd.x - refStart.x,
            y: refEnd.y - refStart.y,
            z: refEnd.z - refStart.z
        };
        const refLength = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);

        // Second arg is the point to pass through
        const pointExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const pointCoords = pointExpr.getVariableAtomicValues();

        if (pointCoords.length < 3) {
            this.dispatchError(`pll3d() requires a point3d as second argument`);
        }

        const throughPoint = { x: pointCoords[0], y: pointCoords[1], z: pointCoords[2] };

        // Third arg (optional) is length
        let length = refLength; // default to reference length
        if (this.subExpressions.length >= 3) {
            const lengthExpr = this._getResolvedExpression(context, this.subExpressions[2]);
            const lengthValue = lengthExpr.getVariableAtomicValues()[0];
            if (typeof lengthValue === 'number' && lengthValue !== 0) {
                length = lengthValue;
            }
        }

        // Create parallel: normalize direction, scale to length, center at point
        const mag = refLength || 1;
        const unitDir = {
            x: direction.x / mag,
            y: direction.y / mag,
            z: direction.z / mag
        };

        const halfLen = length / 2;
        const parallelStart = {
            x: throughPoint.x - unitDir.x * halfLen,
            y: throughPoint.y - unitDir.y * halfLen,
            z: throughPoint.z - unitDir.z * halfLen
        };
        const parallelEnd = {
            x: throughPoint.x + unitDir.x * halfLen,
            y: throughPoint.y + unitDir.y * halfLen,
            z: throughPoint.z + unitDir.z * halfLen
        };

        this.coordinates = [
            parallelStart.x, parallelStart.y, parallelStart.z,
            parallelEnd.x, parallelEnd.y, parallelEnd.z
        ];
    }

    getName() {
        return PLL3DExpression.NAME;
    }

    getGeometryType() {
        return this.inputType;
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    getLinePoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1], z: this.coordinates[2] },
            { x: this.coordinates[3], y: this.coordinates[4], z: this.coordinates[5] }
        ];
    }

    getLine() {
        return {
            start: { x: this.coordinates[0], y: this.coordinates[1], z: this.coordinates[2] },
            end: { x: this.coordinates[3], y: this.coordinates[4], z: this.coordinates[5] }
        };
    }

    getVector() {
        return this.getLine();
    }

    getVectorPoints() {
        return this.getLinePoints();
    }

    getStartValue() {
        return [this.coordinates[0], this.coordinates[1], this.coordinates[2]];
    }

    getEndValue() {
        return [this.coordinates[3], this.coordinates[4], this.coordinates[5]];
    }

    getMidpoint() {
        return {
            x: (this.coordinates[0] + this.coordinates[3]) / 2,
            y: (this.coordinates[1] + this.coordinates[4]) / 2,
            z: (this.coordinates[2] + this.coordinates[5]) / 2
        };
    }

    getFriendlyToStr() {
        const pts = this.getLinePoints();
        return `pll3d[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
    }

    toCommand(options = {}) {
        const pts = this.getLinePoints();
        const geomType = this.getGeometryType();
        const defaults = ExpressionOptionsRegistry.get(geomType);
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };

        if (this.inputType === 'line3d') {
            return new Line3DCommand(this.graphExpression, pts[0], pts[1], mergedOpts);
        }
        return new Vector3DCommand(this.graphExpression, pts[0], pts[1], mergedOpts);
    }

    canPlay() {
        return true;
    }
}
