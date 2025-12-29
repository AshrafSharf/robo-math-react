/**
 * TableWExpression - Creates a table with MathTextComponent cells
 *
 * Uses MathJax for rendering (supports pen animation).
 * See BaseTableExpression for full documentation.
 *
 * Syntax:
 *   tablew(row, col, "formula1", "formula2", ..., range(start, end, step))
 *
 * Example:
 *   T = tablew(0, 0, "x", "x^2", "sin(x)", range(1, 10, 1))
 */
import { BaseTableExpression } from './BaseTableExpression.js';

export class TableWExpression extends BaseTableExpression {
    static NAME = 'tablew';

    getCellType() {
        return 'mathtext';
    }

    getName() {
        return TableWExpression.NAME;
    }
}
