/**
 * PolarvectorExpression - creates a vector using polar coordinates (length and angle)
 *
 * Syntax:
 *   polarvector(graph, length, angleDeg)              - vector from origin
 *   polarvector(graph, length, angleDeg, fromX, fromY) - vector from specified point
 *   polarvector(graph, length, angleDeg, fromPoint)   - vector from point expression
 *
 * Returns vector coordinates [x1, y1, x2, y2]. When used standalone, renders as a vector (arrow).
 * Angle is in degrees: 0=right, 90=up, 180=left, 270=down
 *
 * Examples:
 *   polarvector(g, 5, 0)                // horizontal vector from (0,0) to (5,0)
 *   polarvector(g, 3, 90)               // vertical vector from (0,0) to (0,3)
 *   polarvector(g, 4, 45)               // diagonal vector at 45 degrees
 *   polarvector(g, 5, 30, 1, 2)         // vector from (1,2) at 30 degrees
 *   polarvector(g, 5, 60, A)            // vector from point A at 60 degrees
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { LineUtil } from '../../../geom/LineUtil.js';

export class PolarvectorExpression extends AbstractNonArithmeticExpression {
    static NAME = 'polarvector';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('polarvector() requires: polarvector(graph, length, angle) or polarvector(graph, length, angle, fromX, fromY)');
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
            this.dispatchError('polarvector() requires graph as first argument');
        }

        // Get length and angle
        const lengthExpr = this._getResolvedExpression(context, resolvedExprs[1]);
        const angleExpr = this._getResolvedExpression(context, resolvedExprs[2]);

        const length = lengthExpr.getVariableAtomicValues()[0];
        const angleDeg = angleExpr.getVariableAtomicValues()[0];

        // Determine origin point
        let origin = { x: 0, y: 0 };

        if (resolvedExprs.length === 4) {
            // polarvector(graph, length, angle, fromPoint)
            const fromExpr = this._getResolvedExpression(context, resolvedExprs[3]);
            const fromValues = fromExpr.getVariableAtomicValues();
            origin = { x: fromValues[0], y: fromValues[1] };
        } else if (resolvedExprs.length >= 5) {
            // polarvector(graph, length, angle, fromX, fromY)
            const fromXExpr = this._getResolvedExpression(context, resolvedExprs[3]);
            const fromYExpr = this._getResolvedExpression(context, resolvedExprs[4]);
            origin = {
                x: fromXExpr.getVariableAtomicValues()[0],
                y: fromYExpr.getVariableAtomicValues()[0]
            };
        }

        const result = LineUtil.fromPolar(length, angleDeg, origin);
        this.coordinates = [result.start.x, result.start.y, result.end.x, result.end.y];
    }

    getName() {
        return PolarvectorExpression.NAME;
    }

    getGeometryType() {
        return 'line';
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    asVector() {
        return {
            x: this.coordinates[2] - this.coordinates[0],
            y: this.coordinates[3] - this.coordinates[1]
        };
    }

    magnitude() {
        const dx = this.coordinates[2] - this.coordinates[0];
        const dy = this.coordinates[3] - this.coordinates[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    getVectorPoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1] },
            { x: this.coordinates[2], y: this.coordinates[3] }
        ];
    }

    getVector() {
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
        const pts = this.getVectorPoints();
        return `polarvector[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    toCommand(options = {}) {
        const pts = this.getVectorPoints();
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        return new VectorCommand(this.graphExpression, pts[0], pts[1], mergedOptions);
    }

    canPlay() {
        return true;
    }
}
