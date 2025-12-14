/**
 * Plot expression - represents a function plot
 * Syntax: plot(graph, equation) or plot(graph, equation, domainMin, domainMax)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PlotCommand } from '../../commands/PlotCommand.js';

export class PlotExpression extends AbstractNonArithmeticExpression {
    static NAME = 'plot';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.equation = '';
        this.domainMin = null;
        this.domainMax = null;
        this.scope = {};  // Variable scope for math.js evaluation
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('plot() requires at least 2 arguments: graph, equation');
        }

        // First arg is graph reference - resolve and store the actual expression
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        // Second arg is equation (should be a string/variable containing equation)
        this.subExpressions[1].resolve(context);
        const equationExpr = this.subExpressions[1];

        // Get the equation string - could be from various expression types
        if (typeof equationExpr.getStringValue === 'function') {
            // QuotedStringExpression - e.g., plot(g, "x^2")
            this.equation = equationExpr.getStringValue();
        } else if (typeof equationExpr.getEquation === 'function') {
            this.equation = equationExpr.getEquation();
        } else if (typeof equationExpr.getValue === 'function') {
            this.equation = equationExpr.getValue();
        } else {
            // Try to get it from atomic values or variable name
            const atomicValues = equationExpr.getVariableAtomicValues();
            if (atomicValues.length > 0) {
                this.equation = String(atomicValues[0]);
            }
        }

        // Optional domain arguments
        if (this.subExpressions.length >= 4) {
            this.subExpressions[2].resolve(context);
            this.subExpressions[3].resolve(context);

            const minValues = this.subExpressions[2].getVariableAtomicValues();
            const maxValues = this.subExpressions[3].getVariableAtomicValues();

            if (minValues.length > 0) this.domainMin = minValues[0];
            if (maxValues.length > 0) this.domainMax = maxValues[0];
        }

        // Extract all numeric variables from context for math.js scope
        // This allows expressions like: a=10, b=5, plot(g, a*x^2 + b)
        this.scope = context.getReferencesCopyAsPrimitiveValues();
    }

    // getGrapher() inherited from AbstractNonArithmeticExpression

    getName() {
        return PlotExpression.NAME;
    }

    getEquation() {
        return this.equation;
    }

    getDomain() {
        return { min: this.domainMin, max: this.domainMax };
    }

    getVariableAtomicValues() {
        return [this.equation, this.domainMin, this.domainMax];
    }

    /**
     * Get the variable scope for math.js evaluation
     * @returns {Object} Scope with variable values like {a: 10, b: 5}
     */
    getScope() {
        return this.scope;
    }

    /**
     * Create a PlotCommand from this expression
     * @param {Object} options - Command options {strokeWidth}
     * @returns {PlotCommand}
     */
    toCommand(options = {}) {
        return new PlotCommand(
            this.graphExpression,
            this.equation,
            this.domainMin,
            this.domainMax,
            this.scope,
            options
        );
    }

    /**
     * Plots can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
