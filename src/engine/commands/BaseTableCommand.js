/**
 * BaseTableCommand - Creates a dynamic table with math cells
 *
 * Uses HTML <table> for proper layout and styling.
 * Supports both KatexComponent and MathTextComponent cells.
 *
 * Lifecycle:
 *   doInit():
 *     - Creates HTML table with header and data rows
 *     - Creates cell components inside <td> elements
 *
 *   playSingle():
 *     - Animates cells appearing (fadeIn or write effect for mathtext)
 *
 *   doDirectPlay():
 *     - Shows all cells immediately
 */
import { BaseCommand } from './BaseCommand.js';
import { KatexComponent } from '../../mathtext/katex/katex-component.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { TableCellCollection } from '../expression-parser/collections/TableCellCollection.js';
import $ from '../../mathtext/utils/dom-query.js';
import { TweenMax } from 'gsap';

export class BaseTableCommand extends BaseCommand {
    /**
     * Create a table command
     * @param {number} row - Logical row position (top-left)
     * @param {number} col - Logical column position (top-left)
     * @param {Object} options - Table options
     * @param {string} options.cellType - 'katex' or 'mathtext'
     * @param {string[]} options.formulas - Array of column formulas
     * @param {string[]} options.headerLabels - Optional header labels
     * @param {Object[]} options.rowData - Array of {varValue, values} for each row
     * @param {string} options.variableName - The variable name (e.g., 'x')
     * @param {number} options.fontSize - Font size for cells
     * @param {string} options.color - Color for cells
     * @param {Object} expression - Reference to expression for storing table
     */
    constructor(row, col, options = {}, expression = null) {
        super();
        this.row = row;
        this.col = col;
        this.cellType = options.cellType || 'katex';
        this.formulas = options.formulas || [];
        this.headerLabels = options.headerLabels || null;
        this.rowData = options.rowData || [];
        this.variableName = options.variableName || 'x';
        this.fontSize = options.fontSize || 24;
        this.cellColor = options.color || '#000000';
        this.expression = expression;

        // Table structure
        this.tableDOM = null;
        this.headerCells = [];  // Header cells (KatexComponent)
        this.cells = [];  // 2D array: cells[row][col]
        this.collection = null;  // TableCellCollection for item() access
    }

    /**
     * Get number of columns
     */
    get numCols() {
        return this.formulas.length;
    }

    /**
     * Get number of rows
     */
    get numRows() {
        return this.rowData.length;
    }

