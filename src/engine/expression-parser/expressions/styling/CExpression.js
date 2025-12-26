/**
 * CExpression - Color styling expression
 *
 * Syntax: c(red), c(blue), c("#ff0000")
 * No quotes needed for common color names
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class CExpression extends AbstractNonArithmeticExpression {
    static NAME = 'c';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.colorValue = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('c() requires a color value: c(red) or c("#ff0000")');
        }

        const colorExpr = this.subExpressions[0];
        colorExpr.resolve(context);

        // Handle variable name as color (e.g., c(red) where red is parsed as variable)
        if (colorExpr.variableName) {
            this.colorValue = colorExpr.variableName;
        } else if (typeof colorExpr.getStringValue === 'function') {
            this.colorValue = colorExpr.getStringValue();
        } else {
            this.dispatchError('c() requires a color name or hex value');
        }
    }

    getName() {
        return CExpression.NAME;
    }

    getColorValue() {
        return this.colorValue;
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
