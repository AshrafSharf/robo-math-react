/**
 * MeqExpression - Aligned equation steps with numbered references
 *
 * Returns LaTeX string for use with write() or print()
 *
 * Syntax:
 *   meq(mline(...), mline(...), ...)
 *   meq(mline(...), mline(...), lineGap)  // optional numeric for vertical gap (in pt)
 *
 * Template syntax (in mline equations):
 *   :varName        - simple variable substitution
 *   :{expr}         - mathjs expression (e.g., :{a+b})
 *   :varName:.Nf    - with N decimal places
 *
 * Usage:
 *   write(4, 4, meq(mline("x^2 = 4"), mline("x = \\pm 2")))
 *   print(4, 4, meq(mline("x^2 = 4"), mline("x = \\pm 2"), 10))  // 10pt gap
 *   // Dynamic with change:
 *   a = 5
 *   A = meq(mline("x = :a"), mline("y = :{a*2}"))
 *   print(4, 4, A)
 *   change(a, 5, 10)  // equations update dynamically
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
        this.lineGap = 0;  // vertical gap between lines in pt
        // Template support (aggregated from mlines)
        this.isTemplate = false;     // true if any mline uses templates
        this.templateScope = {};     // merged scope from all mlines
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('meq() requires at least 1 mline() expression');
        }

        // Clear lines array for re-resolution (during change animation)
        this.lines = [];

        // Check if last argument is a numeric (lineGap)
        let expressionsToProcess = this.subExpressions;
        const lastExpr = this.subExpressions[this.subExpressions.length - 1];
        lastExpr.resolve(context);
        const resolvedLast = this._getResolvedExpression(context, lastExpr);

        if (resolvedLast && resolvedLast.getName() === 'number') {
            this.lineGap = resolvedLast.getVariableAtomicValues()[0];
            expressionsToProcess = this.subExpressions.slice(0, -1);
        }

        // Resolve mline expressions
        let autoNumber = 1;
        for (let i = 0; i < expressionsToProcess.length; i++) {
            const lineExpr = expressionsToProcess[i];
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

        // Aggregate template info from mlines
        this.isTemplate = this.lines.some(line => line.isTemplate);
        if (this.isTemplate) {
            this.templateScope = {};
            for (const line of this.lines) {
                if (line.templateScope) {
                    Object.assign(this.templateScope, line.templateScope);
                }
            }
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
        const lineBreak = this.lineGap > 0 ? `\\\\[${this.lineGap}pt]\n` : '\\\\\n';

        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            const num = getCircledNumber(line.number);
            const lineDecor = '\\rule[0.5ex]{3em}{0.5pt}';
            const reason = line.reason ? `(${line.reason})` : '';

            const parts = this._splitEquation(line.equation);
            const isLastLine = i === this.lines.length - 1;
            const lb = isLastLine ? '\n' : lineBreak;

            if (parts.full) {
                latex += `\\multicolumn{3}{l}{${parts.full}} & ${lineDecor} & ${num} & ${reason} ${lb}`;
            } else {
                latex += `${parts.lhs} & = & ${parts.rhs} & ${lineDecor} & ${num} & ${reason} ${lb}`;
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
        const lineBreak = this.lineGap > 0 ? `\\\\[${this.lineGap}pt]\n` : '\\\\\n';

        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            const num = getCircledNumber(line.number);
            const lineDecor = '\\rule[0.5ex]{3em}{0.5pt}';
            const reason = line.reason ? `\\;(${line.reason})` : '';

            const parts = this._splitEquation(line.equation);
            const equation = parts.full ? parts.full : `${parts.lhs} = ${parts.rhs}`;
            const isLastLine = i === this.lines.length - 1;
            const lb = isLastLine ? '\n' : lineBreak;

            // Wrap entire row in bbox for bounds extraction (single column)
            latex += `\\bbox[0px]{${equation} \\quad ${lineDecor} \\; ${num} ${reason}} ${lb}`;
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
