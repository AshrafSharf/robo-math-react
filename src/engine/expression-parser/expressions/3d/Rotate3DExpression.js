/**
 * Rotate3DExpression - animates rotating 3D shape(s) around an axis
 *
 * Syntax:
 *   rotate3d(shapeVar, angle, ax, ay, az)           - single shape, axis as 3 numbers
 *   rotate3d(shapeVar, angle, axisVector)           - single shape, axis as vector
 *   rotate3d(face, angle)                            - Face3D: auto-detect pivot axis
 *   rotate3d(face, angle, pivot(face))              - Face3D with explicit pivot
 *   rotate3d(s1, s2, ..., angle, ax, ay, az)        - multiple shapes (parallel animation)
 *   rotate3d(s1, s2, ..., angle, axisVector)        - multiple shapes with vector axis
 *
 * Creates new shape(s) at the rotated position with arc animation.
 * Original shapes remain visible.
 * When rotating Face3D, rotates the face around its hinge pivot.
 * When rotating multiple shapes, returns a Shape3DCollection.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 3, 0, 0)
 *   rotate3d(V, 90, 0, 0, 1)                  // single shape
 *   rotate3d(V1, V2, V3, 45, 0, 1, 0)         // multiple shapes
 *   F = foldable(G, 12, 2, "box")
 *   rotate3d(face(F, "top"), 90)              // Face3D with auto-pivot
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Rotate3DCommand } from '../../../commands/3d/Rotate3DCommand.js';
import { Rotate3DFaceCommand } from '../../../commands/3d/Rotate3DFaceCommand.js';
import { vectorRotateHandler } from '../../../../3d/common/rotate-handlers/vector_rotate_handler.js';
import { lineRotateHandler } from '../../../../3d/common/rotate-handlers/line_rotate_handler.js';
import { pointRotateHandler } from '../../../../3d/common/rotate-handlers/point_rotate_handler.js';
import { rotatePoints3D } from '../../../../3d/common/rotation_utils.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

// Handler registry for supported 3D shape types
const ROTATE_HANDLERS = {
    'vector3d': vectorRotateHandler,
    'line3d': lineRotateHandler,
    'point3d': pointRotateHandler
};

/**
 * Check if expression is a Face3D (from face() accessor)
 */
function isFaceExpression(expr) {
    return expr && (expr.getName() === 'face' || expr.getGeometryType?.() === 'face3d');
}

