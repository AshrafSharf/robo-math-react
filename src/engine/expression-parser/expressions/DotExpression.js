/**
 * DotExpression - calculates dot product of two vectors (2D or 3D)
 *
 * Syntax:
 *   dot(vecA, vecB)    - dot product of two vectors
 *
 * Auto-detects 2D vs 3D based on input vector types.
 * Returns a single numeric value.
 *
 * Formula:
 *   2D: a·b = ax*bx + ay*by
 *   3D: a·b = ax*bx + ay*by + az*bz
 *
 * Examples:
 *   A = vector(g, 0, 0, 3, 4)
 *   B = vector(g, 0, 0, 1, 0)
 *   dot(A, B)                    // returns 3
 *
 *   A3 = vector3d(g, 0, 0, 0, 1, 2, 3)
 *   B3 = vector3d(g, 0, 0, 0, 4, 5, 6)
 *   dot(A3, B3)                  // returns 1*4 + 2*5 + 3*6 = 32
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';

export class DotExpression extends AbstractArithmeticExpression {
    static NAME = 'dot';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.value = 0;
        this.is3D = false;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('dot() requires two vector arguments: dot(vecA, vecB)');
        }

        // Resolve both vectors
        this.subExpressions[0].resolve(context);
        this.subExpressions[1].resolve(context);

        const vecAExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const vecBExpr = this._getResolvedExpression(context, this.subExpressions[1]);

        // Detect if 3D based on geometry type
        const aType = vecAExpr.getGeometryType?.() || vecAExpr.getName();
        const bType = vecBExpr.getGeometryType?.() || vecBExpr.getName();

        this.is3D = aType.includes('3d') || bType.includes('3d');

        const aCoords = vecAExpr.getVariableAtomicValues();
        const bCoords = vecBExpr.getVariableAtomicValues();

        if (this.is3D) {
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
            this.value = aVec.x * bVec.x + aVec.y * bVec.y + aVec.z * bVec.z;
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
            this.value = aVec.x * bVec.x + aVec.y * bVec.y;
        }
    }

    getName() {
        return DotExpression.NAME;
    }

    getVariableAtomicValues() {
        return [this.value];
    }

    getValue() {
        return this.value;
    }

    getFriendlyToStr() {
        return `dot(${this.value})`;
    }

    // dot() doesn't create a command - it's just a numeric value
    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
