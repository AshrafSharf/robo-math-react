/**
 * Cube3D expression - represents a 3D cube/box
 *
 * Syntax:
 *   cube3d(graph, size, cx, cy, cz)         - using separate coordinates
 *   cube3d(graph, size, point3d)            - using a point3d expression
 *
 * Examples:
 *   cube3d(g, 2, 0, 0, 0)                   // cube with size 2 at origin
 *   cube3d(g, 1.5, P)                       // cube with size 1.5 at point P
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Cube3DCommand } from '../../../commands/3d/Cube3DCommand.js';
import { cube3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Cube3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'cube';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.center = { x: 0, y: 0, z: 0 };
        this.size = 1;
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError(cube3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(cube3d_error_messages.GRAPH_REQUIRED());
        }

        // Second arg is size
        this.subExpressions[1].resolve(context);
        const sizeValues = this.subExpressions[1].getVariableAtomicValues();
        if (sizeValues.length !== 1) {
            this.dispatchError(cube3d_error_messages.INVALID_SIZE());
        }
        this.size = sizeValues[0];

        // Remaining args are center coordinates
        const coordinates = [];
        for (let i = 2; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const atomicValues = this.subExpressions[i].getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                coordinates.push(atomicValues[j]);
            }
        }

        if (coordinates.length !== 3) {
            this.dispatchError(cube3d_error_messages.WRONG_COORD_COUNT(coordinates.length));
        }

        this.center = { x: coordinates[0], y: coordinates[1], z: coordinates[2] };
    }

    getName() {
        return Cube3DExpression.NAME;
    }

    getGeometryType() {
        return 'cube';
    }

    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        const c = this.center;
        return `Cube3D[center=(${c.x}, ${c.y}, ${c.z}), size=${this.size}]`;
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('cube');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };
        return new Cube3DCommand(
            this.graphExpression,
            { center: this.center, size: this.size },
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
