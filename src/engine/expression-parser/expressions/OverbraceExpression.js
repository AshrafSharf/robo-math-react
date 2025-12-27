/**
 * OverbraceExpression - Draws a curly brace above a TextItem
 *
 * Example:
 *   Q = print(6, 4, "x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}")
 *   D = select(Q, "b^2 - 4ac")
 *   overbrace(D)
 *   overbrace(D, 10)
 *   overbrace(D, c(blue), s(3))
 *
 * Syntax:
 *   overbrace(T)                   - Draw overbrace above textItem T
 *   overbrace(T, buffer)           - With custom vertical buffer
 *   overbrace(T, c(blue))          - With color styling
 *   overbrace(T, 10, c(red), s(3)) - Buffer with styling
 *
 * Styling:
 *   c(color) - stroke color
 *   s(width) - stroke width
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { OverbraceCommand } from '../../commands/OverbraceCommand.js';

export class OverbraceExpression extends AbstractNonArithmeticExpression {
    static NAME = 'overbrace';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.textItemVariableName = null;
        this.buffer = 5;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('overbrace() requires at least 1 argument: overbrace(T)');
        }

        // Arg 0: TextItem variable reference
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('overbrace() first argument must be a TextItem variable');
        }
        this.textItemVariableName = targetExpr.variableName;

        // Remaining args: buffer (numeric) and/or styling expressions
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            const expr = this.subExpressions[i];
            expr.resolve(context);

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                // Check if it's a numeric value (buffer)
                const atomicValues = expr.getVariableAtomicValues();
                if (atomicValues.length > 0) {
                    this.buffer = atomicValues[0];
                }
            }
        }

        // Parse styling expressions (c, s, f)
        this._parseStyleExpressions(styleExprs);
    }

    getName() {
        return OverbraceExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        const command = new OverbraceCommand({
            textItemVariableName: this.textItemVariableName,
            buffer: this.buffer
        }, mergedOptions);

        return command;
    }

    canPlay() {
        return true;
    }
}
