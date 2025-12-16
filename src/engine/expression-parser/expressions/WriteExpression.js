/**
 * WriteExpression - Animates math text with pen-tracing write effect
 *
 * Syntax:
 *   write(M)                    - Animate existing MathTextComponent variable
 *   write(row, col, "latex")    - Create new MathTextComponent and animate it
 *   write(collection)           - Animate all items in a TextItemCollection sequentially
 *   write(textItem)             - Animate a single TextItem
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { WriteCommand } from '../../commands/WriteCommand.js';
import { WriteCollectionVarCommand } from '../../commands/WriteCollectionVarCommand.js';
import { WriteTextItemVarCommand } from '../../commands/WriteTextItemVarCommand.js';
import { WriteTextItemExprCommand } from '../../commands/WriteTextItemExprCommand.js';

export class WriteExpression extends AbstractNonArithmeticExpression {
    static NAME = 'write';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Mode: 'existing', 'create', 'collection_var', 'textitem_var', 'textitem_expr'
        this.mode = null;
        // For 'existing' mode
        this.targetVariableName = null;
        // For 'create' mode
        this.row = 0;
        this.col = 0;
        this.latexString = '';
        // For 'collection_var' mode
        this.collectionVariableName = null;
        // For 'textitem_var' mode
        this.textItemVariableName = null;
        // For 'textitem_expr' mode (inline textat)
        this.textItemExpression = null;
        // Reference to created MathTextComponent (set by command after init)
        this.mathTextComponent = null;
    }

    resolve(context) {
        if (this.subExpressions.length === 0) {
            this.dispatchError('write() requires arguments.\nUsage: write(M) or write(row, col, "latex")');
        }

        if (this.subExpressions.length === 1) {
            const targetExpr = this.subExpressions[0];
            targetExpr.resolve(context);

            // Check if target is a textat expression (returns TextItem)
            const targetName = targetExpr.getName && targetExpr.getName();
            if (targetName === 'textat') {
                this.mode = 'textitem_expr';
                this.textItemExpression = targetExpr;
                return;
            }

            // Check if target is a variable reference
            if (targetExpr.variableName) {
                const resolvedExpr = context.getReference(targetExpr.variableName);
                if (!resolvedExpr) {
                    this.dispatchError(`write(): Variable "${targetExpr.variableName}" not found`);
                }

                const exprName = resolvedExpr.getName && resolvedExpr.getName();

                // Check for subonly/subwithout (returns TextItemCollection)
                if (exprName === 'subonly' || exprName === 'subwithout') {
                    this.mode = 'collection_var';
                    this.collectionVariableName = targetExpr.variableName;
                    return;
                }

                // Check for textat variable (returns TextItem)
                if (exprName === 'textat') {
                    this.mode = 'textitem_var';
                    this.textItemVariableName = targetExpr.variableName;
                    return;
                }

                // Check for mathtext (existing MathTextComponent)
                if (exprName === 'mathtext') {
                    this.mode = 'existing';
                    this.targetVariableName = targetExpr.variableName;
                    return;
                }

                this.dispatchError(`write(): "${targetExpr.variableName}" must be a mathtext, subonly, subwithout, or textat expression`);
            } else {
                this.dispatchError('write() argument must be a variable reference');
            }
        } else if (this.subExpressions.length >= 3) {
            // Mode 2: write(row, col, "latex") - create new and animate
            this.mode = 'create';

            // First arg: row (numeric)
            const rowExpr = this.subExpressions[0];
            rowExpr.resolve(context);
            const rowValues = rowExpr.getVariableAtomicValues();
            if (rowValues.length === 0) {
                this.dispatchError('write() first argument must be a number (row)');
            }
            this.row = rowValues[0];

            // Second arg: col (numeric)
            const colExpr = this.subExpressions[1];
            colExpr.resolve(context);
            const colValues = colExpr.getVariableAtomicValues();
            if (colValues.length === 0) {
                this.dispatchError('write() second argument must be a number (col)');
            }
            this.col = colValues[0];

            // Third arg: latex string
            const latexExpr = this.subExpressions[2];
            latexExpr.resolve(context);
            const resolvedLatexExpr = this._getResolvedExpression(context, latexExpr);

            if (!resolvedLatexExpr || resolvedLatexExpr.getName() !== 'quotedstring') {
                this.dispatchError('write() third argument must be a quoted string');
            }
            this.latexString = resolvedLatexExpr.getStringValue();
        } else {
            this.dispatchError('write() requires either 1 argument (variable) or 3 arguments (row, col, "latex")');
        }
    }

    getName() {
        return WriteExpression.NAME;
    }

    getMathTextComponent() {
        return this.mathTextComponent;
    }

    setMathTextComponent(component) {
        this.mathTextComponent = component;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        if (this.mode === 'collection_var') {
            return new WriteCollectionVarCommand(this.collectionVariableName);
        } else if (this.mode === 'textitem_var') {
            return new WriteTextItemVarCommand(this.textItemVariableName);
        } else if (this.mode === 'textitem_expr') {
            // Inline textat expression: write(textat(thetas, 0))
            return new WriteTextItemExprCommand(
                this.textItemExpression.collectionVariableName,
                this.textItemExpression.index
            );
        } else if (this.mode === 'existing') {
            return new WriteCommand('existing', {
                targetVariableName: this.targetVariableName
            });
        } else {
            return new WriteCommand('create', {
                row: this.row,
                col: this.col,
                latexString: this.latexString,
                expression: this
            });
        }
    }

    canPlay() {
        return true;
    }
}
