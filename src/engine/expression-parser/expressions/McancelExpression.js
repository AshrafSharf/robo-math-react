/**
 * McancelExpression - Applies cancel strikethrough to TextItem(s)
 *
 * Example:
 *   Q = print(6, 4, "x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}")
 *   D = select(Q, "b^2 - 4ac")
 *   mcancel(D)
 *   mcancel(D, "u")
 *   mcancel(D, "x", c(blue), s(3))
 *
 * Syntax:
 *   mcancel(T)                    - Cancel with down diagonal (default)
 *   mcancel(T, "u")               - Cancel with up diagonal
 *   mcancel(T, "d")               - Cancel with down diagonal
 *   mcancel(T, "x")               - Cancel with X pattern
 *   mcancel(T, c(blue))           - With color styling
 *   mcancel(T, "u", c(red), s(3)) - Direction with styling
 *
 * Direction codes:
 *   "u" - up diagonal (bottom-left to top-right)
 *   "d" - down diagonal (top-left to bottom-right) - DEFAULT
 *   "x" - X pattern (both diagonals)
 *
 * Styling:
 *   c(color) - stroke color
 *   s(width) - stroke width
 *
 * If T is a TextItemCollection, applies cancel to each item.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { McancelCommand } from '../../commands/McancelCommand.js';

export class McancelExpression extends AbstractNonArithmeticExpression {
    static NAME = 'mcancel';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.textItemVariableName = null;
        this.direction = 'd';  // default: down diagonal
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('mcancel() requires at least 1 argument: mcancel(T)');
        }

        // Arg 0: TextItem variable reference
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('mcancel() first argument must be a TextItem variable');
        }
        this.textItemVariableName = targetExpr.variableName;

        // Remaining args: direction string and/or styling expressions
        const styleExprs = [];

        for (let i = 1; i < this.subExpressions.length; i++) {
            const expr = this.subExpressions[i];
            expr.resolve(context);

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                // Check if it's a direction string
                const resolved = this._getResolvedExpression(context, expr);
                if (resolved && resolved.getName() === 'quotedstring') {
                    const dir = resolved.getStringValue().toLowerCase();
                    if (['u', 'd', 'x'].includes(dir)) {
                        this.direction = dir;
                    }
                }
            }
        }

        // Parse styling expressions (c, s, f)
        this._parseStyleExpressions(styleExprs);
    }

    getName() {
        return McancelExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        const command = new McancelCommand({
            textItemVariableName: this.textItemVariableName,
            direction: this.direction
        }, mergedOptions);

        return command;
    }

    canPlay() {
        return true;
    }
}
