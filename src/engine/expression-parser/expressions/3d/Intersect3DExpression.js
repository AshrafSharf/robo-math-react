/**
 * Intersect3DExpression - finds intersection of 3D geometric objects
 *
 * Syntax:
 *   intersect3d(obj1, obj2)           - returns intersection point or line
 *   intersect3d(obj1, obj2, index)    - for multiple intersections, get nth (1-based)
 *
 * Supported combinations:
 *   - line3d + line3d   → point3d (if they intersect)
 *   - line3d + plane3d  → point3d (if line not parallel to plane)
 *   - plane3d + plane3d → line3d (if planes not parallel)
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   L = line3d(g, 0,0,0, 1,1,1)
 *   P = plane3d(g, 0, 0, 1, -5)        // z = 5 plane
 *   intersect3d(L, P)                   // returns point where line crosses z=5
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Point3DCommand } from '../../../commands/3d/Point3DCommand.js';
import { Line3DCommand } from '../../../commands/3d/Line3DCommand.js';
import { NoOpCommand } from '../../../commands/NoOpCommand.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Intersect3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'intersect3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.resultType = null;  // 'point3d' or 'line3d'
        this.resultData = null;  // { point: {...} } or { start: {...}, end: {...} }
        this.valid = false;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('intersect3d() requires at least 2 arguments');
        }

        // Resolve all subexpressions
        for (const expr of this.subExpressions) {
            expr.resolve(context);
        }

        // Get the two objects to intersect
        const obj1 = this._getResolvedExpression(context, this.subExpressions[0]);
        const obj2 = this._getResolvedExpression(context, this.subExpressions[1]);

        const type1 = obj1.getGeometryType?.() || obj1.getName();
        const type2 = obj2.getGeometryType?.() || obj2.getName();

        // Get graph expression from first object
        this.graphExpression = obj1.graphExpression || obj2.graphExpression;

        // Dispatch to appropriate intersection method
        const types = [type1, type2].sort().join('+');

        switch (types) {
            case 'line3d+line3d':
                this._intersectLineLine(obj1, obj2);
                break;
            case 'line3d+plane3d':
                if (type1 === 'line3d') {
                    this._intersectLinePlane(obj1, obj2);
                } else {
                    this._intersectLinePlane(obj2, obj1);
                }
                break;
            case 'plane3d+plane3d':
                this._intersectPlanePlane(obj1, obj2);
                break;
            default:
                this.dispatchError(`intersect3d() unsupported combination: ${type1} + ${type2}`);
        }
    }

    _intersectLineLine(line1Expr, line2Expr) {
        this.resultType = 'point3d';

        const coords1 = line1Expr.getVariableAtomicValues();
        const coords2 = line2Expr.getVariableAtomicValues();

        const p1 = { x: coords1[0], y: coords1[1], z: coords1[2] };
        const p2 = { x: coords1[3], y: coords1[4], z: coords1[5] };
        const p3 = { x: coords2[0], y: coords2[1], z: coords2[2] };
        const p4 = { x: coords2[3], y: coords2[4], z: coords2[5] };

        // Direction vectors
        const d1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
        const d2 = { x: p4.x - p3.x, y: p4.y - p3.y, z: p4.z - p3.z };
        const w = { x: p1.x - p3.x, y: p1.y - p3.y, z: p1.z - p3.z };

        // Dot products
        const a = d1.x * d1.x + d1.y * d1.y + d1.z * d1.z;
        const b = d1.x * d2.x + d1.y * d2.y + d1.z * d2.z;
        const c = d2.x * d2.x + d2.y * d2.y + d2.z * d2.z;
        const d = d1.x * w.x + d1.y * w.y + d1.z * w.z;
        const e = d2.x * w.x + d2.y * w.y + d2.z * w.z;

        const denom = a * c - b * b;

        // Lines are parallel
        if (Math.abs(denom) < 0.000001) {
            this.valid = false;
            this.resultData = { point: { x: NaN, y: NaN, z: NaN } };
            return;
        }

        // Calculate parameters for closest points
        const s = (b * e - c * d) / denom;
        const t = (a * e - b * d) / denom;

        // Closest points on each line
        const closest1 = {
            x: p1.x + s * d1.x,
            y: p1.y + s * d1.y,
            z: p1.z + s * d1.z
        };
        const closest2 = {
            x: p3.x + t * d2.x,
            y: p3.y + t * d2.y,
            z: p3.z + t * d2.z
        };

        // Check if lines actually intersect (closest points within tolerance)
        const dist = Math.sqrt(
            Math.pow(closest1.x - closest2.x, 2) +
            Math.pow(closest1.y - closest2.y, 2) +
            Math.pow(closest1.z - closest2.z, 2)
        );

        if (dist < 0.001) {
            this.valid = true;
            this.resultData = {
                point: {
                    x: (closest1.x + closest2.x) / 2,
                    y: (closest1.y + closest2.y) / 2,
                    z: (closest1.z + closest2.z) / 2
                }
            };
        } else {
            // Lines are skew (don't intersect)
            this.valid = false;
            this.resultData = { point: { x: NaN, y: NaN, z: NaN } };
        }
    }

    _intersectLinePlane(lineExpr, planeExpr) {
        this.resultType = 'point3d';

        const coords = lineExpr.getVariableAtomicValues();
        const lineStart = { x: coords[0], y: coords[1], z: coords[2] };
        const lineEnd = { x: coords[3], y: coords[4], z: coords[5] };
        const lineDir = {
            x: lineEnd.x - lineStart.x,
            y: lineEnd.y - lineStart.y,
            z: lineEnd.z - lineStart.z
        };

        const planeCenter = planeExpr.getCenter();
        const planeNormal = planeExpr.getNormal();

        // Plane equation: ax + by + cz + d = 0
        const a = planeNormal.x;
        const b = planeNormal.y;
        const c = planeNormal.z;
        const d = -(a * planeCenter.x + b * planeCenter.y + c * planeCenter.z);

        // Line: P = lineStart + t * lineDir
        // Substitute into plane: a(x0 + t*dx) + b(y0 + t*dy) + c(z0 + t*dz) + d = 0
        // t = -(a*x0 + b*y0 + c*z0 + d) / (a*dx + b*dy + c*dz)

        const denom = a * lineDir.x + b * lineDir.y + c * lineDir.z;

        if (Math.abs(denom) < 0.000001) {
            // Line is parallel to plane
            this.valid = false;
            this.resultData = { point: { x: NaN, y: NaN, z: NaN } };
            return;
        }

        const t = -(a * lineStart.x + b * lineStart.y + c * lineStart.z + d) / denom;

        this.valid = true;
        this.resultData = {
            point: {
                x: lineStart.x + t * lineDir.x,
                y: lineStart.y + t * lineDir.y,
                z: lineStart.z + t * lineDir.z
            }
        };
    }

    _intersectPlanePlane(plane1Expr, plane2Expr) {
        this.resultType = 'line3d';

        const center1 = plane1Expr.getCenter();
        const normal1 = plane1Expr.getNormal();
        const center2 = plane2Expr.getCenter();
        const normal2 = plane2Expr.getNormal();

        // Plane equations
        const a1 = normal1.x, b1 = normal1.y, c1 = normal1.z;
        const d1 = -(a1 * center1.x + b1 * center1.y + c1 * center1.z);

        const a2 = normal2.x, b2 = normal2.y, c2 = normal2.z;
        const d2 = -(a2 * center2.x + b2 * center2.y + c2 * center2.z);

        // Direction of intersection line is cross product of normals
        const dir = {
            x: normal1.y * normal2.z - normal1.z * normal2.y,
            y: normal1.z * normal2.x - normal1.x * normal2.z,
            z: normal1.x * normal2.y - normal1.y * normal2.x
        };

        const dirMag = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);

        if (dirMag < 0.000001) {
            // Planes are parallel
            this.valid = false;
            this.resultData = {
                start: { x: NaN, y: NaN, z: NaN },
                end: { x: NaN, y: NaN, z: NaN }
            };
            return;
        }

        // Find a point on the intersection line
        // Solve the system by setting one variable to 0
        let point;

        const detXY = a1 * b2 - a2 * b1;
        if (Math.abs(detXY) > 0.000001) {
            // Set z = 0, solve for x and y
            const x = (b1 * d2 - b2 * d1) / detXY;
            const y = (a2 * d1 - a1 * d2) / detXY;
            point = { x, y, z: 0 };
        } else {
            const detXZ = a1 * c2 - a2 * c1;
            if (Math.abs(detXZ) > 0.000001) {
                // Set y = 0, solve for x and z
                const x = (c1 * d2 - c2 * d1) / detXZ;
                const z = (a2 * d1 - a1 * d2) / detXZ;
                point = { x, y: 0, z };
            } else {
                const detYZ = b1 * c2 - b2 * c1;
                if (Math.abs(detYZ) > 0.000001) {
                    // Set x = 0, solve for y and z
                    const y = (c1 * d2 - c2 * d1) / detYZ;
                    const z = (b2 * d1 - b1 * d2) / detYZ;
                    point = { x: 0, y, z };
                } else {
                    this.valid = false;
                    this.resultData = {
                        start: { x: NaN, y: NaN, z: NaN },
                        end: { x: NaN, y: NaN, z: NaN }
                    };
                    return;
                }
            }
        }

        // Create line segment along direction
        const length = 10; // Default length
        const halfLen = length / 2;
        const normDir = {
            x: dir.x / dirMag,
            y: dir.y / dirMag,
            z: dir.z / dirMag
        };

        this.valid = true;
        this.resultData = {
            start: {
                x: point.x - halfLen * normDir.x,
                y: point.y - halfLen * normDir.y,
                z: point.z - halfLen * normDir.z
            },
            end: {
                x: point.x + halfLen * normDir.x,
                y: point.y + halfLen * normDir.y,
                z: point.z + halfLen * normDir.z
            }
        };
    }

    getName() {
        return Intersect3DExpression.NAME;
    }

    getGeometryType() {
        return this.resultType;
    }

    getPoint() {
        if (this.resultType === 'point3d') {
            return this.resultData.point;
        }
        return null;
    }

    getLinePoints() {
        if (this.resultType === 'line3d') {
            return [this.resultData.start, this.resultData.end];
        }
        return null;
    }

    getLine() {
        if (this.resultType === 'line3d') {
            return { start: this.resultData.start, end: this.resultData.end };
        }
        return null;
    }

    getVariableAtomicValues() {
        if (this.resultType === 'point3d') {
            const pt = this.resultData.point;
            return [pt.x, pt.y, pt.z];
        } else if (this.resultType === 'line3d') {
            return [
                this.resultData.start.x, this.resultData.start.y, this.resultData.start.z,
                this.resultData.end.x, this.resultData.end.y, this.resultData.end.z
            ];
        }
        return [];
    }

    getFriendlyToStr() {
        if (!this.valid) {
            return 'intersect3d[no intersection]';
        }
        if (this.resultType === 'point3d') {
            const pt = this.resultData.point;
            return `intersect3d[point(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)})]`;
        } else if (this.resultType === 'line3d') {
            const s = this.resultData.start;
            const e = this.resultData.end;
            return `intersect3d[line(${s.x.toFixed(2)}, ${s.y.toFixed(2)}, ${s.z.toFixed(2)}) -> (${e.x.toFixed(2)}, ${e.y.toFixed(2)}, ${e.z.toFixed(2)})]`;
        }
        return 'intersect3d[unknown]';
    }

    toCommand(options = {}) {
        if (!this.valid) {
            return new NoOpCommand();
        }

        const defaults = ExpressionOptionsRegistry.get(this.resultType);
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };

        if (this.resultType === 'point3d') {
            return new Point3DCommand(this.graphExpression, this.resultData.point, mergedOpts);
        } else if (this.resultType === 'line3d') {
            return new Line3DCommand(this.graphExpression, this.resultData.start, this.resultData.end, mergedOpts);
        }

        return new NoOpCommand();
    }

    canPlay() {
        return this.valid;
    }
}
