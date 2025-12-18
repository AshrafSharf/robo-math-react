/**
 * Angle3D expression - creates a 3D interior angle arc
 *
 * angle3d = interior (angle arc between two rays from a vertex in 3D space)
 *
 * Syntax:
 *   angle3d(graph, vertex, point1, point2)              - using 3 points
 *   angle3d(graph, vertex, point1, point2, radius)      - with custom radius
 *   angle3d(graph, vector1, vector2)                    - angle between two vectors
 *   angle3d(graph, vector1, vector2, radius)            - with custom radius
 *   angle3d(graph, line1, line2)                        - angle between two lines
 *   angle3d(graph, line1, line2, radius)                - with custom radius
 *
 * Collects 9 coordinates (vertex + point1 + point2) + optional radius
 * Or 12 coordinates (vector1 + vector2 OR line1 + line2) + optional radius
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Angle3DCommand } from '../../../commands/3d/Angle3DCommand.js';
import { angle3d_error_messages } from '../../core/ErrorMessages.js';

export class Angle3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'angle3d';
    static ANGLE_TYPE = 'interior';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vertex = null;     // {x, y, z}
        this.point1 = null;     // {x, y, z}
        this.point2 = null;     // {x, y, z}
        this.radius = 0.8;
        this.graphExpression = null;
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

        // Collect all atomic values from remaining subexpressions
        const allCoords = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const atomicValues = this.subExpressions[i].getVariableAtomicValues();
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
            // For vectors: use start point of first vector as vertex
            // Vectors/lines are (x1, y1, z1, x2, y2, z2) each
            const v1Start = { x: allCoords[0], y: allCoords[1], z: allCoords[2] };
            const v1End = { x: allCoords[3], y: allCoords[4], z: allCoords[5] };
            const v2Start = { x: allCoords[6], y: allCoords[7], z: allCoords[8] };
            const v2End = { x: allCoords[9], y: allCoords[10], z: allCoords[11] };

            // Check if vectors share a common start point (both start at same point)
            const shareStart = Math.abs(v1Start.x - v2Start.x) < 0.0001 &&
                              Math.abs(v1Start.y - v2Start.y) < 0.0001 &&
                              Math.abs(v1Start.z - v2Start.z) < 0.0001;

            if (shareStart) {
                // Vectors share start point - use as vertex
                this.vertex = v1Start;
                this.point1 = v1End;
                this.point2 = v2End;
            } else {
                // Treat as lines - find intersection or use first vector's start as vertex
                // For simplicity, use first point of first shape as vertex
                this.vertex = v1Start;
                this.point1 = v1End;
                this.point2 = v2End;
            }

            if (allCoords.length === 13) {
                this.radius = allCoords[12];
                if (this.radius <= 0) this.radius = 0.8;
            }
        } else if (allCoords.length === 9 || allCoords.length === 10) {
            // Standard vertex + point1 + point2 format
            this.vertex = { x: allCoords[0], y: allCoords[1], z: allCoords[2] };
            this.point1 = { x: allCoords[3], y: allCoords[4], z: allCoords[5] };
            this.point2 = { x: allCoords[6], y: allCoords[7], z: allCoords[8] };

            if (allCoords.length === 10) {
                this.radius = allCoords[9];
                if (this.radius <= 0) this.radius = 0.8;
            }
        } else {
            this.dispatchError(angle3d_error_messages.WRONG_COORD_COUNT(Angle3DExpression.NAME, allCoords.length));
        }
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
        return [
            this.vertex.x, this.vertex.y, this.vertex.z,
            this.point1.x, this.point1.y, this.point1.z,
            this.point2.x, this.point2.y, this.point2.z
        ];
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

    getFriendlyToStr() {
        const v = this.vertex;
        const p1 = this.point1;
        const p2 = this.point2;
        return `Angle3D[vertex(${v.x}, ${v.y}, ${v.z}), p1(${p1.x}, ${p1.y}, ${p1.z}), p2(${p2.x}, ${p2.y}, ${p2.z})]`;
    }

    toCommand(options = {}) {
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
        return true;
    }
}
