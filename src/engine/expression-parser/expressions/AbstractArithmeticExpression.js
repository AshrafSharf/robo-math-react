/**
 * Base class for arithmetic expressions
 */
import { ExpressionError } from '../core/ExpressionError.js';
import { MathUtils } from '../utils/MathUtils.js';

export class AbstractArithmeticExpression {
    constructor() {
        this.resultantExpression = null;
        this.expressionId = -1;
        this.commandText = '';
        // Optional styling (overrides settings if provided)
        this.fontSize = null;
        this.color = null;
        this.strokeWidth = null;
        this.fillColor = null;
        this.strokeOpacity = null;
        this.fillOpacity = null;
    }

    getExpressionId() {
        return this.expressionId;
    }

    setExpressionId(expressionId) {
        this.expressionId = expressionId;
    }

    setExpressionCommandText(commandText) {
        this.commandText = commandText;
    }

    getExpressionCommandText() {
        return this.commandText;
    }

    resolve(context) {
        // To be implemented by subclasses
    }

    getName() {
        return 'Abstract';
    }

    alwaysExecute() {
        return false;
    }

    add(otherExpression) {
        const lhsAtomicValues = this.getVariableAtomicValues();
        const rhsAtomicValues = otherExpression.getVariableAtomicValues();

        // Import dynamically to avoid circular dependencies
        const NumericExpression = this.constructor.NumericExpression;
        const PointExpression = this.constructor.PointExpression;

        if (lhsAtomicValues.length === 1 && rhsAtomicValues.length === 1) {
            this.resultantExpression = new NumericExpression(lhsAtomicValues[0] + rhsAtomicValues[0]);
        } else if (lhsAtomicValues.length === 2 && rhsAtomicValues.length === 2) {
            const xValue = new NumericExpression(lhsAtomicValues[0] + rhsAtomicValues[0]);
            const yValue = new NumericExpression(lhsAtomicValues[1] + rhsAtomicValues[1]);
            this.resultantExpression = new PointExpression([xValue, yValue]);
        }
        return this.resultantExpression;
    }

    subtract(otherExpression) {
        const lhsAtomicValues = this.getVariableAtomicValues();
        const rhsAtomicValues = otherExpression.getVariableAtomicValues();

        const NumericExpression = this.constructor.NumericExpression;
        const PointExpression = this.constructor.PointExpression;

        if (lhsAtomicValues.length === 1 && rhsAtomicValues.length === 1) {
            this.resultantExpression = new NumericExpression(lhsAtomicValues[0] - rhsAtomicValues[0]);
        } else if (lhsAtomicValues.length === 2 && rhsAtomicValues.length === 2) {
            const xValue = new NumericExpression(lhsAtomicValues[0] - rhsAtomicValues[0]);
            const yValue = new NumericExpression(lhsAtomicValues[1] - rhsAtomicValues[1]);
            this.resultantExpression = new PointExpression([xValue, yValue]);
        }
        return this.resultantExpression;
    }

    divide(otherExpression) {
        const lhsAtomicValues = this.getVariableAtomicValues();
        const rhsAtomicValues = otherExpression.getVariableAtomicValues();

        const NumericExpression = this.constructor.NumericExpression;
        const PointExpression = this.constructor.PointExpression;

        // Numeric / Numeric
        if (lhsAtomicValues.length === 1 && rhsAtomicValues.length === 1) {
            this.resultantExpression = new NumericExpression(lhsAtomicValues[0] / rhsAtomicValues[0]);
        }
        // Point / Scalar
        else if (lhsAtomicValues.length === 2 && rhsAtomicValues.length === 1) {
            const divisor = rhsAtomicValues[0];
            const xValue = new NumericExpression(lhsAtomicValues[0] / divisor);
            const yValue = new NumericExpression(lhsAtomicValues[1] / divisor);
            const pointExpr = new PointExpression([xValue, yValue]);
            pointExpr.point = { x: xValue.getNumericValue(), y: yValue.getNumericValue() };
            this.resultantExpression = pointExpr;
        }
        else {
            this.dispatchError('Cannot divide these values');
        }

        return this.resultantExpression;
    }

    multiply(otherExpression) {
        const lhsAtomicValues = this.getVariableAtomicValues();
        const rhsAtomicValues = otherExpression.getVariableAtomicValues();

        const NumericExpression = this.constructor.NumericExpression;
        const PointExpression = this.constructor.PointExpression;

        // Numeric * Numeric
        if (lhsAtomicValues.length === 1 && rhsAtomicValues.length === 1) {
            this.resultantExpression = new NumericExpression(lhsAtomicValues[0] * rhsAtomicValues[0]);
        }
        // Point * Scalar or Scalar * Point
        else if (lhsAtomicValues.length === 2 && rhsAtomicValues.length === 1) {
            const scalar = rhsAtomicValues[0];
            const xValue = new NumericExpression(lhsAtomicValues[0] * scalar);
            const yValue = new NumericExpression(lhsAtomicValues[1] * scalar);
            const pointExpr = new PointExpression([xValue, yValue]);
            pointExpr.point = { x: xValue.getNumericValue(), y: yValue.getNumericValue() };
            this.resultantExpression = pointExpr;
        }
        else if (lhsAtomicValues.length === 1 && rhsAtomicValues.length === 2) {
            const scalar = lhsAtomicValues[0];
            const xValue = new NumericExpression(scalar * rhsAtomicValues[0]);
            const yValue = new NumericExpression(scalar * rhsAtomicValues[1]);
            const pointExpr = new PointExpression([xValue, yValue]);
            pointExpr.point = { x: xValue.getNumericValue(), y: yValue.getNumericValue() };
            this.resultantExpression = pointExpr;
        }
        else {
            this.dispatchError('Cannot multiply these values');
        }

        return this.resultantExpression;
    }

