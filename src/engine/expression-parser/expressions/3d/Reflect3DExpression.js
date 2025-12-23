/**
 * Reflect3DExpression - reflects a 3D shape across a plane
 *
 * Syntax:
 *   reflect3d(plane, shape)  - returns the reflected shape
 *
 * Supports reflecting: point3d, line3d, vector3d, polygon3d
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   P = plane3d(g, 0, 0, 1, 0)           // xy-plane (z = 0)
 *   A = point3d(g, 3, 4, 5)
 *   reflect3d(P, A)                       // returns (3, 4, -5)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Point3DCommand } from '../../../commands/3d/Point3DCommand.js';
import { Line3DCommand } from '../../../commands/3d/Line3DCommand.js';
import { Vector3DCommand } from '../../../commands/3d/Vector3DCommand.js';
import { Polygon3DCommand } from '../../../commands/3d/Polygon3DCommand.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

const SUPPORTED_TYPES = ['point3d', 'line3d', 'vector3d', 'polygon3d'];

export class Reflect3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'reflect3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.planeExpression = null;
        this.shapeExpression = null;
        this.shapeType = null;
        this.reflectedData = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('reflect3d() requires: reflect3d(plane, shape)');
        }

        // Resolve all subexpressions
        for (const expr of this.subExpressions) {
            expr.resolve(context);
        }

        // First arg must be plane3d
        const planeExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const planeType = planeExpr.getGeometryType?.() || planeExpr.getName();

        if (planeType !== 'plane3d') {
            this.dispatchError(`reflect3d() requires plane3d as first argument, got: ${planeType}`);
        }

        this.planeExpression = planeExpr;
        this.graphExpression = planeExpr.graphExpression;

        // Get plane properties for reflection
        const planeCenter = planeExpr.getCenter();
        const planeNormal = planeExpr.getNormal();

        // Compute plane equation: ax + by + cz + d = 0
        const a = planeNormal.x;
        const b = planeNormal.y;
        const c = planeNormal.z;
        const d = -(a * planeCenter.x + b * planeCenter.y + c * planeCenter.z);
        const normalLengthSq = a * a + b * b + c * c;

        if (normalLengthSq < 0.000001) {
            this.dispatchError('reflect3d(): plane has invalid normal vector');
        }

        // Helper to reflect a single point
        const reflectPoint = (pt) => {
            const distance = (a * pt.x + b * pt.y + c * pt.z + d) / normalLengthSq;
            return {
                x: pt.x - 2 * distance * a,
                y: pt.y - 2 * distance * b,
                z: pt.z - 2 * distance * c
            };
        };

        // Second arg is the shape to reflect
        const shapeExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        this.shapeType = shapeExpr.getGeometryType?.() || shapeExpr.getName();
        this.shapeExpression = shapeExpr;

        if (!SUPPORTED_TYPES.includes(this.shapeType)) {
            this.dispatchError(`reflect3d() unsupported shape type: ${this.shapeType}. Supported: ${SUPPORTED_TYPES.join(', ')}`);
        }

        // Reflect based on shape type
        switch (this.shapeType) {
            case 'point3d': {
                const pt = shapeExpr.getPoint();
                this.reflectedData = { point: reflectPoint(pt) };
                break;
            }

            case 'line3d':
            case 'vector3d': {
                const coords = shapeExpr.getVariableAtomicValues();
                const start = { x: coords[0], y: coords[1], z: coords[2] };
                const end = { x: coords[3], y: coords[4], z: coords[5] };
                this.reflectedData = {
                    start: reflectPoint(start),
                    end: reflectPoint(end)
                };
                break;
            }

            case 'polygon3d': {
                const vertices = shapeExpr.getVertices();
                this.reflectedData = {
                    vertices: vertices.map(v => reflectPoint(v))
                };
                break;
            }
        }
    }

    getName() {
        return Reflect3DExpression.NAME;
    }

    getGeometryType() {
        return this.shapeType;
    }

    // Point accessors
    getPoint() {
        if (this.shapeType === 'point3d') {
            return this.reflectedData.point;
        }
        return null;
    }

    // Line/Vector accessors
    getLinePoints() {
        if (this.shapeType === 'line3d' || this.shapeType === 'vector3d') {
            return [this.reflectedData.start, this.reflectedData.end];
        }
        return null;
    }

    getLine() {
        return { start: this.reflectedData.start, end: this.reflectedData.end };
    }

    getVector() {
        return this.getLine();
    }

    // Polygon accessors
    getVertices() {
        if (this.shapeType === 'polygon3d') {
            return this.reflectedData.vertices;
        }
        return null;
    }

    getVariableAtomicValues() {
        switch (this.shapeType) {
            case 'point3d':
                return [this.reflectedData.point.x, this.reflectedData.point.y, this.reflectedData.point.z];
            case 'line3d':
            case 'vector3d':
                return [
                    this.reflectedData.start.x, this.reflectedData.start.y, this.reflectedData.start.z,
                    this.reflectedData.end.x, this.reflectedData.end.y, this.reflectedData.end.z
                ];
            case 'polygon3d':
                return this.reflectedData.vertices.flatMap(v => [v.x, v.y, v.z]);
            default:
                return [];
        }
    }

    getFriendlyToStr() {
        switch (this.shapeType) {
            case 'point3d': {
                const pt = this.reflectedData.point;
                return `reflect3d[point(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)})]`;
            }
            case 'line3d':
            case 'vector3d': {
                const s = this.reflectedData.start;
                const e = this.reflectedData.end;
                return `reflect3d[${this.shapeType}(${s.x.toFixed(2)}, ${s.y.toFixed(2)}, ${s.z.toFixed(2)}) -> (${e.x.toFixed(2)}, ${e.y.toFixed(2)}, ${e.z.toFixed(2)})]`;
            }
            case 'polygon3d':
                return `reflect3d[polygon3d with ${this.reflectedData.vertices.length} vertices]`;
            default:
                return 'reflect3d[unknown]';
        }
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get(this.shapeType);
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };

        switch (this.shapeType) {
            case 'point3d':
                return new Point3DCommand(this.graphExpression, this.reflectedData.point, mergedOpts);
            case 'line3d':
                return new Line3DCommand(this.graphExpression, this.reflectedData.start, this.reflectedData.end, mergedOpts);
            case 'vector3d':
                return new Vector3DCommand(this.graphExpression, this.reflectedData.start, this.reflectedData.end, mergedOpts);
            case 'polygon3d':
                return new Polygon3DCommand(this.graphExpression, this.reflectedData.vertices, mergedOpts);
            default:
                this.dispatchError(`reflect3d(): cannot create command for ${this.shapeType}`);
        }
    }

    canPlay() {
        return this.reflectedData !== null;
    }
}
