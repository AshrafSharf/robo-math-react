/**
 * UnderbraceExpression - Draws a curly brace below a TextItem
 *
 * Example:
 *   Q = print(6, 4, "x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}")
 *   D = select(Q, "b^2 - 4ac")
 *   underbrace(D)
 *   underbrace(D, -10)
 *   underbrace(D, c(blue), s(3))
 *
 * Syntax:
 *   underbrace(T)                   - Draw underbrace below textItem T
 *   underbrace(T, buffer)           - With custom vertical buffer
 *   underbrace(T, c(blue))          - With color styling
 *   underbrace(T, 10, c(red), s(3)) - Buffer with styling
 *
 * Styling:
 *   c(color) - stroke color
 *   s(width) - stroke width
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { UnderbraceCommand } from '../../commands/UnderbraceCommand.js';

export class UnderbraceExpression extends AbstractNonArithmeticExpression {
    static NAME = 'underbrace';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.textItemVariableName = null;
        this.buffer = 5;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('underbrace() requires at least 1 argument: underbrace(T)');
        }

        // Arg 0: TextItem variable reference
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('underbrace() first argument must be a TextItem variable');
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
        return UnderbraceExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        const command = new UnderbraceCommand({
            textItemVariableName: this.textItemVariableName,
            buffer: this.buffer
        }, mergedOptions);

        return command;
    }

    canPlay() {
        return true;
    }
}
