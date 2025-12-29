/**
 * VecSum3DExpression - creates the result vector of adding two 3D vectors
 *
 * Syntax:
 *   vecsum3d(vecA, vecB)              - add vectors, result starts at origin
 *   vecsum3d(vecA, vecB, point)       - add vectors, result starts at point
 *   vecsum3d(vecA, vecB, x, y, z)     - add vectors, result starts at (x, y, z)
 *
 * Returns the mathematical sum a + b as a vector.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   A = vector3d(g, 0, 0, 0, 3, 0, 0)
 *   B = vector3d(g, 0, 0, 0, 0, 2, 0)
 *   vecsum3d(A, B)                        // result: (0,0,0) -> (3,2,0)
 *   vecsum3d(A, B, point3d(g, 1, 1, 1))   // result: (1,1,1) -> (4,3,1)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Vector3DCommand } from '../../../commands/3d/Vector3DCommand.js';
import { Line3DCommand } from '../../../commands/3d/Line3DCommand.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class VecSum3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'vecsum3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2]
        this.graphExpression = null;
        this.inputType = 'vector3d'; // 'vector3d' or 'line3d'
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('vecsum3d() requires: vecsum3d(vecA, vecB)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg is vector A
        const vecAExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const aType = vecAExpr.getGeometryType?.() || vecAExpr.getName();

        if (aType !== 'vector3d' && aType !== 'line3d') {
            this.dispatchError(`vecsum3d() requires vector3d or line3d as first argument, got: ${aType}`);
        }

        this.inputType = aType;
        this.graphExpression = vecAExpr.graphExpression;

        const aCoords = vecAExpr.getVariableAtomicValues();
        const aStart = { x: aCoords[0], y: aCoords[1], z: aCoords[2] };
        const aEnd = { x: aCoords[3], y: aCoords[4], z: aCoords[5] };

        // Vector A as displacement
        const aVec = {
            x: aEnd.x - aStart.x,
            y: aEnd.y - aStart.y,
            z: aEnd.z - aStart.z
        };

        // Second arg is vector B
        const vecBExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const bCoords = vecBExpr.getVariableAtomicValues();
        const bStart = { x: bCoords[0], y: bCoords[1], z: bCoords[2] };
        const bEnd = { x: bCoords[3], y: bCoords[4], z: bCoords[5] };

        // Vector B as displacement
        const bVec = {
            x: bEnd.x - bStart.x,
            y: bEnd.y - bStart.y,
            z: bEnd.z - bStart.z
        };

        // Sum vector
        const sumVec = {
            x: aVec.x + bVec.x,
            y: aVec.y + bVec.y,
            z: aVec.z + bVec.z
        };

        // Get result start position from optional args (defaults to origin)
        let resultStart = { x: 0, y: 0, z: 0 };

        if (this.subExpressions.length >= 3) {
            const thirdArg = this._getResolvedExpression(context, this.subExpressions[2]);
            const thirdValues = thirdArg.getVariableAtomicValues();

            if (thirdValues.length >= 3) {
                // Point3d expression
                resultStart = { x: thirdValues[0], y: thirdValues[1], z: thirdValues[2] };
            } else if (this.subExpressions.length >= 5) {
                // Three numbers (x, y, z)
                const fourthArg = this._getResolvedExpression(context, this.subExpressions[3]);
                const fifthArg = this._getResolvedExpression(context, this.subExpressions[4]);
                resultStart = {
                    x: thirdValues[0],
                    y: fourthArg.getVariableAtomicValues()[0],
                    z: fifthArg.getVariableAtomicValues()[0]
                };
            }
        }

        const resultEnd = {
            x: resultStart.x + sumVec.x,
            y: resultStart.y + sumVec.y,
            z: resultStart.z + sumVec.z
        };

        this.coordinates = [
            resultStart.x, resultStart.y, resultStart.z,
            resultEnd.x, resultEnd.y, resultEnd.z
        ];
    }

    getName() {
        return VecSum3DExpression.NAME;
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

    getMidpoint() {
        return {
            x: (this.coordinates[0] + this.coordinates[3]) / 2,
            y: (this.coordinates[1] + this.coordinates[4]) / 2,
            z: (this.coordinates[2] + this.coordinates[5]) / 2
        };
    }

    getFriendlyToStr() {
        const pts = this.getVectorPoints();
        return `vecsum3d[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
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
