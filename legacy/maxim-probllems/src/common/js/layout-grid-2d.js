/**
 * Layout creation for Grid-2D lessons (2x2 grid of JSXGraph boards + control panel)
 * Creates a responsive layout with four diagram panels and a control panel
 */

export function createGrid2DLayout() {
    // Get the container
    const container = document.getElementById('boards-container');
    if (!container) {
        console.error('Container with id "boards-container" not found');
        return null;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Set container styles
    container.style.cssText = `
        display: flex;
        width: 1100px;
        height: 700px;
        position: relative;
    `;
    
    // Create left side container for the 2x2 grid
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 2px;
        width: 750px;
        height: 700px;
        background-color: #ddd;
    `;
    
    // Create four board containers
    const topLeftContainer = createBoardContainer('top-left-board');
    const topRightContainer = createBoardContainer('top-right-board');
    const bottomLeftContainer = createBoardContainer('bottom-left-board');
    const bottomRightContainer = createBoardContainer('bottom-right-board');
    
    // Add boards to grid
    gridContainer.appendChild(topLeftContainer);
    gridContainer.appendChild(topRightContainer);
    gridContainer.appendChild(bottomLeftContainer);
    gridContainer.appendChild(bottomRightContainer);
    
    // Create control panel container
    const controlPanelContainer = document.createElement('div');
    controlPanelContainer.id = 'control-panel-container';
    controlPanelContainer.style.cssText = `
        width: 350px;
        height: 700px;
        background-color: #ffffff;
        border-left: 1px solid #ddd;
        overflow-y: auto;
        overflow-x: hidden;
    `;
    
    // Create control panel element
    const controlPanel = document.createElement('div');
    controlPanel.id = 'control-panel';
    controlPanel.style.cssText = `
        padding: 20px;
        box-sizing: border-box;
    `;
    controlPanelContainer.appendChild(controlPanel);
    
    // Assemble the layout
    container.appendChild(gridContainer);
    container.appendChild(controlPanelContainer);
    
    // Add responsive styles
    const style = document.createElement('style');
    style.textContent = `
        .board-container {
            position: relative;
            width: 100%;
            height: 100%;
            background-color: white;
            overflow: hidden;
        }
        
        /* Responsive design for smaller screens */
        @media (max-width: 1140px) {
            #boards-container {
                width: 100% !important;
                height: auto !important;
                flex-direction: column;
            }
            #boards-container > div:first-child {
                width: 100% !important;
                height: 600px;
            }
            #control-panel-container {
                width: 100% !important;
                height: auto !important;
                min-height: 200px;
                border-left: none !important;
                border-top: 1px solid #ddd;
            }
        }
        
        /* Mobile adjustments */
        @media (max-width: 600px) {
            #boards-container > div:first-child {
                height: 500px;
            }
            .board-container {
                min-height: 245px;
            }
        }
    `;
    document.head.appendChild(style);
    
    return {
        topLeftBoardId: 'top-left-board',
        topRightBoardId: 'top-right-board',
        bottomLeftBoardId: 'bottom-left-board',
        bottomRightBoardId: 'bottom-right-board',
        controlPanelElement: controlPanel
    };
}

function createBoardContainer(boardId) {
    const container = document.createElement('div');
    container.className = 'board-container';
    
    const board = document.createElement('div');
    board.id = boardId;
    board.style.cssText = `
        width: 100%;
        height: 100%;
    `;
    
    container.appendChild(board);
    return container;
}