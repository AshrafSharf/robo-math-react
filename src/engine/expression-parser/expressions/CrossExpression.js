/**
 * CrossExpression - calculates cross product of two vectors (2D or 3D)
 *
 * Syntax:
 *   cross(vecA, vecB)                     - cross product (2D returns scalar, 3D returns vector at origin)
 *   cross(vecA, vecB, point)              - 3D cross product, result at point
 *   cross(vecA, vecB, x, y, z)            - 3D cross product, result at (x,y,z)
 *
 * Auto-detects 2D vs 3D based on input vector types.
 *
 * 2D: Returns scalar (z-component of 3D cross with z=0)
 *     a × b = ax*by - ay*bx
 *
 * 3D: Returns vector
 *     a × b = (ay*bz - az*by, az*bx - ax*bz, ax*by - ay*bx)
 *
 * Examples:
 *   A = vector(g, 0, 0, 3, 0)
 *   B = vector(g, 0, 0, 0, 4)
 *   cross(A, B)                     // returns 12 (scalar for 2D)
 *
 *   A3 = vector3d(g, 0, 0, 0, 1, 0, 0)
 *   B3 = vector3d(g, 0, 0, 0, 0, 1, 0)
 *   C = cross(A3, B3)               // returns vector (0,0,0) -> (0, 0, 1)
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { Vector3DCommand } from '../../commands/3d/Vector3DCommand.js';
import { ExpressionOptionsRegistry } from '../core/ExpressionOptionsRegistry.js';

export class CrossExpression extends AbstractArithmeticExpression {
    static NAME = 'cross';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.value = 0;           // For 2D: scalar result
        this.coordinates = [];     // For 3D: [x1, y1, z1, x2, y2, z2]
        this.graphExpression = null;
        this.is3D = false;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('cross() requires: cross(vecA, vecB)');
        }

        // Resolve all
        for (const expr of this.subExpressions) {
            expr.resolve(context);
        }

        // Get vectors
        const vecAExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const vecBExpr = this._getResolvedExpression(context, this.subExpressions[1]);

        // Detect if 3D based on geometry type
        const aType = vecAExpr.getGeometryType?.() || vecAExpr.getName();
        const bType = vecBExpr.getGeometryType?.() || vecBExpr.getName();

        this.is3D = aType.includes('3d') || bType.includes('3d');

        const aCoords = vecAExpr.getVariableAtomicValues();
        const bCoords = vecBExpr.getVariableAtomicValues();

        if (this.is3D) {
            this.graphExpression = vecAExpr.graphExpression;

            // 3D: coords are [x1, y1, z1, x2, y2, z2]
            const aVec = {
                x: aCoords[3] - aCoords[0],
                y: aCoords[4] - aCoords[1],
                z: aCoords[5] - aCoords[2]
            };
            const bVec = {
                x: bCoords[3] - bCoords[0],
                y: bCoords[4] - bCoords[1],
                z: bCoords[5] - bCoords[2]
            };

            // 3D cross product
            const crossVec = {
                x: aVec.y * bVec.z - aVec.z * bVec.y,
                y: aVec.z * bVec.x - aVec.x * bVec.z,
                z: aVec.x * bVec.y - aVec.y * bVec.x
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
                x: resultStart.x + crossVec.x,
                y: resultStart.y + crossVec.y,
                z: resultStart.z + crossVec.z
            };

            this.coordinates = [
                resultStart.x, resultStart.y, resultStart.z,
                resultEnd.x, resultEnd.y, resultEnd.z
            ];

            // Also store scalar value (magnitude of cross product)
            this.value = Math.sqrt(crossVec.x ** 2 + crossVec.y ** 2 + crossVec.z ** 2);
        } else {
            // 2D: coords are [x1, y1, x2, y2]
            const aVec = {
                x: aCoords[2] - aCoords[0],
                y: aCoords[3] - aCoords[1]
            };
            const bVec = {
                x: bCoords[2] - bCoords[0],
                y: bCoords[3] - bCoords[1]
            };

            // 2D cross product = z-component = ax*by - ay*bx
            this.value = aVec.x * bVec.y - aVec.y * bVec.x;
        }
    }

    getName() {
        return CrossExpression.NAME;
    }

    getGeometryType() {
        return this.is3D ? 'vector3d' : 'scalar';
    }

    getVariableAtomicValues() {
        if (this.is3D) {
            return this.coordinates.slice();
        }
        return [this.value];
    }

    getValue() {
        return this.value;
    }

    getVectorPoints() {
        if (!this.is3D) return null;
        return [
            { x: this.coordinates[0], y: this.coordinates[1], z: this.coordinates[2] },
            { x: this.coordinates[3], y: this.coordinates[4], z: this.coordinates[5] }
        ];
    }

    getVector() {
        if (!this.is3D) return null;
        return {
            start: { x: this.coordinates[0], y: this.coordinates[1], z: this.coordinates[2] },
            end: { x: this.coordinates[3], y: this.coordinates[4], z: this.coordinates[5] }
        };
    }

    getStartValue() {
        if (!this.is3D) return [this.value];
        return [this.coordinates[0], this.coordinates[1], this.coordinates[2]];
    }

    getEndValue() {
        if (!this.is3D) return [this.value];
        return [this.coordinates[3], this.coordinates[4], this.coordinates[5]];
    }

    getFriendlyToStr() {
        if (this.is3D) {
            const pts = this.getVectorPoints();
            return `cross[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
        }
        return `cross(${this.value})`;
    }

    toCommand(options = {}) {
        if (this.is3D) {
            const pts = this.getVectorPoints();
            const defaults = ExpressionOptionsRegistry.get('vector3d');
            const mergedOpts = {
                styleOptions: {
                    ...defaults.styleOptions,
                    ...(options.styleOptions || {})
                }
            };
            return new Vector3DCommand(this.graphExpression, pts[0], pts[1], mergedOpts);
        }
        // 2D: no command (scalar value)
        return null;
    }

    canPlay() {
        return this.is3D;
    }
}
