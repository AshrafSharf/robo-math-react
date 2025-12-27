/**
 * HLine (Horizontal Line) expression - creates a horizontal line at y coordinate
 *
 * Syntax: hline(graph, y) or hline(graph, y, x1, x2)
 *
 * If only y is provided, line extends from xends().min to xends().max
 * If x1, x2 are provided, line extends from x1 to x2
 *
 * Uses LineUtil.horizontal for calculation
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { LineCommand } from '../../commands/LineCommand.js';
import { LineUtil } from '../../../geom/LineUtil.js';

export class HLineExpression extends AbstractNonArithmeticExpression {
    static NAME = 'hline';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(`hline() needs 2+ arguments.\nUsage: hline(g, y) or hline(g, y, x1, x2)`);
        }

        // First arg is graph reference - resolve and store the actual expression
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        // Collect remaining values, separating styling expressions
        const values = [];
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this.subExpressions[i];

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                const atomicValues = expr.getVariableAtomicValues();
                values.push(...atomicValues);
            }
        }

        this._parseStyleExpressions(styleExprs);

        if (values.length < 1) {
            this.dispatchError(`hline() needs y coordinate.\nUsage: hline(g, y)`);
        }

        const y = values[0];
        let x1, x2;

        if (values.length >= 3) {
            // Custom x range provided
            x1 = values[1];
            x2 = values[2];
        } else {
            // Use graph's xends
            const grapher = this.getGrapher();
            if (grapher && grapher.xends) {
                const xends = grapher.xends();
                x1 = xends.min;
                x2 = xends.max;
            } else {
                // Fallback defaults
                x1 = -10;
                x2 = 10;
            }
        }

        // Use LineUtil.horizontal to create the line
        const line = LineUtil.horizontal(y, x1, x2);
        this.coordinates = [line.start.x, line.start.y, line.end.x, line.end.y];
    }


    // getGrapher() inherited from AbstractNonArithmeticExpression

    getName() {
        return HLineExpression.NAME;
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
        return `HLine[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
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
