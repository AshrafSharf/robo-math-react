/**
 * Cone3D expression - represents a 3D cone
 *
 * Syntax:
 *   cone3d(graph, radius, ax,ay,az, bx,by,bz)  - apex and base using separate coordinates
 *   cone3d(graph, radius, apex, baseCenter)    - using point3d expressions
 *
 * Examples:
 *   cone3d(g, 2, 0,0,5, 0,0,0)              // cone with apex at (0,0,5), base at origin
 *   cone3d(g, 1, apex, base)                // cone between two points
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Cone3DCommand } from '../../../commands/3d/Cone3DCommand.js';
import { cone3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Cone3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'cone';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.apex = { x: 0, y: 0, z: 1 };
        this.baseCenter = { x: 0, y: 0, z: 0 };
        this.radius = 1;
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError(cone3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(cone3d_error_messages.GRAPH_REQUIRED());
        }

        // Second arg is radius
        this.subExpressions[1].resolve(context);
        const radiusValues = this.subExpressions[1].getVariableAtomicValues();
        if (radiusValues.length !== 1) {
            this.dispatchError(cone3d_error_messages.INVALID_RADIUS());
        }
        this.radius = radiusValues[0];

        // Remaining args are apex and base center coordinates
        const coordinates = [];
        for (let i = 2; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const atomicValues = this.subExpressions[i].getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                coordinates.push(atomicValues[j]);
            }
        }

        if (coordinates.length !== 6) {
            this.dispatchError(cone3d_error_messages.WRONG_COORD_COUNT(coordinates.length));
        }

        this.apex = { x: coordinates[0], y: coordinates[1], z: coordinates[2] };
        this.baseCenter = { x: coordinates[3], y: coordinates[4], z: coordinates[5] };
    }

    getName() {
        return Cone3DExpression.NAME;
    }

    getGeometryType() {
        return 'cone';
    }

    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        const a = this.apex;
        const b = this.baseCenter;
        return `Cone3D[apex=(${a.x}, ${a.y}, ${a.z}), base=(${b.x}, ${b.y}, ${b.z}), radius=${this.radius}]`;
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('cone');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };
        return new Cone3DCommand(
            this.graphExpression,
            { apex: this.apex, baseCenter: this.baseCenter, radius: this.radius },
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
