/**
 * Layout module for 2-column, 3-row lessons
 * First column: 3 JSXGraph diagram panels (60% width)
 * Second column: Control panel (40% width)
 */

// Use IIFE to prevent namespace pollution
(function() {
    'use strict';
    
    const MODULE_NAME = 'layout-2col-3row';
    
    /**
     * Create the 2-column, 3-row layout structure
     * @param {string} containerId - The ID of the container element
     * @param {Object} options - Configuration options
     * @returns {Object} References to the created boards and panels
     */
    function createLayout2Col3Row(containerId = 'boards-container', options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with id "${containerId}" not found`);
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Default dimensions
        const totalWidth = 1000;
        const totalHeight = 600;
        const columnGap = 0;
        
        // Column widths
        const diagramColumnWidth = totalWidth * 0.6;  // 60%
        const controlPanelWidth = totalWidth * 0.4;   // 40%
        
        // Row heights (equal distribution)
        const rowHeight = totalHeight / 3;
        
        // Apply container styles
        Object.assign(container.style, {
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
            display: 'flex',
            flexDirection: 'row',
            gap: `${columnGap}px`,
            margin: '0 auto',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            boxSizing: 'border-box',
            position: 'relative'
        });
        
        // Create first column (diagrams)
        const diagramColumn = document.createElement('div');
        Object.assign(diagramColumn.style, {
            width: `${diagramColumnWidth}px`,
            height: `${totalHeight}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            boxSizing: 'border-box'
        });
        
        // Create three diagram containers
        const boardContainers = [];
        const boardIds = ['jxgbox1', 'jxgbox2', 'jxgbox3'];
        
        for (let i = 0; i < 3; i++) {
            const boardContainer = document.createElement('div');
            boardContainer.id = boardIds[i];
            Object.assign(boardContainer.style, {
                width: '100%',
                height: `${rowHeight}px`,
                position: 'relative',
                backgroundColor: '#ffffff',
                borderBottom: i < 2 ? '1px solid #e0e0e0' : 'none',
                boxSizing: 'border-box'
            });
            boardContainers.push(boardContainer);
            diagramColumn.appendChild(boardContainer);
        }
        
        // Create second column (control panel)
        const controlColumn = document.createElement('div');
        Object.assign(controlColumn.style, {
            width: `${controlPanelWidth}px`,
            height: `${totalHeight}px`,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            borderLeft: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
        });
        
        // Create control panel container
        const controlPanel = document.createElement('div');
        controlPanel.id = 'control-panel';
        Object.assign(controlPanel.style, {
            width: '100%',
            height: '100%',
            padding: '16px',
            boxSizing: 'border-box',
            overflowY: 'auto'
        });
        controlColumn.appendChild(controlPanel);
        
        // Append columns to container
        container.appendChild(diagramColumn);
        container.appendChild(controlColumn);
        
        // Create JSXGraph boards
        const boards = [];
        const defaultBoardOptions = {
            boundingbox: [-5, 5, 5, -5],
            axis: false,  // Let lessons create their own coordinate systems
            showCopyright: false,
            showNavigation: false,
            keepaspectratio: true,
            registerEvents: true
        };
        
        for (let i = 0; i < 3; i++) {
            const boardOptions = Object.assign({}, defaultBoardOptions, options[`board${i + 1}Options`] || {});
            const board = JXG.JSXGraph.initBoard(boardIds[i], boardOptions);
            boards.push(board);
        }
        
        return {
            boards: boards,
            board1: boards[0],
            board2: boards[1],
            board3: boards[2],
            controlPanel: controlPanel,
            containers: {
                main: container,
                diagramColumn: diagramColumn,
                controlColumn: controlColumn,
                boardContainers: boardContainers
            },
            dimensions: {
                totalWidth: totalWidth,
                totalHeight: totalHeight,
                diagramColumnWidth: diagramColumnWidth,
                controlPanelWidth: controlPanelWidth,
                rowHeight: rowHeight
            }
        };
    }
    
    /**
     * Update board sizes when window resizes
     * @param {Array} boards - Array of JSXGraph board instances
     */
    function updateBoardSizes(boards) {
        boards.forEach(board => {
            if (board && board.containerObj) {
                const container = board.containerObj;
                const width = container.offsetWidth;
                const height = container.offsetHeight;
                board.resizeContainer(width, height);
            }
        });
    }
    
    // Export for ES modules
    window.layoutModule2Col3Row = {
        createLayout2Col3Row,
        updateBoardSizes
    };
})();

// ES module export
export const layoutModule2Col3Row = window.layoutModule2Col3Row;