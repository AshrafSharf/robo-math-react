/**
 * Cylinder3D expression - represents a 3D cylinder
 *
 * Syntax (two forms):
 *   cylinder(g, radius, height, x, y, z)      - center + height
 *   cylinder(g, radius, height, point3d)      - center + height with point3d
 *   cylinder(g, radius, x1,y1,z1, x2,y2,z2)   - two endpoints
 *   cylinder(g, radius, point3d1, point3d2)   - two endpoints with point3ds
 *
 * Examples:
 *   cylinder(g, 1, 5, 0, 0, 0)           // radius 1, height 5, centered at origin
 *   cylinder(g, 1, 0,0,0, 0,0,5)         // radius 1, from origin to (0,0,5)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Cylinder3DCommand } from '../../../commands/3d/Cylinder3DCommand.js';
import { cylinder3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Cylinder3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'cylinder';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.center = null;
        this.baseCenter = null;
        this.topCenter = null;
        this.radius = 1;
        this.height = null;
        this.graphExpression = null;
        this.useTwoPoints = false;
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError(cylinder3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(cylinder3d_error_messages.GRAPH_REQUIRED());
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

        // First value is radius
        if (allValues.length < 1) {
            this.dispatchError(cylinder3d_error_messages.INVALID_RADIUS());
        }
        this.radius = allValues[0];

        // Remaining values: 4 = height + center, 6 = two points
        const coordinates = allValues.slice(1);

        if (coordinates.length === 4) {
            // height + center (x, y, z)
            this.height = coordinates[0];
            this.center = { x: coordinates[1], y: coordinates[2], z: coordinates[3] };
            this.useTwoPoints = false;
        } else if (coordinates.length === 6) {
            // two endpoints
            this.baseCenter = { x: coordinates[0], y: coordinates[1], z: coordinates[2] };
            this.topCenter = { x: coordinates[3], y: coordinates[4], z: coordinates[5] };
            this.useTwoPoints = true;
        } else {
            this.dispatchError(cylinder3d_error_messages.WRONG_COORD_COUNT(coordinates.length));
        }
    }

    getName() {
        return Cylinder3DExpression.NAME;
    }

    getGeometryType() {
        return 'cylinder';
    }

    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        if (this.useTwoPoints) {
            const b = this.baseCenter;
            const t = this.topCenter;
            return `Cylinder3D[base=(${b.x}, ${b.y}, ${b.z}), top=(${t.x}, ${t.y}, ${t.z}), radius=${this.radius}]`;
        } else {
            const c = this.center;
            return `Cylinder3D[center=(${c.x}, ${c.y}, ${c.z}), radius=${this.radius}, height=${this.height}]`;
        }
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('cylinder');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };

        const shapeData = this.useTwoPoints
            ? { baseCenter: this.baseCenter, topCenter: this.topCenter, radius: this.radius }
            : { center: this.center, radius: this.radius, height: this.height };

        return new Cylinder3DCommand(
            this.graphExpression,
            shapeData,
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
