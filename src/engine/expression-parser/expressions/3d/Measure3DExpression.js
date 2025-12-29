/**
 * Measure3DExpression - renders a 3D measurement indicator with text label
 *
 * Syntax options:
 *   measure3d(graph, x1, y1, z1, x2, y2, z2, "text")  - using coordinates
 *   measure3d(graph, point3d1, point3d2, "text")      - using 3D points
 *
 * Parameters:
 *   graph        - Graph3D reference (required)
 *   coordinates  - 6 values (x1, y1, z1, x2, y2, z2) or 2 point3d (required)
 *   text         - LaTeX string for the label (required)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Measure3DCommand } from '../../../commands/3d/Measure3DCommand.js';
import { measure3d_error_messages } from '../../core/ErrorMessages.js';

export class Measure3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'measure3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2]
        this.text = '';
    }

    resolve(context) {
        // Need at least 3 args: graph, coordinates/points, and text
        if (this.subExpressions.length < 3) {
            this.dispatchError(measure3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(measure3d_error_messages.GRAPH_REQUIRED());
        }

        // Collect coordinates until we hit a quoted string (the text)
        // This allows flexible input: 6 numeric values OR 2 point3d
        this.coordinates = [];
        let textArgIndex = -1;

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const resultExpression = this._getResolvedExpression(context, this.subExpressions[i]);

            // Check if this is the text argument (quoted string)
            if (resultExpression && resultExpression.getName() === 'quotedstring') {
                textArgIndex = i;
                this.text = resultExpression.getStringValue();
                break;
            }

            // Otherwise, collect atomic values (coordinates from points or numbers)
            const atomicValues = resultExpression.getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                this.coordinates.push(atomicValues[j]);
            }
        }

        // Validate we found text
        if (textArgIndex === -1) {
            this.dispatchError(measure3d_error_messages.TEXT_REQUIRED());
        }

        // Validate we have exactly 6 coordinates
        if (this.coordinates.length !== 6) {
            this.dispatchError(measure3d_error_messages.WRONG_COORD_COUNT(this.coordinates.length));
        }
    }

    getName() {
        return Measure3DExpression.NAME;
    }

    /**
     * Get the start point
     * @returns {{x: number, y: number, z: number}}
     */
    getStartPoint() {
        return {
            x: this.coordinates[0],
            y: this.coordinates[1],
            z: this.coordinates[2]
        };
    }

    /**
     * Get the end point
     * @returns {{x: number, y: number, z: number}}
     */
    getEndPoint() {
        return {
            x: this.coordinates[3],
            y: this.coordinates[4],
            z: this.coordinates[5]
        };
    }

    /**
     * Get the midpoint
     * @returns {{x: number, y: number, z: number}}
     */
    getMidpoint() {
        return {
            x: (this.coordinates[0] + this.coordinates[3]) / 2,
            y: (this.coordinates[1] + this.coordinates[4]) / 2,
            z: (this.coordinates[2] + this.coordinates[5]) / 2
        };
    }

    /**
     * Get measurement length
     * @returns {number}
     */
    getLength() {
        const dx = this.coordinates[3] - this.coordinates[0];
        const dy = this.coordinates[4] - this.coordinates[1];
        const dz = this.coordinates[5] - this.coordinates[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Measurement indicators don't have numeric atomic values
     * @returns {Array}
     */
    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        const start = this.getStartPoint();
        const end = this.getEndPoint();
        return `measure3d[(${start.x}, ${start.y}, ${start.z}) -> (${end.x}, ${end.y}, ${end.z}), "${this.text}"]`;
    }

    /**
     * Create a Measure3DCommand from this expression
     * @param {Object} options - Command options
     * @returns {Measure3DCommand}
     */
    toCommand(options = {}) {
        return new Measure3DCommand(
            this.graphExpression,
            this.getStartPoint(),
            this.getEndPoint(),
            this.text,
            { ...options, ...this.getStyleOptions() }
        );
    }

    /**
     * Measurement indicators can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
