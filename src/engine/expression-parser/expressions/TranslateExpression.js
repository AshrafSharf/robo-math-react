/**
 * Translate expression - translates a shape by dx, dy
 *
 * Syntax:
 *   translate(graph, shape, dx, dy)
 *
 * Supported shapes: point, line, vec, circle, polygon
 *
 * The translated shape is a NEW shape with correct model coordinates.
 * The original shape is unchanged.
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { TranslateCommand } from '../../commands/TranslateCommand.js';
import { TransformationUtil } from '../../../geom/TransformationUtil.js';
import { translate_error_messages } from '../core/ErrorMessages.js';
import { GEOMETRY_TYPES } from './IntersectExpression.js';

export class TranslateExpression extends AbstractArithmeticExpression {
    static NAME = 'translate';

    // Supported geometry types for translation
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
        this.translatedData = null; // Computed translated coordinates
        this.originalShapeName = null;  // 'point', 'line', 'vec', 'circle', 'polygon'
        this.originalShapeType = null;  // GEOMETRY_TYPES value
        this.originalShapeVariableName = null;  // Variable name for registry lookup
        this.dx = 0;  // Translation in x
        this.dy = 0;  // Translation in y
        this.graphExpression = null;
    }

    resolve(context) {
        // Validate argument count: exactly 4 args (graph, shape, dx, dy)
        if (this.subExpressions.length !== 4) {
            this.dispatchError(translate_error_messages.WRONG_ARG_COUNT(this.subExpressions.length));
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(translate_error_messages.GRAPH_REQUIRED());
        }

        // Second arg: shape to translate
        this.subExpressions[1].resolve(context);
        const shapeExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        this.originalShapeType = this._getGeometryType(shapeExpr);
        this.originalShapeName = shapeExpr.getName();

        // Store the variable name for registry lookup
        this.originalShapeVariableName = this._getVariableName(this.subExpressions[1]);

        if (!TranslateExpression.SUPPORTED_TYPES.has(this.originalShapeType)) {
            this.dispatchError(translate_error_messages.INVALID_SHAPE(shapeExpr.getName()));
        }

        // Third arg: dx
        this.subExpressions[2].resolve(context);
        const dxExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const dxValues = dxExpr.getVariableAtomicValues();
        if (dxValues.length !== 1) {
            this.dispatchError(translate_error_messages.DX_NOT_NUMBER());
        }
        this.dx = dxValues[0];

        // Fourth arg: dy
        this.subExpressions[3].resolve(context);
        const dyExpr = this._getResolvedExpression(context, this.subExpressions[3]);
        const dyValues = dyExpr.getVariableAtomicValues();
        if (dyValues.length !== 1) {
            this.dispatchError(translate_error_messages.DY_NOT_NUMBER());
        }
        this.dy = dyValues[0];

        // Extract original data and compute translation based on shape type
        this._extractAndTranslate(shapeExpr);
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
     * Extract original coordinates and compute translated coordinates
     */
    _extractAndTranslate(shapeExpr) {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                this._translatePoint(shapeExpr);
                break;
            case GEOMETRY_TYPES.LINE:
                this._translateLine(shapeExpr);
                break;
            case GEOMETRY_TYPES.CIRCLE:
                this._translateCircle(shapeExpr);
                break;
            case GEOMETRY_TYPES.POLYGON:
                this._translatePolygon(shapeExpr);
                break;
        }
    }

    /**
     * Translate a point
     */
    _translatePoint(expr) {
        const point = this._getPointCoords(expr);
        this.originalData = { point };
        this.translatedData = {
            point: TransformationUtil.translatePoint(point, this.dx, this.dy)
        };
    }

    /**
     * Translate a line or vector (both endpoints)
     */
    _translateLine(expr) {
        const linePoints = this._getLinePoints(expr);
        this.originalData = linePoints;
        this.translatedData = TransformationUtil.translateLine(
            linePoints.start,
            linePoints.end,
            this.dx,
            this.dy
        );
    }

    /**
     * Translate a circle (translate center, radius unchanged)
     */
    _translateCircle(expr) {
        const circleCenter = expr.getCenter();
        const radius = expr.getRadius();
        this.originalData = { center: circleCenter, radius };
        this.translatedData = TransformationUtil.translateCircle(
            circleCenter,
            radius,
            this.dx,
            this.dy
        );
    }

    /**
     * Translate a polygon (all vertices)
     */
    _translatePolygon(expr) {
        const vertices = expr.getVertices();
        this.originalData = { vertices };
        this.translatedData = {
            vertices: TransformationUtil.translatePolygon(vertices, this.dx, this.dy)
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
        const coords = expr.getVariableAtomicValues();
        return {
            start: { x: coords[0], y: coords[1] },
            end: { x: coords[2], y: coords[3] }
        };
    }

    getName() {
        return TranslateExpression.NAME;
    }

    /**
     * Return the geometry type of the translated shape
     */
    getGeometryType() {
        return this.originalShapeType;
    }

    /**
     * Get the translated point (for point shapes)
     */
    getPoint() {
        if (this.originalShapeType === GEOMETRY_TYPES.POINT) {
            return this.translatedData.point;
        }
        return null;
    }

    /**
     * Get line points (for line/vec shapes)
     */
    getLinePoints() {
        if (this.originalShapeType === GEOMETRY_TYPES.LINE) {
            return [this.translatedData.start, this.translatedData.end];
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
            return this.translatedData.center;
        }
        return null;
    }

    /**
     * Get radius (for circle shapes)
     */
    getRadius() {
        if (this.originalShapeType === GEOMETRY_TYPES.CIRCLE) {
            return this.translatedData.radius;
        }
        return null;
    }

    /**
     * Get vertices (for polygon shapes)
     */
    getVertices() {
        if (this.originalShapeType === GEOMETRY_TYPES.POLYGON) {
            return this.translatedData.vertices;
        }
        return null;
    }

    /**
     * Return atomic values based on shape type
     */
    getVariableAtomicValues() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.translatedData.point.x, this.translatedData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [
                    this.translatedData.start.x, this.translatedData.start.y,
                    this.translatedData.end.x, this.translatedData.end.y
                ];
            case GEOMETRY_TYPES.CIRCLE:
                return [
                    this.translatedData.center.x, this.translatedData.center.y,
                    this.translatedData.radius
                ];
            case GEOMETRY_TYPES.POLYGON:
                return this.translatedData.vertices.flatMap(v => [v.x, v.y]);
            default:
                return [];
        }
    }

    getStartValue() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.translatedData.point.x, this.translatedData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [this.translatedData.start.x, this.translatedData.start.y];
            case GEOMETRY_TYPES.CIRCLE:
                return [this.translatedData.center.x, this.translatedData.center.y];
            case GEOMETRY_TYPES.POLYGON:
                const v = this.translatedData.vertices[0];
                return [v.x, v.y];
            default:
                return [0, 0];
        }
    }

    getEndValue() {
        switch (this.originalShapeType) {
            case GEOMETRY_TYPES.POINT:
                return [this.translatedData.point.x, this.translatedData.point.y];
            case GEOMETRY_TYPES.LINE:
                return [this.translatedData.end.x, this.translatedData.end.y];
            case GEOMETRY_TYPES.CIRCLE:
                return [this.translatedData.center.x, this.translatedData.center.y];
            case GEOMETRY_TYPES.POLYGON:
                const verts = this.translatedData.vertices;
                const last = verts[verts.length - 1];
                return [last.x, last.y];
            default:
                return [0, 0];
        }
    }

    getFriendlyToStr() {
        return `Translate[${this.originalShapeName}, (${this.dx}, ${this.dy})]`;
    }

    /**
     * Create command for the translated shape
     */
    toCommand(options = {}) {
        return new TranslateCommand(
            this.graphExpression,
            this.originalShapeVariableName,
            this.translatedData,
            this.originalShapeName,
            this.originalShapeType,
            this.dx,
            this.dy,
            options
        );
    }

    /**
     * Can play if we have valid translated data
     */
    canPlay() {
        return this.translatedData !== null;
    }
}
