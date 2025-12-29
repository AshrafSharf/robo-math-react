/**
 * Point3D expression - represents a 3D point
 *
 * Syntax options:
 *   point3d(graph, x, y, z)     - using graph with separate x, y, z values
 *   point3d(graph, point2d, z)  - using a 2D point with z coordinate
 *   point3d(graph, expr)        - using an expression that returns 3 values
 *   point3d(x, y, z)            - s3d mode: just coordinates, no graph needed
 *
 * Examples:
 *   point3d(g, 3, 5, 7)         // point at (3, 5, 7) in g3d
 *   point3d(g, P, 4)            // point at (P.x, P.y, 4) where P is a 2D point
 *   point3d(1, 2, 3)            // s3d mode: just returns coordinates
 */
import { AbstractArithmeticExpression } from '../AbstractArithmeticExpression.js';
import { NumericExpression } from '../NumericExpression.js';
import { Point3DCommand } from '../../../commands/3d/Point3DCommand.js';
import { NoOpCommand } from '../../../commands/NoOpCommand.js';
import { point3d_error_messages } from '../../core/ErrorMessages.js';

export class Point3DExpression extends AbstractArithmeticExpression {
    static NAME = 'point3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.point = { x: 0, y: 0, z: 0 };
        this.graphExpression = null; // Reference to graph expression (null in s3d mode)
        this.isS3DMode = false;      // True when used without graph (just coordinates)
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError(point3d_error_messages.MISSING_ARGS());
        }

        // Resolve first arg to check if it's a graph or coordinate
        this.subExpressions[0].resolve(context);
        const firstExpr = this._getResolvedExpression(context, this.subExpressions[0]);

        // Check if first arg is a g3d graph
        if (firstExpr && firstExpr.getName() === 'g3d') {
            // g3d mode - requires graph
            this.graphExpression = firstExpr;
            this.isS3DMode = false;
            this._resolveWithGraph(context);
        } else {
            // s3d mode - no graph, just coordinates
            this.graphExpression = null;
            this.isS3DMode = true;
            this._resolveWithoutGraph(context);
        }
    }

    /**
     * Resolve in g3d mode (with graph container)
     */
    _resolveWithGraph(context) {
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

    /**
     * Resolve in s3d mode (just coordinates, no graph)
     */
    _resolveWithoutGraph(context) {
        const coordinates = [];
        const styleExprs = [];

        // All args are coordinates (first arg already resolved)
        for (let i = 0; i < this.subExpressions.length; i++) {
            if (i > 0) {
                this.subExpressions[i].resolve(context);
            }
            const resultExpression = this._getResolvedExpression(context, this.subExpressions[i]);

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
            this.dispatchError(`point3d() requires exactly 3 coordinates, got ${coordinates.length}`);
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
     * Style comes from expression via getStyleOptions(): c() -> color, s() -> strokeWidth (radius), etc.
     * @param {Object} options - Additional options (for registry/animation use)
     * @returns {Point3DCommand|NoOpCommand}
     */
    toCommand(options = {}) {
        // s3d mode - no rendering, just data
        if (this.isS3DMode) {
            return new NoOpCommand();
        }

        // g3d mode - render the point
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        // Map strokeWidth to radius for point rendering
        if (mergedOptions.strokeWidth != null) {
            mergedOptions.radius = mergedOptions.strokeWidth;
        }
        return new Point3DCommand(this.graphExpression, this.getPoint(), { styleOptions: mergedOptions });
    }

    /**
     * Points can be played (animated) only in g3d mode
     * @returns {boolean}
     */
    canPlay() {
        return !this.isS3DMode;
    }
}
