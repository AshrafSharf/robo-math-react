/**
 * AreaUnder expression - represents the filled area under a plot curve
 * Syntax:
 *   areaunder(graph, plotVar, xmin, xmax)                    - Default blue, 0.3 opacity
 *   areaunder(graph, plotVar, xmin, xmax, "color")           - Custom color, 0.3 opacity
 *   areaunder(graph, plotVar, xmin, xmax, "color", opacity)  - Custom color and opacity
 *
 * The area is filled between the curve and the x-axis (y=0).
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { AreaUnderCommand } from '../../commands/AreaUnderCommand.js';
import { PlotExpression } from './PlotExpression.js';

export class AreaUnderExpression extends AbstractNonArithmeticExpression {
    static NAME = 'areaunder';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.plotExpression = null;
        this.xmin = null;
        this.xmax = null;
        this.fillColor = 'blue';
        this.fillOpacity = 0.3;
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('areaunder() requires at least 4 arguments: graph, plotVariable, xmin, xmax');
        }

        // First arg is graph reference
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        // Second arg is plot variable reference
        this.subExpressions[1].resolve(context);
        const plotRef = this.subExpressions[1];

        // Get the PlotExpression from context
        if (typeof plotRef.getVariableName === 'function') {
            const varName = plotRef.getVariableName();
            if (varName) {
                const ref = context.getReference(varName);
                if (ref instanceof PlotExpression) {
                    this.plotExpression = ref;
                } else {
                    this.dispatchError(`areaunder() second argument must be a plot variable, got: ${varName}`);
                }
            }
        }

        if (!this.plotExpression) {
            this.dispatchError('areaunder() could not get plot variable');
        }

        // Third arg is xmin
        this.subExpressions[2].resolve(context);
        const xminValues = this.subExpressions[2].getVariableAtomicValues();
        if (xminValues.length > 0) {
            this.xmin = xminValues[0];
        }

        // Fourth arg is xmax
        this.subExpressions[3].resolve(context);
        const xmaxValues = this.subExpressions[3].getVariableAtomicValues();
        if (xmaxValues.length > 0) {
            this.xmax = xmaxValues[0];
        }

        // Optional fifth arg is color (string)
        if (this.subExpressions.length >= 5) {
            this.subExpressions[4].resolve(context);
            const colorExpr = this.subExpressions[4];
            if (typeof colorExpr.getStringValue === 'function') {
                this.fillColor = colorExpr.getStringValue();
            }
        }

        // Optional sixth arg is opacity (number)
        if (this.subExpressions.length >= 6) {
            this.subExpressions[5].resolve(context);
            const opacityValues = this.subExpressions[5].getVariableAtomicValues();
            if (opacityValues.length > 0) {
                this.fillOpacity = opacityValues[0];
            }
        }
    }

    getName() {
        return AreaUnderExpression.NAME;
    }

    getGeometryType() {
        return 'areaunder';
    }

    getVariableAtomicValues() {
        return [this.xmin, this.xmax, this.fillColor, this.fillOpacity];
    }

    /**
     * Create an AreaUnderCommand from this expression
     * @param {Object} options - Command options
     * @returns {AreaUnderCommand}
     */
    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        // Allow c() to override fill color
        const fillColor = mergedOptions.color || this.fillColor;
        // Get fresh compiled function from plot expression (supports change() updates)
        return new AreaUnderCommand(
            this.graphExpression,
            this.plotExpression.getCompiledFunction(),
            this.xmin,
            this.xmax,
            fillColor,
            this.fillOpacity,
            mergedOptions
        );
    }

    /**
     * AreaUnder can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
