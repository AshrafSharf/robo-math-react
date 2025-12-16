/**
 * WriteWithoutExpression - Writes math text excluding specified parts
 *
 * Syntax:
 *   writewithout(M, "exclude")                    - Existing mathtext, exclude pattern
 *   writewithout(row, col, "latex", "exclude")   - Create new, exclude pattern
 *
 * The exclusion pattern is wrapped internally with \bbox[0px]{...}, and
 * only the non-excluded content is animated.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { WriteWithoutCommand } from '../../commands/WriteWithoutCommand.js';
import { RewriteWithoutCommand } from '../../commands/RewriteWithoutCommand.js';

export class WriteWithoutExpression extends AbstractNonArithmeticExpression {
    static NAME = 'writewithout';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.mode = null;  // 'existing' or 'create'
        // For 'existing' mode
        this.targetVariableName = null;
        this.excludePatterns = [];  // Array of patterns to exclude
        // For 'create' mode
        this.row = 0;
        this.col = 0;
        this.latexString = '';
        // Reference to MathTextComponent
        this.mathTextComponent = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('writewithout() requires at least 2 arguments.\nUsage: writewithout(M, "exclude") or writewithout(row, col, "latex", "exclude")');
        }

        // Detect mode based on first argument type
        const firstExpr = this.subExpressions[0];
        firstExpr.resolve(context);

        if (firstExpr.variableName) {
            // Mode 1: writewithout(M, "exclude", ...) - existing mathtext with patterns
            this.mode = 'existing';
            this.targetVariableName = firstExpr.variableName;

            // Verify the referenced expression exists and is a MathTextExpression
            const resolvedExpr = context.getReference(this.targetVariableName);
            if (!resolvedExpr) {
                this.dispatchError(`writewithout(): Variable "${this.targetVariableName}" not found`);
            }
            if (resolvedExpr.getName && resolvedExpr.getName() !== 'mathtext') {
                this.dispatchError(`writewithout(): "${this.targetVariableName}" must be a mathtext expression`);
            }

            // Remaining args: exclude patterns (strings)
            for (let i = 1; i < this.subExpressions.length; i++) {
                const excludeExpr = this.subExpressions[i];
                excludeExpr.resolve(context);
                const resolvedExclude = this._getResolvedExpression(context, excludeExpr);
                if (!resolvedExclude || resolvedExclude.getName() !== 'quotedstring') {
                    this.dispatchError(`writewithout() argument ${i + 1} must be a quoted string (pattern to exclude)`);
                }
                this.excludePatterns.push(resolvedExclude.getStringValue());
            }
        } else if (this.subExpressions.length >= 4) {
            // Mode 2: writewithout(row, col, "latex", "exclude")
            this.mode = 'create';

            // Row
            const rowValues = firstExpr.getVariableAtomicValues();
            if (rowValues.length === 0) {
                this.dispatchError('writewithout() first argument must be a number (row)');
            }
            this.row = rowValues[0];

            // Col
            const colExpr = this.subExpressions[1];
            colExpr.resolve(context);
            const colValues = colExpr.getVariableAtomicValues();
            if (colValues.length === 0) {
                this.dispatchError('writewithout() second argument must be a number (col)');
            }
            this.col = colValues[0];

            // LaTeX string
            const latexExpr = this.subExpressions[2];
            latexExpr.resolve(context);
            const resolvedLatex = this._getResolvedExpression(context, latexExpr);
            if (!resolvedLatex || resolvedLatex.getName() !== 'quotedstring') {
                this.dispatchError('writewithout() third argument must be a quoted string (latex)');
            }
            this.latexString = resolvedLatex.getStringValue();

            // Exclude patterns (from arg index 3 onwards)
            for (let i = 3; i < this.subExpressions.length; i++) {
                const excludeExpr = this.subExpressions[i];
                excludeExpr.resolve(context);
                const resolvedExclude = this._getResolvedExpression(context, excludeExpr);
                if (!resolvedExclude || resolvedExclude.getName() !== 'quotedstring') {
                    this.dispatchError(`writewithout() argument ${i + 1} must be a quoted string (exclude pattern)`);
                }
                this.excludePatterns.push(resolvedExclude.getStringValue());
            }
        } else {
            this.dispatchError('writewithout() usage: writewithout(M, "exclude") or writewithout(row, col, "latex", "exclude")');
        }
    }

    getName() {
        return WriteWithoutExpression.NAME;
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
            // Use RewriteWithoutCommand for existing components
            // - doesn't hide container
            // - wraps patterns with bbox at runtime
            // - animates everything except matched strokes
            return new RewriteWithoutCommand({
                targetVariableName: this.targetVariableName,
                excludePatterns: this.excludePatterns
            });
        } else {
            return new WriteWithoutCommand('create', {
                row: this.row,
                col: this.col,
                latexString: this.latexString,
                excludePatterns: this.excludePatterns,
                expression: this
            });
        }
    }

    canPlay() {
        return true;
    }
}
