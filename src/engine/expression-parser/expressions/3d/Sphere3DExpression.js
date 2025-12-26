/**
 * Sphere3D expression - represents a 3D sphere
 *
 * Syntax:
 *   sphere3d(graph, radius, cx, cy, cz)     - using separate coordinates
 *   sphere3d(graph, radius, point3d)        - using a point3d expression
 *
 * Examples:
 *   sphere3d(g, 2, 0, 0, 0)                 // sphere with radius 2 at origin
 *   sphere3d(g, 1.5, P)                     // sphere with radius 1.5 at point P
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Sphere3DCommand } from '../../../commands/3d/Sphere3DCommand.js';
import { sphere3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Sphere3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'sphere';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.center = { x: 0, y: 0, z: 0 };
        this.radius = 1;
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError(sphere3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(sphere3d_error_messages.GRAPH_REQUIRED());
        }

        // Resolve all remaining args, separating styling
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

        // First value is radius, next 3 are center coordinates
        if (allValues.length !== 4) {
            this.dispatchError(sphere3d_error_messages.WRONG_COORD_COUNT(allValues.length - 1));
        }

        this.radius = allValues[0];
        this.center = { x: allValues[1], y: allValues[2], z: allValues[3] };
    }

    getName() {
        return Sphere3DExpression.NAME;
    }

    getGeometryType() {
        return 'sphere';
    }

    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        const c = this.center;
        return `Sphere3D[center=(${c.x}, ${c.y}, ${c.z}), radius=${this.radius}]`;
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('sphere');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };
        return new Sphere3DCommand(
            this.graphExpression,
            { center: this.center, radius: this.radius },
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
