/**
 * Torus3D expression - represents a 3D torus (donut shape)
 *
 * Syntax:
 *   torus3d(graph, radius, tubeRadius, cx,cy,cz)  - using separate coordinates
 *   torus3d(graph, radius, tubeRadius, point3d)   - using a point3d expression
 *
 * Examples:
 *   torus3d(g, 3, 1, 0, 0, 0)               // torus at origin, main radius 3, tube radius 1
 *   torus3d(g, 2, 0.5, P)                   // torus at point P
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Torus3DCommand } from '../../../commands/3d/Torus3DCommand.js';
import { torus3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Torus3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'torus';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.center = { x: 0, y: 0, z: 0 };
        this.radius = 2;
        this.tubeRadius = 0.5;
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError(torus3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(torus3d_error_messages.GRAPH_REQUIRED());
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

        // Values: radius + tubeRadius + center(3) = 5
        if (allValues.length !== 5) {
            this.dispatchError(torus3d_error_messages.WRONG_COORD_COUNT(allValues.length - 2));
        }

        this.radius = allValues[0];
        this.tubeRadius = allValues[1];
        this.center = { x: allValues[2], y: allValues[3], z: allValues[4] };
    }

    getName() {
        return Torus3DExpression.NAME;
    }

    getGeometryType() {
        return 'torus';
    }

    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        const c = this.center;
        return `Torus3D[center=(${c.x}, ${c.y}, ${c.z}), radius=${this.radius}, tubeRadius=${this.tubeRadius}]`;
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('torus');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };
        return new Torus3DCommand(
            this.graphExpression,
            { center: this.center, radius: this.radius, tubeRadius: this.tubeRadius },
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
