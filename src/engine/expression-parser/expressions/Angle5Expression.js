/**
 * Angle5 (Opposite/Vertical Angle) expression - creates an opposite angle
 *
 * angle5 = opposite/vertical (the angle directly across from the interior angle when two lines cross)
 *
 * Syntax:
 *   angle5(graph, vertex, point1, point2)          - using points
 *   angle5(graph, vertex, point1, point2, radius)  - with custom radius
 *   angle5(graph, line1, line2)                    - angle between two lines
 *   angle5(graph, line1, line2, radius)            - with custom radius
 *
 * Collects 6 coordinates (vertex + point1 + point2) + optional radius
 * Or 8 coordinates (line1 + line2) + optional radius
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { AngleCommand } from '../../commands/AngleCommand.js';
import { angle_error_messages } from '../core/ErrorMessages.js';
import { AngleUtil } from '../../../geom/AngleUtil.js';

export class Angle5Expression extends AbstractNonArithmeticExpression {
    static NAME = 'angle5';
    static ANGLE_TYPE = 'opposite';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = [];
        this.radius = 0.8;
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(angle_error_messages.MISSING_ARGS(Angle5Expression.NAME));
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(angle_error_messages.GRAPH_REQUIRED(Angle5Expression.NAME));
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

        this._parseStyleExpressions(styleExprs);

        if (allCoords.length === 8 || allCoords.length === 9) {
            const line1 = { start: { x: allCoords[0], y: allCoords[1] }, end: { x: allCoords[2], y: allCoords[3] } };
            const line2 = { start: { x: allCoords[4], y: allCoords[5] }, end: { x: allCoords[6], y: allCoords[7] } };
            const angleData = AngleUtil.fromTwoLines(line1, line2);
            if (!angleData) this.dispatchError(`${Angle5Expression.NAME}(): lines are parallel.`);
            this.coordinates = [angleData.vertex.x, angleData.vertex.y, angleData.point1.x, angleData.point1.y, angleData.point2.x, angleData.point2.y];
            if (allCoords.length === 9) { this.radius = allCoords[8]; if (this.radius <= 0) this.radius = 0.8; }
        } else if (allCoords.length === 6 || allCoords.length === 7) {
            this.coordinates = allCoords.slice(0, 6);
            if (allCoords.length === 7) { this.radius = allCoords[6]; if (this.radius <= 0) this.radius = 0.8; }
        } else {
            this.dispatchError(angle_error_messages.WRONG_COORD_COUNT(Angle5Expression.NAME, allCoords.length));
        }
    }


    // getGrapher() inherited from AbstractNonArithmeticExpression

    getName() {
        return Angle5Expression.NAME;
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
        return Angle5Expression.ANGLE_TYPE;
    }

    getFriendlyToStr() {
        const v = this.getVertex();
        const p1 = this.getPoint1();
        const p2 = this.getPoint2();
        return `Angle5[vertex(${v.x}, ${v.y}), p1(${p1.x}, ${p1.y}), p2(${p2.x}, ${p2.y})]`;
    }

    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions(), radius: this.radius };
        return new AngleCommand(
            this.graphExpression,
            this.getVertex(),
            this.getPoint1(),
            this.getPoint2(),
            this.getAngleType(),
            mergedOptions
        );
    }

    canPlay() {
        return true;
    }
}
