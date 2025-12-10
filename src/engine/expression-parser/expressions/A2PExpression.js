/**
 * A2PExpression - gets a point on a circle at a given angle
 *
 * Syntax:
 *   a2p(graph, circle, angleDeg)         - point on circle at angle (degrees)
 *   a2p(graph, center, radius, angleDeg) - point on circle defined by center and radius
 *
 * Returns two coordinate values (x, y). When used standalone, renders as a point.
 * Angle is in degrees: 0=right (3 o'clock), 90=top, 180=left, 270=bottom
 *
 * Examples:
 *   C = circle(g, 0, 0, 2)
 *   a2p(g, C, 0)                 // point at (2, 0) - right
 *   a2p(g, C, 90)                // point at (0, 2) - top
 *   a2p(g, C, 45)                // point at (√2, √2) - 45 degrees
 *   a2p(g, point(g, 1, 1), 3, 0) // point at (4, 1) - circle at (1,1) r=3
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { PointCommand } from '../../commands/PointCommand.js';
import { CircleUtil } from '../../../geom/CircleUtil.js';

export class A2PExpression extends AbstractArithmeticExpression {
    static NAME = 'a2p';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x, y]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('a2p() requires: a2p(graph, circle, angle) or a2p(graph, center, radius, angle)');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('a2p() requires graph as first argument');
        }

        let center, radius, angleDeg;

        if (this.subExpressions.length === 3) {
            // a2p(graph, circle, angle)
            const circleExpr = this._getResolvedExpression(context, this.subExpressions[1]);
            const angleExpr = this._getResolvedExpression(context, this.subExpressions[2]);

            if (circleExpr.getName() !== 'circle') {
                this.dispatchError('a2p() second argument must be a circle expression');
            }

            // Circle expression has [cx, cy, radius]
            const circleValues = circleExpr.getVariableAtomicValues();
            center = { x: circleValues[0], y: circleValues[1] };
            radius = circleValues[2];

            const angleValues = angleExpr.getVariableAtomicValues();
            angleDeg = angleValues[0];

        } else if (this.subExpressions.length >= 4) {
            // a2p(graph, center, radius, angle)
            const centerExpr = this._getResolvedExpression(context, this.subExpressions[1]);
            const radiusExpr = this._getResolvedExpression(context, this.subExpressions[2]);
            const angleExpr = this._getResolvedExpression(context, this.subExpressions[3]);

            const centerValues = centerExpr.getVariableAtomicValues();
            if (centerValues.length < 2) {
                this.dispatchError('a2p() center must have x, y coordinates');
            }

            center = { x: centerValues[0], y: centerValues[1] };

            const radiusValues = radiusExpr.getVariableAtomicValues();
            radius = radiusValues[0];

            const angleValues = angleExpr.getVariableAtomicValues();
            angleDeg = angleValues[0];
        }

        const point = CircleUtil.pointAtAngle(center, radius, angleDeg);
        this.coordinates = [point.x, point.y];
    }

    getName() {
        return A2PExpression.NAME;
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    getStartValue() {
        return this.coordinates.slice();
    }

    getEndValue() {
        return this.coordinates.slice();
    }

    getPoint() {
        return { x: this.coordinates[0], y: this.coordinates[1] };
    }

    getFriendlyToStr() {
        return `a2p(${this.coordinates[0]}, ${this.coordinates[1]})`;
    }

    toCommand(options = {}) {
        return new PointCommand(this.graphExpression, this.getPoint(), options);
    }

    canPlay() {
        return true;
    }
}
