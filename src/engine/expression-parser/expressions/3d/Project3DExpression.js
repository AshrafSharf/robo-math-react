/**
 * Project3DExpression - projects a 3D point onto a plane
 *
 * Syntax:
 *   project3d(plane, point)  - returns the projected point (foot of perpendicular)
 *
 * The projection finds the closest point on the plane to the given point.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   P = plane3d(g, 0, 0, 1, 0)           // xy-plane (z = 0)
 *   A = point3d(g, 3, 4, 5)
 *   project3d(P, A)                       // returns (3, 4, 0)
 */
import { AbstractArithmeticExpression } from '../AbstractArithmeticExpression.js';
import { Point3DCommand } from '../../../commands/3d/Point3DCommand.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Project3DExpression extends AbstractArithmeticExpression {
    static NAME = 'project3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.projectedPoint = { x: 0, y: 0, z: 0 };
        this.graphExpression = null;
        this.planeExpression = null;
        this.pointExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('project3d() requires: project3d(plane, point)');
        }

        // Resolve all subexpressions
        for (const expr of this.subExpressions) {
            expr.resolve(context);
        }

        // First arg must be plane3d
        const planeExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const planeType = planeExpr.getGeometryType?.() || planeExpr.getName();

        if (planeType !== 'plane3d') {
            this.dispatchError(`project3d() requires plane3d as first argument, got: ${planeType}`);
        }

        this.planeExpression = planeExpr;
        this.graphExpression = planeExpr.graphExpression;

        // Second arg must be point3d
        const pointExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const pointType = pointExpr.getGeometryType?.() || pointExpr.getName();

        if (pointType !== 'point3d') {
            this.dispatchError(`project3d() requires point3d as second argument, got: ${pointType}`);
        }

        this.pointExpression = pointExpr;

        // Get plane properties
        const planeCenter = planeExpr.getCenter();
        const planeNormal = planeExpr.getNormal();

        // Compute plane equation: ax + by + cz + d = 0
        const a = planeNormal.x;
        const b = planeNormal.y;
        const c = planeNormal.z;
        const d = -(a * planeCenter.x + b * planeCenter.y + c * planeCenter.z);

        // Get point to project
        const point = pointExpr.getPoint();

        // Project point onto plane
        // Formula: projected = point - ((a*px + b*py + c*pz + d) / (a² + b² + c²)) * normal
        const normalLengthSq = a * a + b * b + c * c;

        if (normalLengthSq < 0.000001) {
            this.dispatchError('project3d(): plane has invalid normal vector');
        }

        const distance = (a * point.x + b * point.y + c * point.z + d) / normalLengthSq;

        this.projectedPoint = {
            x: point.x - distance * a,
            y: point.y - distance * b,
            z: point.z - distance * c
        };
    }

    getName() {
        return Project3DExpression.NAME;
    }

    getGeometryType() {
        return 'point3d';
    }

    getPoint() {
        return this.projectedPoint;
    }

    getVariableAtomicValues() {
        return [this.projectedPoint.x, this.projectedPoint.y, this.projectedPoint.z];
    }

    getFriendlyToStr() {
        const pt = this.projectedPoint;
        return `project3d[(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)})]`;
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('point3d');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...this.getStyleOptions(),
                ...(options.styleOptions || {})
            }
        };
        return new Point3DCommand(this.graphExpression, this.projectedPoint, mergedOpts);
    }

    canPlay() {
        return true;
    }
}
