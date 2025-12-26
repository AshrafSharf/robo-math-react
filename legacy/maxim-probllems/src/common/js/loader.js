// Lesson loader that sets up boards based on config and calls the render function

import { createLayout, initializeBoards } from './layout.js';

export async function loadLesson(lessonName) {
    try {
        // Load config
        const configResponse = await fetch(`./${lessonName}_config.json`);
        const config = await configResponse.json();
        
        // Create layout
        const boardDivs = createLayout(config);
        if (!boardDivs) {
            throw new Error('Failed to create layout');
        }
        
        // Initialize boards
        const boards = initializeBoards(boardDivs, config.boardConfigs || config.boardConfig);
        
        // Load the lesson module
        const module = await import(`./${lessonName}.js`);
        
        if (typeof module.render !== 'function') {
            throw new Error(`Lesson ${lessonName} must export a render function`);
        }
        
        // Call render with appropriate boards based on layout
        switch (config.layout) {
            case 'single':
                module.render(boards.main);
                break;
            case 'left-right':
                module.render(boards.left, boards.right);
                break;
            case 'top-bottom':
                module.render(boards.top, boards.bottom);
                break;
            case 'grid-2x2':
                module.render(boards.topLeft, boards.topRight, boards.bottomLeft, boards.bottomRight);
                break;
            default:
                module.render(boards.main);
        }
        
        // Return module with boards for external control
        return { config, boards, module };
        
    } catch (error) {
        console.error(`Error loading lesson ${lessonName}:`, error);
        const container = document.getElementById('boards-container');
        if (container) {
            container.innerHTML = `<div style="color: red; padding: 20px;">Error loading lesson: ${error.message}</div>`;
        }
        return null;
    }
}