/**
 * Line3D expression - represents a 3D line segment
 *
 * Syntax options:
 *   line3d(graph, x1, y1, z1, x2, y2, z2)  - graph with coordinates
 *   line3d(graph, point3d1, point3d2)      - graph with 3D points
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Line3DCommand } from '../../../commands/3d/Line3DCommand.js';
import { line3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Line3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'line3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2]
        this.graphExpression = null; // Reference to graph expression
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(line3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(line3d_error_messages.GRAPH_REQUIRED());
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
            this.dispatchError(line3d_error_messages.WRONG_COORD_COUNT(this.coordinates.length));
        }
    }

    /**
     * Get the line as a vector (dx, dy, dz)
     */
    asVector() {
        return {
            x: this.coordinates[3] - this.coordinates[0],
            y: this.coordinates[4] - this.coordinates[1],
            z: this.coordinates[5] - this.coordinates[2]
        };
    }

    /**
     * Calculate line length
     */
    length() {
        const dx = this.coordinates[3] - this.coordinates[0];
        const dy = this.coordinates[4] - this.coordinates[1];
        const dz = this.coordinates[5] - this.coordinates[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    getName() {
        return Line3DExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'line3d'
     */
    getGeometryType() {
        return 'line3d';
    }

    getVariableAtomicValues() {
        // Return all 6 coordinates (x1, y1, z1, x2, y2, z2)
        return this.coordinates.slice(0, 6);
    }

    /**
     * Get line as start and end points
     */
    getLinePoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1], z: this.coordinates[2] },
            { x: this.coordinates[3], y: this.coordinates[4], z: this.coordinates[5] }
        ];
    }

    /**
     * Get line as an object with start and end points
     */
    getLine() {
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
     * Get the midpoint of the line
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
        const pts = this.getLinePoints();
        return `Line3D[(${pts[0].x}, ${pts[0].y}, ${pts[0].z}) -> (${pts[1].x}, ${pts[1].y}, ${pts[1].z})]`;
    }

    /**
     * Create a Line3DCommand from this expression
     * Style comes directly from expression: c() -> color, s() -> strokeWidth (thickness)
     * @param {Object} options - Additional options (for registry/animation use)
     * @returns {Line3DCommand}
     */
    toCommand(options = {}) {
        const pts = this.getLinePoints();
        const styleOptions = {
            color: this.color,
            strokeWidth: this.strokeWidth  // s() maps to line thickness
        };
        return new Line3DCommand(this.graphExpression, pts[0], pts[1], { styleOptions });
    }

    /**
     * Lines can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
