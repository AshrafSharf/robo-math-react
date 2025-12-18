/**
 * MathTextExpression - creates a math text component at logical coordinates (row, col)
 *
 * Syntax: mathtext(row, col, "latex string")
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { MathTextCommand } from '../../commands/MathTextCommand.js';

export class MathTextExpression extends AbstractNonArithmeticExpression {
    static NAME = 'mathtext';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Resolved values
        this.row = 0;
        this.col = 0;
        this.latexString = '';
        // Reference to created MathTextComponent (set by command after init)
        this.mathTextComponent = null;
    }

    resolve(context) {
        // Need at least 3 args: row, col, latexString
        if (this.subExpressions.length < 3) {
            this.dispatchError('mathtext() requires 3 arguments: row, col, "latex string"');
        }

        // First arg: row (numeric)
        const rowExpr = this.subExpressions[0];
        rowExpr.resolve(context);
        const rowValues = rowExpr.getVariableAtomicValues();
        if (rowValues.length === 0) {
            this.dispatchError('mathtext() first argument must be a number (row)');
        }
        this.row = rowValues[0];

        // Second arg: col (numeric)
        const colExpr = this.subExpressions[1];
        colExpr.resolve(context);
        const colValues = colExpr.getVariableAtomicValues();
        if (colValues.length === 0) {
            this.dispatchError('mathtext() second argument must be a number (col)');
        }
        this.col = colValues[0];

        // Third arg: latex string (quoted string or variable reference to one)
        const latexExpr = this.subExpressions[2];
        latexExpr.resolve(context);
        const resolvedLatexExpr = this._getResolvedExpression(context, latexExpr);

        if (!resolvedLatexExpr || resolvedLatexExpr.getName() !== 'quotedstring') {
            this.dispatchError('mathtext() third argument must be a quoted string or variable containing one');
        }
        this.latexString = resolvedLatexExpr.getStringValue();
    }

    getName() {
        return MathTextExpression.NAME;
    }

    getMathTextComponent() {
        return this.mathTextComponent;
    }

    setMathTextComponent(component) {
        this.mathTextComponent = component;
    }

    getVariableAtomicValues() {
        // MathText doesn't contribute coordinates - it's a display element
        return [];
    }

    toCommand(options = {}) {
        return new MathTextCommand(
            this.row,
            this.col,
            this.latexString,
            this,  // Pass expression reference so command can set component
            options  // Pass style options (fontSize, color)
        );
    }
}
