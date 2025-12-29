/**
 * Prism3D expression - represents a 3D prism
 *
 * Syntax:
 *   prism3d(graph, sides, height, baseRadius, cx,cy,cz)  - using separate coordinates
 *   prism3d(graph, sides, height, baseRadius, point3d)   - using a point3d expression
 *
 * Examples:
 *   prism3d(g, 6, 5, 2, 0, 0, 0)            // hexagonal prism at origin
 *   prism3d(g, 3, 4, 1, P)                  // triangular prism at point P
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Prism3DCommand } from '../../../commands/3d/Prism3DCommand.js';
import { prism3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Prism3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'prism';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.baseCenter = { x: 0, y: 0, z: 0 };
        this.sides = 6;
        this.height = 1;
        this.baseRadius = 1;
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 5) {
            this.dispatchError(prism3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(prism3d_error_messages.GRAPH_REQUIRED());
        }

        // Collect all values from remaining args, separating styling
        const allValues = [];
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this.subExpressions[i];

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                const atomicValues = expr.getVariableAtomicValues();
                for (let j = 0; j < atomicValues.length; j++) {
                    allValues.push(atomicValues[j]);
                }
            }
        }

        this._parseStyleExpressions(styleExprs);

        // Values: sides + height + baseRadius + center(3) = 6
        if (allValues.length !== 6) {
            this.dispatchError(prism3d_error_messages.WRONG_COORD_COUNT(allValues.length - 3));
        }

        this.sides = Math.floor(allValues[0]);
        this.height = allValues[1];
        this.baseRadius = allValues[2];
        this.baseCenter = { x: allValues[3], y: allValues[4], z: allValues[5] };
    }

    getName() {
        return Prism3DExpression.NAME;
    }

    getGeometryType() {
        return 'prism';
    }

    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        const c = this.baseCenter;
        return `Prism3D[base=(${c.x}, ${c.y}, ${c.z}), sides=${this.sides}, height=${this.height}, radius=${this.baseRadius}]`;
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('prism');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...this.getStyleOptions(),
                ...(options.styleOptions || {})
            }
        };
        return new Prism3DCommand(
            this.graphExpression,
            { baseCenter: this.baseCenter, sides: this.sides, height: this.height, baseRadius: this.baseRadius },
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
