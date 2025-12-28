/**
 * Scale3DExpression - animates scaling 3D shape(s) by a scale factor
 *
 * Syntax:
 *   scale3d(shapeVar, factor)                      - scale around origin
 *   scale3d(shapeVar, factor, cx, cy, cz)          - scale around center point
 *   scale3d(shapeVar, factor, centerPoint)         - scale around center point expression
 *   scale3d(s1, s2, ..., factor)                   - multiple shapes (parallel animation)
 *   scale3d(s1, s2, ..., factor, cx, cy, cz)       - multiple shapes around center
 *
 * Creates new shape(s) at the scaled position with animation.
 * Original shapes remain visible.
 * When scaling multiple shapes, returns a Shape3DCollection.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 1, 1, 1, 3, 3, 3)
 *   scale3d(V, 2)                        // double size around origin
 *   scale3d(V, 0.5, 2, 2, 2)             // half size around (2,2,2)
 *   scale3d(V1, V2, L1, 1.5)             // multiple shapes
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { AssignmentExpression } from '../AssignmentExpression.js';
import { Scale3DCommand } from '../../../commands/3d/Scale3DCommand.js';
import { vectorScaleHandler } from '../../../../3d/common/scale-handlers/vector_scale_handler.js';
import { lineScaleHandler } from '../../../../3d/common/scale-handlers/line_scale_handler.js';
import { pointScaleHandler } from '../../../../3d/common/scale-handlers/point_scale_handler.js';
import { scalePoints3D } from '../../../../3d/common/scale_utils.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';
import { getOrderedDependents } from '../../../utils/DependencyTrackingUtil.js';

// Handler registry for supported 3D shape types
const SCALE_HANDLERS = {
    'vector3d': vectorScaleHandler,
    'line3d': lineScaleHandler,
    'point3d': pointScaleHandler
};

export class Scale3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'scale3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;

        // Single shape mode
        this.shapeExpression = null;
        this.graphExpression = null;
        this.originalShapeVarName = null;
        this.handler = null;
        this.originalPoints = [];
        this.scaledPoints = [];
        this.coordinates = [];

        // Common
        this.scaleFactor = 1;
        this.center = { x: 0, y: 0, z: 0 };

        // Multi-shape mode
        this.isMultiShape = false;
        this.shapeDataArray = [];

        // Pre-computed dependent scaled data (single shape mode)
        this.dependentScaledData = [];  // [{label, handler, originalPoints, scaledPoints, varName}, ...]
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('scale3d() requires at least 2 arguments');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // Find scale factor and center by examining args from end
        const { factorIndex, scaleFactor, center } = this._findFactorAndCenter(context);
        this.scaleFactor = scaleFactor;
        this.center = center;

        // Shape args are from index 0 to factorIndex-1
        const shapeCount = factorIndex;
        if (shapeCount < 1) {
            this.dispatchError('scale3d() requires at least one shape');
        }

        this.isMultiShape = shapeCount > 1;

        if (this.isMultiShape) {
            this._resolveMultiShape(context, shapeCount);
        } else {
            this._resolveSingleShape(context);
        }
    }

    /**
     * Find scale factor index and center by examining args from end
     */
    _findFactorAndCenter(context) {
        const len = this.subExpressions.length;

        // Check last arg
        const lastExpr = this._getResolvedExpression(context, this.subExpressions[len - 1]);
        const lastValues = lastExpr.getVariableAtomicValues();

        // If last arg has 3+ values, it's a point3d as center
        if (lastValues.length >= 3) {
            // Factor is second-to-last
            const factorExpr = this._getResolvedExpression(context, this.subExpressions[len - 2]);
            const factorValues = factorExpr.getVariableAtomicValues();

            if (factorValues.length === 1) {
                return {
                    factorIndex: len - 2,
                    scaleFactor: factorValues[0],
                    center: { x: lastValues[0], y: lastValues[1], z: lastValues[2] }
                };
            }
        }

        // Check if last 3 args are single numbers (cx, cy, cz) with factor before
        if (len >= 5 && lastValues.length === 1) {
            const secondLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 2]);
            const thirdLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 3]);
            const fourthLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 4]);

            const secondLastValues = secondLastExpr.getVariableAtomicValues();
            const thirdLastValues = thirdLastExpr.getVariableAtomicValues();
            const fourthLastValues = fourthLastExpr.getVariableAtomicValues();

            if (secondLastValues.length === 1 && thirdLastValues.length === 1 && fourthLastValues.length === 1) {
                // Pattern: ..., factor, cx, cy, cz
                return {
                    factorIndex: len - 4,
                    scaleFactor: fourthLastValues[0],
                    center: {
                        x: thirdLastValues[0],
                        y: secondLastValues[0],
                        z: lastValues[0]
                    }
                };
            }
        }

        // No center specified, last arg is factor
        if (lastValues.length === 1) {
            return {
                factorIndex: len - 1,
                scaleFactor: lastValues[0],
                center: { x: 0, y: 0, z: 0 }
            };
        }

        this.dispatchError('scale3d() requires a numeric scale factor');
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

    _resolveSingleShape(context) {
        this.shapeExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        this.originalShapeVarName = this._getVariableName(this.subExpressions[0]);
        this.graphExpression = this.shapeExpression.graphExpression;

        const shapeType = this.shapeExpression.getGeometryType?.() || this.shapeExpression.getName();
        this.handler = SCALE_HANDLERS[shapeType];

        if (!this.handler) {
            this.dispatchError(`scale3d() does not support shape type: ${shapeType}. Supported: ${Object.keys(SCALE_HANDLERS).join(', ')}`);
        }

        this.originalPoints = this.handler.getPoints(this.shapeExpression);
        this.scaledPoints = scalePoints3D(this.originalPoints, this.scaleFactor, this.center);

        this.coordinates = [];
        for (const point of this.scaledPoints) {
            this.coordinates.push(point.x, point.y, point.z);
        }

        // Find dependents and pre-compute their scaled data
        if (this.originalShapeVarName) {
            const orderedDependents = getOrderedDependents(context, this.originalShapeVarName);
            this.dependentScaledData = [];

            for (const { expr, label } of orderedDependents) {
                if (!label) continue;
                if (expr === this) continue;  // Skip self to avoid infinite recursion

                expr.resolve(context);
                const cmdExpr = this._getCommandableExpr(expr);
                if (!cmdExpr) continue;

                const shapeType = cmdExpr.getGeometryType?.() || cmdExpr.getName();
                const handler = SCALE_HANDLERS[shapeType];
                if (!handler) continue;

                const originalPoints = handler.getPoints(cmdExpr);
                const scaledPoints = scalePoints3D(originalPoints, this.scaleFactor, this.center);

                this.dependentScaledData.push({
                    label,
                    handler,
                    originalPoints,
                    scaledPoints,
                    varName: label
                });
            }
        }
    }

    _resolveMultiShape(context, shapeCount) {
        this.shapeDataArray = [];

        for (let i = 0; i < shapeCount; i++) {
            const shapeExpr = this._getResolvedExpression(context, this.subExpressions[i]);
            const varName = this.subExpressions[i].variableName || shapeExpr.variableName;

            if (i === 0) {
                this.graphExpression = shapeExpr.graphExpression;
            }

            const shapeType = shapeExpr.getGeometryType?.() || shapeExpr.getName();
            const handler = SCALE_HANDLERS[shapeType];

            if (!handler) {
                this.dispatchError(`scale3d() does not support shape type: ${shapeType}`);
            }

            const originalPoints = handler.getPoints(shapeExpr);
            const scaledPoints = scalePoints3D(originalPoints, this.scaleFactor, this.center);

            this.shapeDataArray.push({
                shapeExpression: shapeExpr,
                handler,
                originalPoints,
                scaledPoints,
                varName
            });
        }
    }

    getName() {
        return Scale3DExpression.NAME;
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
        if (this.scaledPoints.length >= 2) {
            return [this.scaledPoints[0], this.scaledPoints[1]];
        }
        return this.scaledPoints;
    }

    getVector() {
        if (this.scaledPoints.length >= 2) {
            return { start: this.scaledPoints[0], end: this.scaledPoints[1] };
        }
        return null;
    }

    getStartValue() {
        return this.scaledPoints.length > 0
            ? [this.scaledPoints[0].x, this.scaledPoints[0].y, this.scaledPoints[0].z]
            : [];
    }

    getEndValue() {
        return this.scaledPoints.length > 1
            ? [this.scaledPoints[1].x, this.scaledPoints[1].y, this.scaledPoints[1].z]
            : [];
    }

    getFriendlyToStr() {
        if (this.isMultiShape) {
            const names = this.shapeDataArray.map(s => s.varName || 'shape').join(', ');
            return `scale3d[${names}, ×${this.scaleFactor}, center(${this.center.x}, ${this.center.y}, ${this.center.z})]`;
        }
        const pts = this.scaledPoints;
        if (pts.length >= 2) {
            return `scale3d[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
        }
        return `scale3d[×${this.scaleFactor}]`;
    }

    toCommand(options = {}) {
        if (this.isMultiShape) {
            return new Scale3DCommand(
                this.graphExpression,
                this.shapeDataArray,
                this.scaleFactor,
                this.center,
                { ...options, isMultiShape: true }
            );
        }

        const geomType = this.handler.getGeometryType();
        const defaults = ExpressionOptionsRegistry.get(geomType);
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };

        return new Scale3DCommand(
            this.shapeExpression,
            this.originalShapeVarName,
            this.scaleFactor,
            this.center,
            this.handler,
            this.originalPoints,
            this.scaledPoints,
            mergedOpts,
            this.dependentScaledData  // Pass pre-computed dependent data
        );
    }

    canPlay() {
        if (this.isMultiShape) {
            return this.shapeDataArray.length > 0;
        }
        return this.scaledPoints.length > 0;
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
