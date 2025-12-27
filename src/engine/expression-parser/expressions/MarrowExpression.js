/**
 * MarrowExpression - Draws a circle around TextItem and curved arrow
 *
 * Example:
 *   Q = print(6, 4, "x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}")
 *   D = select(Q, "b^2 - 4ac")
 *   marrow(D)
 *   marrow(D, "rm", "E", 50)
 *   marrow(D, "tm", "N", 80, 30, c(blue))
 *
 * Syntax:
 *   marrow(T)                                    - Default: right-middle anchor, East direction
 *   marrow(T, "anchor", "direction")             - Specify anchor and direction
 *   marrow(T, "anchor", "direction", length)     - With arrow length
 *   marrow(T, "anchor", "direction", length, curvature)  - With curvature
 *   marrow(T, ..., c(color), s(width))           - With styling
 *
 * Parameters:
 *   T          - TextItem variable reference
 *   anchor     - Anchor on TextItem: "tl", "tm", "tr", "lm", "rm", "bl", "bm", "br"
 *   direction  - Arrow direction: "N", "E", "S", "W"
 *   length     - Arrow length in pixels (default: 50)
 *   curvature  - Curve amount (default: 50)
 *
 * Styling:
 *   c(color) - stroke color
 *   s(width) - stroke width
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { MarrowCommand } from '../../commands/MarrowCommand.js';

export class MarrowExpression extends AbstractNonArithmeticExpression {
    static NAME = 'marrow';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.textItemVariableName = null;
        this.anchor = 'rm';
        this.direction = 'E';
        this.length = 50;
        this.curvature = 50;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('marrow() requires at least 1 argument: marrow(T)');
        }

        // Arg 0: TextItem variable reference
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('marrow() first argument must be a TextItem variable');
        }
        this.textItemVariableName = targetExpr.variableName;

        // Track position for non-style arguments
        let argIndex = 1;
        const styleExprs = [];

        // Process remaining arguments
        for (let i = 1; i < this.subExpressions.length; i++) {
            const expr = this.subExpressions[i];
            expr.resolve(context);

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                const resolved = this._getResolvedExpression(context, expr);

                // Check if it's a quoted string (anchor or direction)
                if (resolved && resolved.getName() === 'quotedstring') {
                    const strValue = resolved.getStringValue();
                    const upperValue = strValue.toUpperCase();

                    // Check if it's a direction
                    if (['N', 'E', 'S', 'W'].includes(upperValue)) {
                        this.direction = upperValue;
                    }
                    // Check if it's an anchor
                    else if (['TL', 'TM', 'TR', 'LM', 'RM', 'BL', 'BM', 'BR'].includes(upperValue)) {
                        this.anchor = strValue.toLowerCase();
                    }
                } else {
                    // Numeric value - could be length or curvature
                    const atomicValues = expr.getVariableAtomicValues();
                    if (atomicValues.length > 0) {
                        if (argIndex === 1) {
                            this.length = atomicValues[0];
                        } else if (argIndex === 2) {
                            this.curvature = atomicValues[0];
                        }
                        argIndex++;
                    }
                }
            }
        }

        // Parse styling expressions (c, s, f)
        this._parseStyleExpressions(styleExprs);
    }

    getName() {
        return MarrowExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        const command = new MarrowCommand({
            textItemVariableName: this.textItemVariableName,
            anchor: this.anchor,
            direction: this.direction,
            length: this.length,
            curvature: this.curvature
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
