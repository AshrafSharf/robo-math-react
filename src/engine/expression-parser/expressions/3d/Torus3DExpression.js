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

        // Second arg is main radius
        this.subExpressions[1].resolve(context);
        const radiusValues = this.subExpressions[1].getVariableAtomicValues();
        if (radiusValues.length !== 1) {
            this.dispatchError(torus3d_error_messages.INVALID_RADIUS());
        }
        this.radius = radiusValues[0];

        // Third arg is tube radius
        this.subExpressions[2].resolve(context);
        const tubeRadiusValues = this.subExpressions[2].getVariableAtomicValues();
        if (tubeRadiusValues.length !== 1) {
            this.dispatchError(torus3d_error_messages.INVALID_TUBE_RADIUS());
        }
        this.tubeRadius = tubeRadiusValues[0];

        // Remaining args are center coordinates
        const coordinates = [];
        for (let i = 3; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const atomicValues = this.subExpressions[i].getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                coordinates.push(atomicValues[j]);
            }
        }

        if (coordinates.length !== 3) {
            this.dispatchError(torus3d_error_messages.WRONG_COORD_COUNT(coordinates.length));
        }

        this.center = { x: coordinates[0], y: coordinates[1], z: coordinates[2] };
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
