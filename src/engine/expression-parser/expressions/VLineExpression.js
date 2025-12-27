/**
 * VLine (Vertical Line) expression - creates a vertical line at x coordinate
 *
 * Syntax: vline(graph, x) or vline(graph, x, y1, y2)
 *
 * If only x is provided, line extends from yends().min to yends().max
 * If y1, y2 are provided, line extends from y1 to y2
 *
 * Uses LineUtil.vertical for calculation
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { LineCommand } from '../../commands/LineCommand.js';
import { LineUtil } from '../../../geom/LineUtil.js';

export class VLineExpression extends AbstractNonArithmeticExpression {
    static NAME = 'vline';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(`vline() needs 2+ arguments.\nUsage: vline(g, x) or vline(g, x, y1, y2)`);
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
            this.dispatchError(`vline() needs x coordinate.\nUsage: vline(g, x)`);
        }

        const x = values[0];
        let y1, y2;

        if (values.length >= 3) {
            // Custom y range provided
            y1 = values[1];
            y2 = values[2];
        } else {
            // Use graph's yends
            const grapher = this.getGrapher();
            if (grapher && grapher.yends) {
                const yends = grapher.yends();
                y1 = yends.min;
                y2 = yends.max;
            } else {
                // Fallback defaults
                y1 = -10;
                y2 = 10;
            }
        }

        // Use LineUtil.vertical to create the line
        const line = LineUtil.vertical(x, y1, y2);
        this.coordinates = [line.start.x, line.start.y, line.end.x, line.end.y];
    }


    // getGrapher() inherited from AbstractNonArithmeticExpression

    getName() {
        return VLineExpression.NAME;
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
        return `VLine[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
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
