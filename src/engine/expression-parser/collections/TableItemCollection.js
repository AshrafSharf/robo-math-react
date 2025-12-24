/**
 * TableItemCollection - Stores table structure for item() access
 *
 * Similar pattern to TextItemCollection and ShapeCollection.
 * Provides row and cell access with full mutation support.
 *
 * Usage:
 *   A = table()           // Creates table from Settings panel
 *   item(A, 0)            // Returns TableRow (row 0)
 *   item(A, 0, 1)         // Returns TableCell (row 0, col 1)
 */
export class TableItemCollection {
    /**
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     */
    constructor(rows = 0, cols = 0) {
        this.rows = rows;
        this.cols = cols;
        this.cells = []; // 2D array of TableCell objects
    }

    // ===== ROW ACCESS =====

    /**
     * Get the number of rows
     * @returns {number}
     */
    getRowCount() {
        return this.rows;
    }

    /**
     * Get a row wrapper for row-level operations
     * @param {number} rowIndex
     * @returns {TableRow|null}
     */
    getRow(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.rows) return null;
        return new TableRow(this, rowIndex);
    }

    // ===== CELL ACCESS =====

    /**
     * Get the number of columns
     * @returns {number}
     */
    getColumnCount() {
        return this.cols;
    }

    /**
     * Get a cell by row and column index
     * @param {number} rowIndex
     * @param {number} colIndex
     * @returns {TableCell|null}
     */
    getCell(rowIndex, colIndex) {
        if (rowIndex < 0 || rowIndex >= this.rows) return null;
        if (colIndex < 0 || colIndex >= this.cols) return null;
        return this.cells[rowIndex]?.[colIndex] || null;
    }

    /**
     * Set a cell at the given position
     * @param {number} rowIndex
     * @param {number} colIndex
     * @param {TableCell} cell
     */
    setCell(rowIndex, colIndex, cell) {
        if (rowIndex >= 0 && rowIndex < this.rows && colIndex >= 0 && colIndex < this.cols) {
            if (!this.cells[rowIndex]) {
                this.cells[rowIndex] = [];
            }
            this.cells[rowIndex][colIndex] = cell;
        }
    }

    // ===== COLLECTION INTERFACE =====

    /**
     * Get total number of cells
     * @returns {number}
     */
    size() {
        return this.rows * this.cols;
    }

    /**
     * Get total number of cells (JS convention)
     * @returns {number}
     */
    get length() {
        return this.rows * this.cols;
    }

    /**
     * Check if collection is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.rows === 0 || this.cols === 0;
    }

    /**
     * Get all cells as flat array
     * @returns {TableCell[]}
     */
    getAllCells() {
        const allCells = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.getCell(r, c);
                if (cell) allCells.push(cell);
            }
        }
        return allCells;
    }

    // ===== FACTORY =====

    /**
     * Build collection from settings options
     * @param {Object} options - { rows, cols, cells: [[{content}, ...], ...] }
     * @returns {TableItemCollection}
     */
    static fromOptions(options) {
        const rows = options.rows || 0;
        const cols = options.cols || 0;
        const collection = new TableItemCollection(rows, cols);

        // Initialize cells 2D array
        if (options.cells && Array.isArray(options.cells)) {
            collection.cells = options.cells.map((row, rowIdx) =>
                row.map((cellData, colIdx) => new TableCell(cellData, rowIdx, colIdx))
            );
        } else {
            // Create empty cells if no data provided
            collection.cells = [];
            for (let r = 0; r < rows; r++) {
                collection.cells[r] = [];
                for (let c = 0; c < cols; c++) {
                    collection.cells[r][c] = new TableCell({}, r, c);
                }
            }
        }

        return collection;
    }
}

/**
 * TableRow - Wrapper for row-level operations
 *
 * Returned by item(A, row) for full mutation support.
 */
export class TableRow {
    /** Marker property for adapter detection */
    isTableRow = true;

    /**
     * @param {TableItemCollection} collection - Parent collection
     * @param {number} rowIndex - Row index in collection
     */
    constructor(collection, rowIndex) {
        this.collection = collection;
        this.rowIndex = rowIndex;
    }

