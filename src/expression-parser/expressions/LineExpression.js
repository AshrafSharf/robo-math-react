/**
 * Line expression - represents a 2D line segment
 * A line is defined by two points: (x1, y1) and (x2, y2)
 * Optional 5th parameter extends the line length
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';

export class LineExpression extends AbstractNonArithmeticExpression {
    static NAME = 'line';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
    }

    resolve(context) {
        this.coordinates = [];

        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);

            const resultExpression = this.subExpressions[i];
            const atomicValues = resultExpression.getVariableAtomicValues();

            for (let j = 0; j < atomicValues.length; j++) {
                this.coordinates.push(atomicValues[j]);
            }
        }

        // If we have exactly 4 coordinates, add 0 for line extension
        if (this.coordinates.length === 4) {
            this.coordinates[4] = 0; // last arg is to extend line length
        }

        if (this.coordinates.length !== 5) {
            this.dispatchError('The Line Expression allows max of 5 values including an optional length');
        }

        // Extend endpoint if extension parameter is non-zero
        if (this.coordinates[4] !== 0) {
            this.extendEndPoint();
        }
    }

    /**
     * Get the line as a vector (dx, dy)
     */
    asVector() {
        const atomicValues = this.getVariableAtomicValues();
        // This is x2-x1 and y2-y1
        return {
            x: atomicValues[2] - atomicValues[0],
            y: atomicValues[3] - atomicValues[1]
        };
    }

    /**
     * Calculate line length
     */
    length() {
        const dx = this.coordinates[2] - this.coordinates[0];
        const dy = this.coordinates[3] - this.coordinates[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Extend the line endpoint by a given distance
     * Positive distance extends from point 2, negative extends from point 1
     */
    extendEndPoint() {
        const extraDistance = this.coordinates[4];
        const lineLength = this.length();
        const normalizeLength = Math.abs(extraDistance) + lineLength;

        // Calculate direction vector
        const dx = this.coordinates[2] - this.coordinates[0];
        const dy = this.coordinates[3] - this.coordinates[1];

        if (extraDistance > 0) {
            // Extend from the end point (x2, y2)
            const factor = normalizeLength / lineLength;
            this.coordinates[2] = this.coordinates[0] + dx * factor;
            this.coordinates[3] = this.coordinates[1] + dy * factor;
        } else {
            // Extend from the start point (x1, y1) - reverse direction
            const factor = normalizeLength / lineLength;
            this.coordinates[0] = this.coordinates[2] - dx * factor;
            this.coordinates[1] = this.coordinates[3] - dy * factor;
        }
    }

    getName() {
        return LineExpression.NAME;
    }

    getVariableAtomicValues() {
        // Return only the 4 coordinates (x1, y1, x2, y2)
        return this.coordinates.slice(0, 4);
    }

    /**
     * Get line as start and end points
     */
    getLinePoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1] },
            { x: this.coordinates[2], y: this.coordinates[3] }
        ];
    }

    /**
     * Get line as an object with start and end points
     */
    getLine() {
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
        const pts = this.getLinePoints();
        return `Line[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    /**
     * Calculate the slope of the line
     */
    getSlope() {
        const dx = this.coordinates[2] - this.coordinates[0];
        const dy = this.coordinates[3] - this.coordinates[1];

        if (dx === 0) {
            return Infinity; // Vertical line
        }

        return dy / dx;
    }

    /**
     * Get the midpoint of the line
     */
    getMidpoint() {
        return {
            x: (this.coordinates[0] + this.coordinates[2]) / 2,
            y: (this.coordinates[1] + this.coordinates[3]) / 2
        };
    }
}
