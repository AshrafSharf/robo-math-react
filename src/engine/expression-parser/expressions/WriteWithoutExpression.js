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

        // Check if first arg is a mathtext variable (existing mode)
        if (firstExpr.variableName) {
            const resolvedExpr = context.getReference(firstExpr.variableName);
            if (resolvedExpr && resolvedExpr.getName && resolvedExpr.getName() === 'mathtext') {
                // Mode 1: writewithout(M, "exclude", ...) - existing mathtext with patterns
                this.mode = 'existing';
                this.targetVariableName = firstExpr.variableName;

                // Remaining args: exclude patterns (strings or variables pointing to strings)
                for (let i = 1; i < this.subExpressions.length; i++) {
                    const excludeExpr = this.subExpressions[i];
                    excludeExpr.resolve(context);
                    const resolvedExclude = this._getResolvedExpression(context, excludeExpr);
                    if (!resolvedExclude || resolvedExclude.getName() !== 'quotedstring') {
                        this.dispatchError(`writewithout() argument ${i + 1} must be a quoted string (pattern to exclude)`);
                    }
                    this.excludePatterns.push(resolvedExclude.getStringValue());
                }
                return;
            }
            // Not a mathtext - fall through to create mode (could be a point variable)
        }

        if (this.subExpressions.length >= 3) {
            // Mode 2: writewithout(row, col, "latex", "exclude") or writewithout(point, "latex", "exclude")
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
                this.dispatchError('writewithout() requires 2 position coordinates (row, col)');
            }
            this.row = positionCoords[0];
            this.col = positionCoords[1];

            // Next arg: LaTeX string
            if (argIndex >= this.subExpressions.length) {
                this.dispatchError('writewithout() requires a latex string after position');
            }
            const latexExpr = this.subExpressions[argIndex];
            latexExpr.resolve(context);
            const resolvedLatex = this._getResolvedExpression(context, latexExpr);
            if (!resolvedLatex || typeof resolvedLatex.getStringValue !== 'function') {
                this.dispatchError('writewithout() latex argument must be a quoted string, meq(), or mflow()');
            }
            this.latexString = resolvedLatex.getStringValue();
            argIndex++;

            // Exclude patterns (remaining args)
            for (let i = argIndex; i < this.subExpressions.length; i++) {
                const excludeExpr = this.subExpressions[i];
                excludeExpr.resolve(context);
                const resolvedExclude = this._getResolvedExpression(context, excludeExpr);
                if (!resolvedExclude || resolvedExclude.getName() !== 'quotedstring') {
                    this.dispatchError(`writewithout() argument ${i + 1} must be a quoted string (exclude pattern)`);
                }
                this.excludePatterns.push(resolvedExclude.getStringValue());
            }
        } else {
            this.dispatchError('writewithout() usage: writewithout(M, "exclude") or writewithout(position, "latex", "exclude")');
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
            }, options);
        } else {
            return new WriteWithoutCommand('create', {
                row: this.row,
                col: this.col,
                latexString: this.latexString,
                excludePatterns: this.excludePatterns,
                expression: this
            }, options);
        }
    }

    canPlay() {
        return true;
    }
}
