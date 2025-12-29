/**
 * Decompose3DExpression - decomposes a 3D vector into components along axes
 *
 * Syntax:
 *   decompose3d(vec)                  - returns x component by default
 *   decompose3d(vec, "x")             - x component
 *   decompose3d(vec, "y")             - y component
 *   decompose3d(vec, "z")             - z component
 *   decompose3d(vec, refVec)          - parallel component along reference vector
 *   decompose3d(vec, refVec, "perp")  - perpendicular component (requires axis for 3D)
 *
 * Returns the decomposed component as a vector starting from the original vector's start point.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 3, 2, 1)
 *   decompose3d(V)                    // x component: (0,0,0) -> (3,0,0)
 *   decompose3d(V, "y")               // y component: (0,0,0) -> (0,2,0)
 *   decompose3d(V, "z")               // z component: (0,0,0) -> (0,0,1)
 *   decompose3d(V, B)                 // parallel component along B
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Vector3DCommand } from '../../../commands/3d/Vector3DCommand.js';
import { Line3DCommand } from '../../../commands/3d/Line3DCommand.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Decompose3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'decompose3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2]
        this.graphExpression = null;
        this.inputType = 'vector3d'; // 'vector3d' or 'line3d'
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('decompose3d() requires at least one vector argument');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg is vector to decompose
        const vecExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const vecType = vecExpr.getGeometryType?.() || vecExpr.getName();

        if (vecType !== 'vector3d' && vecType !== 'line3d') {
            this.dispatchError(`decompose3d() requires vector3d or line3d as first argument, got: ${vecType}`);
        }

        this.inputType = vecType;
        this.graphExpression = vecExpr.graphExpression;

        const coords = vecExpr.getVariableAtomicValues();
        const start = { x: coords[0], y: coords[1], z: coords[2] };
        const end = { x: coords[3], y: coords[4], z: coords[5] };

        // Vector as displacement
        const vec = {
            x: end.x - start.x,
            y: end.y - start.y,
            z: end.z - start.z
        };

        let component;

        if (this.subExpressions.length === 1) {
            // Default: x component
            component = { x: vec.x, y: 0, z: 0 };
        } else {
            // Second arg could be "x", "y", "z" string or a reference vector
            const secondArg = this._getResolvedExpression(context, this.subExpressions[1]);

            // Check if it's a string
            if (secondArg.getStringValue) {
                const axis = secondArg.getStringValue().toLowerCase();
                component = this._getAxisComponent(vec, axis);
            } else {
                const secondValues = secondArg.getVariableAtomicValues();

                if (secondValues.length >= 6) {
                    // It's a reference vector - project onto it
                    const refStart = { x: secondValues[0], y: secondValues[1], z: secondValues[2] };
                    const refEnd = { x: secondValues[3], y: secondValues[4], z: secondValues[5] };
                    const refVec = {
                        x: refEnd.x - refStart.x,
                        y: refEnd.y - refStart.y,
                        z: refEnd.z - refStart.z
                    };

                    // Check for "perp" flag
                    let isPerp = false;
                    if (this.subExpressions.length >= 3) {
                        const thirdArg = this._getResolvedExpression(context, this.subExpressions[2]);
                        if (thirdArg.getStringValue) {
                            isPerp = thirdArg.getStringValue().toLowerCase() === 'perp';
                        }
                    }

                    if (isPerp) {
                        // Perpendicular component: vec - proj
                        const proj = this._projectOnto(vec, refVec);
                        component = {
                            x: vec.x - proj.x,
                            y: vec.y - proj.y,
                            z: vec.z - proj.z
                        };
                    } else {
                        // Parallel component: projection onto refVec
                        component = this._projectOnto(vec, refVec);
                    }
                } else if (secondValues.length === 1) {
                    // Could be a single character string parsed as number - check common cases
                    this.dispatchError('decompose3d() second argument must be "x", "y", "z", or a reference vector');
                } else {
                    this.dispatchError('decompose3d() second argument must be "x", "y", "z", or a reference vector');
                }
            }
        }

        const componentEnd = {
            x: start.x + component.x,
            y: start.y + component.y,
            z: start.z + component.z
        };

        this.coordinates = [
            start.x, start.y, start.z,
            componentEnd.x, componentEnd.y, componentEnd.z
        ];
    }

    /**
     * Get component along world axis
     */
    _getAxisComponent(vec, axis) {
        switch (axis) {
            case 'x':
                return { x: vec.x, y: 0, z: 0 };
            case 'y':
                return { x: 0, y: vec.y, z: 0 };
            case 'z':
                return { x: 0, y: 0, z: vec.z };
            default:
                this.dispatchError(`decompose3d() axis must be "x", "y", or "z", got: "${axis}"`);
        }
    }

    /**
     * Project vector a onto vector b
     * proj_b(a) = ((a · b) / (b · b)) * b
     */
    _projectOnto(a, b) {
        const aDotB = a.x * b.x + a.y * b.y + a.z * b.z;
        const bDotB = b.x * b.x + b.y * b.y + b.z * b.z;

        if (bDotB === 0) {
            return { x: 0, y: 0, z: 0 };
        }

        const scalar = aDotB / bDotB;
        return {
            x: b.x * scalar,
            y: b.y * scalar,
            z: b.z * scalar
        };
    }

    getName() {
        return Decompose3DExpression.NAME;
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
        return `decompose3d[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
    }

    toCommand(options = {}) {
        const pts = this.getVectorPoints();
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
