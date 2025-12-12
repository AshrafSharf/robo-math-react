/**
 * Rotate expression - rotates a shape around a center point
 *
 * Syntax:
 *   rotate(graph, shape, angle)              - rotate around origin (0, 0)
 *   rotate(graph, shape, angle, cx, cy)      - rotate around point (cx, cy)
 *   rotate(graph, shape, angle, centerPoint) - rotate around a point expression
 *
 * Supported shapes: point, line, vec, circle, polygon
 *
 * The rotated shape is a NEW shape with correct model coordinates.
 * The original shape is unchanged.
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { RotateCommand } from '../../commands/RotateCommand.js';
import { TransformationUtil } from '../../../geom/TransformationUtil.js';
import { rotate_error_messages } from '../core/ErrorMessages.js';
import { GEOMETRY_TYPES } from './IntersectExpression.js';

export class RotateExpression extends AbstractArithmeticExpression {
    static NAME = 'rotate';

    // Supported geometry types for rotation
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
        this.rotatedData = null;    // Computed rotated coordinates
        this.originalShapeName = null;  // 'point', 'line', 'vec', 'circle', 'polygon'
        this.originalShapeType = null;  // GEOMETRY_TYPES value
        this.originalShapeVariableName = null;  // Variable name for registry lookup (e.g., "P")
        this.angle = 0;             // Rotation angle in degrees
        this.center = { x: 0, y: 0 }; // Rotation center
        this.graphExpression = null;
    }

    resolve(context) {
        // Validate argument count: 3-5 args (graph, shape, angle, [center or cx, cy])
        if (this.subExpressions.length < 3 || this.subExpressions.length > 5) {
            this.dispatchError(rotate_error_messages.WRONG_ARG_COUNT(this.subExpressions.length));
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(rotate_error_messages.GRAPH_REQUIRED());
        }

        // Second arg: shape to rotate
        this.subExpressions[1].resolve(context);
        const shapeExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        this.originalShapeType = this._getGeometryType(shapeExpr);
        this.originalShapeName = shapeExpr.getName();

        // Store the variable name for registry lookup (e.g., "P" from "rotate(G, P, 45)")
        this.originalShapeVariableName = this._getVariableName(this.subExpressions[1]);

        if (!RotateExpression.SUPPORTED_TYPES.has(this.originalShapeType)) {
            this.dispatchError(rotate_error_messages.INVALID_SHAPE(shapeExpr.getName()));
        }

        // Third arg: angle in degrees
        this.subExpressions[2].resolve(context);
        const angleExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const angleValues = angleExpr.getVariableAtomicValues();
        if (angleValues.length !== 1) {
            this.dispatchError(rotate_error_messages.ANGLE_NOT_NUMBER());
        }
        this.angle = angleValues[0];

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
                this.dispatchError(rotate_error_messages.INVALID_CENTER());
            }
            this.center = { x: centerCoords[0], y: centerCoords[1] };
        }

        // Extract original data and compute rotation based on shape type
        this._extractAndRotate(shapeExpr);
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
     * Extract original coordinates and compute rotated coordinates
     */
    _extractAndRotate(shapeExpr) {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                this._rotatePoint(shapeExpr);
                break;
            case GEOMETRY_TYPES.LINE:
                this._rotateLine(shapeExpr);
                break;
            case GEOMETRY_TYPES.CIRCLE:
                this._rotateCircle(shapeExpr);
                break;
            case GEOMETRY_TYPES.POLYGON:
                this._rotatePolygon(shapeExpr);
                break;
        }
    }

    /**
     * Rotate a point
     */
    _rotatePoint(expr) {
        const point = this._getPointCoords(expr);
        this.originalData = { point };
        this.rotatedData = {
            point: TransformationUtil.rotatePoint(point, this.angle, this.center)
        };
    }

    /**
     * Rotate a line or vector (both endpoints)
     */
    _rotateLine(expr) {
        const linePoints = this._getLinePoints(expr);
        this.originalData = linePoints;
        this.rotatedData = TransformationUtil.rotateLine(
            linePoints.start,
            linePoints.end,
            this.angle,
            this.center
        );
    }

    /**
     * Rotate a circle (rotate center, radius unchanged)
     */
    _rotateCircle(expr) {
        const circleCenter = expr.getCenter();
        const radius = expr.getRadius();
        this.originalData = { center: circleCenter, radius };
        this.rotatedData = TransformationUtil.rotateCircle(
            circleCenter,
            radius,
            this.angle,
            this.center
        );
    }

    /**
     * Rotate a polygon (all vertices)
     */
    _rotatePolygon(expr) {
        const vertices = expr.getVertices();
        this.originalData = { vertices };
        this.rotatedData = {
            vertices: TransformationUtil.rotatePolygon(vertices, this.angle, this.center)
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
        return RotateExpression.NAME;
    }

    /**
     * Return the geometry type of the rotated shape
     */
    getGeometryType() {
        return this.originalShapeType;
    }

    /**
     * Get the rotated point (for point shapes)
     */
    getPoint() {
        if (this.originalShapeType === GEOMETRY_TYPES.POINT) {
            return this.rotatedData.point;
        }
        return null;
    }

    /**
     * Get line points (for line/vec shapes)
     */
    getLinePoints() {
        if (this.originalShapeType === GEOMETRY_TYPES.LINE) {
            return [this.rotatedData.start, this.rotatedData.end];
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
            return this.rotatedData.center;
        }
        return null;
    }

    /**
     * Get radius (for circle shapes)
     */
    getRadius() {
        if (this.originalShapeType === GEOMETRY_TYPES.CIRCLE) {
            return this.rotatedData.radius;
        }
        return null;
    }

    /**
     * Get vertices (for polygon shapes)
     */
    getVertices() {
        if (this.originalShapeType === GEOMETRY_TYPES.POLYGON) {
            return this.rotatedData.vertices;
        }
        return null;
    }

    /**
     * Return atomic values based on shape type
     */
    getVariableAtomicValues() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.rotatedData.point.x, this.rotatedData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [
                    this.rotatedData.start.x, this.rotatedData.start.y,
                    this.rotatedData.end.x, this.rotatedData.end.y
                ];
            case GEOMETRY_TYPES.CIRCLE:
                return [
                    this.rotatedData.center.x, this.rotatedData.center.y,
                    this.rotatedData.radius
                ];
            case GEOMETRY_TYPES.POLYGON:
                return this.rotatedData.vertices.flatMap(v => [v.x, v.y]);
            default:
                return [];
        }
    }

    getStartValue() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.rotatedData.point.x, this.rotatedData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [this.rotatedData.start.x, this.rotatedData.start.y];
            case GEOMETRY_TYPES.CIRCLE:
                return [this.rotatedData.center.x, this.rotatedData.center.y];
            case GEOMETRY_TYPES.POLYGON:
                const v = this.rotatedData.vertices[0];
                return [v.x, v.y];
            default:
                return [0, 0];
        }
    }

    getEndValue() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.rotatedData.point.x, this.rotatedData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [this.rotatedData.end.x, this.rotatedData.end.y];
            case GEOMETRY_TYPES.CIRCLE:
                return [this.rotatedData.center.x, this.rotatedData.center.y];
            case GEOMETRY_TYPES.POLYGON:
                const verts = this.rotatedData.vertices;
                const last = verts[verts.length - 1];
                return [last.x, last.y];
            default:
                return [0, 0];
        }
    }

    getFriendlyToStr() {
        return `Rotate[${this.originalShapeName}, ${this.angle}°, center(${this.center.x}, ${this.center.y})]`;
    }

    /**
     * Create command for the rotated shape
     */
    toCommand(options = {}) {
        return new RotateCommand(
            this.graphExpression,
            this.originalShapeVariableName,  // Variable name for registry lookup
            this.rotatedData,
            this.originalShapeName,
            this.originalShapeType,
            this.angle,
            this.center,
            options
        );
    }

    /**
     * Can play if we have valid rotated data
     */
    canPlay() {
        return this.rotatedData !== null;
    }
}
