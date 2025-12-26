// Layout system for creating board containers based on config

import { SIZE_PRESETS_2D, resetContainerSize2D, getDeviceType2D } from './common.js';

export function createLayout(config = {}, containerId = 'boards-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id '${containerId}' not found`);
        return null;
    }
    
    
    // Determine device type based on window width
    const deviceType = getDeviceType2D();
    
    // Always use diagram-panel layout with fixed dimensions
    const totalWidth = SIZE_PRESETS_2D.TOTAL_WIDTH;
    const totalHeight = SIZE_PRESETS_2D.HEIGHT;
    const fontSize = deviceType === 'mobile' ? 14 : 16;
    
    // Store fontSize for later use in lesson initialization
    container.setAttribute('data-font-size', fontSize);
    
    // Clear existing content
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.width = `${totalWidth}px`;
    container.style.height = `${totalHeight}px`;
    
    const boards = {};
    
    // Create diagram-panel layout: diagram (600px) and panel (400px)
    const diagramWidth = 600;
    const panelWidth = 400;
    
    boards.diagram = createBoardDiv('diagram', diagramWidth, totalHeight);
    boards.panel = createBoardDiv('panel', panelWidth, totalHeight);
    
    boards.diagram.style.float = 'left';
    boards.panel.style.float = 'right';
    
    container.appendChild(boards.diagram);
    container.appendChild(boards.panel);
    container.style.overflow = 'hidden';
    
    return boards;
}

function createBoardDiv(id, width, height, usePercentage = false) {
    const div = document.createElement('div');
    div.id = `jxgbox-${id}`;
    div.className = 'jxgbox';
    
    if (usePercentage) {
        div.style.width = width;
        div.style.height = height;
    } else {
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;
    }
    
    div.style.boxSizing = 'border-box';
    return div;
}

// Initialize boards based on layout (panel is now HTML-based, only diagram board created)
export function initializeBoards(boardDivs, styleConfig = {}) {
    // Apply global style defaults before creating any boards
    if (styleConfig) {
        // Label options
        if (styleConfig.label) {
            Object.assign(JXG.Options.label, styleConfig.label);
        }
        // Text options
        if (styleConfig.text) {
            Object.assign(JXG.Options.text, styleConfig.text);
        }
        // Line options
        if (styleConfig.line) {
            Object.assign(JXG.Options.line, styleConfig.line);
        }
        // Point options
        if (styleConfig.point) {
            Object.assign(JXG.Options.point, styleConfig.point);
        }
        // Apply any other style categories
        for (const [category, options] of Object.entries(styleConfig)) {
            if (JXG.Options[category] && !['label', 'text', 'line', 'point'].includes(category)) {
                Object.assign(JXG.Options[category], options);
            }
        }
    }
    
    const boards = {};
    
    // Only create diagram board (panel is now HTML-based)
    const div = boardDivs.diagram;
    if (!div) {
        throw new Error('Diagram board div not found');
    }
    
    // Diagram board: maintains aspect ratio, has navigation, shows axes
    const boardConfig = {
        boundingbox: [-6, 6, 6, -6],  // Default square bounds, lessons can override
        showNavigation: false,         // Use custom zoom controls
        showCopyright: false,
        keepaspectratio: true,         // Maintain aspect ratio for geometric accuracy
        axis: false,                   // Let lessons create their own coordinate systems
        grid: false,
        zoom: {
            enabled: false,
            wheel: false,
            pinch: false,
            needShift: false,
            min: 0.1,
            max: 10
        },
        pan: {
            enabled: true,
            needTwoFingers: false,
            needShift: false
        }
    };
    
    boards.diagram = JXG.JSXGraph.initBoard(div.id, boardConfig);
    // Zoom controls removed as per requirement - zoom functionality still available via:
    // - Mouse wheel zoom (if enabled in config)
    // - Pinch zoom on touch devices
    // - Pan by dragging
    // addZoomControls(boards.diagram, div);
    
    return boards;
}

// Add zoom control buttons to a board
function addZoomControls(board, containerDiv) {
    // Create control container
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'zoom-controls';
    controlsDiv.style.cssText = `
        position: absolute;
        bottom: 3px;
        right: 3px;
        display: flex;
        gap: 1px;
        z-index: 1000;
        opacity: 0.6;
    `;
    
    // Create buttons
    const btnStyle = `
        width: 10px;
        height: 10px;
        border: none;
        background: white;
        cursor: pointer;
        border-radius: 0;
        font-size: 8px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        box-shadow: none;
        padding: 0;
    `;
    
    // Zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.innerHTML = '+';
    zoomInBtn.style.cssText = btnStyle;
    zoomInBtn.title = 'Zoom In';
    zoomInBtn.onclick = () => {
        board.zoomIn();
    };
    
    // Zoom out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.innerHTML = '−';
    zoomOutBtn.style.cssText = btnStyle;
    zoomOutBtn.title = 'Zoom Out';
    zoomOutBtn.onclick = () => {
        board.zoomOut();
    };
    
    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '⟲';
    resetBtn.style.cssText = btnStyle;
    resetBtn.title = 'Reset View';
    resetBtn.onclick = () => {
        // Get original bounding box from config
        const bbox = board.attr.boundingbox || [-5, 5, 5, -5];
        board.setBoundingBox(bbox, true);
    };
    
    // Add hover effects
    [zoomInBtn, zoomOutBtn, resetBtn].forEach(btn => {
        btn.onmouseover = () => {
            btn.style.background = '#f0f0f0';
        };
        btn.onmouseout = () => {
            btn.style.background = 'white';
        };
    });
    
    // Append buttons to controls
    controlsDiv.appendChild(zoomOutBtn);
    controlsDiv.appendChild(resetBtn);
    controlsDiv.appendChild(zoomInBtn);
    
    // Append controls to container
    containerDiv.style.position = 'relative';
    containerDiv.appendChild(controlsDiv);
    
    // Add double-click zoom
    board.on('dblclick', function(e) {
        const coords = board.getUsrCoordsOfMouse(e);
        board.setZoom(coords[0], coords[1], board.zoomFactor * 1.5);
    });
}

// Function to reset container size to default
export function resetDefaultSize(containerId = 'boards-container') {
    return resetContainerSize(containerId);
}

// Fullscreen functionality has been removed