/**
 * WriteOnlyExpression - Writes ONLY the specified parts of math text
 *
 * Syntax:
 *   writeonly(M, "include")                    - Existing mathtext, write only matching parts
 *   writeonly(row, col, "latex", "include")   - Create new, write only matching parts
 *
 * The include pattern is wrapped internally with \bbox[0px]{...}, and
 * only the included content is animated (rest is hidden).
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { WriteOnlyCommand } from '../../commands/WriteOnlyCommand.js';
import { RewriteOnlyCommand } from '../../commands/RewriteOnlyCommand.js';

export class WriteOnlyExpression extends AbstractNonArithmeticExpression {
    static NAME = 'writeonly';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.mode = null;  // 'existing' or 'create'
        // For 'existing' mode
        this.targetVariableName = null;
        this.includePatterns = [];  // Array of patterns to include
        // For 'create' mode
        this.row = 0;
        this.col = 0;
        this.latexString = '';
        // Reference to MathTextComponent
        this.mathTextComponent = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('writeonly() requires at least 2 arguments.\nUsage: writeonly(M, "include") or writeonly(row, col, "latex", "include")');
        }

        // Detect mode based on first argument type
        const firstExpr = this.subExpressions[0];
        firstExpr.resolve(context);

        if (firstExpr.variableName) {
            // Mode 1: writeonly(M, "include", ...) - existing mathtext with patterns
            this.mode = 'existing';
            this.targetVariableName = firstExpr.variableName;

            // Verify the referenced expression exists and is a MathTextExpression
            const resolvedExpr = context.getReference(this.targetVariableName);
            if (!resolvedExpr) {
                this.dispatchError(`writeonly(): Variable "${this.targetVariableName}" not found`);
            }
            if (resolvedExpr.getName && resolvedExpr.getName() !== 'mathtext') {
                this.dispatchError(`writeonly(): "${this.targetVariableName}" must be a mathtext expression`);
            }

            // Remaining args: include patterns (strings)
            for (let i = 1; i < this.subExpressions.length; i++) {
                const includeExpr = this.subExpressions[i];
                includeExpr.resolve(context);
                const resolvedInclude = this._getResolvedExpression(context, includeExpr);
                if (!resolvedInclude || resolvedInclude.getName() !== 'quotedstring') {
                    this.dispatchError(`writeonly() argument ${i + 1} must be a quoted string (pattern to include)`);
                }
                this.includePatterns.push(resolvedInclude.getStringValue());
            }
        } else if (this.subExpressions.length >= 4) {
            // Mode 2: writeonly(row, col, "latex", "include")
            this.mode = 'create';

            // Row
            const rowValues = firstExpr.getVariableAtomicValues();
            if (rowValues.length === 0) {
                this.dispatchError('writeonly() first argument must be a number (row)');
            }
            this.row = rowValues[0];

            // Col
            const colExpr = this.subExpressions[1];
            colExpr.resolve(context);
            const colValues = colExpr.getVariableAtomicValues();
            if (colValues.length === 0) {
                this.dispatchError('writeonly() second argument must be a number (col)');
            }
            this.col = colValues[0];

            // LaTeX string
            const latexExpr = this.subExpressions[2];
            latexExpr.resolve(context);
            const resolvedLatex = this._getResolvedExpression(context, latexExpr);
            if (!resolvedLatex || resolvedLatex.getName() !== 'quotedstring') {
                this.dispatchError('writeonly() third argument must be a quoted string (latex)');
            }
            this.latexString = resolvedLatex.getStringValue();

            // Include patterns (from arg index 3 onwards)
            for (let i = 3; i < this.subExpressions.length; i++) {
                const includeExpr = this.subExpressions[i];
                includeExpr.resolve(context);
                const resolvedInclude = this._getResolvedExpression(context, includeExpr);
                if (!resolvedInclude || resolvedInclude.getName() !== 'quotedstring') {
                    this.dispatchError(`writeonly() argument ${i + 1} must be a quoted string (include pattern)`);
                }
                this.includePatterns.push(resolvedInclude.getStringValue());
            }
        } else {
            this.dispatchError('writeonly() usage: writeonly(M, "include") or writeonly(row, col, "latex", "include")');
        }
    }

    getName() {
        return WriteOnlyExpression.NAME;
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
            // Use RewriteOnlyCommand for existing components
            // - doesn't hide container
            // - wraps patterns with bbox at runtime
            // - only animates the matched strokes
            return new RewriteOnlyCommand({
                targetVariableName: this.targetVariableName,
                includePatterns: this.includePatterns
            });
        } else {
            return new WriteOnlyCommand('create', {
                row: this.row,
                col: this.col,
                latexString: this.latexString,
                includePatterns: this.includePatterns,
                expression: this
            });
        }
    }

    canPlay() {
        return true;
    }
}
