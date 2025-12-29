/**
 * Cone3D expression - represents a 3D cone
 *
 * Syntax (g3d):
 *   cone(graph, radius, ax,ay,az, bx,by,bz)  - apex and base using separate coordinates
 *   cone(graph, radius, apex, baseCenter)    - using point3d expressions
 *
 * Syntax (s3d):
 *   cone(s3d, radius, height)                - cone at origin
 *   cone(group, radius, height)              - cone in group at origin
 *   Use position3d() to move the cone
 *
 * Examples:
 *   cone(g, 2, 0,0,5, 0,0,0)                 // g3d: cone with apex at (0,0,5)
 *   cone(S, 2, 5)                            // s3d: cone with radius 2, height 5 at origin
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Cone3DCommand } from '../../../commands/3d/Cone3DCommand.js';
import { ConeS3DCommand } from '../../../commands/s3d/ConeS3DCommand.js';
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

        // s3d mode
        this.isS3DMode = false;
        this.s3dParentExpression = null;
        this.s3dMesh = null;
        this.center = { x: 0, y: 0, z: 0 };
        this.height = 1;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError(cone3d_error_messages.MISSING_ARGS());
        }

        this.subExpressions[0].resolve(context);
        const firstArg = this._getResolvedExpression(context, this.subExpressions[0]);

        if (this._isS3DParent(firstArg)) {
            this.isS3DMode = true;
            this.s3dParentExpression = firstArg;
            this._resolveS3D(context);
            return;
        }

        this.graphExpression = firstArg;
        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(cone3d_error_messages.GRAPH_REQUIRED());
        }

        this._resolveG3D(context);
    }

    _isS3DParent(expr) {
        return (expr.isSpace3D && expr.isSpace3D()) ||
               (expr.isS3DGroup && expr.isS3DGroup());
    }

    _resolveS3D(context) {
        const allValues = [];
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this.subExpressions[i];

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                allValues.push(...expr.getVariableAtomicValues());
            }
        }

        this._parseStyleExpressions(styleExprs);

        // s3d syntax: radius, height (created at origin)
        if (allValues.length < 2) {
            this.dispatchError('cone() in s3d requires: radius, height');
        }

        this.center = { x: 0, y: 0, z: 0 };
        this.radius = allValues[0];
        this.height = allValues[1];
    }

    _resolveG3D(context) {
        const allValues = [];
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this.subExpressions[i];

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                allValues.push(...expr.getVariableAtomicValues());
            }
        }

        this._parseStyleExpressions(styleExprs);

        if (allValues.length !== 7) {
            this.dispatchError(cone3d_error_messages.WRONG_COORD_COUNT(allValues.length - 1));
        }

        this.radius = allValues[0];
        this.apex = { x: allValues[1], y: allValues[2], z: allValues[3] };
        this.baseCenter = { x: allValues[4], y: allValues[5], z: allValues[6] };
    }

    getName() {
        return Cone3DExpression.NAME;
    }

    getGeometryType() {
        return 'cone';
    }

    isS3DCone() {
        return this.isS3DMode;
    }

    getMesh() {
        return this.s3dMesh;
    }

    setS3DMesh(mesh) {
        this.s3dMesh = mesh;
    }

    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        if (this.isS3DMode) {
            const c = this.center;
            return `Cone3D[center=(${c.x}, ${c.y}, ${c.z}), radius=${this.radius}, height=${this.height}]`;
        }
        const a = this.apex;
        const b = this.baseCenter;
        return `Cone3D[apex=(${a.x}, ${a.y}, ${a.z}), base=(${b.x}, ${b.y}, ${b.z}), radius=${this.radius}]`;
    }

    toCommand(options = {}) {
        if (this.isS3DMode) {
            return new ConeS3DCommand(
                this.s3dParentExpression,
                { center: this.center, radius: this.radius, height: this.height },
                { ...options, ...this.getStyleOptions() },
                this
            );
        }

        const defaults = ExpressionOptionsRegistry.get('cone');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...this.getStyleOptions(),
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
