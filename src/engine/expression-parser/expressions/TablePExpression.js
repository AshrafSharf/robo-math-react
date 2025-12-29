/**
 * TablePExpression - Creates a table with KatexComponent cells
 *
 * Uses KaTeX for rendering (faster, HTML-based).
 * See BaseTableExpression for full documentation.
 *
 * Syntax:
 *   tablep(row, col, "formula1", "formula2", ..., range(start, end, step))
 *
 * Example:
 *   T = tablep(0, 0, "x", "x^2", "sin(x)", range(1, 10, 1))
 */
import { BaseTableExpression } from './BaseTableExpression.js';

export class TablePExpression extends BaseTableExpression {
    static NAME = 'tablep';

    getCellType() {
        return 'katex';
    }

    getName() {
        return TablePExpression.NAME;
    }
}
