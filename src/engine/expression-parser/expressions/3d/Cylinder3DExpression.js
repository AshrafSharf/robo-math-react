/**
 * Cylinder3D expression - represents a 3D cylinder
 *
 * Syntax (g3d):
 *   cylinder(g, radius, height, x, y, z)      - center + height
 *   cylinder(g, radius, height, point3d)      - center + height with point3d
 *   cylinder(g, radius, x1,y1,z1, x2,y2,z2)   - two endpoints
 *
 * Syntax (s3d):
 *   cylinder(s3d, radius, height)             - cylinder at origin
 *   cylinder(group, radius, height)           - cylinder in group at origin
 *   Use position3d() to move the cylinder
 *
 * Examples:
 *   cylinder(g, 1, 5, 0, 0, 0)                // g3d: radius 1, height 5, at origin
 *   cylinder(S, 1, 5)                         // s3d: radius 1, height 5 at origin
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Cylinder3DCommand } from '../../../commands/3d/Cylinder3DCommand.js';
import { CylinderS3DCommand } from '../../../commands/s3d/CylinderS3DCommand.js';
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

        // s3d mode
        this.isS3DMode = false;
        this.s3dParentExpression = null;
        this.s3dMesh = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError(cylinder3d_error_messages.MISSING_ARGS());
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
            this.dispatchError(cylinder3d_error_messages.GRAPH_REQUIRED());
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
            this.dispatchError('cylinder() in s3d requires: radius, height');
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

        if (allValues.length < 1) {
            this.dispatchError(cylinder3d_error_messages.INVALID_RADIUS());
        }
        this.radius = allValues[0];

        const coordinates = allValues.slice(1);

        if (coordinates.length === 4) {
            this.height = coordinates[0];
            this.center = { x: coordinates[1], y: coordinates[2], z: coordinates[3] };
            this.useTwoPoints = false;
        } else if (coordinates.length === 6) {
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

    isS3DCylinder() {
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
            return `Cylinder3D[center=(${c.x}, ${c.y}, ${c.z}), radius=${this.radius}, height=${this.height}]`;
        }
        if (this.useTwoPoints) {
            const b = this.baseCenter;
            const t = this.topCenter;
            return `Cylinder3D[base=(${b.x}, ${b.y}, ${b.z}), top=(${t.x}, ${t.y}, ${t.z}), radius=${this.radius}]`;
        }
        const c = this.center;
        return `Cylinder3D[center=(${c.x}, ${c.y}, ${c.z}), radius=${this.radius}, height=${this.height}]`;
    }

    toCommand(options = {}) {
        if (this.isS3DMode) {
            return new CylinderS3DCommand(
                this.s3dParentExpression,
                { center: this.center, radius: this.radius, height: this.height },
                options,
                this
            );
        }

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
