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

        // Second arg is number of sides
        this.subExpressions[1].resolve(context);
        const sidesValues = this.subExpressions[1].getVariableAtomicValues();
        if (sidesValues.length !== 1) {
            this.dispatchError(prism3d_error_messages.INVALID_SIDES());
        }
        this.sides = Math.floor(sidesValues[0]);

        // Third arg is height
        this.subExpressions[2].resolve(context);
        const heightValues = this.subExpressions[2].getVariableAtomicValues();
        if (heightValues.length !== 1) {
            this.dispatchError(prism3d_error_messages.INVALID_HEIGHT());
        }
        this.height = heightValues[0];

        // Fourth arg is base radius
        this.subExpressions[3].resolve(context);
        const radiusValues = this.subExpressions[3].getVariableAtomicValues();
        if (radiusValues.length !== 1) {
            this.dispatchError(prism3d_error_messages.INVALID_RADIUS());
        }
        this.baseRadius = radiusValues[0];

        // Remaining args are base center coordinates
        const coordinates = [];
        for (let i = 4; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const atomicValues = this.subExpressions[i].getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                coordinates.push(atomicValues[j]);
            }
        }

        if (coordinates.length !== 3) {
            this.dispatchError(prism3d_error_messages.WRONG_COORD_COUNT(coordinates.length));
        }

        this.baseCenter = { x: coordinates[0], y: coordinates[1], z: coordinates[2] };
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
