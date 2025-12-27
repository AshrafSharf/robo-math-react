/**
 * Circle expression - represents a 2D circle
 *
 * Syntax options (radius first, center defaults to origin):
 *   circle(graph, radius)             - center at (0, 0)
 *   circle(graph, radius, centerX, centerY) - graph with coordinates
 *   circle(graph, radius, point)      - graph with point
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

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(circle_error_messages.GRAPH_REQUIRED());
        }

        // Collect all atomic values from remaining args, separating styling expressions
        const allCoords = [];
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const resultExpression = this.subExpressions[i];

            if (this._isStyleExpression(resultExpression)) {
                styleExprs.push(resultExpression);
            } else {
                const atomicValues = resultExpression.getVariableAtomicValues();
                for (let j = 0; j < atomicValues.length; j++) {
                    allCoords.push(atomicValues[j]);
                }
            }
        }

        // Parse coords: radius first, then optional center
        // 1 coord  = radius only, center (0, 0)
        // 3 coords = radius + centerX + centerY  OR  radius + point(2 coords)
        if (allCoords.length === 1) {
            // circle(g, r) - center at origin
            const radius = allCoords[0];
            this.coordinates = [0, 0, radius];
        } else if (allCoords.length === 3) {
            // circle(g, r, x, y) OR circle(g, r, point)
            const radius = allCoords[0];
            const centerX = allCoords[1];
            const centerY = allCoords[2];
            this.coordinates = [centerX, centerY, radius];
        } else {
            this.dispatchError(circle_error_messages.WRONG_COORD_COUNT(allCoords.length));
        }

        this._parseStyleExpressions(styleExprs);
    }

    // getGrapher() inherited from AbstractNonArithmeticExpression

    getName() {
        return CircleExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'circle'
     */
    getGeometryType() {
        return 'circle';
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
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        return new CircleCommand(this.graphExpression, center, radius, mergedOptions);
    }

    /**
     * Circles can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
