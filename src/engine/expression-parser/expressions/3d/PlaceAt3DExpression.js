/**
 * PlaceAt3DExpression - copies a 3D vector/line to a new starting point
 *
 * Syntax:
 *   placeat3d(vec, point)         - copy vector to start at point
 *   placeat3d(vec, x, y, z)       - copy vector to start at (x, y, z)
 *   placeat3d(line, point)        - copy line as line to start at point
 *
 * Returns a new vector/line with the same direction and magnitude at the new starting point.
 * Useful for parallelogram construction and vector translation.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 3, 2, 1)
 *   placeat3d(V, point3d(g, 1, 1, 1))    // copy V to start at (1,1,1)
 *   placeat3d(V, 2, 3, 4)                // copy V to start at (2,3,4)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Vector3DCommand } from '../../../commands/3d/Vector3DCommand.js';
import { Line3DCommand } from '../../../commands/3d/Line3DCommand.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class PlaceAt3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'placeat3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2]
        this.graphExpression = null;
        this.inputType = 'vector3d'; // 'vector3d' or 'line3d'
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('placeat3d() requires: placeat3d(vec, point) or placeat3d(vec, x, y, z)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg is vector3d or line3d
        const sourceExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const sourceType = sourceExpr.getGeometryType?.() || sourceExpr.getName();

        if (sourceType !== 'vector3d' && sourceType !== 'line3d') {
            this.dispatchError(`placeat3d() requires a vector3d or line3d as first argument, got: ${sourceType}`);
        }

        this.inputType = sourceType;
        this.graphExpression = sourceExpr.graphExpression;

        // Get source coordinates
        const sourceCoords = sourceExpr.getVariableAtomicValues();
        const start = { x: sourceCoords[0], y: sourceCoords[1], z: sourceCoords[2] };
        const end = { x: sourceCoords[3], y: sourceCoords[4], z: sourceCoords[5] };

        // Calculate the displacement vector
        const displacement = {
            x: end.x - start.x,
            y: end.y - start.y,
            z: end.z - start.z
        };

        // Get new start position from remaining args
        let newStart;
        const secondArg = this._getResolvedExpression(context, this.subExpressions[1]);
        const secondValues = secondArg.getVariableAtomicValues();

        if (secondValues.length >= 3) {
            // Point3d expression
            newStart = { x: secondValues[0], y: secondValues[1], z: secondValues[2] };
        } else if (this.subExpressions.length >= 4) {
            // Three separate numbers (x, y, z)
            const thirdArg = this._getResolvedExpression(context, this.subExpressions[2]);
            const fourthArg = this._getResolvedExpression(context, this.subExpressions[3]);
            newStart = {
                x: secondValues[0],
                y: thirdArg.getVariableAtomicValues()[0],
                z: fourthArg.getVariableAtomicValues()[0]
            };
        } else {
            this.dispatchError('placeat3d() requires a point3d or (x, y, z) coordinates for new start');
        }

        // Calculate new end by applying displacement to new start
        const newEnd = {
            x: newStart.x + displacement.x,
            y: newStart.y + displacement.y,
            z: newStart.z + displacement.z
        };

        this.coordinates = [
            newStart.x, newStart.y, newStart.z,
            newEnd.x, newEnd.y, newEnd.z
        ];
    }

    getName() {
        return PlaceAt3DExpression.NAME;
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
        return `placeat3d[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
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
