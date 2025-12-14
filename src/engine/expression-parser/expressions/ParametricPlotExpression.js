/**
 * ParametricPlotExpression - represents a parametric function plot
 * Syntax: paraplot(graph, xExpr, yExpr, tMin, tMax)
 * Example: paraplot(g, "cos(t)", "sin(t)", 0, 6.28)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { ParametricPlotCommand } from '../../commands/ParametricPlotCommand.js';

export class ParametricPlotExpression extends AbstractNonArithmeticExpression {
    static NAME = 'paraplot';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.xEquation = '';  // x(t) expression
        this.yEquation = '';  // y(t) expression
        this.tMin = 0;
        this.tMax = 2 * Math.PI;
        this.scope = {};  // Variable scope for math.js evaluation
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('paraplot() requires at least 3 arguments: graph, xExpr, yExpr');
        }

        // First arg is graph reference - resolve and store the actual expression
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        // Second arg is x equation
        this.subExpressions[1].resolve(context);
        const xExpr = this.subExpressions[1];
        this.xEquation = this._extractEquationString(xExpr);

        // Third arg is y equation
        this.subExpressions[2].resolve(context);
        const yExpr = this.subExpressions[2];
        this.yEquation = this._extractEquationString(yExpr);

        // Optional t range arguments (tMin, tMax)
        if (this.subExpressions.length >= 5) {
            this.subExpressions[3].resolve(context);
            this.subExpressions[4].resolve(context);

            const minValues = this.subExpressions[3].getVariableAtomicValues();
            const maxValues = this.subExpressions[4].getVariableAtomicValues();

            if (minValues.length > 0) this.tMin = minValues[0];
            if (maxValues.length > 0) this.tMax = maxValues[0];
        }

        // Extract all numeric variables from context for math.js scope
        // This allows expressions like: a=2, paraplot(g, "a*cos(t)", "a*sin(t)", 0, 6.28)
        this.scope = context.getReferencesCopyAsPrimitiveValues();
    }

    /**
     * Extract equation string from various expression types
     * @param {Object} expr - Expression object
     * @returns {string} Equation string
     */
    _extractEquationString(expr) {
        if (typeof expr.getStringValue === 'function') {
            // QuotedStringExpression - e.g., "cos(t)"
            return expr.getStringValue();
        } else if (typeof expr.getEquation === 'function') {
            return expr.getEquation();
        } else if (typeof expr.getValue === 'function') {
            return expr.getValue();
        } else {
            // Try to get it from atomic values
            const atomicValues = expr.getVariableAtomicValues();
            if (atomicValues.length > 0) {
                return String(atomicValues[0]);
            }
        }
        return '';
    }

    getName() {
        return ParametricPlotExpression.NAME;
    }

    getXEquation() {
        return this.xEquation;
    }

    getYEquation() {
        return this.yEquation;
    }

    getTRange() {
        return { min: this.tMin, max: this.tMax };
    }

    getVariableAtomicValues() {
        return [this.xEquation, this.yEquation, this.tMin, this.tMax];
    }

    /**
     * Get the variable scope for math.js evaluation
     * @returns {Object} Scope with variable values like {a: 10, b: 5}
     */
    getScope() {
        return this.scope;
    }

    /**
     * Create a ParametricPlotCommand from this expression
     * @param {Object} options - Command options {strokeWidth}
     * @returns {ParametricPlotCommand}
     */
    toCommand(options = {}) {
        return new ParametricPlotCommand(
            this.graphExpression,
            this.xEquation,
            this.yEquation,
            this.tMin,
            this.tMax,
            this.scope,
            options
        );
    }

    /**
     * Parametric plots can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
