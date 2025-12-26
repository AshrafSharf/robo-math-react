/**
 * Vector3D expression - represents a 3D vector (arrow)
 *
 * Syntax options:
 *   vector3d(graph, x1, y1, z1, x2, y2, z2)  - graph with coordinates
 *   vector3d(graph, point3d1, point3d2)      - graph with 3D points
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Vector3DCommand } from '../../../commands/3d/Vector3DCommand.js';
import { vector3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';
import { NumericExpression } from '../NumericExpression.js';

export class Vector3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'vector3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2]
        this.graphExpression = null; // Reference to graph expression
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(vector3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(vector3d_error_messages.GRAPH_REQUIRED());
        }

        // Remaining args are coordinates, separating styling
        this.coordinates = [];
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const resultExpression = this.subExpressions[i];

            if (this._isStyleExpression(resultExpression)) {
                styleExprs.push(resultExpression);
            } else {
                const atomicValues = resultExpression.getVariableAtomicValues();
                for (let j = 0; j < atomicValues.length; j++) {
                    this.coordinates.push(atomicValues[j]);
                }
            }
        }

        this._parseStyleExpressions(styleExprs);

        if (this.coordinates.length !== 6) {
            this.dispatchError(vector3d_error_messages.WRONG_COORD_COUNT(this.coordinates.length));
        }
    }

    /**
     * Get the vector as a direction (dx, dy, dz)
     */
    asVector() {
        return {
            x: this.coordinates[3] - this.coordinates[0],
            y: this.coordinates[4] - this.coordinates[1],
            z: this.coordinates[5] - this.coordinates[2]
        };
    }

    /**
     * Calculate vector magnitude (length)
     */
    magnitude() {
        const dx = this.coordinates[3] - this.coordinates[0];
        const dy = this.coordinates[4] - this.coordinates[1];
        const dz = this.coordinates[5] - this.coordinates[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    getName() {
        return Vector3DExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'vector3d'
     */
    getGeometryType() {
        return 'vector3d';
    }

    getVariableAtomicValues() {
        // Return all 6 coordinates (x1, y1, z1, x2, y2, z2)
        return this.coordinates.slice(0, 6);
    }

    /**
     * Get vector as start and end points
     */
    getVectorPoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1], z: this.coordinates[2] },
            { x: this.coordinates[3], y: this.coordinates[4], z: this.coordinates[5] }
        ];
    }

    /**
     * Get vector as an object with start and end points
     */
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

    /**
     * Get the midpoint of the vector
     */
    getMidpoint() {
        return {
            x: (this.coordinates[0] + this.coordinates[3]) / 2,
            y: (this.coordinates[1] + this.coordinates[4]) / 2,
            z: (this.coordinates[2] + this.coordinates[5]) / 2
        };
    }

    /**
     * Get a friendly string representation
     */
    getFriendlyToStr() {
        const pts = this.getVectorPoints();
        return `Vec3D[(${pts[0].x}, ${pts[0].y}, ${pts[0].z}) -> (${pts[1].x}, ${pts[1].y}, ${pts[1].z})]`;
    }

    /**
     * Create a Vector3DCommand from this expression
     * @param {Object} options - Command options { styleOptions: { strokeWidth, color, ... } }
     * @returns {Vector3DCommand}
     */
    toCommand(options = {}) {
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

    /**
     * Vectors can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }

    // ==================== Arithmetic Operations ====================

    /**
     * Add two 3D vectors (component-wise addition of direction vectors)
     * Result starts at this vector's start point
     * @param {Object} otherExpression - Another vector3d expression
     * @returns {Vector3DExpression} New vector with summed directions
     */
    add(otherExpression) {
        const otherAtomicValues = otherExpression.getVariableAtomicValues();

        // Check if other is also a 3D vector (6 values)
        if (otherAtomicValues.length !== 6) {
            this.dispatchError('Cannot add: both operands must be 3D vectors');
        }

        // Get direction vectors
        const thisDx = this.coordinates[3] - this.coordinates[0];
        const thisDy = this.coordinates[4] - this.coordinates[1];
        const thisDz = this.coordinates[5] - this.coordinates[2];
        const otherDx = otherAtomicValues[3] - otherAtomicValues[0];
        const otherDy = otherAtomicValues[4] - otherAtomicValues[1];
        const otherDz = otherAtomicValues[5] - otherAtomicValues[2];

        // Sum directions, keep start point
        const newEndX = this.coordinates[0] + thisDx + otherDx;
        const newEndY = this.coordinates[1] + thisDy + otherDy;
        const newEndZ = this.coordinates[2] + thisDz + otherDz;

        return this._createResolvedVector3D(
            this.coordinates[0], this.coordinates[1], this.coordinates[2],
            newEndX, newEndY, newEndZ
        );
    }

    /**
     * Subtract two 3D vectors (component-wise subtraction of direction vectors)
     * Result starts at this vector's start point
     * @param {Object} otherExpression - Another vector3d expression
     * @returns {Vector3DExpression} New vector with subtracted directions
     */
    subtract(otherExpression) {
        const otherAtomicValues = otherExpression.getVariableAtomicValues();

        // Check if other is also a 3D vector (6 values)
        if (otherAtomicValues.length !== 6) {
            this.dispatchError('Cannot subtract: both operands must be 3D vectors');
        }

        // Get direction vectors
        const thisDx = this.coordinates[3] - this.coordinates[0];
        const thisDy = this.coordinates[4] - this.coordinates[1];
        const thisDz = this.coordinates[5] - this.coordinates[2];
        const otherDx = otherAtomicValues[3] - otherAtomicValues[0];
        const otherDy = otherAtomicValues[4] - otherAtomicValues[1];
        const otherDz = otherAtomicValues[5] - otherAtomicValues[2];

        // Subtract directions, keep start point
        const newEndX = this.coordinates[0] + thisDx - otherDx;
        const newEndY = this.coordinates[1] + thisDy - otherDy;
        const newEndZ = this.coordinates[2] + thisDz - otherDz;

        return this._createResolvedVector3D(
            this.coordinates[0], this.coordinates[1], this.coordinates[2],
            newEndX, newEndY, newEndZ
        );
    }

    /**
     * Multiply 3D vector by scalar (scales the direction, keeps start point)
     * @param {Object} otherExpression - Scalar expression
     * @returns {Vector3DExpression} Scaled vector
     */
    multiply(otherExpression) {
        const otherAtomicValues = otherExpression.getVariableAtomicValues();

        // Must be scalar (1 value)
        if (otherAtomicValues.length !== 1) {
            this.dispatchError('Cannot multiply: 3D vector can only be multiplied by a scalar');
        }

        const scalar = otherAtomicValues[0];

        // Special case: -1 means reverse
        if (scalar === -1) {
            return this.reverse();
        }

        // Scale direction vector
        const dx = this.coordinates[3] - this.coordinates[0];
        const dy = this.coordinates[4] - this.coordinates[1];
        const dz = this.coordinates[5] - this.coordinates[2];
        const newEndX = this.coordinates[0] + dx * scalar;
        const newEndY = this.coordinates[1] + dy * scalar;
        const newEndZ = this.coordinates[2] + dz * scalar;

        return this._createResolvedVector3D(
            this.coordinates[0], this.coordinates[1], this.coordinates[2],
            newEndX, newEndY, newEndZ
        );
    }

    /**
     * Divide 3D vector by scalar (scales the direction, keeps start point)
     * @param {Object} otherExpression - Scalar expression
     * @returns {Vector3DExpression} Scaled vector
     */
    divide(otherExpression) {
        const otherAtomicValues = otherExpression.getVariableAtomicValues();

        // Must be scalar (1 value)
        if (otherAtomicValues.length !== 1) {
            this.dispatchError('Cannot divide: 3D vector can only be divided by a scalar');
        }

        const scalar = otherAtomicValues[0];

        if (scalar === 0) {
            this.dispatchError('Cannot divide by zero');
        }

        // Scale direction vector
        const dx = this.coordinates[3] - this.coordinates[0];
        const dy = this.coordinates[4] - this.coordinates[1];
        const dz = this.coordinates[5] - this.coordinates[2];
        const newEndX = this.coordinates[0] + dx / scalar;
        const newEndY = this.coordinates[1] + dy / scalar;
        const newEndZ = this.coordinates[2] + dz / scalar;

        return this._createResolvedVector3D(
            this.coordinates[0], this.coordinates[1], this.coordinates[2],
            newEndX, newEndY, newEndZ
        );
    }

    /**
     * Reverse the 3D vector direction (swap start and end)
     * @returns {Vector3DExpression} Reversed vector
     */
    reverse() {
        return this._createResolvedVector3D(
            this.coordinates[3], this.coordinates[4], this.coordinates[5],
            this.coordinates[0], this.coordinates[1], this.coordinates[2]
        );
    }

    /**
     * Helper to create a resolved Vector3DExpression with coordinates
     * @private
     */
    _createResolvedVector3D(x1, y1, z1, x2, y2, z2) {
        const num1 = new NumericExpression(x1);
        const num2 = new NumericExpression(y1);
        const num3 = new NumericExpression(z1);
        const num4 = new NumericExpression(x2);
        const num5 = new NumericExpression(y2);
        const num6 = new NumericExpression(z2);

        const newVector = new Vector3DExpression([num1, num2, num3, num4, num5, num6]);
        newVector.coordinates = [x1, y1, z1, x2, y2, z2];
        newVector.graphExpression = this.graphExpression;
        return newVector;
    }
}
