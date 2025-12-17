/**
 * Project expression - projects a point onto a line/vector
 *
 * Syntax:
 *   project(graph, line/vec, point)  - returns the projected point (foot of perpendicular)
 *
 * The projection finds the closest point on the infinite line to the given point.
 * This is also known as the "foot of the perpendicular".
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { ProjectCommand } from '../../commands/ProjectCommand.js';
import { LineUtil } from '../../../geom/LineUtil.js';
import { project_error_messages } from '../core/ErrorMessages.js';
import { GEOMETRY_TYPES } from './IntersectExpression.js';

export class ProjectExpression extends AbstractArithmeticExpression {
    static NAME = 'project';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.point = { x: NaN, y: NaN };
        this.originalPointData = null;  // Original point coordinates
        this.originalPointVariableName = null;  // Variable name for registry lookup
        this.linePoints = null;  // The line used for projection {start, end}
        this.graphExpression = null;
    }

    resolve(context) {
        // Validate argument count: exactly 3 args (graph, line/vec, point)
        if (this.subExpressions.length !== 3) {
            this.dispatchError(project_error_messages.WRONG_ARG_COUNT(this.subExpressions.length));
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(project_error_messages.GRAPH_REQUIRED());
        }

        // Resolve line and point expressions
        this.subExpressions[1].resolve(context);
        this.subExpressions[2].resolve(context);

        const lineExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const pointExpr = this._getResolvedExpression(context, this.subExpressions[2]);

        // Validate types
        const lineType = this._getGeometryType(lineExpr);
        const pointType = this._getGeometryType(pointExpr);

        if (lineType !== GEOMETRY_TYPES.LINE) {
            this.dispatchError(project_error_messages.FIRST_ARG_NOT_LINE(lineExpr.getName()));
        }

        if (pointType !== GEOMETRY_TYPES.POINT) {
            this.dispatchError(project_error_messages.SECOND_ARG_NOT_POINT(pointExpr.getName()));
        }

        // Get line points and point coordinates
        this.linePoints = this._getLinePoints(lineExpr);
        const pointCoords = this._getPointCoords(pointExpr);

        // Store original point data for animation
        this.originalPointData = { point: pointCoords };
        this.originalPointVariableName = this._getVariableName(this.subExpressions[2]);

        // Calculate projection using LineUtil
        const projected = LineUtil.projectPoint(
            pointCoords,
            this.linePoints.start,
            this.linePoints.end
        );

        this.point = { x: projected.x, y: projected.y };
    }

    /**
     * Get geometry type category for an expression
     */
    _getGeometryType(expr) {
        if (typeof expr.getGeometryType === 'function') {
            return expr.getGeometryType();
        }
        return null;
    }

    /**
     * Get variable name from expression (for registry lookup)
     */
    _getVariableName(expr) {
        if (expr.variableName) {
            return expr.variableName;
        }
        if (typeof expr.getVariableName === 'function') {
            return expr.getVariableName();
        }
        return null;
    }

    /**
     * Extract line points from line-like expression
     */
    _getLinePoints(expr) {
        if (typeof expr.getLinePoints === 'function') {
            const pts = expr.getLinePoints();
            return { start: pts[0], end: pts[1] };
        }
        if (typeof expr.getVectorPoints === 'function') {
            const pts = expr.getVectorPoints();
            return { start: pts[0], end: pts[1] };
        }
        // Fallback: use getVariableAtomicValues [x1, y1, x2, y2]
        const coords = expr.getVariableAtomicValues();
        return {
            start: { x: coords[0], y: coords[1] },
            end: { x: coords[2], y: coords[3] }
        };
    }

    /**
     * Extract point coordinates from point expression
     */
    _getPointCoords(expr) {
        if (typeof expr.getPoint === 'function') {
            return expr.getPoint();
        }
        const coords = expr.getVariableAtomicValues();
        return { x: coords[0], y: coords[1] };
    }

    getName() {
        return ProjectExpression.NAME;
    }

    getGeometryType() {
        return GEOMETRY_TYPES.POINT;
    }

    // getGrapher() inherited from AbstractArithmeticExpression

    getPoint() {
        return this.point;
    }

    getVariableAtomicValues() {
        return [this.point.x, this.point.y];
    }

    getStartValue() {
        return [this.point.x, this.point.y];
    }

    getEndValue() {
        return [this.point.x, this.point.y];
    }

    getFriendlyToStr() {
        return `Project(${this.point.x.toFixed(2)}, ${this.point.y.toFixed(2)})`;
    }

    /**
     * Create command - ProjectCommand with animation support
     */
    toCommand(options = {}) {
        return new ProjectCommand(
            this.graphExpression,
            this.originalPointVariableName,
            this.point,
            this.linePoints,
            options
        );
    }

    /**
     * Can always play if we have valid coordinates
     */
    canPlay() {
        return !isNaN(this.point.x) && !isNaN(this.point.y);
    }
}
