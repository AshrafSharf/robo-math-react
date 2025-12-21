/**
 * Scale expression - scales a shape around a center point
 *
 * Syntax:
 *   scale(graph, shape, factor)              - scale around origin (0, 0)
 *   scale(graph, shape, factor, cx, cy)      - scale around point (cx, cy)
 *   scale(graph, shape, factor, centerPoint) - scale around a point expression
 *
 * Supported shapes: point, line, vec, circle, polygon
 *
 * The scaled shape is a NEW shape with correct model coordinates.
 * The original shape is unchanged.
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { ScaleCommand } from '../../commands/ScaleCommand.js';
import { TransformationUtil } from '../../../geom/TransformationUtil.js';
import { scale_error_messages } from '../core/ErrorMessages.js';
import { GEOMETRY_TYPES } from './IntersectExpression.js';

export class ScaleExpression extends AbstractArithmeticExpression {
    static NAME = 'scale';

    // Supported geometry types for scaling
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
        this.scaledData = null;     // Computed scaled coordinates
        this.originalShapeName = null;  // 'point', 'line', 'vector', 'circle', 'polygon'
        this.originalShapeType = null;  // GEOMETRY_TYPES value
        this.originalShapeVariableName = null;  // Variable name for registry lookup (e.g., "P")
        this.scaleFactor = 1;       // Scale factor
        this.center = { x: 0, y: 0 }; // Scale center
        this.graphExpression = null;
    }

    resolve(context) {
        // Validate argument count: 3-5 args (graph, shape, factor, [center or cx, cy])
        if (this.subExpressions.length < 3 || this.subExpressions.length > 5) {
            this.dispatchError(scale_error_messages.WRONG_ARG_COUNT(this.subExpressions.length));
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(scale_error_messages.GRAPH_REQUIRED());
        }

        // Second arg: shape to scale
        this.subExpressions[1].resolve(context);
        const shapeExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        this.originalShapeType = this._getGeometryType(shapeExpr);
        this.originalShapeName = shapeExpr.getName();

        // Store the variable name for registry lookup (e.g., "P" from "scale(G, P, 2)")
        this.originalShapeVariableName = this._getVariableName(this.subExpressions[1]);

        if (!ScaleExpression.SUPPORTED_TYPES.has(this.originalShapeType)) {
            this.dispatchError(scale_error_messages.INVALID_SHAPE(shapeExpr.getName()));
        }

        // Third arg: scale factor
        this.subExpressions[2].resolve(context);
        const factorExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const factorValues = factorExpr.getVariableAtomicValues();
        if (factorValues.length !== 1) {
            this.dispatchError(scale_error_messages.FACTOR_NOT_NUMBER());
        }
        this.scaleFactor = factorValues[0];

        // Optional: center point (default origin)
        this.center = { x: 0, y: 0 };
        if (this.subExpressions.length >= 4) {
            const centerCoords = [];
            for (let i = 3; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);
                const centerExpr = this._getResolvedExpression(context, this.subExpressions[i]);
                const values = centerExpr.getVariableAtomicValues();
                centerCoords.push(...values);
            }
            if (centerCoords.length !== 2) {
                this.dispatchError(scale_error_messages.INVALID_CENTER());
            }
            this.center = { x: centerCoords[0], y: centerCoords[1] };
        }

        // Extract original data and compute scaling based on shape type
        this._extractAndScale(shapeExpr);
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
     * Works with VariableReferenceExpression or any expression with variableName
     */
    _getVariableName(expr) {
        // Check if expression has variableName property directly
        if (expr.variableName) {
            return expr.variableName;
        }
        // Check if expression has getVariableName method
        if (typeof expr.getVariableName === 'function') {
            return expr.getVariableName();
        }
        return null;
    }

    /**
     * Extract original coordinates and compute scaled coordinates
     */
    _extractAndScale(shapeExpr) {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                this._scalePoint(shapeExpr);
                break;
            case GEOMETRY_TYPES.LINE:
                this._scaleLine(shapeExpr);
                break;
            case GEOMETRY_TYPES.CIRCLE:
                this._scaleCircle(shapeExpr);
                break;
            case GEOMETRY_TYPES.POLYGON:
                this._scalePolygon(shapeExpr);
                break;
        }
    }

    /**
     * Scale a point
     */
    _scalePoint(expr) {
        const point = this._getPointCoords(expr);
        this.originalData = { point };
        this.scaledData = {
            point: TransformationUtil.scalePoint(point, this.scaleFactor, this.center)
        };
    }

    /**
     * Scale a line or vector (both endpoints)
     */
    _scaleLine(expr) {
        const linePoints = this._getLinePoints(expr);
        this.originalData = linePoints;
        this.scaledData = TransformationUtil.scaleLine(
            linePoints.start,
            linePoints.end,
            this.scaleFactor,
            this.center
        );
    }

    /**
     * Scale a circle (scale center position and radius)
     */
    _scaleCircle(expr) {
        const circleCenter = expr.getCenter();
        const radius = expr.getRadius();
        this.originalData = { center: circleCenter, radius };
        this.scaledData = TransformationUtil.scaleCircle(
            circleCenter,
            radius,
            this.scaleFactor,
            this.center
        );
    }

    /**
     * Scale a polygon (all vertices)
     */
    _scalePolygon(expr) {
        const vertices = expr.getVertices();
        this.originalData = { vertices };
        this.scaledData = {
            vertices: TransformationUtil.scalePolygon(vertices, this.scaleFactor, this.center)
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

    getName() {
        return ScaleExpression.NAME;
    }

    /**
     * Return the geometry type of the scaled shape
     */
    getGeometryType() {
        return this.originalShapeType;
    }

    /**
     * Get the scaled point (for point shapes)
     */
    getPoint() {
        if (this.originalShapeType === GEOMETRY_TYPES.POINT) {
            return this.scaledData.point;
        }
        return null;
    }

    /**
     * Get line points (for line/vec shapes)
     */
    getLinePoints() {
        if (this.originalShapeType === GEOMETRY_TYPES.LINE) {
            return [this.scaledData.start, this.scaledData.end];
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
            return this.scaledData.center;
        }
        return null;
    }

    /**
     * Get radius (for circle shapes)
     */
    getRadius() {
        if (this.originalShapeType === GEOMETRY_TYPES.CIRCLE) {
            return this.scaledData.radius;
        }
        return null;
    }

    /**
     * Get vertices (for polygon shapes)
     */
    getVertices() {
        if (this.originalShapeType === GEOMETRY_TYPES.POLYGON) {
            return this.scaledData.vertices;
        }
        return null;
    }

    /**
     * Return atomic values based on shape type
     */
    getVariableAtomicValues() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.scaledData.point.x, this.scaledData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [
                    this.scaledData.start.x, this.scaledData.start.y,
                    this.scaledData.end.x, this.scaledData.end.y
                ];
            case GEOMETRY_TYPES.CIRCLE:
                return [
                    this.scaledData.center.x, this.scaledData.center.y,
                    this.scaledData.radius
                ];
            case GEOMETRY_TYPES.POLYGON:
                return this.scaledData.vertices.flatMap(v => [v.x, v.y]);
            default:
                return [];
        }
    }

    getStartValue() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.scaledData.point.x, this.scaledData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [this.scaledData.start.x, this.scaledData.start.y];
            case GEOMETRY_TYPES.CIRCLE:
                return [this.scaledData.center.x, this.scaledData.center.y];
            case GEOMETRY_TYPES.POLYGON:
                const v = this.scaledData.vertices[0];
                return [v.x, v.y];
            default:
                return [0, 0];
        }
    }

    getEndValue() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.scaledData.point.x, this.scaledData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [this.scaledData.end.x, this.scaledData.end.y];
            case GEOMETRY_TYPES.CIRCLE:
                return [this.scaledData.center.x, this.scaledData.center.y];
            case GEOMETRY_TYPES.POLYGON:
                const verts = this.scaledData.vertices;
                const last = verts[verts.length - 1];
                return [last.x, last.y];
            default:
                return [0, 0];
        }
    }

    getFriendlyToStr() {
        return `Scale[${this.originalShapeName}, ${this.scaleFactor}x, center(${this.center.x}, ${this.center.y})]`;
    }

    /**
     * Create command for the scaled shape
     */
    toCommand(options = {}) {
        return new ScaleCommand(
            this.graphExpression,
            this.originalShapeVariableName,  // Variable name for registry lookup
            this.scaledData,
            this.originalShapeName,
            this.originalShapeType,
            this.scaleFactor,
            this.center,
            options
        );
    }

    /**
     * Can play if we have valid scaled data
     */
    canPlay() {
        return this.scaledData !== null;
    }
}