    // ===== VISIBILITY =====

    /**
     * Show all cells in this row
     */
    show() {
        for (let c = 0; c < this.getCellCount(); c++) {
            const cell = this.getCell(c);
            if (cell) cell.show();
        }
    }

    /**
     * Hide all cells in this row
     */
    hide() {
        for (let c = 0; c < this.getCellCount(); c++) {
            const cell = this.getCell(c);
            if (cell) cell.hide();
        }
    }

    // ===== SVG PATHS =====

    /**
     * Get all SVG paths from all cells in this row
     * @returns {Element[]}
     */
    getSVGPaths() {
        const allPaths = [];
        for (let c = 0; c < this.getCellCount(); c++) {
            const cell = this.getCell(c);
            if (cell) {
                const paths = cell.getSVGPaths();
                allPaths.push(...paths);
            }
        }
        return allPaths;
    }

    /**
     * Get all cell DOM elements in this row
     * @returns {HTMLElement[]}
     */
    getElements() {
        const elements = [];
        for (let c = 0; c < this.getCellCount(); c++) {
            const cell = this.getCell(c);
            if (cell && cell.element) {
                elements.push(cell.element);
            }
        }
        return elements;
    }

    // ===== CELL ACCESS =====

    /**
     * Get the number of cells in this row
     * @returns {number}
     */
    getCellCount() {
        return this.collection.cols;
    }

    /**
     * Get a cell by column index
     * @param {number} colIndex
     * @returns {TableCell|null}
     */
    getCell(colIndex) {
        return this.collection.getCell(this.rowIndex, colIndex);
    }

    /**
     * Get all cells in this row
     * @returns {TableCell[]}
     */
    getAllCells() {
        const cells = [];
        for (let c = 0; c < this.getCellCount(); c++) {
            const cell = this.getCell(c);
            if (cell) cells.push(cell);
        }
        return cells;
    }

    // ===== MUTATION =====

    /**
     * Set content of a cell in this row
     * @param {number} colIndex
     * @param {string} content
     */
    setCellContent(colIndex, content) {
        const cell = this.getCell(colIndex);
        if (cell) cell.setContent(content);
    }

    // ===== STYLE OPERATIONS (apply to all cells in row) =====

    /**
     * Apply styles to all cells in this row
     * @param {Object} styles - CSS style properties
     */
    setStyle(styles) {
        for (let c = 0; c < this.getCellCount(); c++) {
            const cell = this.getCell(c);
            if (cell) cell.setStyle(styles);
        }
    }

    /**
     * Add a CSS class mark to all cells in this row
     * @param {string} className
     */
    addMark(className) {
        for (let c = 0; c < this.getCellCount(); c++) {
            const cell = this.getCell(c);
            if (cell) cell.addMark(className);
        }
    }

    /**
     * Remove a CSS class mark from all cells in this row
     * @param {string} className
     */
    removeMark(className) {
        for (let c = 0; c < this.getCellCount(); c++) {
            const cell = this.getCell(c);
            if (cell) cell.removeMark(className);
        }
    }

    /**
     * Clear all marks from all cells in this row
     */
    clearMarks() {
        for (let c = 0; c < this.getCellCount(); c++) {
            const cell = this.getCell(c);
            if (cell) cell.clearMarks();
        }
    }
}

/**
 * TableCell - Single cell data with mutation support
 *
 * Returned by item(A, row, col) for direct cell access.
 */
export class TableCell {
    /** Marker property for adapter detection */
    isTableCell = true;

    /**
     * @param {Object} data - Cell data { content, style, marks }
     * @param {number} rowIndex - Row index in collection
     * @param {number} colIndex - Column index in collection
     */
    constructor(data, rowIndex, colIndex) {
        this.content = data?.content || '';
        this.style = data?.style || {};
        this.marks = data?.marks || [];
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.element = null; // DOM reference set during render
        this.cellAdapter = null; // CellAdapter reference set during render
    }

    // ===== CONTENT =====

    /**
     * Get cell content
     * @returns {string}
     */
    getContent() {
        return this.content;
    }

