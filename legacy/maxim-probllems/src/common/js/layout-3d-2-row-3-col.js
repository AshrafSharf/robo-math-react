/**
 * Layout module for 3D 2-row-3-col lessons
 * Creates a layout with:
 * - Top row: 3 Three.js scenes (600px height)
 * - Bottom row: Control panel spanning all columns (200px height)
 * - Total dimensions: 1000x800 pixels
 */

// Dimensions - 1000x800 total
export const LAYOUT_WIDTH = 1000;
export const LAYOUT_HEIGHT = 800;
export const SCENES_HEIGHT = 600;  // Top row height
export const CONTROL_HEIGHT = 200;  // Bottom row height
export const SCENE_WIDTH = Math.floor(LAYOUT_WIDTH / 3);  // ~333px each

/**
 * Creates the complete 3D 2-row-3-col layout
 * @param {string} lessonId - The lesson identifier
 * @returns {Object} Layout components
 */
export function createLayout(lessonId) {
        // Get the container
        const container = document.getElementById('boards-container');
        if (!container) {
            throw new Error('Container element with id "boards-container" not found');
        }

        // Clear any existing content
        container.innerHTML = '';

        // Create main layout structure
        const layoutWrapper = document.createElement('div');
        layoutWrapper.id = 'layout-wrapper';
        layoutWrapper.style.cssText = `
            width: ${LAYOUT_WIDTH}px;
            height: ${LAYOUT_HEIGHT}px;
            margin: 20px auto;
            border: 1px solid #ddd;
            font-family: Arial, sans-serif;
            background: white;
            display: flex;
            flex-direction: column;
        `;

        // Create top row for 3 scenes
        const scenesRow = document.createElement('div');
        scenesRow.id = 'scenes-row';
        scenesRow.style.cssText = `
            width: ${LAYOUT_WIDTH}px;
            height: ${SCENES_HEIGHT}px;
            display: flex;
            flex-direction: row;
            border-bottom: 1px solid #ddd;
        `;

        // Create three scene containers
        const sceneContainers = [];
        for (let i = 0; i < 3; i++) {
            const sceneContainer = document.createElement('div');
            sceneContainer.id = `scene-container-${i + 1}`;
            sceneContainer.style.cssText = `
                width: ${SCENE_WIDTH}px;
                height: ${SCENES_HEIGHT}px;
                border-right: ${i < 2 ? '1px solid #ddd' : 'none'};
                position: relative;
                overflow: hidden;
            `;
            
            scenesRow.appendChild(sceneContainer);
            sceneContainers.push(sceneContainer);
        }

        // Create bottom row for control panel
        const controlRow = document.createElement('div');
        controlRow.id = 'control-row';
        controlRow.style.cssText = `
            width: ${LAYOUT_WIDTH}px;
            height: ${CONTROL_HEIGHT}px;
            background-color: #f8f9fa;
            overflow-y: auto;
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
        `;

        // Create control panel container
        const controlPanelContainer = document.createElement('div');
        controlPanelContainer.id = 'control-panel-container';
        controlPanelContainer.style.cssText = `
            padding: 15px 20px;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        controlRow.appendChild(controlPanelContainer);

        // Assemble layout
        layoutWrapper.appendChild(scenesRow);
        layoutWrapper.appendChild(controlRow);
        container.appendChild(layoutWrapper);

    // Return all components
    return {
        container: layoutWrapper,
        sceneContainers: sceneContainers,
        controlPanelContainer: controlPanelContainer,
        dimensions: {
            layoutWidth: LAYOUT_WIDTH,
            layoutHeight: LAYOUT_HEIGHT,
            sceneWidth: SCENE_WIDTH,
            sceneHeight: SCENES_HEIGHT,
            controlHeight: CONTROL_HEIGHT
        }
    };
}