export class Rotate3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'rotate3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;

        // Single shape mode
        this.shapeExpression = null;
        this.graphExpression = null;
        this.originalShapeVarName = null;
        this.handler = null;
        this.originalPoints = [];
        this.rotatedPoints = [];
        this.coordinates = [];

        // Common
        this.angle = 0;
        this.axis = { x: 0, y: 0, z: 1 };

        // Multi-shape mode
        this.isMultiShape = false;
        this.shapeDataArray = []; // [{shapeExpression, handler, originalPoints, rotatedPoints, varName}, ...]

        // Face3D mode
        this.isFace3DMode = false;
        this.faceExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('rotate3d() requires at least 2 arguments');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // Check for Face3D mode (auto-pivot detection)
        const firstExpr = this._getResolvedExpression(context, this.subExpressions[0]);

        if (isFaceExpression(firstExpr)) {
            // Face3D mode - handle specially
            this._resolveFace3D(context, firstExpr);
            return;
        }

        // Regular mode - requires at least 3 args (shape, angle, axis)
        if (this.subExpressions.length < 3) {
            this.dispatchError('rotate3d() requires at least 3 arguments for non-Face3D shapes');
        }

        // Find angle and axis by examining args from end
        const { angleIndex, axis } = this._findAngleAndAxis(context);
        this.axis = axis;

        // Get angle value
        const angleExpr = this._getResolvedExpression(context, this.subExpressions[angleIndex]);
        this.angle = angleExpr.getVariableAtomicValues()[0];

        // Shape args are from index 0 to angleIndex-1
        const shapeCount = angleIndex;
        if (shapeCount < 1) {
            this.dispatchError('rotate3d() requires at least one shape');
        }

        this.isMultiShape = shapeCount > 1;

        if (this.isMultiShape) {
            // Multi-shape mode
            this._resolveMultiShape(context, shapeCount);
        } else {
            // Single shape mode
            this._resolveSingleShape(context);
        }
    }

    /**
     * Resolve Face3D rotation mode
     * Supports: rotate3d(face, angle) with auto-pivot
     *           rotate3d(face, angle, pivot) with explicit pivot
     */
    _resolveFace3D(context, faceExpr) {
        this.isFace3DMode = true;
        this.faceExpression = faceExpr;
        this.graphExpression = faceExpr.getFoldableExpression()?.graphExpression;

        // Get angle (second arg)
        const angleExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        this.angle = angleExpr.getVariableAtomicValues()[0];

        // Check for explicit axis (third arg)
        if (this.subExpressions.length >= 3) {
            const axisExpr = this._getResolvedExpression(context, this.subExpressions[2]);
            const axisValues = axisExpr.getVariableAtomicValues();

            // If it's a line/pivot (6 values: start + end), extract direction
            if (axisValues.length >= 6) {
                this.axis = {
                    x: axisValues[3] - axisValues[0],
                    y: axisValues[4] - axisValues[1],
                    z: axisValues[5] - axisValues[2]
                };
            } else if (axisValues.length >= 3) {
                // Point3D as direction
                this.axis = { x: axisValues[0], y: axisValues[1], z: axisValues[2] };
            }
        } else {
            // Auto-detect pivot from Face3D
            const face = faceExpr.getFace();
            if (face) {
                const pivotAxis = face.getPivotAxis();
                this.axis = pivotAxis;
            } else {
                // Face not yet available (before command execution), use default
                this.axis = { x: 1, y: 0, z: 0 };
            }
        }
    }

    /**
     * Find angle index and axis by examining args from end
     */
    _findAngleAndAxis(context) {
        const len = this.subExpressions.length;

        // Check last arg - could be axis vector or z component
        const lastExpr = this._getResolvedExpression(context, this.subExpressions[len - 1]);
        const lastValues = lastExpr.getVariableAtomicValues();

        // If last arg has 6 values, it's a vector (use direction)
        if (lastValues.length >= 6) {
            return {
                angleIndex: len - 2,
                axis: {
                    x: lastValues[3] - lastValues[0],
                    y: lastValues[4] - lastValues[1],
                    z: lastValues[5] - lastValues[2]
                }
            };
        }

        // If last arg has 3 values, it's a point3d as axis
        if (lastValues.length >= 3) {
            return {
                angleIndex: len - 2,
                axis: { x: lastValues[0], y: lastValues[1], z: lastValues[2] }
            };
        }

        // Check if last 3 args are single numbers (ax, ay, az)
        if (len >= 4 && lastValues.length === 1) {
            const secondLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 2]);
            const thirdLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 3]);
            const secondLastValues = secondLastExpr.getVariableAtomicValues();
            const thirdLastValues = thirdLastExpr.getVariableAtomicValues();

            if (secondLastValues.length === 1 && thirdLastValues.length === 1) {
                // Pattern: ..., angle, ax, ay, az
                return {
                    angleIndex: len - 4,
                    axis: {
                        x: thirdLastValues[0],
                        y: secondLastValues[0],
                        z: lastValues[0]
                    }
                };
            }
        }

        this.dispatchError('rotate3d() requires axis as (ax, ay, az) or axisVector');
    }

    /**
     * Resolve single shape mode
     */
    _resolveSingleShape(context) {
        this.shapeExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        this.originalShapeVarName = this.subExpressions[0].variableName || this.shapeExpression.variableName;
        this.graphExpression = this.shapeExpression.graphExpression;

        const shapeType = this.shapeExpression.getGeometryType?.() || this.shapeExpression.getName();
        this.handler = ROTATE_HANDLERS[shapeType];

        if (!this.handler) {
            this.dispatchError(`rotate3d() does not support shape type: ${shapeType}. Supported: ${Object.keys(ROTATE_HANDLERS).join(', ')}`);
        }

        this.originalPoints = this.handler.getPoints(this.shapeExpression);
        this.rotatedPoints = rotatePoints3D(this.originalPoints, this.axis, this.angle);

        this.coordinates = [];
        for (const point of this.rotatedPoints) {
            this.coordinates.push(point.x, point.y, point.z);
        }
    }

    /**
     * Resolve multi-shape mode
     */
    _resolveMultiShape(context, shapeCount) {
        this.shapeDataArray = [];

        for (let i = 0; i < shapeCount; i++) {
            const shapeExpr = this._getResolvedExpression(context, this.subExpressions[i]);
            const varName = this.subExpressions[i].variableName || shapeExpr.variableName;

            // Get graph from first shape
            if (i === 0) {
                this.graphExpression = shapeExpr.graphExpression;
            }

            const shapeType = shapeExpr.getGeometryType?.() || shapeExpr.getName();
            const handler = ROTATE_HANDLERS[shapeType];

            if (!handler) {
                this.dispatchError(`rotate3d() does not support shape type: ${shapeType}`);
            }

            const originalPoints = handler.getPoints(shapeExpr);
            const rotatedPoints = rotatePoints3D(originalPoints, this.axis, this.angle);

            this.shapeDataArray.push({
                shapeExpression: shapeExpr,
                handler,
                originalPoints,
                rotatedPoints,
                varName
            });
        }
    }

    getName() {
        return Rotate3DExpression.NAME;
    }

    getGeometryType() {
        if (this.isFace3DMode) {
            return 'face3d';
        }
        if (this.isMultiShape) {
            return 'shape3dcollection';
        }
        return this.handler ? this.handler.getGeometryType() : 'vector3d';
    }

    getGrapher() {
        return this.graphExpression?.getGrapher?.() || null;
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    getVectorPoints() {
        if (this.rotatedPoints.length >= 2) {
            return [this.rotatedPoints[0], this.rotatedPoints[1]];
        }
        return this.rotatedPoints;
    }

    getVector() {
        if (this.rotatedPoints.length >= 2) {
            return { start: this.rotatedPoints[0], end: this.rotatedPoints[1] };
        }
        return null;
    }

    getStartValue() {
        return this.rotatedPoints.length > 0
            ? [this.rotatedPoints[0].x, this.rotatedPoints[0].y, this.rotatedPoints[0].z]
            : [];
    }

    getEndValue() {
        return this.rotatedPoints.length > 1
            ? [this.rotatedPoints[1].x, this.rotatedPoints[1].y, this.rotatedPoints[1].z]
            : [];
    }

    getFriendlyToStr() {
        if (this.isMultiShape) {
            const names = this.shapeDataArray.map(s => s.varName || 'shape').join(', ');
            return `rotate3d[${names}, ${this.angle}° around (${this.axis.x}, ${this.axis.y}, ${this.axis.z})]`;
        }
        const pts = this.rotatedPoints;
        if (pts.length >= 2) {
            return `rotate3d[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
        }
        return `rotate3d[${this.angle}° around (${this.axis.x}, ${this.axis.y}, ${this.axis.z})]`;
    }

    toCommand(options = {}) {
        // Face3D mode - use specialized command
        if (this.isFace3DMode) {
            return new Rotate3DFaceCommand(
                this.faceExpression,
                this.angle,
                this.axis,
                options
            );
        }

        if (this.isMultiShape) {
            return new Rotate3DCommand(
                this.graphExpression,
                this.shapeDataArray,
                this.angle,
                this.axis,
                { ...options, isMultiShape: true }
            );
        }

        // Single shape mode
        const geomType = this.handler.getGeometryType();
        const defaults = ExpressionOptionsRegistry.get(geomType);
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };

        return new Rotate3DCommand(
            this.shapeExpression,
            this.originalShapeVarName,
            this.angle,
            this.axis,
            this.handler,
            this.originalPoints,
            this.rotatedPoints,
            mergedOpts
        );
    }

    canPlay() {
        if (this.isFace3DMode) {
            return true;  // Face3D rotation is always playable
        }
        if (this.isMultiShape) {
            return this.shapeDataArray.length > 0;
        }
        return this.rotatedPoints.length > 0;
    }

    // ===== Collection access methods (for item() expression) =====

    /**
     * Get shape data at index (for item() extraction)
     * @param {number} index
     * @returns {Object|null} Shape data or null if index out of bounds
     */
    getShapeDataAt(index) {
        if (!this.isMultiShape || index < 0 || index >= this.shapeDataArray.length) {
            return null;
        }
        return this.shapeDataArray[index];
    }

    /**
     * Get collection size
     * @returns {number}
     */
    getCollectionSize() {
        return this.isMultiShape ? this.shapeDataArray.length : 0;
    }

    /**
     * Check if this is a collection (multi-shape mode)
     * @returns {boolean}
     */
    isCollection() {
        return this.isMultiShape;
    }
}
