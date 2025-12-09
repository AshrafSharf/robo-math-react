/**
 * AngleX2 (Exterior Angle Second) expression - creates an exterior angle at second vector
 *
 * Syntax:
 *   anglex2(graph, vertex, point1, point2)          - using points
 *   anglex2(graph, vertex, point1, point2, radius)  - with custom radius
 *   anglex2(graph, vx, vy, p1x, p1y, p2x, p2y)      - using raw coordinates
 *   anglex2(graph, vx, vy, p1x, p1y, p2x, p2y, radius)
 *
 * Collects 6 coordinates (vertex + point1 + point2) + optional radius
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { AngleCommand } from '../../commands/AngleCommand.js';
import { angle_error_messages } from '../core/ErrorMessages.js';
import { AngleUtil } from '../../../geom/AngleUtil.js';

export class AngleX2Expression extends AbstractNonArithmeticExpression {
    static NAME = 'anglex2';
    static ANGLE_TYPE = 'exterior-second';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = [];
        this.radius = 0.8;
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(angle_error_messages.MISSING_ARGS(AngleX2Expression.NAME));
        }

        // First arg is graph reference
        this.subExpressions[0].resolve(context);
        this.graphExpression = this.subExpressions[0];

        // Collect all atomic values from remaining subexpressions
        const allCoords = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const atomicValues = this.subExpressions[i].getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                allCoords.push(atomicValues[j]);
            }
        }

        // Handle different input formats (6/7 = points, 8/9 = two lines)
        if (allCoords.length === 8 || allCoords.length === 9) {
            const line1 = { start: { x: allCoords[0], y: allCoords[1] }, end: { x: allCoords[2], y: allCoords[3] } };
            const line2 = { start: { x: allCoords[4], y: allCoords[5] }, end: { x: allCoords[6], y: allCoords[7] } };
            const angleData = AngleUtil.fromTwoLines(line1, line2);
            if (!angleData) this.dispatchError(`${AngleX2Expression.NAME}(): lines are parallel.`);
            this.coordinates = [angleData.vertex.x, angleData.vertex.y, angleData.point1.x, angleData.point1.y, angleData.point2.x, angleData.point2.y];
            if (allCoords.length === 9) { this.radius = allCoords[8]; if (this.radius <= 0) this.radius = 0.8; }
        } else if (allCoords.length === 6 || allCoords.length === 7) {
            this.coordinates = allCoords.slice(0, 6);
            if (allCoords.length === 7) { this.radius = allCoords[6]; if (this.radius <= 0) this.radius = 0.8; }
        } else {
            this.dispatchError(angle_error_messages.WRONG_COORD_COUNT(AngleX2Expression.NAME, allCoords.length));
        }
    }

    getGrapher() {
        if (this.graphExpression && typeof this.graphExpression.getGrapher === 'function') {
            return this.graphExpression.getGrapher();
        }
        return null;
    }

    getName() {
        return AngleX2Expression.NAME;
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
        return AngleX2Expression.ANGLE_TYPE;
    }

    getFriendlyToStr() {
        const v = this.getVertex();
        const p1 = this.getPoint1();
        const p2 = this.getPoint2();
        return `AngleX2[vertex(${v.x}, ${v.y}), p1(${p1.x}, ${p1.y}), p2(${p2.x}, ${p2.y})]`;
    }

    toCommand(options = {}) {
        return new AngleCommand(
            this.graphExpression,
            this.getVertex(),
            this.getPoint1(),
            this.getPoint2(),
            this.getAngleType(),
            { ...options, radius: this.radius }
        );
    }

    canPlay() {
        return true;
    }
}
