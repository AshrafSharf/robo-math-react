/**
 * DistanceMarkerExpression - renders a measurement indicator with text label
 *
 * Syntax options:
 *   dm(graph, x1, y1, x2, y2, "text")                      - using coordinates
 *   dm(graph, point1, point2, "text")                      - using points
 *   dm(graph, x1, y1, x2, y2, "text", textOffset)          - with text offset
 *   dm(graph, x1, y1, x2, y2, "text", textOffset, markerOffset)  - with marker offset
 *
 * Parameters:
 *   graph        - Graph2D reference (required)
 *   coordinates  - 4 values (x1, y1, x2, y2) or 2 points (required)
 *   text         - LaTeX string for the label (required)
 *   textOffset   - perpendicular offset for text from midpoint in pixels (optional, default: 15)
 *   markerOffset - perpendicular offset for the whole marker in pixels (optional, default: 15)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { DistanceMarkerCommand } from '../../commands/DistanceMarkerCommand.js';
import { dm_error_messages } from '../core/ErrorMessages.js';

// Default text offset in pixels (so text doesn't overlap the line)
const DEFAULT_TEXT_OFFSET = 15;
// Default marker offset in pixels (so marker doesn't overlap the shape being measured)
const DEFAULT_MARKER_OFFSET = 15;

export class DistanceMarkerExpression extends AbstractNonArithmeticExpression {
    static NAME = 'dm';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.text = '';
        this.textOffset = DEFAULT_TEXT_OFFSET;
        this.markerOffset = DEFAULT_MARKER_OFFSET;
    }

    resolve(context) {
        // Need at least 3 args: graph, coordinates/points, and text
        if (this.subExpressions.length < 3) {
            this.dispatchError(dm_error_messages.MISSING_ARGS());
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(dm_error_messages.GRAPH_REQUIRED());
        }

        // Collect coordinates until we hit a quoted string (the text)
        // This allows flexible input: 4 numeric values OR 2 points
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
            this.dispatchError(dm_error_messages.TEXT_REQUIRED());
        }

        // Validate we have exactly 4 coordinates
        if (this.coordinates.length !== 4) {
            this.dispatchError(dm_error_messages.WRONG_COORD_COUNT(this.coordinates.length));
        }

        // Check for optional textOffset (next arg after text)
        if (textArgIndex + 1 < this.subExpressions.length) {
            const textOffsetExpr = this.subExpressions[textArgIndex + 1];
            textOffsetExpr.resolve(context);
            const textOffsetValues = textOffsetExpr.getVariableAtomicValues();
            if (textOffsetValues.length > 0) {
                this.textOffset = textOffsetValues[0];
            }
        }

        // Check for optional markerOffset (next arg after textOffset)
        if (textArgIndex + 2 < this.subExpressions.length) {
            const markerOffsetExpr = this.subExpressions[textArgIndex + 2];
            markerOffsetExpr.resolve(context);
            const markerOffsetValues = markerOffsetExpr.getVariableAtomicValues();
            if (markerOffsetValues.length > 0) {
                this.markerOffset = markerOffsetValues[0];
            }
        }
    }

    getName() {
        return DistanceMarkerExpression.NAME;
    }

    /**
     * Get the start point
     * @returns {{x: number, y: number}}
     */
    getStartPoint() {
        return { x: this.coordinates[0], y: this.coordinates[1] };
    }

    /**
     * Get the end point
     * @returns {{x: number, y: number}}
     */
    getEndPoint() {
        return { x: this.coordinates[2], y: this.coordinates[3] };
    }

    /**
     * Get the midpoint
     * @returns {{x: number, y: number}}
     */
    getMidpoint() {
        return {
            x: (this.coordinates[0] + this.coordinates[2]) / 2,
            y: (this.coordinates[1] + this.coordinates[3]) / 2
        };
    }

    /**
     * Distance markers don't have numeric atomic values
     * @returns {Array}
     */
    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        const start = this.getStartPoint();
        const end = this.getEndPoint();
        return `dm[(${start.x}, ${start.y}) -> (${end.x}, ${end.y}), "${this.text}"]`;
    }

    /**
     * Create a DistanceMarkerCommand from this expression
     * @param {Object} options - Command options
     * @returns {DistanceMarkerCommand}
     */
    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        return new DistanceMarkerCommand(
            this.graphExpression,
            this.getStartPoint(),
            this.getEndPoint(),
            this.text,
            this.textOffset,
            this.markerOffset,
            mergedOptions
        );
    }

    /**
     * Distance markers can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
