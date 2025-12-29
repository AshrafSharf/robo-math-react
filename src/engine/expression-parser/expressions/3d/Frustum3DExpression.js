/**
 * Frustum3D expression - represents a 3D frustum (truncated pyramid/cone)
 *
 * Syntax:
 *   frustum3d(graph, baseRadius, topRadius, x1,y1,z1, x2,y2,z2)  - using separate coordinates
 *   frustum3d(graph, baseRadius, topRadius, point3d1, point3d2)  - using point3d expressions
 *
 * Examples:
 *   frustum3d(g, 2, 1, 0,0,0, 0,0,5)        // frustum from base at origin to top
 *   frustum3d(g, 3, 1.5, P1, P2)            // frustum between two points
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Frustum3DCommand } from '../../../commands/3d/Frustum3DCommand.js';
import { frustum3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Frustum3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'frustum';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.baseCenter = { x: 0, y: 0, z: 0 };
        this.topCenter = { x: 0, y: 0, z: 1 };
        this.baseRadius = 2;
        this.topRadius = 1;
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 5) {
            this.dispatchError(frustum3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(frustum3d_error_messages.GRAPH_REQUIRED());
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

        // Values: baseRadius + topRadius + baseCenter(3) + topCenter(3) = 8
        if (allValues.length !== 8) {
            this.dispatchError(frustum3d_error_messages.WRONG_COORD_COUNT(allValues.length - 2));
        }

        this.baseRadius = allValues[0];
        this.topRadius = allValues[1];
        this.baseCenter = { x: allValues[2], y: allValues[3], z: allValues[4] };
        this.topCenter = { x: allValues[5], y: allValues[6], z: allValues[7] };
    }

    getName() {
        return Frustum3DExpression.NAME;
    }

    getGeometryType() {
        return 'frustum';
    }

    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        const b = this.baseCenter;
        const t = this.topCenter;
        return `Frustum3D[base=(${b.x}, ${b.y}, ${b.z}), top=(${t.x}, ${t.y}, ${t.z}), baseR=${this.baseRadius}, topR=${this.topRadius}]`;
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('frustum');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...this.getStyleOptions(),
                ...(options.styleOptions || {})
            }
        };
        return new Frustum3DCommand(
            this.graphExpression,
            { baseCenter: this.baseCenter, topCenter: this.topCenter, baseRadius: this.baseRadius, topRadius: this.topRadius },
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
