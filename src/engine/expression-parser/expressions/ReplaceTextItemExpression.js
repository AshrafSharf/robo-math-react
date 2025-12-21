/**
 * ReplaceTextItemExpression - Creates a new MathTextComponent at a TextItem's position
 *
 * Syntax:
 *   replace("latex", textItemVar)           - Replace using variable
 *   replace("latex", item(collection, i)) - Replace using inline item
 *   replace("latex", subonly(M, "pattern")) - Replace using inline subonly
 *   replace("latex", subwithout(M, "pat"))  - Replace using inline subwithout
 *
 * Takes a raw LaTeX string and a TextItem (or TextItemCollection),
 * creates a new MathTextComponent at the TextItem's position with
 * the TextItem's style, then animates writing it.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { ReplaceTextItemCommand } from '../../commands/ReplaceTextItemCommand.js';
import { ReplaceTextItemExprCommand } from '../../commands/ReplaceTextItemExprCommand.js';

export class ReplaceTextItemExpression extends AbstractNonArithmeticExpression {
    static NAME = 'replace';

    /**
     * @param {Array} subExpressions - [sourceStringExpr, targetExpr]
     */
    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.sourceString = null;
        // Mode: 'variable', 'item_expr', or 'sub_expr' (subonly/subwithout)
        this.mode = null;
        this.targetVariableName = null;
        // For inline item
        this.textItemExpression = null;
        // For inline subonly/subwithout
        this.subExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('replace() requires 2 arguments: replace("latex", textItem)');
        }

        // Arg 0: source LaTeX string
        const sourceExpr = this.subExpressions[0];
        sourceExpr.resolve(context);
        this.sourceString = sourceExpr.getStringValue();

        // Arg 1: target TextItem, TextItemCollection, or inline item
        const targetExpr = this.subExpressions[1];
        targetExpr.resolve(context);

        // Check what kind of target expression we have
        const targetName = targetExpr.getName && targetExpr.getName();
        if (targetName === 'item') {
            this.mode = 'item_expr';
            this.textItemExpression = targetExpr;
        } else if (targetName === 'subonly' || targetName === 'subwithout') {
            this.mode = 'sub_expr';
            this.subExpression = targetExpr;
        } else if (targetExpr.variableName) {
            this.mode = 'variable';
            this.targetVariableName = targetExpr.variableName;
        } else {
            this.dispatchError('replace() second argument must be a TextItem variable, item(), subonly(), or subwithout() expression');
        }

        this.isResolved = true;
        return this;
    }

    getName() {
        return ReplaceTextItemExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    canPlay() {
        return true;
    }

    toCommand() {
        if (this.mode === 'item_expr') {
            return new ReplaceTextItemExprCommand(
                this.sourceString,
                this.textItemExpression.collectionVariableName,
                this.textItemExpression.index,
                this.textItemExpression.inlineExpression  // Pass inline expression if item has one
            );
        }
        if (this.mode === 'sub_expr') {
            // Pass inline subonly/subwithout expression to ReplaceTextItemCommand
            return new ReplaceTextItemCommand(this.sourceString, null, this.subExpression);
        }
        return new ReplaceTextItemCommand(this.sourceString, this.targetVariableName);
    }
}
