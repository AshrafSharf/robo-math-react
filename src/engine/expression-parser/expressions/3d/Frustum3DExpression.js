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

        // Second arg is base radius
        this.subExpressions[1].resolve(context);
        const baseRadiusValues = this.subExpressions[1].getVariableAtomicValues();
        if (baseRadiusValues.length !== 1) {
            this.dispatchError(frustum3d_error_messages.INVALID_BASE_RADIUS());
        }
        this.baseRadius = baseRadiusValues[0];

        // Third arg is top radius
        this.subExpressions[2].resolve(context);
        const topRadiusValues = this.subExpressions[2].getVariableAtomicValues();
        if (topRadiusValues.length !== 1) {
            this.dispatchError(frustum3d_error_messages.INVALID_TOP_RADIUS());
        }
        this.topRadius = topRadiusValues[0];

        // Remaining args are base and top center coordinates
        const coordinates = [];
        for (let i = 3; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const atomicValues = this.subExpressions[i].getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                coordinates.push(atomicValues[j]);
            }
        }

        if (coordinates.length !== 6) {
            this.dispatchError(frustum3d_error_messages.WRONG_COORD_COUNT(coordinates.length));
        }

        this.baseCenter = { x: coordinates[0], y: coordinates[1], z: coordinates[2] };
        this.topCenter = { x: coordinates[3], y: coordinates[4], z: coordinates[5] };
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
