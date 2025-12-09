/**
 * Circle expression - represents a 2D circle
 * Syntax: circle(graph, centerX, centerY, radius) or circle(graph, point, radius)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { CircleCommand } from '../../commands/CircleCommand.js';
import { circle_error_messages } from '../core/ErrorMessages.js';

export class CircleExpression extends AbstractNonArithmeticExpression {
    static NAME = 'circle';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [centerX, centerY, radius]
        this.graphExpression = null; // Reference to graph expression
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(circle_error_messages.MISSING_ARGS());
        }

        // First arg is graph reference
        this.subExpressions[0].resolve(context);
        this.graphExpression = this.subExpressions[0];

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

        if (this.coordinates.length !== 3) {
            this.dispatchError(circle_error_messages.WRONG_COORD_COUNT(this.coordinates.length));
        }
    }

    getGrapher() {
        if (this.graphExpression && typeof this.graphExpression.getGrapher === 'function') {
            return this.graphExpression.getGrapher();
        }
        return null;
    }

    getName() {
        return CircleExpression.NAME;
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    /**
     * Get the center point
     * @returns {{x: number, y: number}}
     */
    getCenter() {
        return { x: this.coordinates[0], y: this.coordinates[1] };
    }

    /**
     * Get the radius
     * @returns {number}
     */
    getRadius() {
        return this.coordinates[2];
    }

    /**
     * Get circle diameter
     * @returns {number}
     */
    getDiameter() {
        return this.coordinates[2] * 2;
    }

    /**
     * Get circle circumference
     * @returns {number}
     */
    getCircumference() {
        return 2 * Math.PI * this.coordinates[2];
    }

    /**
     * Get circle area
     * @returns {number}
     */
    getArea() {
        return Math.PI * this.coordinates[2] * this.coordinates[2];
    }

    /**
     * Get a point on the circle at a given angle (in degrees)
     * @param {number} angleDegrees - Angle in degrees
     * @returns {{x: number, y: number}}
     */
    pointAtAngle(angleDegrees) {
        const angleRadians = (angleDegrees * Math.PI) / 180;
        return {
            x: this.coordinates[0] + this.coordinates[2] * Math.cos(angleRadians),
            y: this.coordinates[1] + this.coordinates[2] * Math.sin(angleRadians)
        };
    }

    getStartValue() {
        // Return point at angle 0
        return [this.coordinates[0] + this.coordinates[2], this.coordinates[1]];
    }

    getEndValue() {
        // For a full circle, end is same as start
        return this.getStartValue();
    }

    /**
     * Get friendly string representation
     */
    getFriendlyToStr() {
        const center = this.getCenter();
        const radius = this.getRadius();
        return `Circle[center(${center.x}, ${center.y}), r=${radius}]`;
    }

    /**
     * Create a CircleCommand from this expression
     * @param {Object} options - Command options {strokeWidth, fill}
     * @returns {CircleCommand}
     */
    toCommand(options = {}) {
        const center = this.getCenter();
        const radius = this.getRadius();
        return new CircleCommand(this.graphExpression, center, radius, options);
    }

    /**
     * Circles can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
