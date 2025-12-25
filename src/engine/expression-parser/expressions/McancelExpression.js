/**
 * McancelExpression - Applies cancel strikethrough to TextItem(s)
 *
 * Syntax:
 *   mcancel(T, "text", "u")           - Cancel with text, up diagonal (default)
 *   mcancel(T, "text", "d")           - Cancel with down diagonal (bcancel)
 *   mcancel(T, "text", "x")           - Cancel with X (xcancel)
 *   mcancel(T, "text", "u", "red")    - With custom color
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
import { McancelCommand } from '../../commands/McancelCommand.js';

export class McancelExpression extends AbstractNonArithmeticExpression {
    static NAME = 'mcancel';

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
            this.dispatchError('mcancel() requires at least 3 arguments: mcancel(T, "text", "direction")');
        }

        // Arg 0: TextItem variable reference
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('mcancel() first argument must be a TextItem variable');
        }
        this.textItemVariableName = targetExpr.variableName;

        // Arg 1: Cancel text (what to show as replacement, e.g., "0" in cancelto)
        const textExpr = this.subExpressions[1];
        textExpr.resolve(context);
        const resolvedText = this._getResolvedExpression(context, textExpr);
        if (!resolvedText || resolvedText.getName() !== 'quotedstring') {
            this.dispatchError('mcancel() second argument must be a quoted string (cancel text)');
        }
        this.cancelText = resolvedText.getStringValue();

        // Arg 2: Direction
        const dirExpr = this.subExpressions[2];
        dirExpr.resolve(context);
        const resolvedDir = this._getResolvedExpression(context, dirExpr);
        if (!resolvedDir || resolvedDir.getName() !== 'quotedstring') {
            this.dispatchError('mcancel() third argument must be a quoted string (direction: "u", "d", or "x")');
        }
        const dir = resolvedDir.getStringValue().toLowerCase();
        if (!['u', 'd', 'x'].includes(dir)) {
            this.dispatchError('mcancel() direction must be "u", "d", or "x"');
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
        return McancelExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        return new McancelCommand({
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
