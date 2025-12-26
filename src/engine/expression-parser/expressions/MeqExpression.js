/**
 * MeqExpression - Aligned equation steps with numbered references
 *
 * Syntax:
 *   meq(row, col, mline(...), mline(...), ...)
 *
 * Example:
 *   meq(4, 4,
 *     mline("x^2 + y^2 = r^2", "Pythagorean"),
 *     mline("x = r\\cos\\theta"),
 *     mline("y = r\\sin\\theta", "", 10)
 *   )
 *
 * Produces output like:
 *   ① ─── (Pythagorean)    x² + y² = r²
 *   ② ───                  x = r cos θ
 *   ⑩ ───                  y = r sin θ
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { WriteCommand } from '../../commands/WriteCommand.js';

// Circled numbers for equation references
const CIRCLED_NUMBERS = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩',
                         '⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];

/**
 * Get circled number representation
 * @param {number} n - The number (1-based)
 * @returns {string} Circled number or fallback (n) for > 20
 */
export function getCircledNumber(n) {
    if (n >= 1 && n <= 20) return CIRCLED_NUMBERS[n - 1];
    return `(${n})`;  // fallback for > 20
}

export class MeqExpression extends AbstractNonArithmeticExpression {
    static NAME = 'meq';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.row = null;
        this.col = null;
        this.lines = [];  // Array of resolved mline expressions
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('meq() requires at least 3 arguments: meq(row, col, mline(...))');
        }

        // Resolve row (first arg)
        const rowExpr = this.subExpressions[0];
        rowExpr.resolve(context);
        const rowValues = rowExpr.getVariableAtomicValues();
        if (rowValues.length === 0) {
            this.dispatchError('meq() first argument (row) must be a number');
        }
        this.row = rowValues[0];

        // Resolve col (second arg)
        const colExpr = this.subExpressions[1];
        colExpr.resolve(context);
        const colValues = colExpr.getVariableAtomicValues();
        if (colValues.length === 0) {
            this.dispatchError('meq() second argument (col) must be a number');
        }
        this.col = colValues[0];

        // Resolve mline expressions (remaining args)
        let autoNumber = 1;
        for (let i = 2; i < this.subExpressions.length; i++) {
            const lineExpr = this.subExpressions[i];
            lineExpr.resolve(context);

            // Get the resolved expression (handles variable references)
            const resolvedExpr = this._getResolvedExpression(context, lineExpr);

            if (!resolvedExpr || resolvedExpr.getName() !== 'mline') {
                this.dispatchError(`meq() argument ${i + 1} must be an mline() expression`);
            }

            // Assign number: use explicit if provided, otherwise auto-increment
            if (resolvedExpr.explicitNumber !== null) {
                resolvedExpr.number = resolvedExpr.explicitNumber;
            } else {
                resolvedExpr.number = autoNumber;
                autoNumber++;
            }

            this.lines.push(resolvedExpr);
        }

        if (this.lines.length === 0) {
            this.dispatchError('meq() requires at least one mline() expression');
        }
    }

    /**
     * Split equation at first '=' for alignment
     * @param {string} equation - The equation string
     * @returns {object} { lhs, rhs } or { full } if no '='
     */
    _splitEquation(equation) {
        const eqIndex = equation.indexOf('=');
        if (eqIndex === -1) {
            return { full: equation };
        }
        return {
            lhs: equation.substring(0, eqIndex).trim(),
            rhs: equation.substring(eqIndex + 1).trim()
        };
    }

    /**
     * Build the complete LaTeX string from lines
     */
    _buildLatex() {
        // Use array environment for alignment
        // Columns: circled number + line + reason | lhs | = | rhs
        let latex = '\\begin{array}{rl@{\\;=\\;}l}\n';

        for (const line of this.lines) {
            const circled = getCircledNumber(line.number);
            const lineDecor = '\\text{───}';
            const reason = line.reason ? `\\text{(${line.reason})}` : '';

            // Build the prefix: ① ─── (reason)
            let prefix = `${circled} \\; ${lineDecor}`;
            if (reason) {
                prefix += ` \\; ${reason}`;
            }

            const parts = this._splitEquation(line.equation);

            if (parts.full) {
                // No '=' in equation, span across columns
                latex += `${prefix} & \\multicolumn{2}{l}{${parts.full}} \\\\\n`;
            } else {
                // Align at '='
                latex += `${prefix} & ${parts.lhs} & ${parts.rhs} \\\\\n`;
            }
        }

        latex += '\\end{array}';
        return latex;
    }

    getName() {
        return MeqExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        const latexString = this._buildLatex();

        return new WriteCommand('create', {
            row: this.row,
            col: this.col,
            latexString: latexString,
            expression: this
        }, options);
    }

    canPlay() {
        return true;
    }
}
