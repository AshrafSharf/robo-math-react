/**
 * TableExpression - Table expression that renders at logical coordinates
 *
 * Usage: A = table(row, col)
 * - row, col: Logical coordinates for table position (like mathtext)
 * - Table configuration (rows, cols, cells, borderStyle) comes from Settings panel
 *
 * Provides collection interface for item() access:
 *   item(A, 0)       → TableRow (row 0)
 *   item(A, 0, 1)    → TableCell (row 0, col 1)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { TableCommand } from '../../commands/TableCommand.js';

export class TableExpression extends AbstractNonArithmeticExpression {
    static NAME = 'table';

    /**
     * @param {Array} subExpressions - Sub-expressions [row, col]
     */
    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions || [];
        this.tableCollection = null; // Set by TableCommand during init

        // Logical position (resolved from args)
        this.logicalRow = 0;
        this.logicalCol = 0;
    }

    /**
     * Resolve position arguments
     */
    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('table() requires 2 arguments: table(row, col)');
        }

        // Resolve row
        this.subExpressions[0].resolve(context);
        const rowExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const rowValues = rowExpr.getVariableAtomicValues();
        if (rowValues.length < 1) {
            this.dispatchError('table() first argument must be a number (row)');
        }
        this.logicalRow = rowValues[0];

        // Resolve col
        this.subExpressions[1].resolve(context);
        const colExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const colValues = colExpr.getVariableAtomicValues();
        if (colValues.length < 1) {
            this.dispatchError('table() second argument must be a number (col)');
        }
        this.logicalCol = colValues[0];
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
        return `table(${this.logicalRow}, ${this.logicalCol})`;
    }
}
