/**
 * Pyramid3D expression - represents a 3D pyramid
 *
 * Syntax:
 *   pyramid3d(graph, sides, height, size, cx,cy,cz)  - using separate coordinates
 *   pyramid3d(graph, sides, height, size, point3d)   - using a point3d expression
 *
 * Examples:
 *   pyramid3d(g, 4, 5, 2, 0, 0, 0)          // square pyramid at origin
 *   pyramid3d(g, 3, 4, 1.5, P)              // triangular pyramid at point P
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Pyramid3DCommand } from '../../../commands/3d/Pyramid3DCommand.js';
import { pyramid3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Pyramid3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'pyramid';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.position = { x: 0, y: 0, z: 0 };
        this.sides = 4;
        this.height = 1;
        this.size = 1;
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 5) {
            this.dispatchError(pyramid3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(pyramid3d_error_messages.GRAPH_REQUIRED());
        }

        // Second arg is number of sides
        this.subExpressions[1].resolve(context);
        const sidesValues = this.subExpressions[1].getVariableAtomicValues();
        if (sidesValues.length !== 1) {
            this.dispatchError(pyramid3d_error_messages.INVALID_SIDES());
        }
        this.sides = Math.floor(sidesValues[0]);

        // Third arg is height
        this.subExpressions[2].resolve(context);
        const heightValues = this.subExpressions[2].getVariableAtomicValues();
        if (heightValues.length !== 1) {
            this.dispatchError(pyramid3d_error_messages.INVALID_HEIGHT());
        }
        this.height = heightValues[0];

        // Fourth arg is base size
        this.subExpressions[3].resolve(context);
        const sizeValues = this.subExpressions[3].getVariableAtomicValues();
        if (sizeValues.length !== 1) {
            this.dispatchError(pyramid3d_error_messages.INVALID_SIZE());
        }
        this.size = sizeValues[0];

        // Remaining args are position coordinates
        const coordinates = [];
        for (let i = 4; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const atomicValues = this.subExpressions[i].getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                coordinates.push(atomicValues[j]);
            }
        }

        if (coordinates.length !== 3) {
            this.dispatchError(pyramid3d_error_messages.WRONG_COORD_COUNT(coordinates.length));
        }

        this.position = { x: coordinates[0], y: coordinates[1], z: coordinates[2] };
    }

    getName() {
        return Pyramid3DExpression.NAME;
    }

    getGeometryType() {
        return 'pyramid';
    }

    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        const p = this.position;
        return `Pyramid3D[position=(${p.x}, ${p.y}, ${p.z}), sides=${this.sides}, height=${this.height}, size=${this.size}]`;
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('pyramid');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };
        return new Pyramid3DCommand(
            this.graphExpression,
            { position: this.position, sides: this.sides, height: this.height, size: this.size },
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
