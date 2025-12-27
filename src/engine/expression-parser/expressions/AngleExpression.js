/**
 * Angle (Interior Angle) expression - creates an interior angle
 *
 * Syntax:
 *   angle(graph, vertex, point1, point2)          - graph with points
 *   angle(graph, vertex, point1, point2, radius)  - graph with custom radius
 *   angle(graph, vx, vy, p1x, p1y, p2x, p2y)      - graph with raw coordinates
 *
 * Collects 6 coordinates (vertex + point1 + point2) + optional radius
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { AngleCommand } from '../../commands/AngleCommand.js';
import { angle_error_messages } from '../core/ErrorMessages.js';
import { AngleUtil } from '../../../geom/AngleUtil.js';

export class AngleExpression extends AbstractNonArithmeticExpression {
    static NAME = 'angle';
    static ANGLE_TYPE = 'interior';
    static RIGHT_ANGLE_TOLERANCE = 0.5; // degrees tolerance for detecting right angles

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [vx, vy, p1x, p1y, p2x, p2y]
        this.radius = 0.8;
        this.graphExpression = null;
        this.angleValue = null; // Calculated angle in degrees
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(angle_error_messages.MISSING_ARGS(AngleExpression.NAME));
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(angle_error_messages.GRAPH_REQUIRED(AngleExpression.NAME));
        }

        // Collect all atomic values from remaining subexpressions, separating styling
        const allCoords = [];
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this.subExpressions[i];

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                const atomicValues = expr.getVariableAtomicValues();
                for (let j = 0; j < atomicValues.length; j++) {
                    allCoords.push(atomicValues[j]);
                }
            }
        }

        // Handle different input formats:
        // 6 coords = vertex(2) + point1(2) + point2(2)
        // 7 coords = vertex(2) + point1(2) + point2(2) + radius
        // 8 coords = line1(4) + line2(4) -> compute intersection as vertex
        // 9 coords = line1(4) + line2(4) + radius
        if (allCoords.length === 8 || allCoords.length === 9) {
            // Two lines input - compute angle from intersection
            const line1 = {
                start: { x: allCoords[0], y: allCoords[1] },
                end: { x: allCoords[2], y: allCoords[3] }
            };
            const line2 = {
                start: { x: allCoords[4], y: allCoords[5] },
                end: { x: allCoords[6], y: allCoords[7] }
            };

            const angleData = AngleUtil.fromTwoLines(line1, line2);
            if (!angleData) {
                this.dispatchError(`${AngleExpression.NAME}(): lines are parallel.\nNo intersection found.`);
            }

            this.coordinates = [
                angleData.vertex.x, angleData.vertex.y,
                angleData.point1.x, angleData.point1.y,
                angleData.point2.x, angleData.point2.y
            ];

            if (allCoords.length === 9) {
                this.radius = allCoords[8];
                if (this.radius <= 0) this.radius = 0.8;
            }
        } else if (allCoords.length === 6 || allCoords.length === 7) {
            // Standard vertex + point1 + point2 format
            this.coordinates = allCoords.slice(0, 6);

            if (allCoords.length === 7) {
                this.radius = allCoords[6];
                if (this.radius <= 0) this.radius = 0.8;
            }
        } else {
            this.dispatchError(angle_error_messages.WRONG_COORD_COUNT(AngleExpression.NAME, allCoords.length));
        }

        // Calculate angle value
        this._calculateAngleValue();

        this._parseStyleExpressions(styleExprs);
    }

    /**
     * Calculate angle value from vertex, point1, point2
     */
    _calculateAngleValue() {
        const vertex = this.getVertex();
        const point1 = this.getPoint1();
        const point2 = this.getPoint2();

        // Vectors from vertex to points
        const v1 = { x: point1.x - vertex.x, y: point1.y - vertex.y };
        const v2 = { x: point2.x - vertex.x, y: point2.y - vertex.y };

        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

        if (mag1 < 0.000001 || mag2 < 0.000001) {
            this.angleValue = 0;
            return;
        }

        let cosTheta = dot / (mag1 * mag2);
        cosTheta = Math.max(-1, Math.min(1, cosTheta));
        this.angleValue = Math.acos(cosTheta) * (180 / Math.PI);
    }

    /**
     * Check if this angle is a right angle (90°)
     * @returns {boolean}
     */
    isRightAngle() {
        if (this.angleValue === null) return false;
        return Math.abs(this.angleValue - 90) < AngleExpression.RIGHT_ANGLE_TOLERANCE;
    }

    // getGrapher() inherited from AbstractNonArithmeticExpression

    getName() {
        return AngleExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'angle'
     */
    getGeometryType() {
        return 'angle';
    }

    getVariableAtomicValues() {
        return this.coordinates.slice(0, 6);
    }

    getVertex() {
        return { x: this.coordinates[0], y: this.coordinates[1] };
    }

    getPoint1() {
        return { x: this.coordinates[2], y: this.coordinates[3] };
    }

    getPoint2() {
        return { x: this.coordinates[4], y: this.coordinates[5] };
    }

    getRadius() {
        return this.radius;
    }

    getAngleType() {
        return AngleExpression.ANGLE_TYPE;
    }

    getFriendlyToStr() {
        const v = this.getVertex();
        const p1 = this.getPoint1();
        const p2 = this.getPoint2();
        return `Angle[vertex(${v.x}, ${v.y}), p1(${p1.x}, ${p1.y}), p2(${p2.x}, ${p2.y})]`;
    }

    toCommand(options = {}) {
        // Automatically use 'right' angle type if angle is ~90°
        const angleType = this.isRightAngle() ? 'right' : this.getAngleType();
        const mergedOptions = { ...options, ...this.getStyleOptions(), radius: this.radius };

        return new AngleCommand(
            this.graphExpression,
            this.getVertex(),
            this.getPoint1(),
            this.getPoint2(),
            angleType,
            mergedOptions
        );
    }

    canPlay() {
        return true;
    }
}
