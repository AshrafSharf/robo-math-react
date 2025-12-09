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
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('plot() requires at least 2 arguments: graph, equation');
        }

        // First arg is graph reference
        this.subExpressions[0].resolve(context);
        this.graphExpression = this.subExpressions[0];

        // Second arg is equation (should be a string/variable containing equation)
        this.subExpressions[1].resolve(context);
        const equationExpr = this.subExpressions[1];

        // Get the equation string - could be from getEquation() or as a string value
        if (typeof equationExpr.getEquation === 'function') {
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
    }

    getGrapher() {
        if (this.graphExpression && typeof this.graphExpression.getGrapher === 'function') {
            return this.graphExpression.getGrapher();
        }
        return null;
    }

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
     * Create a PlotCommand from this expression
     * @param {Object} options - Command options {strokeWidth}
     * @returns {PlotCommand}
     */
    toCommand(options = {}) {
        return new PlotCommand(
            this.getGrapher(),
            this.equation,
            this.domainMin,
            this.domainMax,
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
