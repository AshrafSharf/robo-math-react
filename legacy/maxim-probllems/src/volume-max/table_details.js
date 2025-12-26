// Table Details Module for Volume Maximization
// Shows a table with cut size values and corresponding volumes

/**
 * Creates and manages the volume table
 * @param {Object} controlPanel - The control panel instance
 * @param {number} sheetSize - Size of the sheet (12 units)
 * @param {number} optimalCut - The optimal cut value (2 units)
 * @returns {Object} Table controller
 */
export function createVolumeTable(controlPanel, sheetSize = 12, optimalCut = 2) {
    // Create a container for the table
    const tableContainer = document.createElement('div');
    tableContainer.id = 'volume-table-container';
    tableContainer.style.display = 'none'; // Initially hidden
    
    // Insert the table after the Controls title but before Box Dimensions
    const dimensionsTitle = document.getElementById('text-dimensions-title');
    if (dimensionsTitle && dimensionsTitle.parentNode) {
        dimensionsTitle.parentNode.insertBefore(tableContainer, dimensionsTitle);
    } else {
        // Fallback if we can't find the right position
        controlPanel.container.appendChild(tableContainer);
    }
    
    // Create a simple table without radio buttons
    const tableHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #000000;">
            <thead>
                <tr style="border-bottom: 2px solid #ddd;">
                    <th style="padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;">Cut (x)</th>
                    <th style="padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;">Base</th>
                    <th style="padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;">Height</th>
                    <th style="padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;">Volume</th>
                    <th style="padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;">% of Max</th>
                </tr>
            </thead>
            <tbody id="volume-table-body"></tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
    tableContainer.style.cssText = 'margin: 2px 5px 0; padding: 2px; max-height: 300px; overflow-y: auto;';
    
    const tbody = tableContainer.querySelector('#volume-table-body');
    
    // Calculate volume for a given cut size
    function calculateVolume(cutSize) {
        const base = sheetSize - 2 * cutSize;
        const height = cutSize;
        const volume = cutSize * base * base;
        return { base, height, volume };
    }
    
    // Calculate max volume (at optimal cut)
    const maxVolume = optimalCut * Math.pow(sheetSize - 2 * optimalCut, 2);
    
    // Generate and populate table
    function populateTable() {
        tbody.innerHTML = '';
        
        // Generate values from 0.5 to 5.5 in steps of 0.5
        const startCut = 0.5;
        const endCut = 5.5;
        const step = 0.5;
        
        for (let cut = startCut; cut <= endCut; cut += step) {
            const { base, height, volume } = calculateVolume(cut);
            const percentOfMax = (volume / maxVolume * 100).toFixed(1);
            
            const row = document.createElement('tr');
            row.style.cssText = 'border-bottom: 1px solid #eee;';
            
            // Highlight the optimal row
            if (Math.abs(cut - optimalCut) < 0.01) {
                row.style.backgroundColor = '#e8f4fd';
                row.style.fontWeight = 'bold';
            }
            
            row.innerHTML = `
                <td style="padding: 3px; text-align: center; font-size: 13px;">${cut.toFixed(1)}</td>
                <td style="padding: 3px; text-align: center; font-size: 13px;">${base.toFixed(1)}</td>
                <td style="padding: 3px; text-align: center; font-size: 13px;">${height.toFixed(1)}</td>
                <td style="padding: 3px; text-align: center; font-size: 13px;">${volume.toFixed(1)}</td>
                <td style="padding: 3px; text-align: center; font-size: 13px;">${percentOfMax}%</td>
            `;
            
            tbody.appendChild(row);
        }
    }
    
    // Initial population
    populateTable();
    
    let currentHighlightedRow = null;
    
    // Controller object
    const controller = {
        show() {
            tableContainer.style.display = 'block';
        },
        
        hide() {
            tableContainer.style.display = 'none';
        },
        
        isVisible() {
            return tableContainer.style.display !== 'none';
        },
        
        updateSelectedCut(cutValue) {
            // Clear previous highlight
            if (currentHighlightedRow) {
                currentHighlightedRow.style.border = '';
                currentHighlightedRow.style.boxShadow = '';
            }
            
            // Find and highlight the row closest to the current cut value
            const rows = tbody.querySelectorAll('tr');
            let closestRow = null;
            let minDiff = Infinity;
            
            rows.forEach(row => {
                const cutCell = row.querySelector('td:first-child');
                if (cutCell) {
                    const rowCutValue = parseFloat(cutCell.textContent);
                    const diff = Math.abs(rowCutValue - cutValue);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestRow = row;
                    }
                }
            });
            
            if (closestRow) {
                closestRow.style.border = '2px solid #4488ff';
                closestRow.style.boxShadow = '0 0 4px rgba(68, 136, 255, 0.3)';
                currentHighlightedRow = closestRow;
                
                // Scroll the row into view if needed
                const containerRect = tableContainer.getBoundingClientRect();
                const rowRect = closestRow.getBoundingClientRect();
                if (rowRect.top < containerRect.top || rowRect.bottom > containerRect.bottom) {
                    closestRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        },
        
        destroy() {
            if (tableContainer.parentNode) {
                tableContainer.parentNode.removeChild(tableContainer);
            }
        }
    };
    
    return controller;
}