    power(otherExpression) {
        const lhsAtomicValues = this.getVariableAtomicValues();
        const rhsAtomicValues = otherExpression.getVariableAtomicValues();

        if (lhsAtomicValues.length !== 1 || rhsAtomicValues.length !== 1) {
            this.dispatchError('Not a numerical value');
        }

        const NumericExpression = this.constructor.NumericExpression;
        this.resultantExpression = new NumericExpression(Math.pow(lhsAtomicValues[0], rhsAtomicValues[0]));
        return this.resultantExpression;
    }

    getVariableAtomicValues() {
        return this.resultantExpression?.getVariableAtomicValues() || [];
    }

    dispatchError(errMessage) {
        const expressionError = new ExpressionError(this.getExpressionId(), 'Expression Error', errMessage);
        throw expressionError;
    }

    getStartValue() {
        return [];
    }

    getEndValue() {
        return [];
    }

    equals(other) {
        if (!other) return false;

        const currentExp = this.getComparableExpression();
        const otherExp = other.getComparableExpression();

        if (currentExp.getName() !== otherExp.getName()) return false;
        if (this.getLabel() !== other.getLabel()) return false;

        const currentAtomicValues = currentExp.getVariableAtomicValues();
        const otherAtomicValues = otherExp.getVariableAtomicValues();

        if (currentAtomicValues.length === otherAtomicValues.length) {
            for (let i = 0; i < currentAtomicValues.length; i++) {
                if (!MathUtils.isEqual(currentAtomicValues[i], otherAtomicValues[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    getComparableExpression() {
        return this;
    }

    getLabel() {
        return '';
    }

    reverse() {
        return null;
    }

    getTraceableCoordinates() {
        return this.getVariableAtomicValues();
    }

    getIndexedVariableAtomicValues(index) {
        return this.getVariableAtomicValues();
    }

    /**
     * Returns whether this expression can be played (animated).
     * Override in subclasses that represent playable shapes.
     * @returns {boolean}
     */
    canPlay() {
        return false;
    }

    /**
     * Get resolved expression (dereference variable references)
     * @param {Object} context - The expression context
     * @param {Object} expr - The expression to resolve
     * @returns {Object} The resolved expression
     */
    _getResolvedExpression(context, expr) {
        if (expr.getName() === 'variable') {
            const varName = expr.getVariableName();
            return context.getReference(varName) || expr;
        }
        return expr;
    }

    /**
     * Get the grapher from direct graphExpression.
     * @returns {Grapher|null}
     */
    getGrapher() {
        if (this.graphExpression && typeof this.graphExpression.getGrapher === 'function') {
            return this.graphExpression.getGrapher();
        }
        return null;
    }

    /**
     * Parse styling expressions (c, f, s, fc, so, fo) from resolved sub-expressions
     * @param {Array} expressions - Array of resolved expressions to check
     */
    _parseStyleExpressions(expressions) {
        for (const expr of expressions) {
            const name = expr.getName && expr.getName();
            if (name === 'c') {
                this.color = expr.getColorValue();
            } else if (name === 'f') {
                this.fontSize = expr.getFontSizeValue();
            } else if (name === 's') {
                this.strokeWidth = expr.getStrokeWidthValue();
            } else if (name === 'fc') {
                this.fillColor = expr.getFillColorValue();
            } else if (name === 'so') {
                this.strokeOpacity = expr.getStrokeOpacityValue();
            } else if (name === 'fo') {
                this.fillOpacity = expr.getFillOpacityValue();
            }
        }
    }

    /**
     * Check if expression is a styling expression (c, f, s, fc, so, fo)
     * @param {Object} expr - Expression to check
     * @returns {boolean}
     */
    _isStyleExpression(expr) {
        const name = expr.getName && expr.getName();
        return name === 'c' || name === 'f' || name === 's' ||
               name === 'fc' || name === 'so' || name === 'fo';
    }

    /**
     * Get style options dict parsed from c(), s(), f(), fc(), so(), fo() expressions
     * @returns {Object} Style options {color, strokeWidth, fontSize, fillColor, strokeOpacity, fillOpacity}
     */
    getStyleOptions() {
        const options = {};
        if (this.color != null) options.color = this.color;
        if (this.strokeWidth != null) options.strokeWidth = this.strokeWidth;
        if (this.fontSize != null) options.fontSize = this.fontSize;
        if (this.fillColor != null) options.fillColor = this.fillColor;
        if (this.strokeOpacity != null) options.strokeOpacity = this.strokeOpacity;
        if (this.fillOpacity != null) options.fillOpacity = this.fillOpacity;
        return options;
    }
}

// Static references to be set later to avoid circular dependencies
AbstractArithmeticExpression.NumericExpression = null;
AbstractArithmeticExpression.PointExpression = null;
