/**
 * MsubExpression - Substitutes a TextItem with new LaTeX content
 *
 * Syntax:
 *   msub(T, "latex")                      - Substitute using variable
 *   msub(item(collection, i), "latex")    - Substitute using inline item
 *   msub(select(M, "pattern"), "latex")   - Substitute using inline select
 *
 * Fades out the target TextItem and reveals new math at the same position.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { ReplaceTextItemCommand } from '../../commands/ReplaceTextItemCommand.js';
import { ReplaceTextItemExprCommand } from '../../commands/ReplaceTextItemExprCommand.js';
import { KatexReplaceTextItemCommand } from '../../commands/KatexReplaceTextItemCommand.js';

export class MsubExpression extends AbstractNonArithmeticExpression {
    static NAME = 'msub';
    static KATEX_SOURCES = ['print', 'printonly', 'printwithout'];

    /**
     * @param {Array} subExpressions - [targetExpr, sourceStringExpr]
     */
    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.sourceString = null;
        // Mode: 'variable', 'item_expr', or 'sub_expr' (select/selectexcept)
        this.mode = null;
        this.targetVariableName = null;
        // For inline item
        this.textItemExpression = null;
        // For inline select/selectexcept
        this.subExpression = null;
        this.isKatexSource = false;  // Detected during resolve
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('msub() requires 2 arguments: msub(textItem, "latex")');
        }

        // Arg 0: target TextItem, TextItemCollection, or inline item
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        // Arg 1: source LaTeX string
        const sourceExpr = this.subExpressions[1];
        sourceExpr.resolve(context);
        this.sourceString = sourceExpr.getStringValue();

        // Check what kind of target expression we have
        const targetName = targetExpr.getName && targetExpr.getName();
        if (targetName === 'item') {
            this.mode = 'item_expr';
            this.textItemExpression = targetExpr;
            // Detect KaTeX from item's collection source
            const collExpr = context.getReference(targetExpr.collectionVariableName);
            this.isKatexSource = this._isKatexExpression(collExpr);
        } else if (targetName === 'select' || targetName === 'selectexcept') {
            this.mode = 'sub_expr';
            this.subExpression = targetExpr;
            this.isKatexSource = this._isKatexExpression(targetExpr);
        } else if (targetExpr.variableName) {
            this.mode = 'variable';
            this.targetVariableName = targetExpr.variableName;
            const textItemExpr = context.getReference(this.targetVariableName);
            this.isKatexSource = this._isKatexExpression(textItemExpr);
        } else {
            this.dispatchError('msub() first argument must be a TextItem variable, item(), select(), or selectexcept() expression');
        }

        this.isResolved = true;
        return this;
    }

    /**
     * Check if an expression originates from a KaTeX source
     */
    _isKatexExpression(expr) {
        if (!expr || !expr.sourceExpression) return false;
        return MsubExpression.KATEX_SOURCES.includes(expr.sourceExpression.getName());
    }

    getName() {
        return MsubExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    canPlay() {
        return true;
    }

    toCommand() {
        if (this.mode === 'item_expr') {
            // TODO: KatexReplaceTextItemExprCommand if needed
            return new ReplaceTextItemExprCommand(
                this.sourceString,
                this.textItemExpression.collectionVariableName,
                this.textItemExpression.index,
                this.textItemExpression.inlineExpression
            );
        }

        if (this.isKatexSource) {
            if (this.mode === 'sub_expr') {
                return new KatexReplaceTextItemCommand(this.sourceString, null, this.subExpression);
            }
            return new KatexReplaceTextItemCommand(this.sourceString, this.targetVariableName);
        }

        if (this.mode === 'sub_expr') {
            return new ReplaceTextItemCommand(this.sourceString, null, this.subExpression);
        }
        return new ReplaceTextItemCommand(this.sourceString, this.targetVariableName);
    }
}
