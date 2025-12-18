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

        // Check if first arg is a mathtext variable (existing mode)
        if (firstExpr.variableName) {
            const resolvedExpr = context.getReference(firstExpr.variableName);
            if (resolvedExpr && resolvedExpr.getName && resolvedExpr.getName() === 'mathtext') {
                // Mode 1: writeonly(M, "include", ...) - existing mathtext with patterns
                this.mode = 'existing';
                this.targetVariableName = firstExpr.variableName;

                // Remaining args: include patterns (strings or variables pointing to strings)
                for (let i = 1; i < this.subExpressions.length; i++) {
                    const includeExpr = this.subExpressions[i];
                    includeExpr.resolve(context);
                    const resolvedInclude = this._getResolvedExpression(context, includeExpr);
                    if (!resolvedInclude || resolvedInclude.getName() !== 'quotedstring') {
                        this.dispatchError(`writeonly() argument ${i + 1} must be a quoted string (pattern to include)`);
                    }
                    this.includePatterns.push(resolvedInclude.getStringValue());
                }
                return;
            }
            // Not a mathtext - fall through to create mode (could be a point variable)
        }

        if (this.subExpressions.length >= 3) {
            // Mode 2: writeonly(row, col, "latex", "include") or writeonly(point, "latex", "include")
            this.mode = 'create';

            // Collect position coordinates (need exactly 2: row, col)
            const positionCoords = [];
            let argIndex = 0;

            while (argIndex < this.subExpressions.length && positionCoords.length < 2) {
                const expr = this.subExpressions[argIndex];
                if (argIndex > 0) expr.resolve(context); // firstExpr already resolved
                const atomicValues = (argIndex === 0 ? firstExpr : expr).getVariableAtomicValues();

                for (const val of atomicValues) {
                    positionCoords.push(val);
                    if (positionCoords.length >= 2) break;
                }
                argIndex++;
            }

            if (positionCoords.length < 2) {
                this.dispatchError('writeonly() requires 2 position coordinates (row, col)');
            }
            this.row = positionCoords[0];
            this.col = positionCoords[1];

            // Next arg: LaTeX string
            if (argIndex >= this.subExpressions.length) {
                this.dispatchError('writeonly() requires a latex string after position');
            }
            const latexExpr = this.subExpressions[argIndex];
            latexExpr.resolve(context);
            const resolvedLatex = this._getResolvedExpression(context, latexExpr);
            if (!resolvedLatex || resolvedLatex.getName() !== 'quotedstring') {
                this.dispatchError('writeonly() latex argument must be a quoted string');
            }
            this.latexString = resolvedLatex.getStringValue();
            argIndex++;

            // Include patterns (remaining args)
            for (let i = argIndex; i < this.subExpressions.length; i++) {
                const includeExpr = this.subExpressions[i];
                includeExpr.resolve(context);
                const resolvedInclude = this._getResolvedExpression(context, includeExpr);
                if (!resolvedInclude || resolvedInclude.getName() !== 'quotedstring') {
                    this.dispatchError(`writeonly() argument ${i + 1} must be a quoted string (include pattern)`);
                }
                this.includePatterns.push(resolvedInclude.getStringValue());
            }
        } else {
            this.dispatchError('writeonly() usage: writeonly(M, "include") or writeonly(position, "latex", "include")');
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
            }, options);
        } else {
            return new WriteOnlyCommand('create', {
                row: this.row,
                col: this.col,
                latexString: this.latexString,
                includePatterns: this.includePatterns,
                expression: this
            }, options);
        }
    }

    canPlay() {
        return true;
    }
}
