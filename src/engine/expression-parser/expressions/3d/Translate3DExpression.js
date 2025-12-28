/**
 * Translate3DExpression - animates translating 3D shape(s) by (dx, dy, dz)
 *
 * Syntax:
 *   translate3d(shapeVar, dx, dy, dz)              - single shape
 *   translate3d(shapeVar, deltaVector)             - single shape, delta as vector
 *   translate3d(s1, s2, ..., dx, dy, dz)           - multiple shapes (parallel animation)
 *   translate3d(s1, s2, ..., deltaVector)          - multiple shapes with vector delta
 *
 * Creates new shape(s) at the translated position with slide animation.
 * Original shapes remain visible.
 * When translating multiple shapes, returns a Shape3DCollection.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 3, 0, 0)
 *   translate3d(V, 1, 2, 3)                   // single shape
 *   translate3d(V1, V2, L1, 1, 2, 3)          // multiple mixed shapes
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { AssignmentExpression } from '../AssignmentExpression.js';
import { Translate3DCommand } from '../../../commands/3d/Translate3DCommand.js';
import { vectorTranslateHandler } from '../../../../3d/common/translate-handlers/vector_translate_handler.js';
import { lineTranslateHandler } from '../../../../3d/common/translate-handlers/line_translate_handler.js';
import { pointTranslateHandler } from '../../../../3d/common/translate-handlers/point_translate_handler.js';
import { translatePoints3D } from '../../../../3d/common/translate_utils.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';
import { getOrderedDependents } from '../../../utils/DependencyTrackingUtil.js';

// Handler registry for supported 3D shape types
const TRANSLATE_HANDLERS = {
    'vector3d': vectorTranslateHandler,
    'line3d': lineTranslateHandler,
    'point3d': pointTranslateHandler
};

export class Translate3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'translate3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;

        // Single shape mode
        this.shapeExpression = null;
        this.graphExpression = null;
        this.originalShapeVarName = null;
        this.handler = null;
        this.originalPoints = [];
        this.translatedPoints = [];
        this.coordinates = [];

        // Common
        this.delta = { dx: 0, dy: 0, dz: 0 };

        // Multi-shape mode
        this.isMultiShape = false;
        this.shapeDataArray = [];

        // Pre-computed dependent translated data (single shape mode)
        this.dependentTranslatedData = [];  // [{label, handler, originalPoints, translatedPoints, varName}, ...]
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('translate3d() requires at least 2 arguments');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // Find delta by examining args from end
        const { deltaIndex, delta } = this._findDelta(context);
        this.delta = delta;

        // Shape args are from index 0 to deltaIndex-1
        const shapeCount = deltaIndex;
        if (shapeCount < 1) {
            this.dispatchError('translate3d() requires at least one shape');
        }

        this.isMultiShape = shapeCount > 1;

        if (this.isMultiShape) {
            this._resolveMultiShape(context, shapeCount);
        } else {
            this._resolveSingleShape(context);
        }
    }

    /**
     * Find delta index and values by examining args from end
     */
    _findDelta(context) {
        const len = this.subExpressions.length;

        // Check last arg
        const lastExpr = this._getResolvedExpression(context, this.subExpressions[len - 1]);
        const lastValues = lastExpr.getVariableAtomicValues();

        // If last arg has 6 values, it's a vector (use direction as delta)
        if (lastValues.length >= 6) {
            return {
                deltaIndex: len - 1,
                delta: {
                    dx: lastValues[3] - lastValues[0],
                    dy: lastValues[4] - lastValues[1],
                    dz: lastValues[5] - lastValues[2]
                }
            };
        }

        // If last arg has 3 values, it's a point3d as delta
        if (lastValues.length >= 3) {
            return {
                deltaIndex: len - 1,
                delta: { dx: lastValues[0], dy: lastValues[1], dz: lastValues[2] }
            };
        }

        // Check if last 3 args are single numbers (dx, dy, dz)
        if (len >= 4 && lastValues.length === 1) {
            const secondLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 2]);
            const thirdLastExpr = this._getResolvedExpression(context, this.subExpressions[len - 3]);
            const secondLastValues = secondLastExpr.getVariableAtomicValues();
            const thirdLastValues = thirdLastExpr.getVariableAtomicValues();

            if (secondLastValues.length === 1 && thirdLastValues.length === 1) {
                return {
                    deltaIndex: len - 3,
                    delta: {
                        dx: thirdLastValues[0],
                        dy: secondLastValues[0],
                        dz: lastValues[0]
                    }
                };
            }
        }

        this.dispatchError('translate3d() requires delta as (dx, dy, dz) or deltaVector');
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
        this.handler = TRANSLATE_HANDLERS[shapeType];

        if (!this.handler) {
            this.dispatchError(`translate3d() does not support shape type: ${shapeType}. Supported: ${Object.keys(TRANSLATE_HANDLERS).join(', ')}`);
        }

        this.originalPoints = this.handler.getPoints(this.shapeExpression);
        this.translatedPoints = translatePoints3D(this.originalPoints, this.delta);

        this.coordinates = [];
        for (const point of this.translatedPoints) {
            this.coordinates.push(point.x, point.y, point.z);
        }

        // Find dependents and pre-compute their translated data
        if (this.originalShapeVarName) {
            const orderedDependents = getOrderedDependents(context, this.originalShapeVarName);
            this.dependentTranslatedData = [];

            for (const { expr, label } of orderedDependents) {
                if (!label) continue;
                if (expr === this) continue;  // Skip self to avoid infinite recursion

                expr.resolve(context);
                const cmdExpr = this._getCommandableExpr(expr);
                if (!cmdExpr) continue;

                const shapeType = cmdExpr.getGeometryType?.() || cmdExpr.getName();
                const handler = TRANSLATE_HANDLERS[shapeType];
                if (!handler) continue;

                const originalPoints = handler.getPoints(cmdExpr);
                const translatedPoints = translatePoints3D(originalPoints, this.delta);

                this.dependentTranslatedData.push({
                    label,
                    handler,
                    originalPoints,
                    translatedPoints,
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
            const handler = TRANSLATE_HANDLERS[shapeType];

            if (!handler) {
                this.dispatchError(`translate3d() does not support shape type: ${shapeType}`);
            }

            const originalPoints = handler.getPoints(shapeExpr);
            const translatedPoints = translatePoints3D(originalPoints, this.delta);

            this.shapeDataArray.push({
                shapeExpression: shapeExpr,
                handler,
                originalPoints,
                translatedPoints,
                varName
            });
        }
    }

    getName() {
        return Translate3DExpression.NAME;
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
        if (this.translatedPoints.length >= 2) {
            return [this.translatedPoints[0], this.translatedPoints[1]];
        }
        return this.translatedPoints;
    }

    getVector() {
        if (this.translatedPoints.length >= 2) {
            return { start: this.translatedPoints[0], end: this.translatedPoints[1] };
        }
        return null;
    }

    getStartValue() {
        return this.translatedPoints.length > 0
            ? [this.translatedPoints[0].x, this.translatedPoints[0].y, this.translatedPoints[0].z]
            : [];
    }

    getEndValue() {
        return this.translatedPoints.length > 1
            ? [this.translatedPoints[1].x, this.translatedPoints[1].y, this.translatedPoints[1].z]
            : [];
    }

    getFriendlyToStr() {
        if (this.isMultiShape) {
            const names = this.shapeDataArray.map(s => s.varName || 'shape').join(', ');
            return `translate3d[${names}, (${this.delta.dx}, ${this.delta.dy}, ${this.delta.dz})]`;
        }
        const pts = this.translatedPoints;
        if (pts.length >= 2) {
            return `translate3d[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
        }
        return `translate3d[(${this.delta.dx}, ${this.delta.dy}, ${this.delta.dz})]`;
    }

    toCommand(options = {}) {
        if (this.isMultiShape) {
            return new Translate3DCommand(
                this.graphExpression,
                this.shapeDataArray,
                this.delta,
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

        return new Translate3DCommand(
            this.shapeExpression,
            this.originalShapeVarName,
            this.delta,
            this.handler,
            this.originalPoints,
            this.translatedPoints,
            mergedOpts,
            this.dependentTranslatedData  // Pass pre-computed dependent data
        );
    }

    canPlay() {
        if (this.isMultiShape) {
            return this.shapeDataArray.length > 0;
        }
        return this.translatedPoints.length > 0;
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
