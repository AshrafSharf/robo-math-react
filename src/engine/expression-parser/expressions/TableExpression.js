/**
 * TableExpression - Table expression that renders at logical coordinates
 *
 * @description Creates a configurable table at logical (row, col) position.
 * Table content can be configured via Settings panel or inline in the expression.
 *
 * @usage
 * Basic syntax (configure via Settings panel):
 *   T = table(row, col)
 *   T = table(0, 0)
 *
 * Inline syntax (data in expression):
 *   T = table(row, col, numRows, numCols, "cell1", "cell2", ...)
 *   T = table(0, 0, 2, 3, "a", "b", "c", "d", "e", "f")  // 2 rows × 3 cols
 *   T = table(4, 5, 2, 2, "\\frac{1}{2}", "\\sqrt{2}", "x^2", "\\pi")  // LaTeX content
 *
 * With ref() for dynamic content:
 *   G = ref()  // Then in Ref tab: table(0, 0, 2, 2, "a", "b", "c", "d")
 *
 * @param {number} row - Logical row position (like mathtext)
 * @param {number} col - Logical column position (like mathtext)
 * @param {number} [numRows] - Number of table rows (for inline syntax)
 * @param {number} [numCols] - Number of table columns (for inline syntax)
 * @param {...string} [cellValues] - Cell values filling row by row (for inline syntax)
 *
 * @settings Table options configurable via Settings panel:
 *   - Headers: Header row with background color
 *   - Rows/Cols: Table dimensions
 *   - Cells: Cell content (supports LaTeX)
 *   - Border Style: all, none, horizontal, vertical, outer
 *   - Header Background: Color picker for header row
 *
 * @collection Provides item() access for cell manipulation:
 *   item(T, 0)       → TableRow (row 0)
 *   item(T, 0, 1)    → TableCell (row 0, col 1)
 *   item(T, r, c)    → Get specific cell
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { TableCommand } from '../../commands/TableCommand.js';

export class TableExpression extends AbstractNonArithmeticExpression {
    static NAME = 'table';

    /**
     * @param {Array} subExpressions - Sub-expressions [row, col] or [row, col, rows, cols, ...values]
     */
    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions || [];
        this.tableCollection = null; // Set by TableCommand during init

        // Logical position (resolved from args)
        this.logicalRow = 0;
        this.logicalCol = 0;

        // Inline table data (if provided)
        this.inlineRows = null;
        this.inlineCols = null;
        this.inlineCells = null;
    }

    /**
     * Resolve position arguments
     */
    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('table() requires at least 2 arguments: table(row, col)');
        }

        // Resolve row position
        this.subExpressions[0].resolve(context);
        const rowExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const rowValues = rowExpr.getVariableAtomicValues();
        if (rowValues.length < 1) {
            this.dispatchError('table() first argument must be a number (row)');
        }
        this.logicalRow = rowValues[0];

        // Resolve col position
        this.subExpressions[1].resolve(context);
        const colExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const colValues = colExpr.getVariableAtomicValues();
        if (colValues.length < 1) {
            this.dispatchError('table() second argument must be a number (col)');
        }
        this.logicalCol = colValues[0];

        // Check for inline syntax: table(row, col, rows, cols, "v1", "v2", ...)
        if (this.subExpressions.length >= 4) {
            // Resolve rows count
            this.subExpressions[2].resolve(context);
            const rowsExpr = this._getResolvedExpression(context, this.subExpressions[2]);
            const rowsValues = rowsExpr.getVariableAtomicValues();
            if (rowsValues.length >= 1) {
                this.inlineRows = Math.floor(rowsValues[0]);
            }

            // Resolve cols count
            this.subExpressions[3].resolve(context);
            const colsExpr = this._getResolvedExpression(context, this.subExpressions[3]);
            const colsValues = colsExpr.getVariableAtomicValues();
            if (colsValues.length >= 1) {
                this.inlineCols = Math.floor(colsValues[0]);
            }

            // Extract cell values (remaining arguments)
            if (this.inlineRows && this.inlineCols && this.subExpressions.length > 4) {
                this.inlineCells = [];
                for (let r = 0; r < this.inlineRows; r++) {
                    const row = [];
                    for (let c = 0; c < this.inlineCols; c++) {
                        const idx = 4 + r * this.inlineCols + c;
                        if (idx < this.subExpressions.length) {
                            const cellExpr = this.subExpressions[idx];
                            // Get string value from expression
                            let content = '';
                            if (cellExpr.value !== undefined) {
                                content = String(cellExpr.value);
                            } else if (cellExpr.getVariableAtomicValues) {
                                cellExpr.resolve(context);
                                const vals = cellExpr.getVariableAtomicValues();
                                content = vals.length > 0 ? String(vals[0]) : '';
                            }
                            row.push({ content });
                        } else {
                            row.push({ content: '' });
                        }
                    }
                    this.inlineCells.push(row);
                }
            }
        }
    }

    /**
     * Get expression name
     * @returns {string}
     */
    getName() {
        return TableExpression.NAME;
    }

    /**
     * Get atomic values (empty for table)
     * @returns {Array}
     */
    getVariableAtomicValues() {
        return [];
    }

    /**
     * Create TableCommand with options from ExpressionOptionsRegistry
     * @param {Object} options - Options including table data from Settings panel
     * @returns {TableCommand}
     */
    toCommand(options = {}) {
        // Table configuration comes from Settings panel options
        const tableOptions = options.table || {};

        // If inline data was provided, use it instead of settings panel data
        if (this.inlineRows && this.inlineCols && this.inlineCells) {
            tableOptions.rows = this.inlineRows;
            tableOptions.cols = this.inlineCols;
            tableOptions.cells = this.inlineCells;
        }

        // Merge with expression coordinates
        return new TableCommand(tableOptions, {
            ...options,
            row: this.logicalRow,
            col: this.logicalCol,
            expression: this
        });
    }

    /**
     * Tables can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }

    // ===== COLLECTION INTERFACE (for item() access) =====

    /**
     * Set the table collection (called by TableCommand during init)
     * @param {TableItemCollection} collection
     */
    setTableCollection(collection) {
        this.tableCollection = collection;
    }

    /**
     * Get the table collection
     * @returns {TableItemCollection|null}
     */
    getTableCollection() {
        return this.tableCollection;
    }

    /**
     * Get collection size (number of rows)
     * @returns {number}
     */
    getCollectionSize() {
        return this.tableCollection?.getRowCount() || 0;
    }

    /**
     * Get row count
     * @returns {number}
     */
    getRowCount() {
        return this.tableCollection?.getRowCount() || 0;
    }

    /**
     * Get column count
     * @returns {number}
     */
    getColumnCount() {
        return this.tableCollection?.getColumnCount() || 0;
    }

    /**
     * Get a row by index (for item(A, row))
     * @param {number} rowIndex
     * @returns {TableRow|null}
     */
    getRow(rowIndex) {
        return this.tableCollection?.getRow(rowIndex) || null;
    }

    /**
     * Get a cell by row and column (for item(A, row, col))
     * @param {number} rowIndex
     * @param {number} colIndex
     * @returns {TableCell|null}
     */
    getCell(rowIndex, colIndex) {
        return this.tableCollection?.getCell(rowIndex, colIndex) || null;
    }

    /**
     * Friendly string representation
     * @returns {string}
     */
    getFriendlyToStr() {
        if (this.inlineRows && this.inlineCols) {
            return `table(${this.logicalRow}, ${this.logicalCol}, ${this.inlineRows}, ${this.inlineCols}, ...)`;
        }
        return `table(${this.logicalRow}, ${this.logicalCol})`;
    }

    /**
     * Check if this table has inline data (not from settings panel)
     * @returns {boolean}
     */
    hasInlineData() {
        return !!(this.inlineRows && this.inlineCols && this.inlineCells);
    }
}
