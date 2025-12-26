// Table Row Selector Module
// Provides reusable table creation with radio button row selection
// Designed for control panels in 2D lessons

import katex from 'katex';

/**
 * Creates a table with radio button row selection
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.container - Parent element to append table to
 * @param {Array<string>} options.headers - Column headers (supports LaTeX via KaTeX)
 * @param {Array<number>} options.columnWidths - Optional column widths in pixels
 * @param {Object} options.styles - Optional style overrides
 * @param {Function} options.onSelectionChange - Callback when selection changes
 * @param {number} options.maxHeight - Maximum height before scrolling (default: 400px)
 * @returns {Object} Table controller with methods to manage the table
 */
export function createSelectableTable(options) {
    const {
        container,
        headers = [],
        columnWidths = [],
        styles = {},
        onSelectionChange = () => {},
        maxHeight = 400
    } = options;
    
    // Default styles
    const defaultStyles = {
        container: `margin: 2px 5px 0; padding: 2px; max-height: ${maxHeight}px; overflow-y: auto;`,
        table: 'width: 100%; border-collapse: collapse; font-size: 14px; color: #000000;',
        headerRow: 'border-bottom: 2px solid #ddd;',
        headerCell: 'padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;',
        bodyRow: 'border-bottom: 1px solid #eee;',
        bodyCell: 'padding: 3px; text-align: center; font-size: 13px;',
        radioCell: 'padding: 3px; text-align: center;',
        radio: 'margin: 0; cursor: pointer;'
    };
    
    // Merge styles with defaults
    const mergedStyles = { ...defaultStyles, ...styles };
    
    // Create table container
    const tableContainer = document.createElement('div');
    tableContainer.style.cssText = mergedStyles.container;
    container.appendChild(tableContainer);
    
    // Create table
    const table = document.createElement('table');
    table.style.cssText = mergedStyles.table;
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = mergedStyles.headerRow;
    
    // Add radio column header
    const radioHeader = document.createElement('th');
    radioHeader.style.cssText = mergedStyles.headerCell;
    radioHeader.style.width = columnWidths[0] || '20px';
    headerRow.appendChild(radioHeader);
    
    // Add other headers
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.style.cssText = mergedStyles.headerCell;
        if (columnWidths[index + 1]) {
            th.style.width = columnWidths[index + 1] + 'px';
        }
        
        // Check if header contains LaTeX (starts with $ or contains backslash)
        if (header.includes('$') || header.includes('\\')) {
            // Remove $ signs if present
            const cleanHeader = header.replace(/\$/g, '');
            th.innerHTML = katex.renderToString(cleanHeader, { throwOnError: false });
        } else {
            th.textContent = header;
        }
        
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    
    // Track selected index
    let selectedIndex = 0;
    const radioButtons = [];
    let isDisabled = false;
    
    // Controller object
    const controller = {
        /**
         * Clear all rows from the table
         */
        clearRows() {
            tbody.innerHTML = '';
            radioButtons.length = 0;
            selectedIndex = 0;
        },
        
        /**
         * Add a single row to the table
         * @param {Array} rowData - Array of cell contents (can include LaTeX)
         * @param {Object} options - Row-specific options
         */
        addRow(rowData, options = {}) {
            const row = document.createElement('tr');
            row.style.cssText = mergedStyles.bodyRow;
            
            // Radio button cell
            const radioCell = document.createElement('td');
            radioCell.style.cssText = mergedStyles.radioCell;
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'tableRowSelection_' + Math.random().toString(36).substr(2, 9);
            radio.checked = radioButtons.length === selectedIndex;
            radio.disabled = isDisabled;
            radio.style.cssText = mergedStyles.radio;
            if (isDisabled) {
                radio.style.opacity = '0.5';
                radio.style.cursor = 'not-allowed';
            }
            
            const currentIndex = radioButtons.length;
            radio.onchange = () => {
                if (radio.checked && !isDisabled) {
                    selectedIndex = currentIndex;
                    onSelectionChange(currentIndex, rowData);
                }
            };
            
            radioCell.appendChild(radio);
            row.appendChild(radioCell);
            radioButtons.push(radio);
            
            // Data cells
            rowData.forEach((cellData, index) => {
                const cell = document.createElement('td');
                cell.style.cssText = mergedStyles.bodyCell;
                
                // Apply custom cell styles if provided
                if (options.cellStyles && options.cellStyles[index]) {
                    cell.style.cssText += ';' + options.cellStyles[index];
                }
                
                // Check if cell data contains LaTeX
                if (typeof cellData === 'string' && (cellData.includes('$') || cellData.includes('\\'))) {
                    // Remove $ signs if present
                    const cleanData = cellData.replace(/\$/g, '');
                    cell.innerHTML = katex.renderToString(cleanData, { throwOnError: false });
                } else {
                    cell.textContent = cellData;
                }
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        },
        
        /**
         * Add multiple rows at once
         * @param {Array<Array>} rowsData - Array of row data arrays
         */
        addRows(rowsData) {
            rowsData.forEach(rowData => this.addRow(rowData));
        },
        
        /**
         * Update all rows with new data
         * @param {Array<Array>} rowsData - New row data
         */
        updateRows(rowsData) {
            this.clearRows();
            this.addRows(rowsData);
        },
        
        /**
         * Get the currently selected row index
         * @returns {number} Selected index
         */
        getSelectedIndex() {
            return selectedIndex;
        },
        
        /**
         * Set the selected row by index
         * @param {number} index - Row index to select
         */
        setSelectedIndex(index) {
            if (index >= 0 && index < radioButtons.length) {
                selectedIndex = index;
                radioButtons[index].checked = true;
                // Trigger the change callback
                const rowData = this.getRowData(index);
                onSelectionChange(index, rowData);
            }
        },
        
        /**
         * Get data for a specific row
         * @param {number} index - Row index
         * @returns {Array} Row data
         */
        getRowData(index) {
            const row = tbody.children[index];
            if (!row) return null;
            
            const data = [];
            // Skip first cell (radio button)
            for (let i = 1; i < row.children.length; i++) {
                data.push(row.children[i].textContent);
            }
            return data;
        },
        
        /**
         * Get total number of rows
         * @returns {number} Row count
         */
        getRowCount() {
            return radioButtons.length;
        },
        
        /**
         * Disable all radio buttons in the table
         */
        disable() {
            isDisabled = true;
            radioButtons.forEach(radio => {
                radio.disabled = true;
                radio.style.opacity = '0.5';
                radio.style.cursor = 'not-allowed';
            });
        },
        
        /**
         * Enable all radio buttons in the table
         */
        enable() {
            isDisabled = false;
            radioButtons.forEach(radio => {
                radio.disabled = false;
                radio.style.opacity = '1';
                radio.style.cursor = 'pointer';
            });
        },
        
        /**
         * Check if the table is disabled
         * @returns {boolean} Disabled state
         */
        isDisabled() {
            return isDisabled;
        },
        
        /**
         * Destroy the table and clean up
         */
        destroy() {
            if (tableContainer.parentNode) {
                tableContainer.parentNode.removeChild(tableContainer);
            }
        }
    };
    
    return controller;
}

/**
 * Helper function to format complex numbers for table display
 * @param {number} real - Real part
 * @param {number} imag - Imaginary part
 * @param {number} precision - Decimal precision (default: 1)
 * @returns {string} Formatted complex number
 */
export function formatComplexForTable(real, imag, precision = 1) {
    // Handle special cases
    if (Math.abs(imag) < Math.pow(10, -precision)) {
        return real.toFixed(precision);
    }
    if (Math.abs(real) < Math.pow(10, -precision)) {
        if (Math.abs(imag - 1) < Math.pow(10, -precision)) return 'i';
        if (Math.abs(imag + 1) < Math.pow(10, -precision)) return '-i';
        return `${imag.toFixed(precision)}i`;
    }
    
    // General case
    if (imag > 0) {
        if (Math.abs(imag - 1) < Math.pow(10, -precision)) {
            return `${real.toFixed(precision)} + i`;
        }
        return `${real.toFixed(precision)} + ${imag.toFixed(precision)}i`;
    } else {
        if (Math.abs(imag + 1) < Math.pow(10, -precision)) {
            return `${real.toFixed(precision)} - i`;
        }
        return `${real.toFixed(precision)} - ${Math.abs(imag).toFixed(precision)}i`;
    }
}

/**
 * Helper function to format polar form for table display
 * @param {number} magnitude - Magnitude (r)
 * @param {number} angleDeg - Angle in degrees
 * @param {number} magPrecision - Magnitude precision (default: 2)
 * @returns {string} LaTeX string for polar form
 */
export function formatPolarForTable(magnitude, angleDeg, magPrecision = 2) {
    const degStr = Number.isInteger(angleDeg) ? angleDeg.toString() : angleDeg.toFixed(1);
    return `${magnitude.toFixed(magPrecision)}(\\cos ${degStr}° + i\\sin ${degStr}°)`;
}