/**
 * Angle3D expression - creates a 3D interior angle arc or calculates angle between objects
 *
 * angle3d = interior (angle arc between two rays from a vertex in 3D space)
 *
 * Syntax:
 *   angle3d(graph, vertex, point1, point2)              - using 3 points (draws arc)
 *   angle3d(graph, vertex, point1, point2, radius)      - with custom radius
 *   angle3d(graph, vector1, vector2)                    - angle between two vectors (draws arc)
 *   angle3d(graph, vector1, vector2, radius)            - with custom radius
 *   angle3d(graph, line1, line2)                        - angle between two lines (draws arc)
 *   angle3d(graph, line1, line2, radius)                - with custom radius
 *   angle3d(graph, plane1, plane2)                      - angle between two planes (returns degrees)
 *   angle3d(graph, line, plane)                         - angle between line and plane (returns degrees)
 *
 * Returns angle value in degrees. Can be used in arithmetic expressions.
 * For visual angles (arcs), also creates visual arc via toCommand().
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Angle3DCommand } from '../../../commands/3d/Angle3DCommand.js';
import { RightAngle3DCommand } from '../../../commands/3d/RightAngle3DCommand.js';
import { angle3d_error_messages } from '../../core/ErrorMessages.js';

export class Angle3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'angle3d';
    static ANGLE_TYPE = 'interior';
    static RIGHT_ANGLE_TOLERANCE = 0.5; // degrees tolerance for detecting right angles

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vertex = null;     // {x, y, z}
        this.point1 = null;     // {x, y, z}
        this.point2 = null;     // {x, y, z}
        this.radius = 0.8;
        this.graphExpression = null;
        this.angleValue = null; // Calculated angle in degrees
        this.mode = 'visual';   // 'visual' (draws arc) or 'value' (just returns angle value)
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(angle3d_error_messages.MISSING_ARGS(Angle3DExpression.NAME));
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(angle3d_error_messages.GRAPH_REQUIRED(Angle3DExpression.NAME));
        }

        // Resolve remaining arguments and detect types, separating styling
        const args = [];
        const styleExprs = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this._getResolvedExpression(context, this.subExpressions[i]);
            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                args.push(expr);
            }
        }
        this._parseStyleExpressions(styleExprs);

        // Detect types of first two arguments
        const type1 = args[0].getGeometryType?.() || args[0].getName();
        const type2 = args.length >= 2 ? (args[1].getGeometryType?.() || args[1].getName()) : null;

        // Check for plane-plane or line-plane combinations
        if (type1 === 'plane3d' && type2 === 'plane3d') {
            this._resolveAngleBetweenPlanes(args[0], args[1]);
            return;
        }

        if ((type1 === 'plane3d' && (type2 === 'line3d' || type2 === 'vector3d')) ||
            (type2 === 'plane3d' && (type1 === 'line3d' || type1 === 'vector3d'))) {
            const planeArg = type1 === 'plane3d' ? args[0] : args[1];
            const lineArg = type1 === 'plane3d' ? args[1] : args[0];
            this._resolveAngleLinePlane(lineArg, planeArg);
            return;
        }

        // Fall back to original coordinate-based resolution for visual angles
        this._resolveVisualAngle(args);
    }

    /**
     * Resolve angle between two planes (using their normals)
     * θ = arccos(|n₁ · n₂| / (||n₁|| ||n₂||))
     */
    _resolveAngleBetweenPlanes(plane1Expr, plane2Expr) {
        this.mode = 'value';

        const n1 = plane1Expr.getNormal();
        const n2 = plane2Expr.getNormal();

        // Dot product
        const dotProduct = n1.x * n2.x + n1.y * n2.y + n1.z * n2.z;

        // Magnitudes
        const mag1 = Math.sqrt(n1.x * n1.x + n1.y * n1.y + n1.z * n1.z);
        const mag2 = Math.sqrt(n2.x * n2.x + n2.y * n2.y + n2.z * n2.z);

        if (mag1 < 0.000001 || mag2 < 0.000001) {
            this.dispatchError('Plane has zero normal vector');
            return;
        }

        // cos(θ) = |n1 · n2| / (||n1|| ||n2||)
        // Use absolute value because angle between planes is always acute or right
        let cosTheta = Math.abs(dotProduct) / (mag1 * mag2);
        // Clamp to [-1, 1] to handle floating point errors
        cosTheta = Math.max(-1, Math.min(1, cosTheta));

        // Convert to degrees
        this.angleValue = Math.acos(cosTheta) * (180 / Math.PI);

        // For visual representation, create points based on normals
        // Use center of first plane as vertex
        const center1 = plane1Expr.getCenter();
        this.vertex = center1;
        this.point1 = {
            x: center1.x + n1.x / mag1,
            y: center1.y + n1.y / mag1,
            z: center1.z + n1.z / mag1
        };
        this.point2 = {
            x: center1.x + n2.x / mag2,
            y: center1.y + n2.y / mag2,
            z: center1.z + n2.z / mag2
        };
    }

    /**
     * Resolve angle between line and plane
     * θ = arcsin(|b · n| / (||b|| ||n||))
     * where b is line direction and n is plane normal
     */
    _resolveAngleLinePlane(lineExpr, planeExpr) {
        this.mode = 'value';

        // Get line direction vector
        let b;
        if (lineExpr.asVector) {
            b = lineExpr.asVector();
        } else {
            const coords = lineExpr.getVariableAtomicValues();
            b = {
                x: coords[3] - coords[0],
                y: coords[4] - coords[1],
                z: coords[5] - coords[2]
            };
        }

        const n = planeExpr.getNormal();

        // Dot product
        const dotProduct = b.x * n.x + b.y * n.y + b.z * n.z;

        // Magnitudes
        const magB = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
        const magN = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);

        if (magB < 0.000001 || magN < 0.000001) {
            this.dispatchError('Line or plane has zero direction/normal');
            return;
        }

        // sin(θ) = |b · n| / (||b|| ||n||)
        let sinTheta = Math.abs(dotProduct) / (magB * magN);
        // Clamp to [-1, 1]
        sinTheta = Math.max(-1, Math.min(1, sinTheta));

        // Convert to degrees
        this.angleValue = Math.asin(sinTheta) * (180 / Math.PI);

        // For visual representation
        const center = planeExpr.getCenter();
        this.vertex = center;
        // Point along line direction
        this.point1 = {
            x: center.x + b.x / magB,
            y: center.y + b.y / magB,
            z: center.z + b.z / magB
        };
        // Point along plane normal
        this.point2 = {
            x: center.x + n.x / magN,
            y: center.y + n.y / magN,
            z: center.z + n.z / magN
        };
    }

    /**
     * Original visual angle resolution (for points, vectors, lines)
     */
    _resolveVisualAngle(args) {
        this.mode = 'visual';

        // Collect all atomic values from arguments
        const allCoords = [];
        for (const arg of args) {
            const atomicValues = arg.getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                allCoords.push(atomicValues[j]);
            }
        }

        // Handle different input formats:
        // 9 coords = vertex(3) + point1(3) + point2(3)
        // 10 coords = vertex(3) + point1(3) + point2(3) + radius
        // 12 coords = vector1(6) + vector2(6) OR line1(6) + line2(6)
        // 13 coords = above + radius
        if (allCoords.length === 12 || allCoords.length === 13) {
            // Two vectors or two lines input
            const v1Start = { x: allCoords[0], y: allCoords[1], z: allCoords[2] };
            const v1End = { x: allCoords[3], y: allCoords[4], z: allCoords[5] };
            const v2Start = { x: allCoords[6], y: allCoords[7], z: allCoords[8] };
            const v2End = { x: allCoords[9], y: allCoords[10], z: allCoords[11] };

            // Check if vectors share a common start point
            const shareStart = Math.abs(v1Start.x - v2Start.x) < 0.0001 &&
                              Math.abs(v1Start.y - v2Start.y) < 0.0001 &&
                              Math.abs(v1Start.z - v2Start.z) < 0.0001;

            if (shareStart) {
                this.vertex = v1Start;
                this.point1 = v1End;
                this.point2 = v2End;
            } else {
                this.vertex = v1Start;
                this.point1 = v1End;
                this.point2 = v2End;
            }

            if (allCoords.length === 13) {
                this.radius = allCoords[12];
                if (this.radius <= 0) this.radius = 0.8;
            }
            // else keep default radius = 0.8 for vectors/lines
        } else if (allCoords.length === 9 || allCoords.length === 10) {
            // Standard vertex + point1 + point2 format
            this.vertex = { x: allCoords[0], y: allCoords[1], z: allCoords[2] };
            this.point1 = { x: allCoords[3], y: allCoords[4], z: allCoords[5] };
            this.point2 = { x: allCoords[6], y: allCoords[7], z: allCoords[8] };

            if (allCoords.length === 10) {
                this.radius = allCoords[9];
                if (this.radius <= 0) this.radius = 0.8;
            } else {
                // Compute radius from minimum distance to points
                const d1 = Math.sqrt(
                    (this.point1.x - this.vertex.x) ** 2 +
                    (this.point1.y - this.vertex.y) ** 2 +
                    (this.point1.z - this.vertex.z) ** 2
                );
                const d2 = Math.sqrt(
                    (this.point2.x - this.vertex.x) ** 2 +
                    (this.point2.y - this.vertex.y) ** 2 +
                    (this.point2.z - this.vertex.z) ** 2
                );
                this.radius = Math.min(d1, d2);
            }
        } else {
            this.dispatchError(angle3d_error_messages.WRONG_COORD_COUNT(Angle3DExpression.NAME, allCoords.length));
        }

        // Calculate angle value for visual angles too
        this._calculateAngleValue();
    }

    /**
     * Calculate angle value from vertex, point1, point2
     */
    _calculateAngleValue() {
        if (!this.vertex || !this.point1 || !this.point2) return;

        // Vectors from vertex to points
        const v1 = {
            x: this.point1.x - this.vertex.x,
            y: this.point1.y - this.vertex.y,
            z: this.point1.z - this.vertex.z
        };
        const v2 = {
            x: this.point2.x - this.vertex.x,
            y: this.point2.y - this.vertex.y,
            z: this.point2.z - this.vertex.z
        };

        const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

        if (mag1 < 0.000001 || mag2 < 0.000001) {
            this.angleValue = 0;
            return;
        }

        let cosTheta = dot / (mag1 * mag2);
        cosTheta = Math.max(-1, Math.min(1, cosTheta));
        this.angleValue = Math.acos(cosTheta) * (180 / Math.PI);
    }

    getName() {
        return Angle3DExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'angle3d'
     */
    getGeometryType() {
        return 'angle3d';
    }

    getVariableAtomicValues() {
        // Return angle value in degrees as the primary atomic value
        // This allows angle3d to be used in arithmetic expressions
        if (this.angleValue !== null) {
            return [this.angleValue];
        }
        return [
            this.vertex.x, this.vertex.y, this.vertex.z,
            this.point1.x, this.point1.y, this.point1.z,
            this.point2.x, this.point2.y, this.point2.z
        ];
    }

    /**
     * Get the calculated angle value in degrees
     * @returns {number} Angle in degrees
     */
    getAngleValue() {
        return this.angleValue;
    }

    getVertex() {
        return this.vertex;
    }

    getPoint1() {
        return this.point1;
    }

    getPoint2() {
        return this.point2;
    }

    getRadius() {
        return this.radius;
    }

    getAngleType() {
        return Angle3DExpression.ANGLE_TYPE;
    }

    /**
     * Check if this angle is a right angle (90°)
     * @returns {boolean}
     */
    isRightAngle() {
        if (this.angleValue === null) return false;
        return Math.abs(this.angleValue - 90) < Angle3DExpression.RIGHT_ANGLE_TOLERANCE;
    }

    getFriendlyToStr() {
        if (this.angleValue !== null) {
            return `Angle3D[${this.angleValue.toFixed(2)}°]`;
        }
        const v = this.vertex;
        const p1 = this.point1;
        const p2 = this.point2;
        return `Angle3D[vertex(${v.x}, ${v.y}, ${v.z}), p1(${p1.x}, ${p1.y}, ${p1.z}), p2(${p2.x}, ${p2.y}, ${p2.z})]`;
    }

    toCommand(options = {}) {
        // For value-only modes (plane-plane, line-plane), don't create visual command
        if (this.mode === 'value') {
            return null;
        }

        // Automatically use RightAngle3DCommand if angle is ~90°
        if (this.isRightAngle()) {
            return new RightAngle3DCommand(
                this.graphExpression,
                this.vertex,
                this.point1,
                this.point2,
                { ...options, size: this.radius * 0.5 }
            );
        }

        return new Angle3DCommand(
            this.graphExpression,
            this.vertex,
            this.point1,
            this.point2,
            this.getAngleType(),
            { ...options, radius: this.radius }
        );
    }

    canPlay() {
        // Only visual mode can be played (animated)
        return this.mode === 'visual';
    }
}
