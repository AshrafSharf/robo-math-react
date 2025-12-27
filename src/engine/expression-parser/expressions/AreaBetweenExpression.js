/**
 * AreaBetween expression - represents the filled area between two plot curves
 * Syntax:
 *   areabetween(graph, plot1, plot2)                    - Default blue, 0.3 opacity
 *   areabetween(graph, plot1, plot2, "color")           - Custom color, 0.3 opacity
 *   areabetween(graph, plot1, plot2, "color", opacity)  - Custom color and opacity
 *
 * The area is filled between the two curves. Intersection points are calculated automatically.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { AreaBetweenCommand } from '../../commands/AreaBetweenCommand.js';
import { PlotExpression } from './PlotExpression.js';

export class AreaBetweenExpression extends AbstractNonArithmeticExpression {
    static NAME = 'areabetween';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.plotExpression1 = null;
        this.plotExpression2 = null;
        this.fillColor = 'blue';
        this.fillOpacity = 0.3;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('areabetween() requires at least 3 arguments: graph, plot1, plot2');
        }

        // First arg is graph reference
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        // Second arg is first plot variable reference
        this.subExpressions[1].resolve(context);
        const plotRef1 = this.subExpressions[1];

        // Get the first PlotExpression from context
        if (typeof plotRef1.getVariableName === 'function') {
            const varName = plotRef1.getVariableName();
            if (varName) {
                const ref = context.getReference(varName);
                if (ref instanceof PlotExpression) {
                    this.plotExpression1 = ref;
                } else {
                    this.dispatchError(`areabetween() second argument must be a plot variable, got: ${varName}`);
                }
            }
        }

        if (!this.plotExpression1) {
            this.dispatchError('areabetween() could not get first plot variable');
        }

        // Third arg is second plot variable reference
        this.subExpressions[2].resolve(context);
        const plotRef2 = this.subExpressions[2];

        // Get the second PlotExpression from context
        if (typeof plotRef2.getVariableName === 'function') {
            const varName = plotRef2.getVariableName();
            if (varName) {
                const ref = context.getReference(varName);
                if (ref instanceof PlotExpression) {
                    this.plotExpression2 = ref;
                } else {
                    this.dispatchError(`areabetween() third argument must be a plot variable, got: ${varName}`);
                }
            }
        }

        if (!this.plotExpression2) {
            this.dispatchError('areabetween() could not get second plot variable');
        }

        // Optional fourth arg is color (string)
        if (this.subExpressions.length >= 4) {
            this.subExpressions[3].resolve(context);
            const colorExpr = this.subExpressions[3];
            if (typeof colorExpr.getStringValue === 'function') {
                this.fillColor = colorExpr.getStringValue();
            }
        }

        // Optional fifth arg is opacity (number)
        if (this.subExpressions.length >= 5) {
            this.subExpressions[4].resolve(context);
            const opacityValues = this.subExpressions[4].getVariableAtomicValues();
            if (opacityValues.length > 0) {
                this.fillOpacity = opacityValues[0];
            }
        }
    }

    getName() {
        return AreaBetweenExpression.NAME;
    }

    getGeometryType() {
        return 'areabetween';
    }

    getVariableAtomicValues() {
        return [this.fillColor, this.fillOpacity];
    }

    /**
     * Create an AreaBetweenCommand from this expression
     * @param {Object} options - Command options
     * @returns {AreaBetweenCommand}
     */
    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        // Allow c() to override fill color
        const fillColor = mergedOptions.color || this.fillColor;
        // Get fresh compiled functions from plot expressions (supports change() updates)
        return new AreaBetweenCommand(
            this.graphExpression,
            this.plotExpression1.getCompiledFunction(),
            this.plotExpression2.getCompiledFunction(),
            fillColor,
            this.fillOpacity,
            mergedOptions
        );
    }

    /**
     * AreaBetween can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
