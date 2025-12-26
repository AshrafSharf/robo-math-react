/**
 * MflowExpression - Generates annotated arrow chains
 *
 * Returns LaTeX string for use with write() or print()
 *
 * Syntax:
 *   mflow(start, mstep(above, below, result), mstep(...), ...)
 *
 * Usage:
 *   write(4, 4, mflow("x", mstep("f(x)", "step 1", "y")))
 *   print(4, 4, mflow("x", mstep("f(x)", "step 1", "y")))
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';

export class MflowExpression extends AbstractNonArithmeticExpression {
    static NAME = 'mflow';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.start = '';
        this.steps = [];
        this.latexString = '';
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('mflow() requires at least 2 arguments: mflow(start, mstep(...))');
        }

        // Resolve start (first arg)
        const startExpr = this.subExpressions[0];
        startExpr.resolve(context);
        const resolvedStart = this._getResolvedExpression(context, startExpr);
        if (resolvedStart && resolvedStart.getName() === 'quotedstring') {
            this.start = resolvedStart.getStringValue();
        } else {
            this.dispatchError('mflow() first argument (start) must be a quoted string');
        }

        // Resolve mstep expressions (remaining args)
        for (let i = 1; i < this.subExpressions.length; i++) {
            const stepExpr = this.subExpressions[i];
            stepExpr.resolve(context);

            if (stepExpr.getName() !== 'mstep') {
                this.dispatchError(`mflow() argument ${i + 1} must be an mstep() expression`);
            }

            this.steps.push(stepExpr);
        }

        if (this.steps.length === 0) {
            this.dispatchError('mflow() requires at least one mstep() expression');
        }

        // Build latex string
        this.latexString = this._buildLatex();
    }

    _formatText(text) {
        if (text.includes('\\')) {
            return text;
        }
        return `\\text{${text}}`;
    }

    _buildLatex() {
        let latex = this._formatText(this.start);

        for (const step of this.steps) {
            const above = this._formatText(step.above);
            const below = this._formatText(step.below);
            const result = this._formatText(step.result);

            latex += ` \\xrightarrow[${below}]{${above}} ${result}`;
        }

        return latex;
    }

    getName() {
        return MflowExpression.NAME;
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
