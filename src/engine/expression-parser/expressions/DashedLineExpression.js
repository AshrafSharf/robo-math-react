/**
 * DashedLine expression - represents a 2D dashed line segment
 *
 * Syntax options:
 *   dashedline(graph, x1, y1, x2, y2)  - graph with coordinates
 *   dashedline(graph, point1, point2)  - graph with points
 *
 * Same input as line(), but renders as dashed with fade-in animation.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { DashedLineCommand } from '../../commands/DashedLineCommand.js';
import { line_error_messages } from '../core/ErrorMessages.js';

export class DashedLineExpression extends AbstractNonArithmeticExpression {
    static NAME = 'dashedline';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null; // Reference to graph expression
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(line_error_messages.MISSING_ARGS());
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(line_error_messages.GRAPH_REQUIRED());
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
            this.dispatchError(line_error_messages.WRONG_COORD_COUNT(this.coordinates.length));
        }
    }

    // getGrapher() inherited from AbstractNonArithmeticExpression

    /**
     * Get the line as a vector (dx, dy)
     */
    asVector() {
        const atomicValues = this.getVariableAtomicValues();
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

    getName() {
        return DashedLineExpression.NAME;
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
        return `DashedLine[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
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

    /**
     * Create a DashedLineCommand from this expression
     * @param {Object} options - Command options {strokeWidth}
     * @returns {DashedLineCommand}
     */
    toCommand(options = {}) {
        const pts = this.getLinePoints();
        return new DashedLineCommand(this.graphExpression, pts[0], pts[1], options);
    }

    /**
     * Dashed lines can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
