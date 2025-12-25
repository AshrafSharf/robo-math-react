/**
 * Vector expression - represents a 2D vector (arrow)
 *
 * Syntax options:
 *   vector(graph, x1, y1, x2, y2)   - graph with coordinates
 *   vector(graph, point1, point2)   - graph with point expressions
 *
 * Similar to line but renders with an arrowhead.
 *
 * Examples:
 *   g = g2d(0, 0, 5, 5)
 *   vector(g, 0, 0, 3, 2)           // vector from origin to (3,2)
 *   vector(g, A, B)                 // vector between points A and B
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { vector_error_messages } from '../core/ErrorMessages.js';
import { NumericExpression } from './NumericExpression.js';

export class VectorExpression extends AbstractNonArithmeticExpression {
    static NAME = 'vector';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null; // Reference to graph expression
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(vector_error_messages.MISSING_ARGS());
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(vector_error_messages.GRAPH_REQUIRED());
        }

        // Remaining args are coordinates
        this.coordinates = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);

            const resultExpression = this.subExpressions[i];
            const atomicValues = resultExpression.getVariableAtomicValues();

            for (let j = 0; j < atomicValues.length; j++) {
                this.coordinates.push(atomicValues[j]);
            }
        }

        if (this.coordinates.length !== 4) {
            this.dispatchError(vector_error_messages.WRONG_COORD_COUNT(this.coordinates.length));
        }
    }

    // getGrapher() inherited from AbstractNonArithmeticExpression

    /**
     * Get the vector as a direction (dx, dy)
     */
    asVector() {
        return {
            x: this.coordinates[2] - this.coordinates[0],
            y: this.coordinates[3] - this.coordinates[1]
        };
    }

    /**
     * Calculate vector magnitude (length)
     */
    magnitude() {
        const dx = this.coordinates[2] - this.coordinates[0];
        const dy = this.coordinates[3] - this.coordinates[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    getName() {
        return VectorExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'line'
     */
    getGeometryType() {
        return 'line';
    }

    getVariableAtomicValues() {
        return this.coordinates.slice(0, 4);
    }

    /**
     * Get vector as start and end points
     */
    getVectorPoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1] },
            { x: this.coordinates[2], y: this.coordinates[3] }
        ];
    }

    /**
     * Get vector as an object with start and end points
     */
    getVector() {
        return {
            start: { x: this.coordinates[0], y: this.coordinates[1] },
            end: { x: this.coordinates[2], y: this.coordinates[3] }
        };
    }

    getStartValue() {
        return [this.coordinates[0], this.coordinates[1]];
    }

    getEndValue() {
        return [this.coordinates[2], this.coordinates[3]];
    }

    /**
     * Get a friendly string representation
     */
    getFriendlyToStr() {
        const pts = this.getVectorPoints();
        return `Vec[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    /**
     * Get the midpoint of the vector
     */
    getMidpoint() {
        return {
            x: (this.coordinates[0] + this.coordinates[2]) / 2,
            y: (this.coordinates[1] + this.coordinates[3]) / 2
        };
    }

    /**
     * Create a VectorCommand from this expression
     * @param {Object} options - Command options {strokeWidth}
     * @returns {VectorCommand}
     */
    toCommand(options = {}) {
        const pts = this.getVectorPoints();
        return new VectorCommand(this.graphExpression, pts[0], pts[1], options);
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
     * Add two vectors (component-wise addition of direction vectors)
     * Result starts at this vector's start point
     * @param {Object} otherExpression - Another vector expression
     * @returns {VectorExpression} New vector with summed directions
     */
    add(otherExpression) {
        const otherAtomicValues = otherExpression.getVariableAtomicValues();

        // Check if other is also a vector (4 values)
        if (otherAtomicValues.length !== 4) {
            this.dispatchError('Cannot add: both operands must be vectors');
        }

        // Get direction vectors
        const thisDx = this.coordinates[2] - this.coordinates[0];
        const thisDy = this.coordinates[3] - this.coordinates[1];
        const otherDx = otherAtomicValues[2] - otherAtomicValues[0];
        const otherDy = otherAtomicValues[3] - otherAtomicValues[1];

        // Sum directions, keep start point
        const newEndX = this.coordinates[0] + thisDx + otherDx;
        const newEndY = this.coordinates[1] + thisDy + otherDy;

        return this._createResolvedVector(
            this.coordinates[0], this.coordinates[1],
            newEndX, newEndY
        );
    }

    /**
     * Subtract two vectors (component-wise subtraction of direction vectors)
     * Result starts at this vector's start point
     * @param {Object} otherExpression - Another vector expression
     * @returns {VectorExpression} New vector with subtracted directions
     */
    subtract(otherExpression) {
        const otherAtomicValues = otherExpression.getVariableAtomicValues();

        // Check if other is also a vector (4 values)
        if (otherAtomicValues.length !== 4) {
            this.dispatchError('Cannot subtract: both operands must be vectors');
        }

        // Get direction vectors
        const thisDx = this.coordinates[2] - this.coordinates[0];
        const thisDy = this.coordinates[3] - this.coordinates[1];
        const otherDx = otherAtomicValues[2] - otherAtomicValues[0];
        const otherDy = otherAtomicValues[3] - otherAtomicValues[1];

        // Subtract directions, keep start point
        const newEndX = this.coordinates[0] + thisDx - otherDx;
        const newEndY = this.coordinates[1] + thisDy - otherDy;

        return this._createResolvedVector(
            this.coordinates[0], this.coordinates[1],
            newEndX, newEndY
        );
    }

    /**
     * Multiply vector by scalar (scales the direction, keeps start point)
     * @param {Object} otherExpression - Scalar expression
     * @returns {VectorExpression} Scaled vector
     */
    multiply(otherExpression) {
        const otherAtomicValues = otherExpression.getVariableAtomicValues();

        // Must be scalar (1 value)
        if (otherAtomicValues.length !== 1) {
            this.dispatchError('Cannot multiply: vector can only be multiplied by a scalar');
        }

        const scalar = otherAtomicValues[0];

        // Special case: -1 means reverse
        if (scalar === -1) {
            return this.reverse();
        }

        // Scale direction vector
        const dx = this.coordinates[2] - this.coordinates[0];
        const dy = this.coordinates[3] - this.coordinates[1];
        const newEndX = this.coordinates[0] + dx * scalar;
        const newEndY = this.coordinates[1] + dy * scalar;

        return this._createResolvedVector(
            this.coordinates[0], this.coordinates[1],
            newEndX, newEndY
        );
    }

    /**
     * Divide vector by scalar (scales the direction, keeps start point)
     * @param {Object} otherExpression - Scalar expression
     * @returns {VectorExpression} Scaled vector
     */
    divide(otherExpression) {
        const otherAtomicValues = otherExpression.getVariableAtomicValues();

        // Must be scalar (1 value)
        if (otherAtomicValues.length !== 1) {
            this.dispatchError('Cannot divide: vector can only be divided by a scalar');
        }

        const scalar = otherAtomicValues[0];

        if (scalar === 0) {
            this.dispatchError('Cannot divide by zero');
        }

        // Scale direction vector
        const dx = this.coordinates[2] - this.coordinates[0];
        const dy = this.coordinates[3] - this.coordinates[1];
        const newEndX = this.coordinates[0] + dx / scalar;
        const newEndY = this.coordinates[1] + dy / scalar;

        return this._createResolvedVector(
            this.coordinates[0], this.coordinates[1],
            newEndX, newEndY
        );
    }

    /**
     * Reverse the vector direction (swap start and end)
     * @returns {VectorExpression} Reversed vector
     */
    reverse() {
        return this._createResolvedVector(
            this.coordinates[2], this.coordinates[3],
            this.coordinates[0], this.coordinates[1]
        );
    }

    /**
     * Helper to create a resolved VectorExpression with coordinates
     * @private
     */
    _createResolvedVector(x1, y1, x2, y2) {
        const num1 = new NumericExpression(x1);
        const num2 = new NumericExpression(y1);
        const num3 = new NumericExpression(x2);
        const num4 = new NumericExpression(y2);

        const newVector = new VectorExpression([num1, num2, num3, num4]);
        newVector.coordinates = [x1, y1, x2, y2];
        newVector.graphExpression = this.graphExpression;
        return newVector;
    }
}
