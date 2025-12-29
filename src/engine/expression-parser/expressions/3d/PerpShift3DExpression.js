/**
 * PerpShift3DExpression - shifts a 3D vector perpendicular to its direction
 *
 * In 3D, perpendicular direction is determined using cross product with an axis vector.
 * The perpendicular direction is: normalize(cross(vecDir, axisDir))
 *
 * Syntax:
 *   perpshift3d(vec, distance, axisVec)       - shift perpendicular by distance using axis
 *   perpshift3d(vec, distance, ax, ay, az)    - axis as 3 numbers
 *
 * Positive distance shifts in cross product direction, negative in opposite direction.
 * Animates the shift using GSAP.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 1, 0, 0)   // x-axis vector
 *   A = vector3d(g, 0, 0, 0, 0, 0, 1)   // z-axis
 *   perpshift3d(V, 2, A)                // shift V perpendicular by 2, using z-axis to determine direction
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { PerpShift3DCommand } from '../../../commands/3d/PerpShift3DCommand.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class PerpShift3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'perpshift3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2] - shifted position
        this.graphExpression = null;
        this.vectorExpression = null;
        this.originalShapeVarName = null;
        this.inputType = 'vector3d'; // 'vector3d' or 'line3d'

        // For animation
        this.vecStart = null;
        this.vecEnd = null;
        this.shiftedStart = null;
        this.shiftedEnd = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('perpshift3d() requires: perpshift3d(vec, distance, axisVec) or perpshift3d(vec, distance, ax, ay, az)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg is vector to shift
        this.vectorExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        const vecType = this.vectorExpression.getGeometryType?.() || this.vectorExpression.getName();

        if (vecType !== 'vector3d' && vecType !== 'line3d') {
            this.dispatchError(`perpshift3d() requires vector3d or line3d as first argument, got: ${vecType}`);
        }

        this.inputType = vecType;
        this.originalShapeVarName = this.subExpressions[0].variableName || this.vectorExpression.variableName;
        this.graphExpression = this.vectorExpression.graphExpression;

        const coords = this.vectorExpression.getVariableAtomicValues();
        this.vecStart = { x: coords[0], y: coords[1], z: coords[2] };
        this.vecEnd = { x: coords[3], y: coords[4], z: coords[5] };

        // Vector direction
        const vecDir = {
            x: this.vecEnd.x - this.vecStart.x,
            y: this.vecEnd.y - this.vecStart.y,
            z: this.vecEnd.z - this.vecStart.z
        };

        // Second arg is distance
        const distExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const distance = distExpr.getVariableAtomicValues()[0];

        // Parse axis from remaining args (starting at index 2)
        const axis = this._parseAxis(context);

        // Compute perpendicular direction using cross product
        const perpDir = this._crossProduct(vecDir, axis);
        const perpMag = Math.sqrt(perpDir.x * perpDir.x + perpDir.y * perpDir.y + perpDir.z * perpDir.z);

        if (perpMag === 0) {
            this.dispatchError('perpshift3d() vector and axis are parallel - cannot determine perpendicular direction');
        }

        // Normalize and scale by distance
        const offset = {
            x: (perpDir.x / perpMag) * distance,
            y: (perpDir.y / perpMag) * distance,
            z: (perpDir.z / perpMag) * distance
        };

        // Shifted position
        this.shiftedStart = {
            x: this.vecStart.x + offset.x,
            y: this.vecStart.y + offset.y,
            z: this.vecStart.z + offset.z
        };
        this.shiftedEnd = {
            x: this.vecEnd.x + offset.x,
            y: this.vecEnd.y + offset.y,
            z: this.vecEnd.z + offset.z
        };

        this.coordinates = [
            this.shiftedStart.x, this.shiftedStart.y, this.shiftedStart.z,
            this.shiftedEnd.x, this.shiftedEnd.y, this.shiftedEnd.z
        ];
    }

    /**
     * Parse axis vector from arguments starting at index 2
     */
    _parseAxis(context) {
        const remainingArgs = this.subExpressions.slice(2);

        if (remainingArgs.length === 0) {
            this.dispatchError('perpshift3d() requires an axis vector');
        }

        const firstArg = this._getResolvedExpression(context, remainingArgs[0]);
        const firstValues = firstArg.getVariableAtomicValues();

        if (firstValues.length >= 6) {
            // It's a vector3d - extract direction
            return {
                x: firstValues[3] - firstValues[0],
                y: firstValues[4] - firstValues[1],
                z: firstValues[5] - firstValues[2]
            };
        } else if (firstValues.length >= 3) {
            // It's a point3d - use as direction
            return { x: firstValues[0], y: firstValues[1], z: firstValues[2] };
        } else if (remainingArgs.length >= 3) {
            // Three separate numbers (ax, ay, az)
            const ay = this._getResolvedExpression(context, remainingArgs[1]).getVariableAtomicValues()[0];
            const az = this._getResolvedExpression(context, remainingArgs[2]).getVariableAtomicValues()[0];
            return { x: firstValues[0], y: ay, z: az };
        }

        this.dispatchError('perpshift3d() requires axis as vector3d, point3d, or (ax, ay, az)');
    }

    /**
     * Compute cross product: a × b
     */
    _crossProduct(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    getName() {
        return PerpShift3DExpression.NAME;
    }

    getGeometryType() {
        return this.inputType;
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    getVectorPoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1], z: this.coordinates[2] },
            { x: this.coordinates[3], y: this.coordinates[4], z: this.coordinates[5] }
        ];
    }

    getVector() {
        return {
            start: { x: this.coordinates[0], y: this.coordinates[1], z: this.coordinates[2] },
            end: { x: this.coordinates[3], y: this.coordinates[4], z: this.coordinates[5] }
        };
    }

    getLinePoints() {
        return this.getVectorPoints();
    }

    getLine() {
        return this.getVector();
    }

    getStartValue() {
        return [this.coordinates[0], this.coordinates[1], this.coordinates[2]];
    }

    getEndValue() {
        return [this.coordinates[3], this.coordinates[4], this.coordinates[5]];
    }

    getFriendlyToStr() {
        const pts = this.getVectorPoints();
        return `perpshift3d[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
    }

    toCommand(options = {}) {
        const geomType = this.getGeometryType();
        const defaults = ExpressionOptionsRegistry.get(geomType);
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...this.getStyleOptions(),
                ...(options.styleOptions || {})
            }
        };

        return new PerpShift3DCommand(
            this.vectorExpression,
            this.originalShapeVarName,
            this.vecStart,
            this.vecEnd,
            this.shiftedStart,
            this.shiftedEnd,
            this.inputType,
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
