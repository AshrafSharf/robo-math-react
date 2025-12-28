/**
 * Rotate3DExpression - animates rotating 3D shape(s) around an axis
 *
 * Syntax:
 *   rotate3d(shapeVar, angle, ax, ay, az)           - single shape, axis as 3 numbers
 *   rotate3d(shapeVar, angle, axisVector)           - single shape, axis as vector
 *   rotate3d(s1, s2, ..., angle, ax, ay, az)        - multiple shapes (parallel animation)
 *   rotate3d(s1, s2, ..., angle, axisVector)        - multiple shapes with vector axis
 *
 * Creates new shape(s) at the rotated position with arc animation.
 * Original shapes remain visible.
 * When rotating multiple shapes, returns a Shape3DCollection.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 3, 0, 0)
 *   rotate3d(V, 90, 0, 0, 1)                  // single shape
 *   rotate3d(V1, V2, V3, 45, 0, 1, 0)         // multiple shapes
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { AssignmentExpression } from '../AssignmentExpression.js';
import { Rotate3DCommand } from '../../../commands/3d/Rotate3DCommand.js';
import { RotateS3DCommand } from '../../../commands/s3d/RotateS3DCommand.js';
import { vectorRotateHandler } from '../../../../3d/common/rotate-handlers/vector_rotate_handler.js';
import { lineRotateHandler } from '../../../../3d/common/rotate-handlers/line_rotate_handler.js';
import { pointRotateHandler } from '../../../../3d/common/rotate-handlers/point_rotate_handler.js';
import { rotatePoints3D } from '../../../../3d/common/rotation_utils.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';
import { getOrderedDependents } from '../../../utils/DependencyTrackingUtil.js';

// Handler registry for supported 3D shape types
const ROTATE_HANDLERS = {
    'vector3d': vectorRotateHandler,
    'line3d': lineRotateHandler,
    'point3d': pointRotateHandler
};

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

        // Pre-computed dependent rotated data (single shape mode)
        this.dependentRotatedData = [];  // [{label, handler, originalPoints, rotatedPoints, varName}, ...]

        // s3d mode (pure Three.js)
        this.isS3DMode = false;
        this.s3dTargetExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('rotate3d() requires at least 3 arguments');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
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

        // Check if first shape is s3d group or face
        const firstShapeExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        if (this._isS3DTarget(firstShapeExpr)) {
            // s3d mode - pure Three.js rotation
            this.isS3DMode = true;
            this.s3dTargetExpression = firstShapeExpr;
            return; // No further processing needed for s3d
        }

        if (this.isMultiShape) {
            // Multi-shape mode
            this._resolveMultiShape(context, shapeCount);
        } else {
            // Single shape mode
            this._resolveSingleShape(context);
        }
    }

    /**
     * Get variable name from expression (matching 2D pattern)
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
     * Get the commandable expression (RHS for assignments, or the expression itself)
     */
    _getCommandableExpr(expr) {
        if (expr instanceof AssignmentExpression) {
            return expr.getComparableExpression();
        }
        return expr;
    }

    /**
     * Check if target is an s3d object (group, face, or primitive)
     */
    _isS3DTarget(expr) {
        return (expr.isS3DGroup && expr.isS3DGroup()) ||
               (expr.isS3DFace && expr.isS3DFace()) ||
               (expr.isS3DSphere && expr.isS3DSphere()) ||
               (expr.isS3DCube && expr.isS3DCube()) ||
               (expr.isS3DCone && expr.isS3DCone()) ||
               (expr.isS3DCylinder && expr.isS3DCylinder());
    }

    /**
     * Find angle index and axis by examining args from end
     */
    _findAngleAndAxis(context) {
        const len = this.subExpressions.length;

        // Check last arg - could be axis vector, edge, or z component
        const lastExpr = this._getResolvedExpression(context, this.subExpressions[len - 1]);

        // If last arg is an edge expression, use its axis
        if (lastExpr.isS3DEdge && lastExpr.isS3DEdge()) {
            const edgeAxis = lastExpr.getAxis();
            return {
                angleIndex: len - 2,
                axis: { x: edgeAxis[0], y: edgeAxis[1], z: edgeAxis[2] }
            };
        }

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

        this.dispatchError('rotate3d() requires axis as (ax, ay, az), axisVector, or edge');
    }

    /**
     * Resolve single shape mode
     */
    _resolveSingleShape(context) {
        this.shapeExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        this.originalShapeVarName = this._getVariableName(this.subExpressions[0]);
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

        // Find dependents and pre-compute their rotated data
        if (this.originalShapeVarName) {
            const orderedDependents = getOrderedDependents(context, this.originalShapeVarName);
            this.dependentRotatedData = [];

            for (const { expr, label } of orderedDependents) {
                if (!label) continue;
                if (expr === this) continue;  // Skip self to avoid infinite recursion

                expr.resolve(context);
                const cmdExpr = this._getCommandableExpr(expr);
                if (!cmdExpr) continue;

                const shapeType = cmdExpr.getGeometryType?.() || cmdExpr.getName();
                const handler = ROTATE_HANDLERS[shapeType];
                if (!handler) continue;

                const originalPoints = handler.getPoints(cmdExpr);
                const rotatedPoints = rotatePoints3D(originalPoints, this.axis, this.angle);

                this.dependentRotatedData.push({
                    label,
                    handler,
                    originalPoints,
                    rotatedPoints,
                    varName: label
                });
            }
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
        // s3d mode - pure Three.js rotation
        if (this.isS3DMode) {
            return new RotateS3DCommand(
                this.s3dTargetExpression,
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
            mergedOpts,
            this.dependentRotatedData  // Pass pre-computed dependent data
        );
    }

    canPlay() {
        if (this.isS3DMode) {
            return this.s3dTargetExpression != null;
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
