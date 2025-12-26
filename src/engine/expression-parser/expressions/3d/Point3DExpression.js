/**
 * Point3D expression - represents a 3D point
 *
 * Syntax options:
 *   point3d(graph, x, y, z)     - using graph with separate x, y, z values
 *   point3d(graph, point2d, z)  - using a 2D point with z coordinate
 *   point3d(graph, expr)        - using an expression that returns 3 values
 *
 * Examples:
 *   point3d(g, 3, 5, 7)         // point at (3, 5, 7)
 *   point3d(g, P, 4)            // point at (P.x, P.y, 4) where P is a 2D point
 */
import { AbstractArithmeticExpression } from '../AbstractArithmeticExpression.js';
import { NumericExpression } from '../NumericExpression.js';
import { Point3DCommand } from '../../../commands/3d/Point3DCommand.js';
import { point3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Point3DExpression extends AbstractArithmeticExpression {
    static NAME = 'point3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.point = { x: 0, y: 0, z: 0 };
        this.graphExpression = null; // Reference to graph expression
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(point3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(point3d_error_messages.GRAPH_REQUIRED());
        }

        // Collect coordinates from remaining args, separating styling
        // - point3d(g, x, y, z) - separate numeric values
        // - point3d(g, point2d, z) - 2D point + z value
        // - point3d(g, expr) - expression returning 3 values
        const coordinates = [];
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const resultExpression = this.subExpressions[i];

            if (this._isStyleExpression(resultExpression)) {
                styleExprs.push(resultExpression);
            } else {
                const atomicValues = resultExpression.getVariableAtomicValues();
                for (let j = 0; j < atomicValues.length; j++) {
                    coordinates.push(atomicValues[j]);
                }
            }
        }

        this._parseStyleExpressions(styleExprs);

        if (coordinates.length !== 3) {
            this.dispatchError(point3d_error_messages.WRONG_COORD_COUNT(coordinates.length));
        }

        this.point = { x: coordinates[0], y: coordinates[1], z: coordinates[2] };
    }

    getName() {
        return Point3DExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'point3d'
     */
    getGeometryType() {
        return 'point3d';
    }

    getPoint() {
        return this.point;
    }

    add(otherExpression) {
        const otherVal = this.extractPoint3DValue('add', otherExpression);
        const resultantPt = {
            x: this.point.x + otherVal.x,
            y: this.point.y + otherVal.y,
            z: this.point.z + otherVal.z
        };

        return this.resolvedPoint3DExpression(resultantPt);
    }

    subtract(otherExpression) {
        const otherVal = this.extractPoint3DValue('subtract', otherExpression);
        const resultantPt = {
            x: this.point.x - otherVal.x,
            y: this.point.y - otherVal.y,
            z: this.point.z - otherVal.z
        };

        return this.resolvedPoint3DExpression(resultantPt);
    }

    divide(otherExpression) {
        const atomicValues = otherExpression.getVariableAtomicValues();
        if (atomicValues.length !== 1) {
            this.dispatchError(point3d_error_messages.DIVIDE_BY_POINT());
        }

        const divisor = atomicValues[0];
        const resultPt = {
            x: this.point.x / divisor,
            y: this.point.y / divisor,
            z: this.point.z / divisor
        };

        return this.resolvedPoint3DExpression(resultPt);
    }

    multiply(otherExpression) {
        const atomicValues = otherExpression.getVariableAtomicValues();
        if (atomicValues.length !== 1) {
            this.dispatchError(point3d_error_messages.MULTIPLY_BY_POINT());
        }

        const scaleBy = atomicValues[0];
        const resultPt = {
            x: this.point.x * scaleBy,
            y: this.point.y * scaleBy,
            z: this.point.z * scaleBy
        };

        return this.resolvedPoint3DExpression(resultPt);
    }

    power(otherExpression) {
        this.dispatchError(point3d_error_messages.POWER_NOT_SUPPORTED());
        return null;
    }

    resolvedPoint3DExpression(pt) {
        const numX = new NumericExpression(pt.x);
        const numY = new NumericExpression(pt.y);
        const numZ = new NumericExpression(pt.z);
        const newExpr = new Point3DExpression([numX, numY, numZ]);
        newExpr.point = pt;
        newExpr.graphExpression = this.graphExpression;
        return newExpr;
    }

    extractPoint3DValue(operName, otherExpression) {
        const atomicValues = otherExpression.getVariableAtomicValues();

        if (atomicValues.length !== 3) {
            throw new Error(`To ${operName}, Expression must have 3 coordinate values`);
        }

        return { x: atomicValues[0], y: atomicValues[1], z: atomicValues[2] };
    }

    getVariableAtomicValues() {
        const pt = this.getPoint();
        return [pt.x, pt.y, pt.z];
    }

    getFriendlyToStr() {
        const pt = this.getPoint();
        return `(${pt.x}, ${pt.y}, ${pt.z})`;
    }

    /**
     * Create a Point3DCommand from this expression
     * @param {Object} options - { styleOptions: { radius, color, ... } }
     * @returns {Point3DCommand}
     */
    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('point3d');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };
        return new Point3DCommand(this.graphExpression, this.getPoint(), mergedOpts);
    }

    /**
     * Points can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
