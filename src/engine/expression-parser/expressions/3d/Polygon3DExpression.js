/**
 * Polygon3D expression - represents a 3D polygon (planar surface from vertices)
 *
 * Syntax:
 *   polygon3d(g, p1, p2, p3, ...)     - 3 or more point3d vertices
 *   polygon3d(g, point3d(g,0,0,0), point3d(g,3,0,0), point3d(g,1.5,2,0))
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Polygon3DCommand } from '../../../commands/3d/Polygon3DCommand.js';
import { polygon3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Polygon3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'polygon3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vertices = [];
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {  // graph + at least 3 points
            this.dispatchError(polygon3d_error_messages.MISSING_ARGS());
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(polygon3d_error_messages.GRAPH_REQUIRED());
        }

        // Remaining args must be point3d expressions, separating styling
        this.vertices = [];
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const arg = this._getResolvedExpression(context, this.subExpressions[i]);

            if (this._isStyleExpression(arg)) {
                styleExprs.push(arg);
                continue;
            }

            // Check if it's a point3d
            if (typeof arg.getGeometryType !== 'function' || arg.getGeometryType() !== 'point3d') {
                this.dispatchError(polygon3d_error_messages.INVALID_VERTEX(i));
            }

            const pt = arg.getPoint();
            this.vertices.push({ x: pt.x, y: pt.y, z: pt.z });
        }

        this._parseStyleExpressions(styleExprs);

        if (this.vertices.length < 3) {
            this.dispatchError(polygon3d_error_messages.MIN_VERTICES());
        }
    }

    getName() {
        return Polygon3DExpression.NAME;
    }

    getGeometryType() {
        return 'polygon3d';
    }

    getVertices() {
        return this.vertices;
    }

    /**
     * Get centroid of polygon
     */
    getCentroid() {
        const n = this.vertices.length;
        const sum = this.vertices.reduce((acc, v) => ({
            x: acc.x + v.x,
            y: acc.y + v.y,
            z: acc.z + v.z
        }), { x: 0, y: 0, z: 0 });

        return {
            x: sum.x / n,
            y: sum.y / n,
            z: sum.z / n
        };
    }

    getVariableAtomicValues() {
        // Return all vertex coordinates flattened
        const values = [];
        for (const v of this.vertices) {
            values.push(v.x, v.y, v.z);
        }
        return values;
    }

    getFriendlyToStr() {
        return `Polygon3D[${this.vertices.length} vertices]`;
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('polygon3d');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };
        return new Polygon3DCommand(
            this.graphExpression,
            { vertices: this.vertices },
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
