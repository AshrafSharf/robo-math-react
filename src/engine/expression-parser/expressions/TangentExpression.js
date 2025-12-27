/**
 * TangentExpression - creates a tangent line to a circle or plot
 *
 * Syntax:
 *   tangent(graph, circle, angle, length)  - tangent to circle at angle (degrees), length
 *   tangent(graph, plot, x, length)        - tangent to plot at x value, length
 *
 * Angle convention: 0 at positive x-axis, counter-clockwise (standard math)
 * Line position: Centered at the touch point (length/2 on each side)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { LineCommand } from '../../commands/LineCommand.js';
import { CircleUtil } from '../../../geom/CircleUtil.js';

export class TangentExpression extends AbstractNonArithmeticExpression {
    static NAME = 'tangent';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
        this.shapeType = null; // 'circle' or 'plot'
    }

    resolve(context) {
        // Validate: need 4 arguments (graph, shape, param, length)
        if (this.subExpressions.length < 4) {
            this.dispatchError(
                'tangent() requires 4 arguments: tangent(graph, shape, param, length)\n' +
                '  For circles: tangent(G, circle, angle, length)\n' +
                '  For plots: tangent(G, plot, x, length)'
            );
        }

        // Resolve all subexpressions, separating styling
        const styleExprs = [];
        const resolvedExprs = [];

        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this.subExpressions[i];

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                resolvedExprs.push(expr);
            }
        }

        this._parseStyleExpressions(styleExprs);

        // First arg: graph reference
        this.graphExpression = this._getResolvedExpression(context, resolvedExprs[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('tangent() requires graph as first argument');
        }

        // Second arg: shape (circle or plot)
        const shapeExpr = this._getResolvedExpression(context, resolvedExprs[1]);
        this.shapeType = this._detectShapeType(shapeExpr);

        // Third arg: parameter (angle for circle, x for plot)
        const paramExpr = this._getResolvedExpression(context, resolvedExprs[2]);
        const paramValue = paramExpr.getVariableAtomicValues()[0];

        // Fourth arg: length
        const lengthExpr = this._getResolvedExpression(context, resolvedExprs[3]);
        const length = lengthExpr.getVariableAtomicValues()[0];

        // Calculate tangent based on shape type
        if (this.shapeType === 'circle') {
            this._calculateCircleTangent(shapeExpr, paramValue, length);
        } else if (this.shapeType === 'plot') {
            this._calculatePlotTangent(shapeExpr, paramValue, length);
        } else {
            this.dispatchError(
                `tangent() requires a circle or plot as second argument.\n` +
                `Got: ${shapeExpr.getName ? shapeExpr.getName() : 'unknown'}`
            );
        }
    }

    /**
     * Detect if the expression is a circle or plot
     */
    _detectShapeType(expr) {
        if (typeof expr.getGeometryType === 'function') {
            const geoType = expr.getGeometryType();
            if (geoType === 'circle') return 'circle';
            if (geoType === 'plot') return 'plot';
        }
        return null;
    }

    /**
     * Calculate tangent line for a circle at given angle
     * Uses CircleUtil.tangentAtAngle which returns centered line
     */
    _calculateCircleTangent(circleExpr, angleDeg, length) {
        const center = circleExpr.getCenter();
        const radius = circleExpr.getRadius();

        // Use existing CircleUtil.tangentAtAngle
        // Returns {start: Point, end: Point} - already centered at touch point
        const tangentLine = CircleUtil.tangentAtAngle(center, radius, angleDeg, length);

        this.coordinates = [
            tangentLine.start.x, tangentLine.start.y,
            tangentLine.end.x, tangentLine.end.y
        ];
    }

    /**
     * Calculate tangent line for a plot at given x value
     * Uses numeric differentiation (central difference)
     */
    _calculatePlotTangent(plotExpr, xValue, length) {
        const f = plotExpr.getCompiledFunction();

        if (!f) {
            this.dispatchError('tangent(): plot has no valid function');
        }

        // Get point on curve
        const y = f(xValue);
        if (!isFinite(y)) {
            this.dispatchError(`tangent(): function undefined at x = ${xValue}`);
        }

        // Numeric differentiation using central difference
        const h = 0.0001;
        const y1 = f(xValue - h);
        const y2 = f(xValue + h);

        if (!isFinite(y1) || !isFinite(y2)) {
            this.dispatchError(`tangent(): cannot compute derivative at x = ${xValue}`);
        }

        const slope = (y2 - y1) / (2 * h);

        // Calculate tangent line endpoints
        // Direction vector: (1, slope), normalized then scaled by length/2
        const dirLength = Math.sqrt(1 + slope * slope);
        const dx = (length / 2) / dirLength;
        const dy = slope * dx;

        // Line centered at (xValue, y)
        this.coordinates = [
            xValue - dx, y - dy,  // start point
            xValue + dx, y + dy   // end point
        ];
    }

    getName() {
        return TangentExpression.NAME;
    }

    getGeometryType() {
        return 'line';
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    getLinePoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1] },
            { x: this.coordinates[2], y: this.coordinates[3] }
        ];
    }

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

    getFriendlyToStr() {
        const pts = this.getLinePoints();
        return `tangent[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)})]`;
    }

    toCommand(options = {}) {
        const pts = this.getLinePoints();
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        return new LineCommand(this.graphExpression, pts[0], pts[1], mergedOptions);
    }

    canPlay() {
        return true;
    }
}