    /**
     * Set cell content
     * @param {string} content
     */
    setContent(content) {
        this.content = content;
    }

    // ===== STYLE =====

    /**
     * Get cell styles
     * @returns {Object}
     */
    getStyle() {
        return { ...this.style };
    }

    /**
     * Set/merge cell styles
     * @param {Object} styles - CSS style properties
     */
    setStyle(styles) {
        Object.assign(this.style, styles);
        // Apply to DOM if element exists
        if (this.element) {
            Object.assign(this.element.style, styles);
        }
    }

    // ===== MARKS (CSS classes) =====

    /**
     * Get all marks on this cell
     * @returns {string[]}
     */
    getMarks() {
        return [...this.marks];
    }

    /**
     * Add a CSS class mark
     * @param {string} className
     */
    addMark(className) {
        if (!this.marks.includes(className)) {
            this.marks.push(className);
            if (this.element) {
                this.element.classList.add(className);
            }
        }
    }

    /**
     * Remove a CSS class mark
     * @param {string} className
     */
    removeMark(className) {
        const index = this.marks.indexOf(className);
        if (index !== -1) {
            this.marks.splice(index, 1);
            if (this.element) {
                this.element.classList.remove(className);
            }
        }
    }

    /**
     * Check if cell has a specific mark
     * @param {string} className
     * @returns {boolean}
     */
    hasMark(className) {
        return this.marks.includes(className);
    }

    /**
     * Clear all marks
     */
    clearMarks() {
        if (this.element) {
            this.marks.forEach(m => this.element.classList.remove(m));
        }
        this.marks = [];
    }

    // ===== DOM =====

    /**
     * Set DOM element reference (called during render)
     * @param {HTMLElement} element
     */
    setElement(element) {
        this.element = element;
        // Apply any pending styles and marks
        if (element) {
            Object.assign(element.style, this.style);
            this.marks.forEach(m => element.classList.add(m));
        }
    }

    /**
     * Get DOM element reference
     * @returns {HTMLElement|null}
     */
    getElement() {
        return this.element;
    }

    /**
     * Set CellAdapter reference (called during render)
     * @param {CellAdapter} adapter
     */
    setCellAdapter(adapter) {
        this.cellAdapter = adapter;
    }

    /**
     * Get CellAdapter reference
     * @returns {CellAdapter|null}
     */
    getCellAdapter() {
        return this.cellAdapter;
    }

    // ===== MATH DETECTION =====

    /**
     * Check if cell content is LaTeX math
     * @returns {boolean}
     */
    isMath() {
        return this.cellAdapter ? this.cellAdapter.isMath() : false;
    }

    /**
     * Get the math container element (.table-cell-math div)
     * @returns {HTMLElement|null}
     */
    getMathContainer() {
        if (!this.element) return null;
        return this.element.querySelector('.table-cell-math');
    }

    /**
     * Get SVG paths from rendered LaTeX content
     * @returns {Element[]}
     */
    getSVGPaths() {
        const mathContainer = this.getMathContainer();
        if (mathContainer) {
            return Array.from(mathContainer.querySelectorAll('path'));
        }
        return [];
    }

    // ===== VISIBILITY =====

    /**
     * Show the cell
     */
    show() {
        if (!this.element) return;
        this.element.style.visibility = 'visible';
        this.element.style.opacity = '1';
        // Enable strokes if math content
        const paths = this.getSVGPaths();
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
        });
    }

    /**
     * Hide the cell
     */
    hide() {
        if (!this.element) return;
        this.element.style.visibility = 'hidden';
        this.element.style.opacity = '0';
        // Disable strokes if math content
        const paths = this.getSVGPaths();
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,10000');
            path.style.strokeDasharray = '0,10000';
        });
    }

    /**
     * Disable strokes on math content (for animation preparation)
     */
    disableStrokes() {
        const paths = this.getSVGPaths();
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,10000');
            path.style.strokeDasharray = '0,10000';
        });
    }

    /**
     * Enable strokes on math content
     */
    enableStrokes() {
        const paths = this.getSVGPaths();
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
        });
    }
}
