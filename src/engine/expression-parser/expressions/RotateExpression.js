/**
 * Rotate expression - rotates one or more shapes around a center point
 *
 * Syntax:
 *   rotate(graph, shape, angle)                    - rotate around origin (0, 0)
 *   rotate(graph, shape, angle, cx, cy)            - rotate around point (cx, cy)
 *   rotate(graph, shape, angle, centerPoint)       - rotate around a point expression
 *   rotate(graph, s1, s2, ..., angle)              - rotate multiple shapes (parallel animation)
 *   rotate(graph, s1, s2, ..., angle, cx, cy)      - rotate multiple shapes around point
 *   rotate(graph, s1, s2, ..., angle, centerPoint) - rotate multiple shapes around point
 *
 * Supported shapes: point, line, vec, circle, polygon
 *
 * The rotated shape(s) are NEW shapes with correct model coordinates.
 * The original shapes are unchanged.
 *
 * When rotating multiple shapes, returns a ShapeCollection.
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
        this.originalData = null;   // Original shape coordinates (single shape mode)
        this.rotatedData = null;    // Computed rotated coordinates (single shape mode)
        this.originalShapeName = null;  // 'point', 'line', 'vector', 'circle', 'polygon'
        this.originalShapeType = null;  // GEOMETRY_TYPES value
        this.originalShapeVariableName = null;  // Variable name for registry lookup (e.g., "P")
        this.angle = 0;             // Rotation angle in degrees
        this.center = { x: 0, y: 0 }; // Rotation center
        this.graphExpression = null;

        // Multi-shape mode
        this.isMultiShape = false;
        this.shapeDataArray = [];  // [{originalShapeVarName, rotatedData, originalShapeName, originalShapeType}, ...]
    }

    resolve(context) {
        // Validate argument count: at least 3 args (graph, shape, angle)
        if (this.subExpressions.length < 3) {
            this.dispatchError(rotate_error_messages.WRONG_ARG_COUNT(this.subExpressions.length));
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(rotate_error_messages.GRAPH_REQUIRED());
        }

        // Determine where angle and optional center are located
        // Strategy: resolve from end to find center (if any), then angle
        const { angleIndex, center } = this._findAngleAndCenter(context);
        this.center = center;

        // Get angle value
        this.subExpressions[angleIndex].resolve(context);
        const angleExpr = this._getResolvedExpression(context, this.subExpressions[angleIndex]);
        const angleValues = angleExpr.getVariableAtomicValues();
        if (angleValues.length !== 1) {
            this.dispatchError(rotate_error_messages.ANGLE_NOT_NUMBER());
        }
        this.angle = angleValues[0];

        // Shape args are from index 1 to angleIndex-1
        const shapeCount = angleIndex - 1;
        if (shapeCount < 1) {
            this.dispatchError(rotate_error_messages.WRONG_ARG_COUNT(this.subExpressions.length));
        }

        this.isMultiShape = shapeCount > 1;

        if (this.isMultiShape) {
            // Multi-shape mode: process each shape
            this.shapeDataArray = [];
            for (let i = 1; i <= shapeCount; i++) {
                this.subExpressions[i].resolve(context);
                const shapeExpr = this._getResolvedExpression(context, this.subExpressions[i]);
                const shapeType = this._getGeometryType(shapeExpr);
                const shapeName = shapeExpr.getName();
                const shapeVarName = this._getVariableName(this.subExpressions[i]);

                if (!RotateExpression.SUPPORTED_TYPES.has(shapeType)) {
                    this.dispatchError(rotate_error_messages.INVALID_SHAPE(shapeName));
                }

                // Compute rotated data for this shape
                const rotatedData = this._computeRotatedData(shapeExpr, shapeType);

                this.shapeDataArray.push({
                    originalShapeVarName: shapeVarName,
                    rotatedData,
                    originalShapeName: shapeName,
                    originalShapeType: shapeType
                });
            }
        } else {
            // Single shape mode: existing behavior
            this.subExpressions[1].resolve(context);
            const shapeExpr = this._getResolvedExpression(context, this.subExpressions[1]);
            this.originalShapeType = this._getGeometryType(shapeExpr);
            this.originalShapeName = shapeExpr.getName();
            this.originalShapeVariableName = this._getVariableName(this.subExpressions[1]);

            if (!RotateExpression.SUPPORTED_TYPES.has(this.originalShapeType)) {
                this.dispatchError(rotate_error_messages.INVALID_SHAPE(this.originalShapeName));
            }

            // Extract original data and compute rotation based on shape type
            this._extractAndRotate(shapeExpr);
        }
    }

    /**
     * Find angle index and center point by examining args from end
     * Returns { angleIndex, center }
     */
    _findAngleAndCenter(context) {
        const len = this.subExpressions.length;

        // Try to detect center point pattern from end
        // Case 1: Last arg is a point expression (like P or point(1,2))
        // Case 2: Last 2 args are numbers (cx, cy)
        // Case 3: No center, last arg is angle

        // Resolve last arg to check
        this.subExpressions[len - 1].resolve(context);
        const lastExpr = this._getResolvedExpression(context, this.subExpressions[len - 1]);
        const lastType = this._getGeometryType(lastExpr);
        const lastValues = lastExpr.getVariableAtomicValues();

        // If last arg is a point geometry type, it's the center
        if (lastType === GEOMETRY_TYPES.POINT) {
            return {
                angleIndex: len - 2,
                center: { x: lastValues[0], y: lastValues[1] }
            };
        }

        // Check if last 2 args are single numbers (cx, cy)
        if (len >= 4 && lastValues.length === 1) {
            this.subExpressions[len - 2].resolve(context);
            const secondLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 2]);
            const secondLastValues = secondLastExpr.getVariableAtomicValues();

            if (secondLastValues.length === 1) {
                // Check if third-to-last is also a single number (potential angle)
                // If so, last 2 are cx, cy
                if (len >= 5) {
                    this.subExpressions[len - 3].resolve(context);
                    const thirdLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 3]);
                    const thirdLastValues = thirdLastExpr.getVariableAtomicValues();
                    if (thirdLastValues.length === 1) {
                        // Pattern: ..., angle, cx, cy
                        return {
                            angleIndex: len - 3,
                            center: { x: secondLastValues[0], y: lastValues[0] }
                        };
                    }
                }
            }
        }

        // No center detected, last arg is angle
        return {
            angleIndex: len - 1,
            center: { x: 0, y: 0 }
        };
    }

    /**
     * Compute rotated data for a shape (used in multi-shape mode)
     */
    _computeRotatedData(shapeExpr, shapeType) {
        switch (shapeType) {
            case GEOMETRY_TYPES.POINT: {
                const point = this._getPointCoords(shapeExpr);
                return { point: TransformationUtil.rotatePoint(point, this.angle, this.center) };
            }
            case GEOMETRY_TYPES.LINE: {
                const linePoints = this._getLinePoints(shapeExpr);
                return TransformationUtil.rotateLine(linePoints.start, linePoints.end, this.angle, this.center);
            }
            case GEOMETRY_TYPES.CIRCLE: {
                const center = shapeExpr.getCenter();
                const radius = shapeExpr.getRadius();
                return TransformationUtil.rotateCircle(center, radius, this.angle, this.center);
            }
            case GEOMETRY_TYPES.POLYGON: {
                const vertices = shapeExpr.getVertices();
                return { vertices: TransformationUtil.rotatePolygon(vertices, this.angle, this.center) };
            }
            default:
                return null;
        }
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
        if (this.isMultiShape) {
            const shapeNames = this.shapeDataArray.map(s => s.originalShapeName).join(', ');
            return `Rotate[${shapeNames}, ${this.angle}°, center(${this.center.x}, ${this.center.y})]`;
        }
        return `Rotate[${this.originalShapeName}, ${this.angle}°, center(${this.center.x}, ${this.center.y})]`;
    }

    /**
     * Create command for the rotated shape(s)
     */
    toCommand(options = {}) {
        if (this.isMultiShape) {
            // Multi-shape mode: pass shape data array
            return new RotateCommand(
                this.graphExpression,
                this.shapeDataArray,
                this.angle,
                this.center,
                { ...options, isMultiShape: true }
            );
        }

        // Single shape mode: existing behavior
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
        if (this.isMultiShape) {
            return this.shapeDataArray.length > 0;
        }
        return this.rotatedData !== null;
    }
}