    async doInit() {
        const coordinateMapper = this.diagram2d.coordinateMapper;
        const canvasSection = this.diagram2d.canvasSection;

        // Convert logical coordinates to pixel position
        const pixelCoords = coordinateMapper.toPixel(this.row, this.col);

        // Create HTML table
        this.tableDOM = document.createElement('table');
        this.tableDOM.className = 'robo-table';
        this.tableDOM.id = `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.tableDOM.style.cssText = `
            position: absolute;
            left: ${pixelCoords.x}px;
            top: ${pixelCoords.y}px;
            border-collapse: collapse;
            border: 1px solid ${this.cellColor};
        `;

        canvasSection.appendChild(this.tableDOM);

        // Create header row if headers are provided
        if (this.headerLabels && this.headerLabels.length > 0) {
            await this._createHeaderRow();
        }

        // Create data rows
        await this._createDataRows();

        // Create collection for item() access
        this.collection = new TableCellCollection(this.cells, this.cellType);

        // Store reference in expression
        if (this.expression) {
            this.expression.setTable(this);
        }

        // Set command result to the collection for shapeRegistry
        this.commandResult = this.collection;
    }

    /**
     * Create header row with <th> elements
     */
    async _createHeaderRow() {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        this.headerCells = [];

        for (let c = 0; c < this.headerLabels.length; c++) {
            const label = this.headerLabels[c];

            const th = document.createElement('th');
            th.style.cssText = `
                border: 1px solid ${this.cellColor};
                padding: 4px 8px;
                text-align: center;
                vertical-align: middle;
                background-color: rgba(0, 0, 0, 0.05);
                line-height: 1;
            `;

            // Headers always use KatexComponent
            // KatexComponent appends itself to the parent (th) in its init()
            const headerComponent = new KatexComponent(
                label,
                0,
                0,
                { toPixel: () => ({ x: 0, y: 0 }) },
                th,
                {
                    fontSize: this.fontSize,
                    color: this.cellColor,
                    inline: true  // Use inline mode for compact table cells
                }
            );

            // Override absolute positioning for table cells
            headerComponent.containerDOM.style.position = 'static';
            headerComponent.containerDOM.style.display = 'inline-block';
            headerComponent.containerDOM.style.margin = '0';
            headerComponent.containerDOM.style.padding = '0';
            headerComponent.containerDOM.style.lineHeight = '1';
            // Fix KaTeX internal spacing
            const katexEl = headerComponent.containerDOM.querySelector('.katex');
            if (katexEl) {
                katexEl.style.lineHeight = '1';
                katexEl.style.margin = '0';
                katexEl.style.padding = '0';
            }

            this.headerCells.push({
                component: headerComponent,
                td: th,
                col: c
            });

            // Initially hide
            headerComponent.hide();

            tr.appendChild(th);
        }

        thead.appendChild(tr);
        this.tableDOM.appendChild(thead);
    }

    /**
     * Create data rows with <td> elements
     */
    async _createDataRows() {
        const tbody = document.createElement('tbody');
        this.cells = [];

        for (let r = 0; r < this.numRows; r++) {
            const tr = document.createElement('tr');
            const rowCells = [];
            const rowData = this.rowData[r];

            for (let c = 0; c < this.numCols; c++) {
                const value = rowData.values[c];
                const latexValue = this._toLatex(value);

                const td = document.createElement('td');
                td.style.cssText = `
                    border: 1px solid ${this.cellColor};
                    padding: 4px 8px;
                    text-align: center;
                    vertical-align: middle;
                    line-height: 1;
                `;

                // Create cell component
                // Components append themselves to the parent (td) in their init()
                let cellComponent;
                if (this.cellType === 'katex') {
                    cellComponent = new KatexComponent(
                        latexValue,
                        0,
                        0,
                        { toPixel: () => ({ x: 0, y: 0 }) },
                        td,
                        {
                            fontSize: this.fontSize,
                            color: this.cellColor,
                            inline: true  // Use inline mode for compact table cells
                        }
                    );
                    // Override absolute positioning for table cells
                    cellComponent.containerDOM.style.position = 'static';
                    cellComponent.containerDOM.style.display = 'inline-block';
                    cellComponent.containerDOM.style.margin = '0';
                    cellComponent.containerDOM.style.padding = '0';
                    cellComponent.containerDOM.style.lineHeight = '1';
                    // Fix KaTeX internal spacing
                    const katexEl = cellComponent.containerDOM.querySelector('.katex');
                    if (katexEl) {
                        katexEl.style.lineHeight = '1';
                        katexEl.style.margin = '0';
                        katexEl.style.padding = '0';
                    }
                } else {
                    // MathTextComponent
                    cellComponent = new MathTextComponent(
                        latexValue,
                        0,
                        0,
                        { toPixel: () => ({ x: 0, y: 0 }) },
                        td,
                        {
                            fontSize: this.fontSize,
                            stroke: this.cellColor,
                            fill: this.cellColor
                        }
                    );
                    // Override absolute positioning for table cells
                    cellComponent.containerDOM.style.position = 'static';
                    cellComponent.containerDOM.style.display = 'inline-block';
                    cellComponent.containerDOM.style.margin = '0';
                    cellComponent.containerDOM.style.padding = '0';
                }

                rowCells.push({
                    component: cellComponent,
                    td: td,
                    row: r,
                    col: c
                });

                // Initially hide
                cellComponent.hide();

                tr.appendChild(td);
            }

            this.cells.push(rowCells);
            tbody.appendChild(tr);
        }

        this.tableDOM.appendChild(tbody);
    }

    /**
     * Convert a value to LaTeX string
     */
    _toLatex(value) {
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'number') {
            // Format number nicely
            if (Number.isInteger(value)) {
                return String(value);
            }
            // Round to avoid floating point noise
            const rounded = Math.round(value * 1e10) / 1e10;
            if (Math.abs(rounded) < 0.0001 && rounded !== 0) {
                return rounded.toExponential(2);
            }
            return String(rounded);
        }
        return String(value);
    }

    /**
     * Animate cells appearing
     */
    async playSingle() {
        const promises = [];
        const delayPerCell = 0.1;  // 100ms delay between cells
        let cellIndex = 0;

        // Animate header cells first
        for (let c = 0; c < this.headerCells.length; c++) {
            const headerCell = this.headerCells[c];
            const delay = cellIndex * delayPerCell;
            cellIndex++;

            const promise = new Promise((resolve) => {
                setTimeout(() => {
                    headerCell.component.show();
                    TweenMax.fromTo(headerCell.td, 0.3,
                        { opacity: 0 },
                        { opacity: 1, onComplete: resolve }
                    );
                }, delay * 1000);
            });

            promises.push(promise);
        }

        // Animate data cells
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
                const cell = this.cells[r][c];
                const delay = cellIndex * delayPerCell;
                cellIndex++;

                const promise = new Promise((resolve) => {
                    setTimeout(() => {
                        if (this.cellType === 'katex') {
                            cell.component.show();
                            TweenMax.fromTo(cell.td, 0.3,
                                { opacity: 0 },
                                { opacity: 1, onComplete: resolve }
                            );
                        } else {
                            // MathTextComponent with write effect
                            cell.component.show();
                            cell.component.enableStroke();
                            resolve();
                        }
                    }, delay * 1000);
                });

                promises.push(promise);
            }
        }

        return Promise.all(promises);
    }

    /**
     * Show all cells immediately
     */
    doDirectPlay() {
        // Show header cells
        for (let c = 0; c < this.headerCells.length; c++) {
            this.headerCells[c].component.show();
        }

        // Show data cells
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
                const cell = this.cells[r][c];
                cell.component.show();
                if (this.cellType === 'mathtext') {
                    cell.component.enableStroke();
                }
            }
        }
    }

    /**
     * Get cell at position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Object} Cell with component
     */
    getCell(row, col) {
        if (row < 0 || row >= this.numRows || col < 0 || col >= this.numCols) {
            return null;
        }
        return this.cells[row][col];
    }

    /**
     * Get the collection for item() access
     */
    getCollection() {
        return this.collection;
    }

    /**
     * Clear the table
     */
    clear() {
        // Remove header cell components
        for (let c = 0; c < this.headerCells.length; c++) {
            const headerCell = this.headerCells[c];
            if (headerCell.component && typeof headerCell.component.destroy === 'function') {
                headerCell.component.destroy();
            }
        }

        // Remove all data cell components
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
                const cell = this.cells[r][c];
                if (cell.component) {
                    if (typeof cell.component.destroy === 'function') {
                        cell.component.destroy();
                    }
                }
            }
        }

        // Remove table element
        if (this.tableDOM && this.tableDOM.parentNode) {
            this.tableDOM.parentNode.removeChild(this.tableDOM);
        }

        this.headerCells = [];
        this.cells = [];
        this.tableDOM = null;
        this.collection = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
