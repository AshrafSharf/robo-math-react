/**
 * Base class for non-arithmetic expressions
 */
import { ExpressionError } from '../core/ExpressionError.js';
import { MathUtils } from '../utils/MathUtils.js';
import { NumericExpression } from './NumericExpression.js';

export class AbstractNonArithmeticExpression {
    constructor() {
        this.expressionId = -1;
        this.commandText = '';
        this.label = '';  // Assigned variable name (for dependency traversal)
        // Optional styling (overrides settings if provided)
        this.fontSize = null;
        this.color = null;
        this.strokeWidth = null;
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

    add(otherExpression) {
        return null;
    }

    subtract(otherExpression) {
        return null;
    }

    divide(otherExpression) {
        return null;
    }

    multiply(otherExpression) {
        if (otherExpression instanceof NumericExpression) {
            const numValue = otherExpression.getNumericValue();
            if (numValue === -1) {
                return this.reverse();
            }
        }
        return null;
    }

    power(otherExpression) {
        return null;
    }

    getVariableAtomicValues() {
        return [];
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

    alwaysExecute() {
        return false;
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

    setLabel(label) {
        this.label = label;
    }

    getLabel() {
        return this.label;
    }

    reverse() {
        this.dispatchError('The object doesnt support reverse option');
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
     * Parse styling expressions (c, f, s) from resolved sub-expressions
     * Call this after parsing required arguments to extract optional styling
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
            }
        }
    }

    /**
     * Check if expression is a styling expression (c, f, or s)
     * @param {Object} expr - Expression to check
     * @returns {boolean}
     */
    _isStyleExpression(expr) {
        const name = expr.getName && expr.getName();
        return name === 'c' || name === 'f' || name === 's';
    }
}
