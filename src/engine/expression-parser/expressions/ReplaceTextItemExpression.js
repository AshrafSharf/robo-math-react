/**
 * ReplaceTextItemExpression - Creates a new MathTextComponent at a TextItem's position
 *
 * Syntax: replace("latex string", textItemOrCollection)
 *
 * Takes a raw LaTeX string and a TextItem (or TextItemCollection),
 * creates a new MathTextComponent at the TextItem's position with
 * the TextItem's style, then animates writing it.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { ReplaceTextItemCommand } from '../../commands/ReplaceTextItemCommand.js';

export class ReplaceTextItemExpression extends AbstractNonArithmeticExpression {
    static NAME = 'replace';

    /**
     * @param {Array} subExpressions - [sourceStringExpr, targetExpr]
     */
    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.sourceString = null;
        this.targetVariableName = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('replace() requires 2 arguments: replace("latex", textItem)');
        }

        // Arg 0: source LaTeX string
        const sourceExpr = this.subExpressions[0];
        sourceExpr.resolve(context);
        this.sourceString = sourceExpr.getStringValue();

        // Arg 1: target TextItem or TextItemCollection variable
        const targetExpr = this.subExpressions[1];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('replace() second argument must be a TextItem variable');
        }
        this.targetVariableName = targetExpr.variableName;

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
        return new ReplaceTextItemCommand(this.sourceString, this.targetVariableName);
    }
}
