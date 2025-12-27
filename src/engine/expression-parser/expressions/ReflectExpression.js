/**
 * Reflect expression - reflects a shape across a line/vector
 *
 * Syntax:
 *   reflect(graph, line/vec, shape)  - returns the reflected shape
 *
 * Supported shapes: point, line, vec, circle, polygon
 *
 * The reflection creates a mirror image of the shape across the infinite line.
 * The reflected shape is equidistant from the line as the original,
 * but on the opposite side.
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { ReflectCommand } from '../../commands/ReflectCommand.js';
import { LineUtil } from '../../../geom/LineUtil.js';
import { reflect_error_messages } from '../core/ErrorMessages.js';
import { GEOMETRY_TYPES } from './IntersectExpression.js';

export class ReflectExpression extends AbstractArithmeticExpression {
    static NAME = 'reflect';

    // Supported geometry types for reflection
    static SUPPORTED_TYPES = new Set([
        GEOMETRY_TYPES.POINT,
        GEOMETRY_TYPES.LINE,
        GEOMETRY_TYPES.CIRCLE,
        GEOMETRY_TYPES.POLYGON
    ]);

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.originalData = null;   // Original shape coordinates
        this.reflectedData = null;  // Computed reflected coordinates
        this.originalShapeName = null;  // 'point', 'line', 'vector', 'circle', 'polygon'
        this.originalShapeType = null;  // GEOMETRY_TYPES value
        this.originalShapeVariableName = null;  // Variable name for registry lookup
        this.linePoints = null;     // The line used for reflection {start, end}
        this.graphExpression = null;
    }

    resolve(context) {
        // Validate argument count: exactly 3 args (graph, line/vec, shape)
        if (this.subExpressions.length !== 3) {
            this.dispatchError(reflect_error_messages.WRONG_ARG_COUNT(this.subExpressions.length));
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(reflect_error_messages.GRAPH_REQUIRED());
        }

        // Second arg: line/vector to reflect across
        this.subExpressions[1].resolve(context);
        const lineExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const lineType = this._getGeometryType(lineExpr);

        if (lineType !== GEOMETRY_TYPES.LINE) {
            this.dispatchError(reflect_error_messages.FIRST_ARG_NOT_LINE(lineExpr.getName()));
        }

        // Get line points for reflection
        this.linePoints = this._getLinePoints(lineExpr);

        // Third arg: shape to reflect
        this.subExpressions[2].resolve(context);
        const shapeExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        this.originalShapeType = this._getGeometryType(shapeExpr);
        this.originalShapeName = shapeExpr.getName();

        // Store the variable name for registry lookup
        this.originalShapeVariableName = this._getVariableName(this.subExpressions[2]);

        if (!ReflectExpression.SUPPORTED_TYPES.has(this.originalShapeType)) {
            this.dispatchError(reflect_error_messages.INVALID_SHAPE(shapeExpr.getName()));
        }

        // Extract original data and compute reflection based on shape type
        this._extractAndReflect(shapeExpr);
    }

    /**
     * Get geometry type from expression
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

    /**
     * Extract original coordinates and compute reflected coordinates
     */
    _extractAndReflect(shapeExpr) {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                this._reflectPoint(shapeExpr);
                break;
            case GEOMETRY_TYPES.LINE:
                this._reflectLine(shapeExpr);
                break;
            case GEOMETRY_TYPES.CIRCLE:
                this._reflectCircle(shapeExpr);
                break;
            case GEOMETRY_TYPES.POLYGON:
                this._reflectPolygon(shapeExpr);
                break;
        }
    }

    /**
     * Reflect a point
     */
    _reflectPoint(expr) {
        const point = this._getPointCoords(expr);
        this.originalData = { point };
        const reflected = LineUtil.reflectPoint(
            point,
            this.linePoints.start,
            this.linePoints.end
        );
        this.reflectedData = {
            point: { x: reflected.x, y: reflected.y }
        };
    }

    /**
     * Reflect a line or vector (both endpoints)
     */
    _reflectLine(expr) {
        const linePoints = this._getLinePoints(expr);
        this.originalData = linePoints;
        const reflectedStart = LineUtil.reflectPoint(
            linePoints.start,
            this.linePoints.start,
            this.linePoints.end
        );
        const reflectedEnd = LineUtil.reflectPoint(
            linePoints.end,
            this.linePoints.start,
            this.linePoints.end
        );
        this.reflectedData = {
            start: { x: reflectedStart.x, y: reflectedStart.y },
            end: { x: reflectedEnd.x, y: reflectedEnd.y }
        };
    }

    /**
     * Reflect a circle (reflect center, radius unchanged)
     */
    _reflectCircle(expr) {
        const circleCenter = expr.getCenter();
        const radius = expr.getRadius();
        this.originalData = { center: circleCenter, radius };
        const reflectedCenter = LineUtil.reflectPoint(
            circleCenter,
            this.linePoints.start,
            this.linePoints.end
        );
        this.reflectedData = {
            center: { x: reflectedCenter.x, y: reflectedCenter.y },
            radius
        };
    }

    /**
     * Reflect a polygon (all vertices)
     */
    _reflectPolygon(expr) {
        const vertices = expr.getVertices();
        this.originalData = { vertices };
        const reflectedVertices = vertices.map(v => {
            const reflected = LineUtil.reflectPoint(
                v,
                this.linePoints.start,
                this.linePoints.end
            );
            return { x: reflected.x, y: reflected.y };
        });
        this.reflectedData = { vertices: reflectedVertices };
    }

    getName() {
        return ReflectExpression.NAME;
    }

    /**
     * Return the geometry type of the reflected shape
     */
    getGeometryType() {
        return this.originalShapeType;
    }

    /**
     * Get the reflected point (for point shapes)
     */
    getPoint() {
        if (this.originalShapeType === GEOMETRY_TYPES.POINT) {
            return this.reflectedData.point;
        }
        return null;
    }

    /**
     * Get line points (for line/vec shapes)
     */
    getLinePoints() {
        if (this.originalShapeType === GEOMETRY_TYPES.LINE) {
            return [this.reflectedData.start, this.reflectedData.end];
        }
        return null;
    }

    /**
     * Get vector points (for vec shapes, same as line)
     */
    getVectorPoints() {
        return this.getLinePoints();
    }

    /**
     * Get center (for circle shapes)
     */
    getCenter() {
        if (this.originalShapeType === GEOMETRY_TYPES.CIRCLE) {
            return this.reflectedData.center;
        }
        return null;
    }

    /**
     * Get radius (for circle shapes)
     */
    getRadius() {
        if (this.originalShapeType === GEOMETRY_TYPES.CIRCLE) {
            return this.reflectedData.radius;
        }
        return null;
    }

    /**
     * Get vertices (for polygon shapes)
     */
    getVertices() {
        if (this.originalShapeType === GEOMETRY_TYPES.POLYGON) {
            return this.reflectedData.vertices;
        }
        return null;
    }

    /**
     * Return atomic values based on shape type
     */
    getVariableAtomicValues() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.reflectedData.point.x, this.reflectedData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [
                    this.reflectedData.start.x, this.reflectedData.start.y,
                    this.reflectedData.end.x, this.reflectedData.end.y
                ];
            case GEOMETRY_TYPES.CIRCLE:
                return [
                    this.reflectedData.center.x, this.reflectedData.center.y,
                    this.reflectedData.radius
                ];
            case GEOMETRY_TYPES.POLYGON:
                return this.reflectedData.vertices.flatMap(v => [v.x, v.y]);
            default:
                return [];
        }
    }

    getStartValue() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.reflectedData.point.x, this.reflectedData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [this.reflectedData.start.x, this.reflectedData.start.y];
            case GEOMETRY_TYPES.CIRCLE:
                return [this.reflectedData.center.x, this.reflectedData.center.y];
            case GEOMETRY_TYPES.POLYGON:
                const v = this.reflectedData.vertices[0];
                return [v.x, v.y];
            default:
                return [0, 0];
        }
    }

    getEndValue() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.reflectedData.point.x, this.reflectedData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [this.reflectedData.end.x, this.reflectedData.end.y];
            case GEOMETRY_TYPES.CIRCLE:
                return [this.reflectedData.center.x, this.reflectedData.center.y];
            case GEOMETRY_TYPES.POLYGON:
                const verts = this.reflectedData.vertices;
                const last = verts[verts.length - 1];
                return [last.x, last.y];
            default:
                return [0, 0];
        }
    }

    getFriendlyToStr() {
        return `Reflect[${this.originalShapeName}]`;
    }

    /**
     * Create command for the reflected shape
     */
    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        return new ReflectCommand(
            this.graphExpression,
            this.originalShapeVariableName,
            this.reflectedData,
            this.originalShapeName,
            this.originalShapeType,
            this.linePoints,
            mergedOptions
        );
    }

    /**
     * Can play if we have valid reflected data
     */
    canPlay() {
        return this.reflectedData !== null;
    }
}
