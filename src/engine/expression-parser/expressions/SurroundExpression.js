/**
 * SurroundExpression - Draws a rectangle around a TextItem
 *
 * Example:
 *   Q = print(6, 4, "x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}")
 *   D = select(Q, "b^2 - 4ac")
 *   surround(D)
 *   surround(D, c(red), s(3))
 *
 * Syntax:
 *   surround(T)                - Draw rectangle around textItem T
 *   surround(T, c(blue))       - With color styling
 *   surround(T, c(red), s(3))  - With color and stroke width
 *
 * Styling:
 *   c(color) - stroke color
 *   s(width) - stroke width
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { SurroundCommand } from '../../commands/SurroundCommand.js';

export class SurroundExpression extends AbstractNonArithmeticExpression {
    static NAME = 'surround';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.textItemVariableName = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('surround() requires at least 1 argument: surround(T)');
        }

        // Arg 0: TextItem variable reference
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('surround() first argument must be a TextItem variable');
        }
        this.textItemVariableName = targetExpr.variableName;

        // Remaining args: styling expressions
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            const expr = this.subExpressions[i];
            expr.resolve(context);

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            }
        }

        // Parse styling expressions (c, s, f)
        this._parseStyleExpressions(styleExprs);
    }

    getName() {
        return SurroundExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        const command = new SurroundCommand({
            textItemVariableName: this.textItemVariableName
        });

        // Apply styling from expressions
        if (this.color) command.color = this.color;
        if (this.strokeWidth) command.strokeWidth = this.strokeWidth;

        return command;
    }

    canPlay() {
        return true;
    }
}
