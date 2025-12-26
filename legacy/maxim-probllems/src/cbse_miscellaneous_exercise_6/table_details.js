// Table details module for cost minimization problem
// Displays values of dimensions and costs at different length values

/**
 * Creates and manages the cost optimization table
 * @param {Object} controlPanel - The control panel instance
 * @param {number} optimalLength - The optimal length value (x = 2)
 * @returns {Object} Table controller with show/hide/update methods
 */
export function createCostTable(controlPanel, optimalLength = 2) {
    let currentParameter = optimalLength;
    
    // Create container for the table
    const tableContainer = document.createElement('div');
    tableContainer.id = 'cost-table-container';
    tableContainer.style.display = 'none'; // Initially hidden
    
    // Insert table in appropriate position in control panel
    // Try to find the dimensions title as insertion point
    const dimensionsTitle = document.getElementById('text-dimensions-title');
    if (dimensionsTitle && dimensionsTitle.parentNode) {
        dimensionsTitle.parentNode.insertBefore(tableContainer, dimensionsTitle);
    } else {
        // Fallback to appending at end
        if (controlPanel.container) {
            controlPanel.container.appendChild(tableContainer);
        }
    }
    
    // Create table HTML with proper styling
    const tableHTML = `
        <div style="margin-bottom: 5px; font-weight: bold; font-size: 14px; color: #000000;">
            Cost Analysis Table
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #000000;">
            <thead>
                <tr style="background-color: #f5f5f5;">
                    <th style="padding: 5px; border: 1px solid #ddd; text-align: center; font-weight: bold;">
                        Length<br/>(x)
                    </th>
                    <th style="padding: 5px; border: 1px solid #ddd; text-align: center; font-weight: bold;">
                        Width<br/>(y = 4/x)
                    </th>
                    <th style="padding: 5px; border: 1px solid #ddd; text-align: center; font-weight: bold;">
                        Base Cost<br/>(Rs)
                    </th>
                    <th style="padding: 5px; border: 1px solid #ddd; text-align: center; font-weight: bold;">
                        Side Cost<br/>(Rs)
                    </th>
                    <th style="padding: 5px; border: 1px solid #ddd; text-align: center; font-weight: bold;">
                        Total Cost<br/>(Rs)
                    </th>
                    <th style="padding: 5px; border: 1px solid #ddd; text-align: center; font-weight: bold;">
                        +Rs
                    </th>
                </tr>
            </thead>
            <tbody id="cost-table-body"></tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
    
    // Apply container styles for scrolling and spacing
    tableContainer.style.cssText = `
        margin: 10px 5px;
        padding: 10px;
        max-height: 350px;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: white;
    `;
    
    // Calculate cost function
    function calculateCost(length) {
        const width = 4 / length;  // y = 4/x from constraint xy = 4
        const baseCost = 70 * 4;   // Base area is always 4 m²
        const sideArea = 2 * 2 * (length + width);  // 2 * depth * perimeter
        const sideCost = 45 * sideArea;
        const totalCost = baseCost + sideCost;
        return { width, baseCost, sideCost, totalCost };
    }
    
    // Calculate minimum cost (at optimal point)
    const minCost = calculateCost(optimalLength).totalCost;
    
    // Format number for display
    function formatNumber(value, precision = 1) {
        return Number(value.toFixed(precision)).toString();
    }
    
    // Populate table with values
    function populateTable() {
        const tbody = tableContainer.querySelector('#cost-table-body');
        tbody.innerHTML = '';
        
        // Generate rows from x = 0.5 to x = 8 with step 0.5
        for (let length = 0.5; length <= 8; length += 0.5) {
            const { width, baseCost, sideCost, totalCost } = calculateCost(length);
            const aboveMin = totalCost - minCost;
            
            const row = document.createElement('tr');
            
            // Styling based on value
            if (Math.abs(length - optimalLength) < 0.01) {
                // Optimal row - green highlight
                row.style.backgroundColor = '#d4edda';
                row.style.fontWeight = 'bold';
            } else if (Math.abs(length - currentParameter) < 0.01) {
                // Current selection - yellow highlight
                row.style.backgroundColor = '#fff3cd';
            }
            
            // Add hover effect
            row.style.cursor = 'pointer';
            row.addEventListener('mouseenter', () => {
                if (Math.abs(length - optimalLength) > 0.01 && Math.abs(length - currentParameter) > 0.01) {
                    row.style.backgroundColor = '#f0f0f0';
                }
            });
            row.addEventListener('mouseleave', () => {
                if (Math.abs(length - optimalLength) > 0.01 && Math.abs(length - currentParameter) > 0.01) {
                    row.style.backgroundColor = '';
                }
            });
            
            // Click to select row and update slider
            row.addEventListener('click', () => {
                // Update the stepper value
                const stepperElement = document.getElementById('tank-length-value');
                if (stepperElement) {
                    stepperElement.value = length;
                    // Trigger the change event
                    const event = new Event('input', { bubbles: true });
                    stepperElement.dispatchEvent(event);
                }
            });
            
            row.innerHTML = `
                <td style="padding: 5px; border: 1px solid #ddd; text-align: center;">
                    ${formatNumber(length)}
                </td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: center;">
                    ${formatNumber(width)}
                </td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: center;">
                    ${Math.round(baseCost)}
                </td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: center;">
                    ${Math.round(sideCost)}
                </td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: center; ${Math.abs(length - optimalLength) < 0.01 ? 'color: green;' : ''}">
                    ${Math.round(totalCost)}
                </td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: center; ${aboveMin > 0 ? 'color: #d9534f;' : 'color: green;'}">
                    ${aboveMin > 0 ? '+' + Math.round(aboveMin) : '0'}
                </td>
            `;
            
            tbody.appendChild(row);
        }
    }
    
    // Update selected row highlighting
    function updateSelectedLength(length) {
        currentParameter = length;
        const tbody = tableContainer.querySelector('#cost-table-body');
        const rows = tbody.getElementsByTagName('tr');
        
        for (let row of rows) {
            const lengthCell = row.cells[0]; // Length column
            const value = parseFloat(lengthCell.textContent);
            
            // Reset all row styles
            if (Math.abs(value - optimalLength) < 0.01) {
                // Keep optimal row green
                row.style.backgroundColor = '#d4edda';
                row.style.fontWeight = 'bold';
            } else if (Math.abs(value - currentParameter) < 0.01) {
                // Highlight current selection
                row.style.backgroundColor = '#fff3cd';
                row.style.fontWeight = 'normal';
            } else {
                // Default style
                row.style.backgroundColor = '';
                row.style.fontWeight = 'normal';
            }
        }
        
        // Scroll to current value
        for (let i = 0; i < rows.length; i++) {
            const lengthCell = rows[i].cells[0];
            const value = parseFloat(lengthCell.textContent);
            
            if (Math.abs(value - currentParameter) < 0.01) {
                // Scroll this row into view
                rows[i].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                break;
            }
        }
    }
    
    // Controller object with methods
    return {
        show: () => {
            tableContainer.style.display = 'block';
            if (!tableContainer.querySelector('tbody').children.length) {
                populateTable();
            }
            // Scroll to optimal value initially
            setTimeout(() => {
                const tbody = tableContainer.querySelector('#cost-table-body');
                const rows = tbody.getElementsByTagName('tr');
                for (let i = 0; i < rows.length; i++) {
                    const lengthCell = rows[i].cells[0];
                    const value = parseFloat(lengthCell.textContent);
                    if (Math.abs(value - optimalLength) < 0.01) {
                        rows[i].scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                        break;
                    }
                }
            }, 100);
        },
        hide: () => {
            tableContainer.style.display = 'none';
        },
        updateSelectedLength: updateSelectedLength,
        update: (value) => {
            updateSelectedLength(value);
        }
    };
}