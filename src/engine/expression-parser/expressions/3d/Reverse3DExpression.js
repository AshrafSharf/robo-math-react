/**
 * Reverse3DExpression - creates a reversed (flipped) 3D vector or line
 *
 * Syntax:
 *   reverse3d(vectorVar)              - create reversed vector at same tail position
 *   reverse3d(lineVar)                - create reversed line at same start position
 *
 * This creates a new vector/line with opposite direction, pivoting around the start point.
 * The new shape points in the opposite direction from the original.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 3, 2, 1)
 *   reverse3d(V)                      // creates vector from (0,0,0) to (-3,-2,-1)
 *   L = line3d(g, 0, 0, 0, 2, 2, 2)
 *   reverse3d(L)                      // creates line from (0,0,0) to (-2,-2,-2)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Reverse3DCommand } from '../../../commands/3d/Reverse3DCommand.js';

export class Reverse3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'reverse3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vectorExpression = null;
        this.originalShapeVarName = null;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2] - reversed vector coords
        this.inputType = 'vector3d'; // 'vector3d' or 'line3d'
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('reverse3d() requires 1 argument: reverse3d(vectorVar)');
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
            this.dispatchError('reverse3d() requires a vector3d or line3d as first argument');
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

        // Reversed vector: same start, opposite direction
        this.coordinates = [
            origStart.x,
            origStart.y,
            origStart.z,
            origStart.x - dx,
            origStart.y - dy,
            origStart.z - dz
        ];
    }

    getName() {
        return Reverse3DExpression.NAME;
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
        return `reverse3d[(${pts[0].x}, ${pts[0].y}, ${pts[0].z}) -> (${pts[1].x}, ${pts[1].y}, ${pts[1].z})]`;
    }

    toCommand(options = {}) {
        return new Reverse3DCommand(
            this.vectorExpression,
            this.originalShapeVarName,
            this.coordinates,
            this.inputType,
            options
        );
    }

    canPlay() {
        return true;
    }
}
