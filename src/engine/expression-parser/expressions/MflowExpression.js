/**
 * MflowExpression - Generates annotated arrow chains as mathtext
 *
 * Syntax:
 *   mflow(row, col, start, mstep(above, below, result), mstep(...), ...)
 *
 * Example:
 *   mflow(4, 4, "x", mstep("f(x)", "step 1", "y"), mstep("g(y)", "step 2", "z"))
 *
 * Produces LaTeX:
 *   x \xrightarrow[\text{step 1}]{f(x)} y \xrightarrow[\text{step 2}]{g(y)} z
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { WriteCommand } from '../../commands/WriteCommand.js';

export class MflowExpression extends AbstractNonArithmeticExpression {
    static NAME = 'mflow';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.row = null;
        this.col = null;
        this.start = '';
        this.steps = [];  // Array of resolved mstep expressions
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('mflow() requires at least 4 arguments: mflow(row, col, start, mstep(...))');
        }

        // Resolve row (first arg)
        const rowExpr = this.subExpressions[0];
        rowExpr.resolve(context);
        const rowValues = rowExpr.getVariableAtomicValues();
        if (rowValues.length === 0) {
            this.dispatchError('mflow() first argument (row) must be a number');
        }
        this.row = rowValues[0];

        // Resolve col (second arg)
        const colExpr = this.subExpressions[1];
        colExpr.resolve(context);
        const colValues = colExpr.getVariableAtomicValues();
        if (colValues.length === 0) {
            this.dispatchError('mflow() second argument (col) must be a number');
        }
        this.col = colValues[0];

        // Resolve start (third arg)
        const startExpr = this.subExpressions[2];
        startExpr.resolve(context);
        const resolvedStart = this._getResolvedExpression(context, startExpr);
        if (resolvedStart && resolvedStart.getName() === 'quotedstring') {
            this.start = resolvedStart.getStringValue();
        } else {
            this.dispatchError('mflow() third argument (start) must be a quoted string');
        }

        // Resolve mstep expressions (remaining args)
        for (let i = 3; i < this.subExpressions.length; i++) {
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
    }

    /**
     * Format text for LaTeX - wrap in \text{} if plain text, pass through if LaTeX
     */
    _formatText(text) {
        // If contains backslash, assume it's LaTeX
        if (text.includes('\\')) {
            return text;
        }
        // Otherwise wrap in \text{}
        return `\\text{${text}}`;
    }

    /**
     * Build the complete LaTeX string from start and steps
     */
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
