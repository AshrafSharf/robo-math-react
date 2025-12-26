// Layout for 2D-2D lessons with two JSXGraph boards and control panel
// Fixed dimensions: 1000x600 pixels - Boards stacked vertically (600px) + Control Panel (400px)

import { createControlPanel } from './control-panel-2d.js';

// Layout creation function
export function createLayout2D2D(containerId = 'boards-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container element "${containerId}" not found`);
            return null;
        }

        // Set container size
        container.style.width = '1000px';
        container.style.height = '700px';
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.margin = '0';
        container.style.border = '1px solid #ddd';
        container.style.backgroundColor = '#fff';
        container.style.position = 'relative';
        container.style.boxSizing = 'border-box';

        // Create boards wrapper for vertical stacking
        const boardsWrapper = document.createElement('div');
        boardsWrapper.style.width = '600px';
        boardsWrapper.style.height = '700px';
        boardsWrapper.style.display = 'flex';
        boardsWrapper.style.flexDirection = 'column';
        boardsWrapper.style.float = 'left';

        // Create board1 container (top - 350px height)
        const board1Container = document.createElement('div');
        board1Container.id = 'board1-container';
        board1Container.style.width = '600px';
        board1Container.style.height = '350px';
        board1Container.style.position = 'relative';
        board1Container.style.backgroundColor = '#fcfcfc';
        board1Container.style.borderBottom = '1px solid #e0e0e0';
        board1Container.style.borderRight = '1px solid #e0e0e0';

        // Create board2 container (bottom - 350px height)
        const board2Container = document.createElement('div');
        board2Container.id = 'board2-container';
        board2Container.style.width = '600px';
        board2Container.style.height = '350px';
        board2Container.style.position = 'relative';
        board2Container.style.backgroundColor = '#fcfcfc';
        board2Container.style.borderRight = '1px solid #e0e0e0';

        // Create control panel container (400px)
        const panelContainer = document.createElement('div');
        panelContainer.id = 'control-panel';
        panelContainer.style.width = '400px';
        panelContainer.style.height = '700px';
        panelContainer.style.backgroundColor = '#f8f9fa';
        panelContainer.style.overflow = 'visible';
        panelContainer.style.display = 'flex';
        panelContainer.style.flexDirection = 'column';
        panelContainer.style.float = 'right';

        // Add containers to wrapper and main container
        boardsWrapper.appendChild(board1Container);
        boardsWrapper.appendChild(board2Container);
        container.appendChild(boardsWrapper);
        container.appendChild(panelContainer);

        // Create JSXGraph board elements
        const board1Element = document.createElement('div');
        board1Element.id = 'board1';
        board1Element.style.width = '100%';
        board1Element.style.height = '100%';
        board1Container.appendChild(board1Element);

        const board2Element = document.createElement('div');
        board2Element.id = 'board2';
        board2Element.style.width = '100%';
        board2Element.style.height = '100%';
        board2Container.appendChild(board2Element);

        // Create JSXGraph boards
        const board1 = JXG.JSXGraph.initBoard('board1', {
            boundingbox: [-2, 2, 2, -2],
            keepaspectratio: true,
            axis: false,
            grid: false,
            showCopyright: false,
            showNavigation: false,
            pan: {
                enabled: true,
                needTwoFingers: false
            },
            zoom: {
                enabled: true,
                wheel: false,
                needShift: false,
                min: 0.1,
                max: 10
            }
        });

        const board2 = JXG.JSXGraph.initBoard('board2', {
            boundingbox: [-2, 2, 2, -2],
            keepaspectratio: true,
            axis: false,
            grid: false,
            showCopyright: false,
            showNavigation: false,
            pan: {
                enabled: true,
                needTwoFingers: false
            },
            zoom: {
                enabled: true,
                wheel: false,
                needShift: false,
                min: 0.1,
                max: 10
            }
        });

        // Import createControlPanel for 2D lessons
        const controlPanel = createControlPanel(panelContainer);

        return {
            board1: board1,
            board2: board2,
            controlPanel: controlPanel
        };
}