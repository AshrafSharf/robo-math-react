/**
 * MeqExpression - Aligned equation steps with numbered references
 *
 * Returns LaTeX string for use with write() or print()
 *
 * Syntax:
 *   meq(mline(...), mline(...), ...)
 *
 * Usage:
 *   write(4, 4, meq(mline("x^2 = 4"), mline("x = \\pm 2")))
 *   print(4, 4, meq(mline("x^2 = 4"), mline("x = \\pm 2")))
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';

/**
 * Get circled number representation
 * @param {number} n - The number (1-based)
 * @returns {string} Number in parentheses
 */
export function getCircledNumber(n) {
    return `(${n})`;
}

export class MeqExpression extends AbstractNonArithmeticExpression {
    static NAME = 'meq';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.lines = [];
        this.latexString = '';
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('meq() requires at least 1 mline() expression');
        }

        // Resolve mline expressions
        let autoNumber = 1;
        for (let i = 0; i < this.subExpressions.length; i++) {
            const lineExpr = this.subExpressions[i];
            lineExpr.resolve(context);

            const resolvedExpr = this._getResolvedExpression(context, lineExpr);

            if (!resolvedExpr || resolvedExpr.getName() !== 'mline') {
                this.dispatchError(`meq() argument ${i + 1} must be an mline() expression`);
            }

            // Assign number
            if (resolvedExpr.explicitNumber !== null) {
                resolvedExpr.number = resolvedExpr.explicitNumber;
            } else {
                resolvedExpr.number = autoNumber;
                autoNumber++;
            }

            this.lines.push(resolvedExpr);
        }

        // Build latex string
        this.latexString = this._buildAlignedArrayLatex();
    }

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

    _buildAlignedArrayLatex() {
        let latex = '\\begin{array}{rclcll}\n';

        for (const line of this.lines) {
            const num = getCircledNumber(line.number);
            const lineDecor = '\\rule[0.5ex]{3em}{0.5pt}';
            const reason = line.reason ? `(${line.reason})` : '';

            const parts = this._splitEquation(line.equation);

            if (parts.full) {
                latex += `\\multicolumn{3}{l}{${parts.full}} & ${lineDecor} & ${num} & ${reason} \\\\\n`;
            } else {
                latex += `${parts.lhs} & = & ${parts.rhs} & ${lineDecor} & ${num} & ${reason} \\\\\n`;
            }
        }

        latex += '\\end{array}';
        return latex;
    }

    /**
     * Build LaTeX with \bbox{0px}{...} around each line for bounds extraction.
     * Used by WriteMeqCommand for bounds-based line animation.
     * Note: \bbox can't contain & separators, so we put entire row in single column.
     */
    _buildAlignedArrayLatexWithBBox() {
        let latex = '\\begin{array}{l}\n';

        for (const line of this.lines) {
            const num = getCircledNumber(line.number);
            const lineDecor = '\\rule[0.5ex]{3em}{0.5pt}';
            const reason = line.reason ? `\\;(${line.reason})` : '';

            const parts = this._splitEquation(line.equation);
            const equation = parts.full ? parts.full : `${parts.lhs} = ${parts.rhs}`;

            // Wrap entire row in bbox for bounds extraction (single column)
            latex += `\\bbox[0px]{${equation} \\quad ${lineDecor} \\; ${num} ${reason}} \\\\\n`;
        }

        latex += '\\end{array}';
        return latex;
    }

    /**
     * Get LaTeX string with bbox markers for bounds extraction.
     * @returns {string} LaTeX with \bbox markers around each line
     */
    getStringValueWithBBox() {
        return this._buildAlignedArrayLatexWithBBox();
    }

    getName() {
        return MeqExpression.NAME;
    }

    getStringValue() {
        return this.latexString;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
