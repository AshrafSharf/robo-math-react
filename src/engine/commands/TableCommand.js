/**
 * TableCommand - Command for creating a table at logical coordinates
 *
 * Creates a DOM table using coordinateMapper to convert logical (row, col)
 * to pixel coordinates. Uses CellAdapter to render cell content (math vs text).
 *
 * Like MathTextCommand, shows instantly on init.
 */
import { BaseCommand } from './BaseCommand.js';
import { TableItemCollection } from '../expression-parser/collections/TableItemCollection.js';
import { CellAdapter } from '../adapters/CellAdapter.js';

export class TableCommand extends BaseCommand {
    /**
     * Create a table command
     * @param {Object} tableData - Table configuration from Settings panel
     * @param {number} tableData.rows - Number of rows
     * @param {number} tableData.cols - Number of columns
     * @param {Array} tableData.cells - 2D array of cell data [{content}, ...]
     * @param {Object} options - Command options
     */
    constructor(tableData, options = {}) {
        super();
        this.tableData = tableData || {};
        this.options = options;

        // Table configuration
        this.rowCount = tableData.rows || 2;
        this.colCount = tableData.cols || 2;
        this.cellsData = tableData.cells || [];
        this.borderStyle = tableData.borderStyle || 'all';
        this.cellPadding = tableData.cellPadding || '8px 12px';

        // Position (logical coordinates)
        this.row = options.row ?? 0;
        this.col = options.col ?? 0;

        // Styling
        this.fontSize = options.fontSize ?? 16;

        // DOM elements
        this.tableElement = null;
        this.containerDOM = null;

        // Collection for item() access
        this.tableCollection = null;

        // Cell adapters
        this.cellAdapters = [];

        // Reference to expression (for storing collection)
        this.expression = options.expression || null;
    }

    /**
     * Create table at logical position
     * @returns {Promise}
     */
    async doInit() {
        // 1. Build TableItemCollection from table data
        this.tableCollection = TableItemCollection.fromOptions({
            rows: this.rowCount,
            cols: this.colCount,
            cells: this.cellsData
        });

        // 2. Store collection in expression for item() access
        if (this.expression) {
            this.expression.setTableCollection(this.tableCollection);
        }

        // 3. Get coordinateMapper and canvasSection from diagram2d
        const coordinateMapper = this.diagram2d.coordinateMapper;
        const canvasSection = this.diagram2d.canvasSection;

        // 4. Convert logical to pixel coordinates
        const pixelCoords = coordinateMapper.toPixel(this.row, this.col);

        // 5. Create container for the table
        this.containerDOM = document.createElement('div');
        this.containerDOM.className = 'table-container';
        this.containerDOM.style.position = 'absolute';
        this.containerDOM.style.left = pixelCoords.x + 'px';
        this.containerDOM.style.top = pixelCoords.y + 'px';

        // 6. Create table element
        this.tableElement = document.createElement('table');
        this.tableElement.className = 'robo-table';
        this.tableElement.style.borderCollapse = 'collapse';
        this.tableElement.style.fontSize = this.fontSize + 'px';
        this.tableElement.style.minWidth = '50px';
        this.tableElement.style.minHeight = '50px';

        // 7. Build table rows and cells
        await this._buildTableDOM();

        // 8. Apply border style
        this._applyBorderStyle();

        // 9. Append to canvas
        this.containerDOM.appendChild(this.tableElement);
        canvasSection.appendChild(this.containerDOM);

        // 10. Set command result
        this.commandResult = {
            tableElement: this.tableElement,
            containerDOM: this.containerDOM,
            tableCollection: this.tableCollection
        };
    }

    /**
     * Build table DOM structure and render cells
     * @returns {Promise}
     */
    async _buildTableDOM() {
        for (let r = 0; r < this.rowCount; r++) {
            const rowElement = document.createElement('tr');

            for (let c = 0; c < this.colCount; c++) {
                const cellElement = document.createElement('td');
                cellElement.style.padding = this.cellPadding;
                cellElement.style.textAlign = 'center';
                cellElement.style.verticalAlign = 'middle';

                // Get cell from collection
                const cell = this.tableCollection.getCell(r, c);
                if (cell) {
                    // Link DOM element to cell
                    cell.setElement(cellElement);

                    // Create adapter and render content
                    const adapter = new CellAdapter(cell);
                    this.cellAdapters.push({ row: r, col: c, adapter });

                    await adapter.render(cellElement, {
                        fontSize: this.fontSize,
                        color: this.color
                    });
                }

                rowElement.appendChild(cellElement);
            }

            this.tableElement.appendChild(rowElement);
        }
    }

    /**
     * Apply border style to table
     */
    _applyBorderStyle() {
        const borderWidth = '1px';
        const borderColor = '#ddd';
        const borderStyleType = 'solid';
        const border = `${borderWidth} ${borderStyleType} ${borderColor}`;

        const cells = this.tableElement.querySelectorAll('td');

        // Reset all borders first
        cells.forEach(cell => {
            cell.style.border = 'none';
        });
        this.tableElement.style.border = 'none';

        switch (this.borderStyle) {
            case 'all':
                cells.forEach(cell => {
                    cell.style.border = border;
                });
                break;

            case 'none':
                // Already cleared above
                break;

            case 'horizontal':
                cells.forEach(cell => {
                    cell.style.borderTop = border;
                    cell.style.borderBottom = border;
                });
                break;

            case 'vertical':
                cells.forEach(cell => {
                    cell.style.borderLeft = border;
                    cell.style.borderRight = border;
                });
                break;

            case 'outer':
                this.tableElement.style.border = border;
                break;
        }
    }

    /**
     * Get cell element by row and column
     * @param {number} row
     * @param {number} col
     * @returns {HTMLElement|null}
     */
    getCellElement(row, col) {
        const cell = this.tableCollection?.getCell(row, col);
        return cell?.getElement() || null;
    }

    /**
     * Re-render a specific cell (after content update)
     * @param {number} row
     * @param {number} col
     * @returns {Promise}
     */
    async rerenderCell(row, col) {
        const cell = this.tableCollection?.getCell(row, col);
        const cellElement = cell?.getElement();

        if (cell && cellElement) {
            const adapter = new CellAdapter(cell);
            await adapter.render(cellElement, {
                fontSize: this.fontSize,
                color: this.color
            });
        }
    }

    /**
     * Override direct play - already visible from doInit
     */
    doDirectPlay() {
        // No-op - already visible
    }

    /**
     * Get label position
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        return { x: this.col, y: this.row };
    }

    /**
     * Clear the table
     */
    clear() {
        if (this.containerDOM && this.containerDOM.parentNode) {
            this.containerDOM.parentNode.removeChild(this.containerDOM);
        }
        this.tableElement = null;
        this.containerDOM = null;
        this.tableCollection = null;
        this.cellAdapters = [];
        this.commandResult = null;
        this.isInitialized = false;
    }

    /**
     * Show table
     */
    show() {
        if (this.containerDOM) {
            this.containerDOM.style.display = 'block';
        }
    }

    /**
     * Hide table
     */
    hide() {
        if (this.containerDOM) {
            this.containerDOM.style.display = 'none';
        }
    }
}
