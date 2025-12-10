/**
 * UVExpression - calculates unit vector (normalized direction)
 *
 * Syntax:
 *   uv(line)         - unit vector in direction of line/vector
 *   uv(p1, p2)       - unit vector from p1 to p2
 *   uv(x, y)         - unit vector of (x, y)
 *
 * Returns direction values [dx, dy] where dx² + dy² = 1.
 * When used standalone with graph, renders as unit vector from origin.
 *
 * Examples:
 *   L = line(g, 0, 0, 3, 4)
 *   uv(L)                     // returns (0.6, 0.8)
 *   uv(A, B)                  // unit direction from A to B
 *   uv(3, 4)                  // returns (0.6, 0.8)
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { GeomUtil } from '../../../geom/GeomUtil.js';

export class UVExpression extends AbstractArithmeticExpression {
    static NAME = 'uv';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.direction = [0, 0]; // [dx, dy] normalized
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('uv() requires at least one argument');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        let dx, dy;

        // Check if first arg is a graph
        const firstArg = this._getResolvedExpression(context, this.subExpressions[0]);
        const isFirstArgGraph = firstArg && firstArg.getName() === 'g2d';

        if (isFirstArgGraph) {
            this.graphExpression = firstArg;

            if (this.subExpressions.length === 2) {
                // uv(graph, line/vector)
                const sourceExpr = this._getResolvedExpression(context, this.subExpressions[1]);
                const result = this._getDirectionFromShape(sourceExpr);
                dx = result.dx;
                dy = result.dy;
            } else if (this.subExpressions.length >= 3) {
                // uv(graph, p1, p2) or uv(graph, x, y)
                const arg1 = this._getResolvedExpression(context, this.subExpressions[1]);
                const arg2 = this._getResolvedExpression(context, this.subExpressions[2]);
                const result = this._getDirectionFromArgs(arg1, arg2);
                dx = result.dx;
                dy = result.dy;
            }
        } else {
            // No graph prefix
            if (this.subExpressions.length === 1) {
                // uv(line/vector)
                const result = this._getDirectionFromShape(firstArg);
                dx = result.dx;
                dy = result.dy;
            } else if (this.subExpressions.length >= 2) {
                // uv(p1, p2) or uv(x, y)
                const arg2 = this._getResolvedExpression(context, this.subExpressions[1]);
                const result = this._getDirectionFromArgs(firstArg, arg2);
                dx = result.dx;
                dy = result.dy;
            }
        }

        // Normalize
        const mag = Math.sqrt(dx * dx + dy * dy);
        if (mag < 1e-10) {
            this.dispatchError('uv() cannot compute unit vector of zero-magnitude vector');
        }

        this.direction = [dx / mag, dy / mag];
    }

    _getDirectionFromShape(sourceExpr) {
        const values = sourceExpr.getVariableAtomicValues();

        if (values.length >= 4) {
            // Has start and end points
            const startVal = sourceExpr.getStartValue ? sourceExpr.getStartValue() : values.slice(0, 2);
            const endVal = sourceExpr.getEndValue ? sourceExpr.getEndValue() : values.slice(2, 4);
            return {
                dx: endVal[0] - startVal[0],
                dy: endVal[1] - startVal[1]
            };
        } else if (values.length >= 2) {
            // Treat as vector (x, y)
            return { dx: values[0], dy: values[1] };
        }

        this.dispatchError('uv() requires an expression with coordinates');
    }

    _getDirectionFromArgs(arg1, arg2) {
        const values1 = arg1.getVariableAtomicValues();
        const values2 = arg2.getVariableAtomicValues();

        if (values1.length >= 2 && values2.length >= 2) {
            // Two points - direction from p1 to p2
            return {
                dx: values2[0] - values1[0],
                dy: values2[1] - values1[1]
            };
        } else if (values1.length === 1 && values2.length === 1) {
            // Two numbers - treat as vector (x, y)
            return { dx: values1[0], dy: values2[0] };
        }

        this.dispatchError('uv() arguments must be points or numbers');
    }

    getName() {
        return UVExpression.NAME;
    }

    getVariableAtomicValues() {
        return this.direction.slice();
    }

    getDirection() {
        return { x: this.direction[0], y: this.direction[1] };
    }

    getFriendlyToStr() {
        return `uv(${this.direction[0].toFixed(4)}, ${this.direction[1].toFixed(4)})`;
    }

    // When used standalone with graph, render as unit vector from origin
    toCommand(options = {}) {
        if (this.graphExpression) {
            const start = { x: 0, y: 0 };
            const end = { x: this.direction[0], y: this.direction[1] };
            return new VectorCommand(this.graphExpression, start, end, options);
        }
        return null;
    }

    canPlay() {
        return this.graphExpression !== null;
    }
}
