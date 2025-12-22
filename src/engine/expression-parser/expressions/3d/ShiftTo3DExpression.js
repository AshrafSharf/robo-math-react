/**
 * ShiftTo3DExpression - Shifts a 3D vector or line to a new position
 *
 * Repositions the vector/line so its tail (start point) is at the target position,
 * while preserving its direction and magnitude.
 *
 * Syntax:
 *   shiftTo3d(vectorVar, point3d)        - shift vector to start at point3d
 *   shiftTo3d(vectorVar, x, y, z)        - shift vector to start at (x, y, z)
 *   shiftTo3d(lineVar, point3d)          - shift line to start at point3d
 *   shiftTo3d(lineVar, x, y, z)          - shift line to start at (x, y, z)
 *
 * @example
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 3, 2, 1)
 *   shiftTo3d(V, point3d(g, 2, 2, 2))    // shift V to start at (2,2,2)
 *   shiftTo3d(V, 1, 1, 1)                // shift V to start at (1,1,1)
 *   L = line3d(g, 0, 0, 0, 2, 2, 2)
 *   shiftTo3d(L, 1, 1, 1)                // shift L to start at (1,1,1)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { ShiftTo3DCommand } from '../../../commands/3d/ShiftTo3DCommand.js';

export class ShiftTo3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'shiftTo3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vectorExpression = null;
        this.originalShapeVarName = null;
        this.targetPosition = null; // {x, y, z}
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2] - shifted vector coords
        this.inputType = 'vector3d'; // 'vector3d' or 'line3d'
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('shiftTo3d() requires at least 2 arguments: shiftTo3d(vectorVar, point3d) or shiftTo3d(vectorVar, x, y, z)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be a vector3d or line3d variable reference
        this.vectorExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        this.originalShapeVarName = this.subExpressions[0].variableName || this.vectorExpression.variableName;

        const shapeType = this.vectorExpression?.getGeometryType?.() || this.vectorExpression?.getName();
        if (shapeType !== 'vector3d' && shapeType !== 'line3d') {
            this.dispatchError('shiftTo3d() requires a vector3d or line3d as first argument');
        }
        this.inputType = shapeType;

        // Get original vector data
        const origCoords = this.vectorExpression.getVariableAtomicValues();
        const origStart = { x: origCoords[0], y: origCoords[1], z: origCoords[2] };
        const origEnd = { x: origCoords[3], y: origCoords[4], z: origCoords[5] };

        // Calculate vector displacement
        const dx = origEnd.x - origStart.x;
        const dy = origEnd.y - origStart.y;
        const dz = origEnd.z - origStart.z;

        // Second+ args define target position
        const secondArg = this._getResolvedExpression(context, this.subExpressions[1]);
        const secondValues = secondArg.getVariableAtomicValues();

        if (secondValues.length >= 3) {
            // Point3d expression
            this.targetPosition = { x: secondValues[0], y: secondValues[1], z: secondValues[2] };
        } else if (this.subExpressions.length >= 4) {
            // Three numbers (x, y, z)
            const thirdArg = this._getResolvedExpression(context, this.subExpressions[2]);
            const fourthArg = this._getResolvedExpression(context, this.subExpressions[3]);
            this.targetPosition = {
                x: secondValues[0],
                y: thirdArg.getVariableAtomicValues()[0],
                z: fourthArg.getVariableAtomicValues()[0]
            };
        } else {
            this.dispatchError('shiftTo3d() requires a point3d or (x, y, z) coordinates for target position');
        }

        // Calculate shifted vector coordinates
        this.coordinates = [
            this.targetPosition.x,
            this.targetPosition.y,
            this.targetPosition.z,
            this.targetPosition.x + dx,
            this.targetPosition.y + dy,
            this.targetPosition.z + dz
        ];
    }

    getName() {
        return ShiftTo3DExpression.NAME;
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

    getStartValue() {
        return [this.coordinates[0], this.coordinates[1], this.coordinates[2]];
    }

    getEndValue() {
        return [this.coordinates[3], this.coordinates[4], this.coordinates[5]];
    }

    getFriendlyToStr() {
        const pts = this.getVectorPoints();
        return `shiftTo3d[(${pts[0].x}, ${pts[0].y}, ${pts[0].z}) -> (${pts[1].x}, ${pts[1].y}, ${pts[1].z})]`;
    }

    toCommand(options = {}) {
        return new ShiftTo3DCommand(
            this.vectorExpression,
            this.originalShapeVarName,
            this.targetPosition,
            this.coordinates,
            this.inputType,
            options
        );
    }

    canPlay() {
        return true;
    }
}
