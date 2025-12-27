/**
 * Cube3D expression - represents a 3D cube/box
 *
 * Syntax (g3d):
 *   cube(graph, size, cx, cy, cz)         - using separate coordinates
 *   cube(graph, size, point3d)            - using a point3d expression
 *
 * Syntax (s3d):
 *   cube(s3d, size)                       - cube at origin
 *   cube(group, size)                     - cube in group at origin
 *   Use position3d() to move the cube
 *
 * Examples:
 *   cube(g, 2, 0, 0, 0)                   // g3d: cube with size 2 at origin
 *   cube(S, 2)                            // s3d: cube with size 2 at origin
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Cube3DCommand } from '../../../commands/3d/Cube3DCommand.js';
import { CubeS3DCommand } from '../../../commands/s3d/CubeS3DCommand.js';
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

        // s3d mode
        this.isS3DMode = false;
        this.s3dParentExpression = null;
        this.s3dMesh = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(cube3d_error_messages.MISSING_ARGS());
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
            this.dispatchError(cube3d_error_messages.GRAPH_REQUIRED());
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

        // s3d syntax: just size (created at origin)
        if (allValues.length < 1) {
            this.dispatchError('cube() in s3d requires: size');
        }

        this.center = { x: 0, y: 0, z: 0 };
        this.size = allValues[0];
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

        if (allValues.length !== 4) {
            this.dispatchError(cube3d_error_messages.WRONG_COORD_COUNT(allValues.length - 1));
        }

        this.size = allValues[0];
        this.center = { x: allValues[1], y: allValues[2], z: allValues[3] };
    }

    getName() {
        return Cube3DExpression.NAME;
    }

    getGeometryType() {
        return 'cube';
    }

    isS3DCube() {
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
        const c = this.center;
        return `Cube3D[center=(${c.x}, ${c.y}, ${c.z}), size=${this.size}]`;
    }

    toCommand(options = {}) {
        if (this.isS3DMode) {
            return new CubeS3DCommand(
                this.s3dParentExpression,
                { center: this.center, size: this.size },
                options,
                this
            );
        }

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
