/**
 * HeaderExpression - Defines column headers for table expressions
 *
 * Syntax:
 *   header("col1", "col2", "col3", ...)
 *
 * Used with tablep/tablew to add column headers:
 *   T = tablep(0, 0, header("n", "n^2", "\\sin(n)"), "n", "n^2", "sin(n)", range(1, 10))
 *
 * Headers are rendered using KatexComponent.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { QuotedStringExpression } from './QuotedStringExpression.js';
import { VariableReferenceExpression } from './VariableReferenceExpression.js';

/**
 * Unwrap a variable reference to get the underlying expression
 */
function unwrapExpression(expr) {
    if (expr instanceof VariableReferenceExpression) {
        return expr.variableValueExpression;
    }
    return expr;
}

export class HeaderExpression extends AbstractNonArithmeticExpression {
    static NAME = 'header';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;

        // Header labels (LaTeX strings)
        this.labels = [];
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('header() requires at least one label');
        }

        // Collect all header labels
        for (let i = 0; i < this.subExpressions.length; i++) {
            const exprRaw = this.subExpressions[i];
            exprRaw.resolve(context);
            const expr = unwrapExpression(exprRaw);

            if (expr instanceof QuotedStringExpression) {
                this.labels.push(expr.getStringValue());
            } else {
                this.dispatchError(`header() argument ${i + 1} must be a quoted string`);
            }
        }
    }

    getName() {
        return HeaderExpression.NAME;
    }

    /**
     * Get the header labels
     * @returns {string[]}
     */
    getLabels() {
        return this.labels;
    }

    /**
     * Get number of columns
     * @returns {number}
     */
    getColumnCount() {
        return this.labels.length;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        // Header doesn't create a command directly - it's used by table expressions
        return null;
    }

    canPlay() {
        return false;
    }
}
