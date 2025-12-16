/**
 * WriteExpression - Animates math text with pen-tracing write effect
 *
 * Syntax:
 *   write(M)                    - Animate existing MathTextComponent variable
 *   write(row, col, "latex")    - Create new MathTextComponent and animate it
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { WriteCommand } from '../../commands/WriteCommand.js';

export class WriteExpression extends AbstractNonArithmeticExpression {
    static NAME = 'write';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Mode: 'existing' or 'create'
        this.mode = null;
        // For 'existing' mode
        this.targetVariableName = null;
        // For 'create' mode
        this.row = 0;
        this.col = 0;
        this.latexString = '';
        // Reference to created MathTextComponent (set by command after init)
        this.mathTextComponent = null;
    }

    resolve(context) {
        if (this.subExpressions.length === 0) {
            this.dispatchError('write() requires arguments.\nUsage: write(M) or write(row, col, "latex")');
        }

        if (this.subExpressions.length === 1) {
            // Mode 1: write(M) - animate existing MathTextComponent
            this.mode = 'existing';
            const targetExpr = this.subExpressions[0];
            targetExpr.resolve(context);

            // Get the variable name for registry lookup
            if (targetExpr.variableName) {
                this.targetVariableName = targetExpr.variableName;
            } else {
                this.dispatchError('write() argument must be a variable reference to a MathTextComponent');
            }

            // Verify the referenced expression exists and is a MathTextExpression
            const resolvedExpr = context.getVariable(this.targetVariableName);
            if (!resolvedExpr) {
                this.dispatchError(`write(): Variable "${this.targetVariableName}" not found`);
            }
            if (resolvedExpr.getName && resolvedExpr.getName() !== 'mathtext') {
                this.dispatchError(`write(): "${this.targetVariableName}" must be a mathtext expression`);
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
        if (this.mode === 'existing') {
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
