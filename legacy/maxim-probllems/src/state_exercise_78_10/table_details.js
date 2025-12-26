// Table Details Module for Open Box Volume Maximization
// Shows a table with base size values and corresponding volumes

/**
 * Creates and manages the volume table
 * @param {Object} controlPanel - The control panel instance
 * @param {number} surfaceArea - Fixed surface area constraint (108)
 * @param {number} optimalX - The optimal base size (6)
 * @param {number} optimalY - The optimal height (3)
 * @returns {Object} Table controller
 */
export function createVolumeTable(controlPanel, surfaceArea = 108, optimalX = 6, optimalY = 3) {
    // Create a container for the table
    const tableContainer = document.createElement('div');
    tableContainer.id = 'volume-table-container';
    tableContainer.style.display = 'none'; // Initially hidden
    
    // Insert the table after the Controls title
    const controlsTitle = document.getElementById('text-control-title');
    if (controlsTitle && controlsTitle.parentNode) {
        controlsTitle.parentNode.insertBefore(tableContainer, controlsTitle.nextSibling);
    } else {
        // Fallback if we can't find the right position
        if (controlPanel.container) {
            controlPanel.container.appendChild(tableContainer);
        }
    }
    
    // Create a table showing values
    const tableHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #000000;">
            <thead>
                <tr style="border-bottom: 2px solid #ddd;">
                    <th style="padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;">Base (x)</th>
                    <th style="padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;">Height (y)</th>
                    <th style="padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;">Surface Area</th>
                    <th style="padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;">V (cm³)</th>
                    <th style="padding: 4px 5px; text-align: center; font-weight: bold; font-size: 13px;">% of Max</th>
                </tr>
            </thead>
            <tbody id="volume-table-body"></tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
    // Remove max-height to avoid scrollbar - let table show naturally
    tableContainer.style.cssText = 'margin: 10px 5px 10px; padding: 2px;';
    
    const tbody = tableContainer.querySelector('#volume-table-body');
    
    // Calculate height and volume for a given base size
    function calculateValues(x) {
        if (x <= 0) return { y: 0, surfaceArea: 0, volume: 0 };
        const y = (surfaceArea - x * x) / (4 * x);
        if (y <= 0) return { y: 0, surfaceArea: x * x, volume: 0 };
        const actualSA = x * x + 4 * x * y;
        const volume = x * x * y;
        return { y, surfaceArea: actualSA, volume };
    }
    
    // Calculate max volume
    const maxVolume = optimalX * optimalX * optimalY;
    
    // Generate and populate table
    function populateTable() {
        tbody.innerHTML = '';
        
        // Generate fewer values to fit without scrolling - steps of 1.0
        const startX = 1;
        const endX = 10;
        const step = 1.0;
        
        for (let x = startX; x <= endX; x += step) {
            const { y, surfaceArea: sa, volume } = calculateValues(x);
            
            // Skip invalid values (where y would be negative)
            if (y <= 0) continue;
            
            const percentOfMax = volume > 0 ? (volume / maxVolume * 100).toFixed(1) : '0.0';
            
            const row = document.createElement('tr');
            row.style.cssText = 'border-bottom: 1px solid #eee;';
            
            // Highlight the optimal row
            if (Math.abs(x - optimalX) < 0.01) {
                row.style.backgroundColor = '#e8f4fd';
                row.style.fontWeight = 'bold';
            }
            
            row.innerHTML = `
                <td style="padding: 3px; text-align: center; font-size: 13px;">${x.toFixed(1)}</td>
                <td style="padding: 3px; text-align: center; font-size: 13px;">${y.toFixed(2)}</td>
                <td style="padding: 3px; text-align: center; font-size: 13px;">${sa.toFixed(1)}</td>
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
        
        updateSelectedValue(baseValue) {
            // Clear previous highlight
            if (currentHighlightedRow) {
                currentHighlightedRow.style.border = '';
                currentHighlightedRow.style.boxShadow = '';
            }
            
            // Find and highlight the row closest to the current base value
            const rows = tbody.querySelectorAll('tr');
            let closestRow = null;
            let minDiff = Infinity;
            
            rows.forEach(row => {
                const baseCell = row.querySelector('td:first-child');
                if (baseCell) {
                    const rowBaseValue = parseFloat(baseCell.textContent);
                    const diff = Math.abs(rowBaseValue - baseValue);
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