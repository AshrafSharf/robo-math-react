/**
 * Scale expression - scales one or more shapes around a center point
 *
 * Syntax:
 *   scale(graph, shape, factor)                    - scale around origin (0, 0)
 *   scale(graph, shape, factor, cx, cy)            - scale around point (cx, cy)
 *   scale(graph, shape, factor, centerPoint)       - scale around a point expression
 *   scale(graph, s1, s2, ..., factor)              - scale multiple shapes (parallel animation)
 *   scale(graph, s1, s2, ..., factor, cx, cy)      - scale multiple shapes around point
 *   scale(graph, s1, s2, ..., factor, centerPoint) - scale multiple shapes around point
 *
 * Supported shapes: point, line, vec, circle, polygon
 *
 * The scaled shape(s) are NEW shapes with correct model coordinates.
 * The original shapes are unchanged.
 *
 * When scaling multiple shapes, returns a ShapeCollection.
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
        this.originalData = null;   // Original shape coordinates (single shape mode)
        this.scaledData = null;     // Computed scaled coordinates (single shape mode)
        this.originalShapeName = null;  // 'point', 'line', 'vector', 'circle', 'polygon'
        this.originalShapeType = null;  // GEOMETRY_TYPES value
        this.originalShapeVariableName = null;  // Variable name for registry lookup (e.g., "P")
        this.scaleFactor = 1;       // Scale factor
        this.center = { x: 0, y: 0 }; // Scale center
        this.graphExpression = null;

        // Multi-shape mode
        this.isMultiShape = false;
        this.shapeDataArray = [];  // [{originalShapeVarName, scaledData, originalShapeName, originalShapeType}, ...]
    }

    resolve(context) {
        // Validate argument count: at least 3 args (graph, shape, factor)
        if (this.subExpressions.length < 3) {
            this.dispatchError(scale_error_messages.WRONG_ARG_COUNT(this.subExpressions.length));
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(scale_error_messages.GRAPH_REQUIRED());
        }

        // Determine where factor and optional center are located
        // Strategy: resolve from end to find center (if any), then factor
        const { factorIndex, center } = this._findFactorAndCenter(context);
        this.center = center;

        // Get factor value
        this.subExpressions[factorIndex].resolve(context);
        const factorExpr = this._getResolvedExpression(context, this.subExpressions[factorIndex]);
        const factorValues = factorExpr.getVariableAtomicValues();
        if (factorValues.length !== 1) {
            this.dispatchError(scale_error_messages.FACTOR_NOT_NUMBER());
        }
        this.scaleFactor = factorValues[0];

        // Shape args are from index 1 to factorIndex-1
        const shapeCount = factorIndex - 1;
        if (shapeCount < 1) {
            this.dispatchError(scale_error_messages.WRONG_ARG_COUNT(this.subExpressions.length));
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

                if (!ScaleExpression.SUPPORTED_TYPES.has(shapeType)) {
                    this.dispatchError(scale_error_messages.INVALID_SHAPE(shapeName));
                }

                // Compute scaled data for this shape
                const scaledData = this._computeScaledData(shapeExpr, shapeType);

                this.shapeDataArray.push({
                    originalShapeVarName: shapeVarName,
                    scaledData,
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

            if (!ScaleExpression.SUPPORTED_TYPES.has(this.originalShapeType)) {
                this.dispatchError(scale_error_messages.INVALID_SHAPE(this.originalShapeName));
            }

            // Extract original data and compute scaling based on shape type
            this._extractAndScale(shapeExpr);
        }
    }

    /**
     * Find factor index and center point by examining args from end
     * Returns { factorIndex, center }
     */
    _findFactorAndCenter(context) {
        const len = this.subExpressions.length;

        // Try to detect center point pattern from end
        // Case 1: Last arg is a point expression (like P or point(1,2))
        // Case 2: Last 2 args are numbers (cx, cy)
        // Case 3: No center, last arg is factor

        // Resolve last arg to check
        this.subExpressions[len - 1].resolve(context);
        const lastExpr = this._getResolvedExpression(context, this.subExpressions[len - 1]);
        const lastType = this._getGeometryType(lastExpr);
        const lastValues = lastExpr.getVariableAtomicValues();

        // If last arg is a point geometry type, it's the center
        if (lastType === GEOMETRY_TYPES.POINT) {
            return {
                factorIndex: len - 2,
                center: { x: lastValues[0], y: lastValues[1] }
            };
        }

        // Check if last 2 args are single numbers (cx, cy)
        if (len >= 4 && lastValues.length === 1) {
            this.subExpressions[len - 2].resolve(context);
            const secondLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 2]);
            const secondLastValues = secondLastExpr.getVariableAtomicValues();

            if (secondLastValues.length === 1) {
                // Check if third-to-last is also a single number (potential factor)
                // If so, last 2 are cx, cy
                if (len >= 5) {
                    this.subExpressions[len - 3].resolve(context);
                    const thirdLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 3]);
                    const thirdLastValues = thirdLastExpr.getVariableAtomicValues();
                    if (thirdLastValues.length === 1) {
                        // Pattern: ..., factor, cx, cy
                        return {
                            factorIndex: len - 3,
                            center: { x: secondLastValues[0], y: lastValues[0] }
                        };
                    }
                }
            }
        }

        // No center detected, last arg is factor
        return {
            factorIndex: len - 1,
            center: { x: 0, y: 0 }
        };
    }

    /**
     * Compute scaled data for a shape (used in multi-shape mode)
     */
    _computeScaledData(shapeExpr, shapeType) {
        switch (shapeType) {
            case GEOMETRY_TYPES.POINT: {
                const point = this._getPointCoords(shapeExpr);
                return { point: TransformationUtil.scalePoint(point, this.scaleFactor, this.center) };
            }
            case GEOMETRY_TYPES.LINE: {
                const linePoints = this._getLinePoints(shapeExpr);
                return TransformationUtil.scaleLine(linePoints.start, linePoints.end, this.scaleFactor, this.center);
            }
            case GEOMETRY_TYPES.CIRCLE: {
                const center = shapeExpr.getCenter();
                const radius = shapeExpr.getRadius();
                return TransformationUtil.scaleCircle(center, radius, this.scaleFactor, this.center);
            }
            case GEOMETRY_TYPES.POLYGON: {
                const vertices = shapeExpr.getVertices();
                return { vertices: TransformationUtil.scalePolygon(vertices, this.scaleFactor, this.center) };
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
        if (this.isMultiShape) {
            const shapeNames = this.shapeDataArray.map(s => s.originalShapeName).join(', ');
            return `Scale[${shapeNames}, ${this.scaleFactor}x, center(${this.center.x}, ${this.center.y})]`;
        }
        return `Scale[${this.originalShapeName}, ${this.scaleFactor}x, center(${this.center.x}, ${this.center.y})]`;
    }

    /**
     * Create command for the scaled shape(s)
     */
    toCommand(options = {}) {
        if (this.isMultiShape) {
            // Multi-shape mode: pass shape data array
            return new ScaleCommand(
                this.graphExpression,
                this.shapeDataArray,
                this.scaleFactor,
                this.center,
                { ...options, isMultiShape: true }
            );
        }

        // Single shape mode: existing behavior
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
        if (this.isMultiShape) {
            return this.shapeDataArray.length > 0;
        }
        return this.scaledData !== null;
    }
}
