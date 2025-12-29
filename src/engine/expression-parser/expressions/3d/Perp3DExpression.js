/**
 * Perp3DExpression - creates a perpendicular line or vector through a point in 3D
 *
 * In 3D, there are infinite perpendicular directions. We use a reference axis vector
 * to determine which perpendicular direction to use via cross product.
 *
 * Syntax:
 *   perp3d(vec/line, point, axisVec)          - perpendicular, same length as reference
 *   perp3d(vec/line, point, axisVec, length)  - perpendicular with custom length
 *   perp3d(vec/line, point, ax, ay, az)       - axis as 3 numbers
 *   perp3d(vec/line, point, ax, ay, az, len)  - axis as 3 numbers with length
 *
 * The perpendicular direction is: normalize(cross(vecDir, axisDir))
 *
 * Returns line3d if input is line3d, vector3d if input is vector3d.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 1, 0, 0)   // x-axis
 *   A = vector3d(g, 0, 0, 0, 0, 0, 1)   // z-axis
 *   perp3d(V, point3d(g, 0, 0, 0), A)   // perpendicular to V in plane defined by z-axis
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Vector3DCommand } from '../../../commands/3d/Vector3DCommand.js';
import { Line3DCommand } from '../../../commands/3d/Line3DCommand.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Perp3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'perp3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2]
        this.graphExpression = null;
        this.inputType = 'vector3d'; // 'vector3d' or 'line3d'
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError(`perp3d() needs arguments.\nUsage: perp3d(vec/line, point, axisVec) or perp3d(vec/line, point, ax, ay, az)`);
        }

        // Resolve all subexpressions, separating styling
        const resolvedExprs = [];
        const styleExprs = [];

        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this.subExpressions[i];

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                resolvedExprs.push(expr);
            }
        }

        this._parseStyleExpressions(styleExprs);

        // First arg is vector3d or line3d reference
        const sourceExpr = this._getResolvedExpression(context, resolvedExprs[0]);
        const sourceType = sourceExpr.getGeometryType?.() || sourceExpr.getName();

        if (sourceType !== 'vector3d' && sourceType !== 'line3d') {
            this.dispatchError(`perp3d() requires a vector3d or line3d as first argument, got: ${sourceType}`);
        }

        this.inputType = sourceType;
        this.graphExpression = sourceExpr.graphExpression;

        // Get source direction
        const sourceCoords = sourceExpr.getVariableAtomicValues();
        const refStart = { x: sourceCoords[0], y: sourceCoords[1], z: sourceCoords[2] };
        const refEnd = { x: sourceCoords[3], y: sourceCoords[4], z: sourceCoords[5] };

        const vecDir = {
            x: refEnd.x - refStart.x,
            y: refEnd.y - refStart.y,
            z: refEnd.z - refStart.z
        };
        const refLength = Math.sqrt(vecDir.x * vecDir.x + vecDir.y * vecDir.y + vecDir.z * vecDir.z);

        // Second arg is the point to pass through
        const pointExpr = this._getResolvedExpression(context, resolvedExprs[1]);
        const pointCoords = pointExpr.getVariableAtomicValues();

        if (pointCoords.length < 3) {
            this.dispatchError(`perp3d() requires a point3d as second argument`);
        }

        const throughPoint = { x: pointCoords[0], y: pointCoords[1], z: pointCoords[2] };

        // Parse axis and optional length from remaining args
        const { axis, length } = this._parseAxisAndLength(context, refLength, resolvedExprs);

        // Compute perpendicular direction using cross product
        const perpDir = this._crossProduct(vecDir, axis);
        const perpMag = Math.sqrt(perpDir.x * perpDir.x + perpDir.y * perpDir.y + perpDir.z * perpDir.z);

        if (perpMag === 0) {
            this.dispatchError('perp3d() vector and axis are parallel - cannot determine perpendicular direction');
        }

        // Normalize and scale
        const unitPerp = {
            x: perpDir.x / perpMag,
            y: perpDir.y / perpMag,
            z: perpDir.z / perpMag
        };

        const halfLen = length / 2;
        const perpStart = {
            x: throughPoint.x - unitPerp.x * halfLen,
            y: throughPoint.y - unitPerp.y * halfLen,
            z: throughPoint.z - unitPerp.z * halfLen
        };
        const perpEnd = {
            x: throughPoint.x + unitPerp.x * halfLen,
            y: throughPoint.y + unitPerp.y * halfLen,
            z: throughPoint.z + unitPerp.z * halfLen
        };

        this.coordinates = [
            perpStart.x, perpStart.y, perpStart.z,
            perpEnd.x, perpEnd.y, perpEnd.z
        ];
    }

    /**
     * Parse axis vector and optional length from remaining arguments (starting at index 2)
     */
    _parseAxisAndLength(context, defaultLength, resolvedExprs) {
        const remainingArgs = resolvedExprs.slice(2);
        let axis = { x: 0, y: 0, z: 1 }; // default: z-axis
        let length = defaultLength;

        if (remainingArgs.length === 0) {
            this.dispatchError('perp3d() requires an axis vector');
        }

        // Check first remaining arg
        const firstArg = this._getResolvedExpression(context, remainingArgs[0]);
        const firstValues = firstArg.getVariableAtomicValues();

        if (firstValues.length >= 6) {
            // It's a vector3d - extract direction
            axis = {
                x: firstValues[3] - firstValues[0],
                y: firstValues[4] - firstValues[1],
                z: firstValues[5] - firstValues[2]
            };
            // Check for optional length
            if (remainingArgs.length >= 2) {
                const lenArg = this._getResolvedExpression(context, remainingArgs[1]);
                const lenValue = lenArg.getVariableAtomicValues()[0];
                if (typeof lenValue === 'number' && lenValue !== 0) {
                    length = lenValue;
                }
            }
        } else if (firstValues.length >= 3) {
            // It's a point3d - use as direction
            axis = { x: firstValues[0], y: firstValues[1], z: firstValues[2] };
            // Check for optional length
            if (remainingArgs.length >= 2) {
                const lenArg = this._getResolvedExpression(context, remainingArgs[1]);
                const lenValue = lenArg.getVariableAtomicValues()[0];
                if (typeof lenValue === 'number' && lenValue !== 0) {
                    length = lenValue;
                }
            }
        } else if (remainingArgs.length >= 3) {
            // Three separate numbers (ax, ay, az)
            const ay = this._getResolvedExpression(context, remainingArgs[1]).getVariableAtomicValues()[0];
            const az = this._getResolvedExpression(context, remainingArgs[2]).getVariableAtomicValues()[0];
            axis = { x: firstValues[0], y: ay, z: az };
            // Check for optional length
            if (remainingArgs.length >= 4) {
                const lenArg = this._getResolvedExpression(context, remainingArgs[3]);
                const lenValue = lenArg.getVariableAtomicValues()[0];
                if (typeof lenValue === 'number' && lenValue !== 0) {
                    length = lenValue;
                }
            }
        } else {
            this.dispatchError('perp3d() requires axis as vector3d, point3d, or (ax, ay, az)');
        }

        return { axis, length };
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
        return Perp3DExpression.NAME;
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
        return `perp3d[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
    }

    toCommand(options = {}) {
        const pts = this.getLinePoints();
        const geomType = this.getGeometryType();
        const defaults = ExpressionOptionsRegistry.get(geomType);
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...this.getStyleOptions(),
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
