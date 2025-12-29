/**
 * Sphere3D expression - represents a 3D sphere
 *
 * Syntax (g3d):
 *   sphere(graph, radius, cx, cy, cz)     - using separate coordinates
 *   sphere(graph, radius, point3d)        - using a point3d expression
 *
 * Syntax (s3d):
 *   sphere(s3d, radius)                   - sphere at origin
 *   sphere(group, radius)                 - sphere in group at origin
 *   Use position3d() to move the sphere
 *
 * Examples:
 *   sphere(g, 2, 0, 0, 0)                 // g3d: sphere with radius 2 at origin
 *   sphere(S, 2)                          // s3d: sphere with radius 2 at origin
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Sphere3DCommand } from '../../../commands/3d/Sphere3DCommand.js';
import { SphereS3DCommand } from '../../../commands/s3d/SphereS3DCommand.js';
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

        // s3d mode
        this.isS3DMode = false;
        this.s3dParentExpression = null;
        this.s3dMesh = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(sphere3d_error_messages.MISSING_ARGS());
        }

        // First arg - check if s3d or g3d
        this.subExpressions[0].resolve(context);
        const firstArg = this._getResolvedExpression(context, this.subExpressions[0]);

        // Check for s3d context
        if (this._isS3DParent(firstArg)) {
            this.isS3DMode = true;
            this.s3dParentExpression = firstArg;
            this._resolveS3D(context);
            return;
        }

        // g3d mode
        this.graphExpression = firstArg;
        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(sphere3d_error_messages.GRAPH_REQUIRED());
        }

        this._resolveG3D(context);
    }

    /**
     * Check if expression is s3d or group
     */
    _isS3DParent(expr) {
        return (expr.isSpace3D && expr.isSpace3D()) ||
               (expr.isS3DGroup && expr.isS3DGroup());
    }

    /**
     * Resolve for s3d mode: sphere(parent, radius)
     */
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

        // s3d syntax: just radius (created at origin)
        if (allValues.length < 1) {
            this.dispatchError('sphere() in s3d requires: radius');
        }

        this.center = { x: 0, y: 0, z: 0 };
        this.radius = allValues[0];
    }

    /**
     * Resolve for g3d mode: sphere(graph, radius, x, y, z)
     */
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

        // g3d syntax: radius, x, y, z (4 values)
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

    /**
     * Check if this is an s3d sphere
     */
    isS3DSphere() {
        return this.isS3DMode;
    }

    /**
     * Get the mesh (for s3d mode)
     */
    getMesh() {
        return this.s3dMesh;
    }

    /**
     * Set the mesh (called by command after init)
     */
    setS3DMesh(mesh) {
        this.s3dMesh = mesh;
    }

    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        const c = this.center;
        return `Sphere3D[center=(${c.x}, ${c.y}, ${c.z}), radius=${this.radius}]`;
    }

    toCommand(options = {}) {
        // s3d mode - pure Three.js
        if (this.isS3DMode) {
            return new SphereS3DCommand(
                this.s3dParentExpression,
                { center: this.center, radius: this.radius },
                { ...options, ...this.getStyleOptions() },
                this
            );
        }

        // g3d mode
        const defaults = ExpressionOptionsRegistry.get('sphere');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...this.getStyleOptions(),
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
