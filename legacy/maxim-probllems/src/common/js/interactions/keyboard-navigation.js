// Keyboard navigation functionality for JSXGraph elements
// Extracted from common.js to focus on interactive features

import { updateBoard } from './board-updates.js';

/**
 * Enable keyboard navigation for any point (free points, gliders, etc.)
 * @param {JXG.Point} point - The JSXGraph point to make keyboard-navigable
 * @param {Object} options - Configuration options
 * @param {number} options.stepSize - Default coordinate step for free points (default: 0.1)
 * @param {Array} options.boards - Additional boards to update (default: [])
 * @param {Function} options.onMove - Callback function when point moves
 * @returns {Function} Cleanup function to remove event listeners
 */
export function enableKeyboardNavigation(point, options = {}) {
    const defaultOptions = {
        stepSize: 0.1,     // Default coordinate step for free points
        boards: [],        // Additional boards to update
        onMove: null       // Callback function when point moves
    };
    
    const opts = { ...defaultOptions, ...options };
    
    const keydownHandler = (e) => {
        if (document.activeElement === document.body || 
            opts.boards.some(board => document.activeElement === board.containerObj)) {
            
            let moved = false;
            let newX = point.X();
            let newY = point.Y();
            
            // Calculate movement based on arrow keys
            switch(e.key) {
                case 'ArrowLeft':
                    newX -= opts.stepSize;
                    moved = true;
                    break;
                case 'ArrowRight':
                    newX += opts.stepSize;
                    moved = true;
                    break;
                case 'ArrowUp':
                    newY += opts.stepSize;
                    moved = true;
                    break;
                case 'ArrowDown':
                    newY -= opts.stepSize;
                    moved = true;
                    break;
            }
            
            if (moved) {
                e.preventDefault();
                
                // Move the point - JSXGraph will handle constraints automatically
                // For gliders, it will project to the nearest point on the curve/line/circle
                // For free points, it will move freely
                point.setPosition(JXG.COORDS_BY_USER, [newX, newY]);
                
                // Update all specified boards with MathJax re-rendering
                updateBoard(point.board);
                opts.boards.forEach(board => updateBoard(board));
                
                // Call custom callback if provided
                if (opts.onMove) {
                    opts.onMove(point);
                }
            }
        }
    };
    
    document.addEventListener('keydown', keydownHandler);
    
    // Return cleanup function
    return () => {
        document.removeEventListener('keydown', keydownHandler);
    };
}