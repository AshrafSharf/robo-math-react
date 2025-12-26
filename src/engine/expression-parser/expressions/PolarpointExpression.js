/**
 * PolarpointExpression - creates a point using polar coordinates (radius and angle)
 *
 * Syntax:
 *   polarpoint(graph, radius, angleDeg)                - point from origin
 *   polarpoint(graph, radius, angleDeg, centerX, centerY) - point from specified center
 *   polarpoint(graph, radius, angleDeg, centerPoint)   - point from center point expression
 *
 * Returns point coordinates [x, y]. When used standalone, renders as a point.
 * Angle is in degrees: 0=right, 90=up, 180=left, 270=down
 *
 * Examples:
 *   polarpoint(g, 5, 0)                // point at (5, 0) - 5 units right of origin
 *   polarpoint(g, 3, 90)               // point at (0, 3) - 3 units up from origin
 *   polarpoint(g, 4, 45)               // point at 45 degrees, radius 4
 *   polarpoint(g, 5, 30, 1, 2)         // point at (r=5, θ=30°) from center (1, 2)
 *   polarpoint(g, 5, 60, A)            // point at (r=5, θ=60°) from point A
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PointCommand } from '../../commands/PointCommand.js';

export class PolarpointExpression extends AbstractNonArithmeticExpression {
    static NAME = 'polarpoint';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.point = { x: 0, y: 0 };
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('polarpoint() requires: polarpoint(graph, radius, angle) or polarpoint(graph, radius, angle, centerX, centerY)');
        }

        // Resolve all subexpressions first, separating styling
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

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, resolvedExprs[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('polarpoint() requires graph as first argument');
        }

        // Get radius and angle
        const radiusExpr = this._getResolvedExpression(context, resolvedExprs[1]);
        const angleExpr = this._getResolvedExpression(context, resolvedExprs[2]);

        const radius = radiusExpr.getVariableAtomicValues()[0];
        const angleDeg = angleExpr.getVariableAtomicValues()[0];

        // Determine center point
        let center = { x: 0, y: 0 };

        if (resolvedExprs.length === 4) {
            // polarpoint(graph, radius, angle, centerPoint)
            const centerExpr = this._getResolvedExpression(context, resolvedExprs[3]);
            const centerValues = centerExpr.getVariableAtomicValues();
            center = { x: centerValues[0], y: centerValues[1] };
        } else if (resolvedExprs.length >= 5) {
            // polarpoint(graph, radius, angle, centerX, centerY)
            const centerXExpr = this._getResolvedExpression(context, resolvedExprs[3]);
            const centerYExpr = this._getResolvedExpression(context, resolvedExprs[4]);
            center = {
                x: centerXExpr.getVariableAtomicValues()[0],
                y: centerYExpr.getVariableAtomicValues()[0]
            };
        }

        // Convert polar to cartesian
        const angleRad = angleDeg * Math.PI / 180;
        this.point = {
            x: center.x + radius * Math.cos(angleRad),
            y: center.y + radius * Math.sin(angleRad)
        };
    }

    getName() {
        return PolarpointExpression.NAME;
    }

    getGeometryType() {
        return 'point';
    }

    getPoint() {
        return this.point;
    }

    getVariableAtomicValues() {
        return [this.point.x, this.point.y];
    }

    getFriendlyToStr() {
        return `polarpoint(${this.point.x}, ${this.point.y})`;
    }

    toCommand(options = {}) {
        return new PointCommand(this.graphExpression, this.point, options);
    }

    canPlay() {
        return true;
    }
}
