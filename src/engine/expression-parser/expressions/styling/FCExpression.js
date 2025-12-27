/**
 * FCExpression - Fill Color styling expression
 *
 * Syntax: fc(red), fc(blue), fc("#ff0000")
 * No quotes needed for common color names
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class FCExpression extends AbstractNonArithmeticExpression {
    static NAME = 'fc';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.fillColorValue = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('fc() requires a color value: fc(red) or fc("#ff0000")');
        }

        const colorExpr = this.subExpressions[0];
        colorExpr.resolve(context);

        // Handle variable name as color (e.g., fc(red) where red is parsed as variable)
        if (colorExpr.variableName) {
            this.fillColorValue = colorExpr.variableName;
        } else if (typeof colorExpr.getStringValue === 'function') {
            this.fillColorValue = colorExpr.getStringValue();
        } else {
            this.dispatchError('fc() requires a color name or hex value');
        }
    }

    getName() {
        return FCExpression.NAME;
    }

    getFillColorValue() {
        return this.fillColorValue;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
