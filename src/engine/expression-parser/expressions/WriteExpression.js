/**
 * WriteExpression - Animates math text with pen-tracing write effect
 *
 * Syntax:
 *   write(M)                    - Animate existing MathTextComponent variable
 *   write(row, col, "latex")    - Create new MathTextComponent and animate it
 *   write(row, col, item(i))    - Clone TextItem to position and animate it
 *   write(collection)           - Animate all items in a TextItemCollection sequentially
 *   write(textItem)             - Animate a single TextItem
 *
 * TextItemCollection sources:
 *   - select(M, patterns...)       - Returns collection of matched patterns
 *   - selectexcept(M, patterns...) - Returns collection of excluded patterns
 *   - writeonly(M, patterns...)    - Returns collection of excluded (non-written) parts
 *   - writewithout(M, patterns...) - Returns collection of excluded (matched) parts
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { WriteCommand } from '../../commands/WriteCommand.js';
import { WriteCollectionVarCommand } from '../../commands/WriteCollectionVarCommand.js';
import { WriteTextItemVarCommand } from '../../commands/WriteTextItemVarCommand.js';
import { WriteTextItemExprCommand } from '../../commands/WriteTextItemExprCommand.js';
import { WriteTextItemCommand } from '../../commands/WriteTextItemCommand.js';

export class WriteExpression extends AbstractNonArithmeticExpression {
    static NAME = 'write';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Mode: 'existing', 'create', 'collection_var', 'textitem_var', 'textitem_expr'
        this.mode = null;
        // For 'existing' mode
        this.targetVariableName = null;
        // For 'create' mode and 'textitem_expr' with position
        this.row = null;
        this.col = null;
        this.latexString = '';
        // For 'collection_var' mode
        this.collectionVariableName = null;
        // For 'textitem_var' mode
        this.textItemVariableName = null;
        // For 'textitem_expr' mode (inline item)
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

            // Check if target is an item expression (returns TextItem)
            const targetName = targetExpr.getName && targetExpr.getName();
            if (targetName === 'item') {
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

                // Check for TextItemCollection sources: select, selectexcept, writeonly, writewithout
                if (exprName === 'select' || exprName === 'selectexcept' ||
                    exprName === 'writeonly' || exprName === 'writewithout') {
                    this.mode = 'collection_var';
                    this.collectionVariableName = targetExpr.variableName;
                    return;
                }

                // Check for item variable (returns TextItem)
                if (exprName === 'item') {
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

                this.dispatchError(`write(): "${targetExpr.variableName}" must be a mathtext, select, selectexcept, writeonly, writewithout, or item expression`);
            } else {
                this.dispatchError('write() argument must be a variable reference');
            }
        } else if (this.subExpressions.length >= 2) {
            // Mode 2: write(row, col, "latex") or write(point, "latex") - create new and animate
            this.mode = 'create';

            // Collect position coordinates (need exactly 2: row, col)
            const positionCoords = [];
            let argIndex = 0;

            while (argIndex < this.subExpressions.length && positionCoords.length < 2) {
                const expr = this.subExpressions[argIndex];
                expr.resolve(context);
                const atomicValues = expr.getVariableAtomicValues();

                for (const val of atomicValues) {
                    positionCoords.push(val);
                    if (positionCoords.length >= 2) break;
                }
                argIndex++;
            }

            if (positionCoords.length < 2) {
                this.dispatchError('write() requires 2 position coordinates (row, col)');
            }
            this.row = positionCoords[0];
            this.col = positionCoords[1];

            // Next arg: latex string or item expression
            if (argIndex >= this.subExpressions.length) {
                this.dispatchError('write() requires a latex string or item expression after position');
            }
            const contentExpr = this.subExpressions[argIndex];
            contentExpr.resolve(context);

            // Check if it's an item expression (returns TextItem)
            const contentName = contentExpr.getName && contentExpr.getName();
            if (contentName === 'item') {
                this.mode = 'textitem_expr';
                this.textItemExpression = contentExpr;
                return;
            }

            // Otherwise expect a latex string
            const resolvedLatexExpr = this._getResolvedExpression(context, contentExpr);

            if (!resolvedLatexExpr || resolvedLatexExpr.getName() !== 'quotedstring') {
                this.dispatchError('write() content argument must be a quoted string or item expression');
            }
            this.latexString = resolvedLatexExpr.getStringValue();
        } else {
            this.dispatchError('write() requires either 1 argument (variable) or position + "latex"');
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
            // Check if position is provided
            if (this.row !== null && this.col !== null) {
                // write(row, col, item(thetas, 0)) - clone to position
                return new WriteTextItemCommand(
                    this.textItemExpression.collectionVariableName,
                    this.textItemExpression.index,
                    this.row,
                    this.col
                );
            } else {
                // write(item(thetas, 0)) - animate in place
                return new WriteTextItemExprCommand(
                    this.textItemExpression.collectionVariableName,
                    this.textItemExpression.index
                );
            }
        } else if (this.mode === 'existing') {
            return new WriteCommand('existing', {
                targetVariableName: this.targetVariableName
            }, options);
        } else {
            return new WriteCommand('create', {
                row: this.row,
                col: this.col,
                latexString: this.latexString,
                expression: this
            }, options);
        }
    }

    canPlay() {
        return true;
    }
}
