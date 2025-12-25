/**
 * Distance3DExpression - calculates distance between 3D geometric objects
 *
 * Syntax (overloaded):
 *   distance3d(point1, point2)    - distance between two 3D points
 *   distance3d(point, line)       - perpendicular distance from point to line
 *   distance3d(point, plane)      - perpendicular distance from point to plane
 *   distance3d(line1, line2)      - distance between two lines (parallel or skew)
 *   distance3d(plane1, plane2)    - distance between two parallel planes
 *
 * Returns a numeric value (scalar). No visualization.
 *
 * Formulas:
 *   Point to point:  d = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)
 *   Point to plane:  d = |u · n - p| / ||n||  where plane: r · n = p
 *   Point to line:   d = ||PQ × u|| / ||u||  where u is line direction
 *   Skew lines:      d = |AC · (b × d)| / ||b × d||
 *   Parallel lines:  d = ||AC × b|| / ||b||
 *   Parallel planes: d = |d₁ - d₂| / ||n||
 */
import { AbstractArithmeticExpression } from '../AbstractArithmeticExpression.js';

export class Distance3DExpression extends AbstractArithmeticExpression {
    static NAME = 'distance3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.value = 0;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('distance3d() requires 2 arguments');
        }

        // Resolve all subexpressions
        for (const expr of this.subExpressions) {
            expr.resolve(context);
        }

        // Get the two objects
        const obj1 = this._getResolvedExpression(context, this.subExpressions[0]);
        const obj2 = this._getResolvedExpression(context, this.subExpressions[1]);

        const type1 = obj1.getGeometryType?.() || obj1.getName();
        const type2 = obj2.getGeometryType?.() || obj2.getName();

        // Dispatch to appropriate distance method based on type combination
        const types = [type1, type2].sort().join('+');

        switch (types) {
            case 'point3d+point3d':
                this._distancePointPoint(obj1, obj2);
                break;
            case 'line3d+point3d':
                if (type1 === 'point3d') {
                    this._distancePointLine(obj1, obj2);
                } else {
                    this._distancePointLine(obj2, obj1);
                }
                break;
            case 'plane3d+point3d':
                if (type1 === 'point3d') {
                    this._distancePointPlane(obj1, obj2);
                } else {
                    this._distancePointPlane(obj2, obj1);
                }
                break;
            case 'line3d+line3d':
                this._distanceLineLine(obj1, obj2);
                break;
            case 'plane3d+plane3d':
                this._distancePlanePlane(obj1, obj2);
                break;
            case 'vector3d+point3d':
                // Treat vector as line for distance calculation
                if (type1 === 'point3d') {
                    this._distancePointVector(obj1, obj2);
                } else {
                    this._distancePointVector(obj2, obj1);
                }
                break;
            case 'vector3d+vector3d':
                // Treat vectors as lines for distance calculation
                this._distanceVectorVector(obj1, obj2);
                break;
            default:
                this.dispatchError(`distance3d() unsupported combination: ${type1} + ${type2}`);
        }
    }

    /**
     * Distance between two 3D points
     * d = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)
     */
    _distancePointPoint(point1Expr, point2Expr) {
        const p1 = point1Expr.getPoint();
        const p2 = point2Expr.getPoint();

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;

        this.value = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Perpendicular distance from point to line
     * d = ||PQ × u|| / ||u||
     * where P is point on line, Q is external point, u is line direction
     */
    _distancePointLine(pointExpr, lineExpr) {
        const Q = pointExpr.getPoint();
        const linePoints = lineExpr.getLinePoints();
        const P = linePoints[0];
        const lineEnd = linePoints[1];

        // Direction vector of line
        const u = {
            x: lineEnd.x - P.x,
            y: lineEnd.y - P.y,
            z: lineEnd.z - P.z
        };

        // Vector PQ
        const PQ = {
            x: Q.x - P.x,
            y: Q.y - P.y,
            z: Q.z - P.z
        };

        // Cross product PQ × u
        const cross = {
            x: PQ.y * u.z - PQ.z * u.y,
            y: PQ.z * u.x - PQ.x * u.z,
            z: PQ.x * u.y - PQ.y * u.x
        };

        const crossMag = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
        const uMag = Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z);

        if (uMag < 0.000001) {
            // Degenerate line (zero length)
            this.value = Math.sqrt(PQ.x * PQ.x + PQ.y * PQ.y + PQ.z * PQ.z);
            return;
        }

        this.value = crossMag / uMag;
    }

    /**
     * Perpendicular distance from point to plane
     * d = |u · n - p| / ||n||
     * where plane equation is r · n = p
     */
    _distancePointPlane(pointExpr, planeExpr) {
        const U = pointExpr.getPoint();
        const center = planeExpr.getCenter();
        const normal = planeExpr.getNormal();

        // Plane equation: r · n = p where p = center · n
        const p = center.x * normal.x + center.y * normal.y + center.z * normal.z;

        // u · n
        const uDotN = U.x * normal.x + U.y * normal.y + U.z * normal.z;

        // ||n||
        const normalMag = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);

        if (normalMag < 0.000001) {
            this.dispatchError('Plane has zero normal vector');
            return;
        }

        this.value = Math.abs(uDotN - p) / normalMag;
    }

    /**
     * Distance between two lines (handles parallel and skew lines)
     * Skew lines:     d = |AC · (b × d)| / ||b × d||
     * Parallel lines: d = ||AC × b|| / ||b||
     */
    _distanceLineLine(line1Expr, line2Expr) {
        const line1 = line1Expr.getLinePoints();
        const line2 = line2Expr.getLinePoints();

        const A = line1[0];  // Point on line 1
        const C = line2[0];  // Point on line 2

        // Direction vectors
        const b = {
            x: line1[1].x - A.x,
            y: line1[1].y - A.y,
            z: line1[1].z - A.z
        };
        const d = {
            x: line2[1].x - C.x,
            y: line2[1].y - C.y,
            z: line2[1].z - C.z
        };

        // Vector AC
        const AC = {
            x: C.x - A.x,
            y: C.y - A.y,
            z: C.z - A.z
        };

        // Cross product b × d
        const bCrossD = {
            x: b.y * d.z - b.z * d.y,
            y: b.z * d.x - b.x * d.z,
            z: b.x * d.y - b.y * d.x
        };

        const bCrossDMag = Math.sqrt(bCrossD.x * bCrossD.x + bCrossD.y * bCrossD.y + bCrossD.z * bCrossD.z);

        if (bCrossDMag < 0.000001) {
            // Lines are parallel (or one is degenerate)
            // Use perpendicular distance formula: d = ||AC × b|| / ||b||
            const ACCrossB = {
                x: AC.y * b.z - AC.z * b.y,
                y: AC.z * b.x - AC.x * b.z,
                z: AC.x * b.y - AC.y * b.x
            };
            const ACCrossBMag = Math.sqrt(ACCrossB.x * ACCrossB.x + ACCrossB.y * ACCrossB.y + ACCrossB.z * ACCrossB.z);
            const bMag = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);

            if (bMag < 0.000001) {
                // Degenerate case: both lines are points
                this.value = Math.sqrt(AC.x * AC.x + AC.y * AC.y + AC.z * AC.z);
                return;
            }

            this.value = ACCrossBMag / bMag;
        } else {
            // Skew lines: d = |AC · (b × d)| / ||b × d||
            const scalarTriple = AC.x * bCrossD.x + AC.y * bCrossD.y + AC.z * bCrossD.z;
            this.value = Math.abs(scalarTriple) / bCrossDMag;
        }
    }

    /**
     * Distance between two parallel planes
     * d = |d₁ - d₂| / ||n||
     * where plane equations are: n · r = d₁ and n · r = d₂
     */
    _distancePlanePlane(plane1Expr, plane2Expr) {
        const center1 = plane1Expr.getCenter();
        const normal1 = plane1Expr.getNormal();
        const center2 = plane2Expr.getCenter();
        const normal2 = plane2Expr.getNormal();

        // Check if planes are parallel (normals are proportional)
        // Cross product should be ~zero for parallel normals
        const cross = {
            x: normal1.y * normal2.z - normal1.z * normal2.y,
            y: normal1.z * normal2.x - normal1.x * normal2.z,
            z: normal1.x * normal2.y - normal1.y * normal2.x
        };
        const crossMag = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);

        const normal1Mag = Math.sqrt(normal1.x * normal1.x + normal1.y * normal1.y + normal1.z * normal1.z);
        const normal2Mag = Math.sqrt(normal2.x * normal2.x + normal2.y * normal2.y + normal2.z * normal2.z);

        if (crossMag > 0.001 * normal1Mag * normal2Mag) {
            // Planes are not parallel - they intersect
            this.value = 0;
            return;
        }

        // Planes are parallel
        // Normalize first normal for consistent calculation
        const n = {
            x: normal1.x / normal1Mag,
            y: normal1.y / normal1Mag,
            z: normal1.z / normal1Mag
        };

        // d values for each plane (distance from origin along normal)
        const d1 = center1.x * n.x + center1.y * n.y + center1.z * n.z;
        const d2 = center2.x * n.x + center2.y * n.y + center2.z * n.z;

        this.value = Math.abs(d1 - d2);
    }

    /**
     * Distance from point to vector (treated as line)
     */
    _distancePointVector(pointExpr, vectorExpr) {
        const Q = pointExpr.getPoint();
        const vectorPoints = vectorExpr.getVectorPoints();
        const P = vectorPoints[0];
        const vecEnd = vectorPoints[1];

        // Direction vector
        const u = {
            x: vecEnd.x - P.x,
            y: vecEnd.y - P.y,
            z: vecEnd.z - P.z
        };

        // Vector PQ
        const PQ = {
            x: Q.x - P.x,
            y: Q.y - P.y,
            z: Q.z - P.z
        };

        // Cross product PQ × u
        const cross = {
            x: PQ.y * u.z - PQ.z * u.y,
            y: PQ.z * u.x - PQ.x * u.z,
            z: PQ.x * u.y - PQ.y * u.x
        };

        const crossMag = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
        const uMag = Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z);

        if (uMag < 0.000001) {
            this.value = Math.sqrt(PQ.x * PQ.x + PQ.y * PQ.y + PQ.z * PQ.z);
            return;
        }

        this.value = crossMag / uMag;
    }

    /**
     * Distance between two vectors (treated as lines)
     */
    _distanceVectorVector(vec1Expr, vec2Expr) {
        const vec1Points = vec1Expr.getVectorPoints();
        const vec2Points = vec2Expr.getVectorPoints();

        const A = vec1Points[0];
        const C = vec2Points[0];

        const b = {
            x: vec1Points[1].x - A.x,
            y: vec1Points[1].y - A.y,
            z: vec1Points[1].z - A.z
        };
        const d = {
            x: vec2Points[1].x - C.x,
            y: vec2Points[1].y - C.y,
            z: vec2Points[1].z - C.z
        };

        const AC = {
            x: C.x - A.x,
            y: C.y - A.y,
            z: C.z - A.z
        };

        const bCrossD = {
            x: b.y * d.z - b.z * d.y,
            y: b.z * d.x - b.x * d.z,
            z: b.x * d.y - b.y * d.x
        };

        const bCrossDMag = Math.sqrt(bCrossD.x * bCrossD.x + bCrossD.y * bCrossD.y + bCrossD.z * bCrossD.z);

        if (bCrossDMag < 0.000001) {
            // Parallel vectors
            const ACCrossB = {
                x: AC.y * b.z - AC.z * b.y,
                y: AC.z * b.x - AC.x * b.z,
                z: AC.x * b.y - AC.y * b.x
            };
            const ACCrossBMag = Math.sqrt(ACCrossB.x * ACCrossB.x + ACCrossB.y * ACCrossB.y + ACCrossB.z * ACCrossB.z);
            const bMag = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);

            if (bMag < 0.000001) {
                this.value = Math.sqrt(AC.x * AC.x + AC.y * AC.y + AC.z * AC.z);
                return;
            }

            this.value = ACCrossBMag / bMag;
        } else {
            const scalarTriple = AC.x * bCrossD.x + AC.y * bCrossD.y + AC.z * bCrossD.z;
            this.value = Math.abs(scalarTriple) / bCrossDMag;
        }
    }

    getName() {
        return Distance3DExpression.NAME;
    }

    getVariableAtomicValues() {
        return [this.value];
    }

    getValue() {
        return this.value;
    }

    getFriendlyToStr() {
        return `distance3d(${this.value.toFixed(4)})`;
    }

    // distance3d doesn't create a visual command - it's just a numeric value
    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
