/**
 * TableCellCollection - Collection class for table cells
 *
 * Enables item(T, row, col) access pattern for tables.
 * Wraps the 2D array of cells and provides adapted access.
 */
import { TableCellAdapter } from '../../adapters/TableCellAdapter.js';

export class TableCellCollection {
    /**
     * Create a table cell collection
     * @param {Array<Array<Object>>} cells - 2D array of cell objects
     * @param {string} cellType - 'katex' or 'mathtext'
     */
    constructor(cells, cellType) {
        this.cells = cells;
        this.cellType = cellType;

        // Markers for type detection
        this.isTableCollection = true;
    }

    /**
     * Get cell at position, wrapped in adapter
     * @param {number} row - Row index (0-based)
     * @param {number} col - Column index (0-based)
     * @returns {TableCellAdapter|null}
     */
    get(row, col) {
        if (row < 0 || row >= this.getRowCount()) {
            console.warn(`TableCellCollection: Row ${row} out of bounds (0-${this.getRowCount() - 1})`);
            return null;
        }
        if (col < 0 || col >= this.getColCount()) {
            console.warn(`TableCellCollection: Column ${col} out of bounds (0-${this.getColCount() - 1})`);
            return null;
        }

        const cell = this.cells[row][col];
        return TableCellAdapter.for(cell, this.cellType);
    }

    /**
     * Get row count
     * @returns {number}
     */
    getRowCount() {
        return this.cells.length;
    }

    /**
     * Get column count
     * @returns {number}
     */
    getColCount() {
        return this.cells[0]?.length || 0;
    }

    /**
     * Get total cell count
     * @returns {number}
     */
    size() {
        return this.getRowCount() * this.getColCount();
    }

    /**
     * Get all cells as flat array of adapters
     * @returns {TableCellAdapter[]}
     */
    getAll() {
        const allCells = [];
        for (let r = 0; r < this.getRowCount(); r++) {
            for (let c = 0; c < this.getColCount(); c++) {
                allCells.push(this.get(r, c));
            }
        }
        return allCells;
    }

    /**
     * Get all cells in a specific row
     * @param {number} row - Row index
     * @returns {TableCellAdapter[]}
     */
    getRow(row) {
        if (row < 0 || row >= this.getRowCount()) {
            return [];
        }
        const rowCells = [];
        for (let c = 0; c < this.getColCount(); c++) {
            rowCells.push(this.get(row, c));
        }
        return rowCells;
    }

    /**
     * Get all cells in a specific column
     * @param {number} col - Column index
     * @returns {TableCellAdapter[]}
     */
    getColumn(col) {
        if (col < 0 || col >= this.getColCount()) {
            return [];
        }
        const colCells = [];
        for (let r = 0; r < this.getRowCount(); r++) {
            colCells.push(this.get(r, col));
        }
        return colCells;
    }

    /**
     * Show all cells
     */
    show() {
        for (let r = 0; r < this.getRowCount(); r++) {
            for (let c = 0; c < this.getColCount(); c++) {
                const adapter = this.get(r, c);
                if (adapter) adapter.show();
            }
        }
    }

    /**
     * Hide all cells
     */
    hide() {
        for (let r = 0; r < this.getRowCount(); r++) {
            for (let c = 0; c < this.getColCount(); c++) {
                const adapter = this.get(r, c);
                if (adapter) adapter.hide();
            }
        }
    }
}
