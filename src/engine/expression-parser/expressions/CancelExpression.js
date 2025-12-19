/**
 * CancelExpression - Applies cancel strikethrough to TextItem(s)
 *
 * Syntax:
 *   cancel(T, "text", "u")           - Cancel with text, up diagonal (default)
 *   cancel(T, "text", "d")           - Cancel with down diagonal (bcancel)
 *   cancel(T, "text", "x")           - Cancel with X (xcancel)
 *   cancel(T, "text", "u", "red")    - With custom color
 *
 * Direction codes:
 *   "u" - up diagonal (\cancel, \cancelto)
 *   "d" - down diagonal (\bcancel)
 *   "x" - X pattern (\xcancel)
 *
 * If T is a TextItemCollection, applies cancel to each item.
 * Text is wrapped in \text{} if plain, used as LaTeX if contains special chars.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { CancelCommand } from '../../commands/CancelCommand.js';

export class CancelExpression extends AbstractNonArithmeticExpression {
    static NAME = 'cancel';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.textItemVariableName = null;
        this.cancelText = '';
        this.direction = 'u';  // default: up diagonal
        this.color = 'red';    // default: red
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('cancel() requires at least 3 arguments: cancel(T, "text", "direction")');
        }

        // Arg 0: TextItem variable reference
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('cancel() first argument must be a TextItem variable');
        }
        this.textItemVariableName = targetExpr.variableName;

        // Arg 1: Cancel text (what to show as replacement, e.g., "0" in cancelto)
        const textExpr = this.subExpressions[1];
        textExpr.resolve(context);
        const resolvedText = this._getResolvedExpression(context, textExpr);
        if (!resolvedText || resolvedText.getName() !== 'quotedstring') {
            this.dispatchError('cancel() second argument must be a quoted string (cancel text)');
        }
        this.cancelText = resolvedText.getStringValue();

        // Arg 2: Direction
        const dirExpr = this.subExpressions[2];
        dirExpr.resolve(context);
        const resolvedDir = this._getResolvedExpression(context, dirExpr);
        if (!resolvedDir || resolvedDir.getName() !== 'quotedstring') {
            this.dispatchError('cancel() third argument must be a quoted string (direction: "u", "d", or "x")');
        }
        const dir = resolvedDir.getStringValue().toLowerCase();
        if (!['u', 'd', 'x'].includes(dir)) {
            this.dispatchError('cancel() direction must be "u", "d", or "x"');
        }
        this.direction = dir;

        // Arg 3 (optional): Color
        if (this.subExpressions.length >= 4) {
            const colorExpr = this.subExpressions[3];
            colorExpr.resolve(context);
            const resolvedColor = this._getResolvedExpression(context, colorExpr);
            if (resolvedColor && resolvedColor.getName() === 'quotedstring') {
                this.color = resolvedColor.getStringValue();
            }
        }
    }

    getName() {
        return CancelExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        return new CancelCommand({
            textItemVariableName: this.textItemVariableName,
            cancelText: this.cancelText,
            direction: this.direction,
            color: this.color
        });
    }

    canPlay() {
        return true;
    }
}
