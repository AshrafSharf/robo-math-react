/**
 * Common utilities for Grid-2D lessons (2x2 grid layout)
 * Provides helper functions for working with multiple JSXGraph boards
 */

import { COLORS } from './colors.js';
import { SIZES } from './sizes.js';
import { createCoordinateSystem, createVector, mathDisplay } from './common.js';

/**
 * Synchronize zoom and pan across all four boards
 * @param {Array} boards - Array of JSXGraph board objects [topLeft, topRight, bottomLeft, bottomRight]
 */
export function synchronizeBoards(boards) {
    boards.forEach((board, index) => {
        board.on('boundingbox', function() {
            const bbox = board.getBoundingBox();
            boards.forEach((otherBoard, otherIndex) => {
                if (index !== otherIndex) {
                    otherBoard.setBoundingBox(bbox, false);
                }
            });
        });
    });
}

/**
 * Create synchronized points across multiple boards
 * @param {Array} boards - Array of JSXGraph boards
 * @param {Array} coords - Initial coordinates [x, y]
 * @param {Object} options - JSXGraph point options
 * @returns {Array} Array of created points
 */
export function createSynchronizedPoints(boards, coords, options) {
    const points = [];
    
    // Create the first point as draggable
    const mainPoint = boards[0].create('point', coords, {
        ...options,
        fixed: false
    });
    points.push(mainPoint);
    
    // Create dependent points on other boards
    for (let i = 1; i < boards.length; i++) {
        const dependentPoint = boards[i].create('point', [
            () => mainPoint.X(),
            () => mainPoint.Y()
        ], {
            ...options,
            fixed: true
        });
        points.push(dependentPoint);
    }
    
    return points;
}

/**
 * Create a function graph on multiple boards
 * @param {Array} boards - Array of JSXGraph boards to draw on
 * @param {Function} func - The function to graph
 * @param {Object} options - JSXGraph function graph options
 * @returns {Array} Array of created function graphs
 */
export function createMultiBoardFunction(boards, func, options = {}) {
    return boards.map(board => 
        board.create('functiongraph', [func], options)
    );
}

/**
 * Clear specific elements from all boards
 * @param {Array} boards - Array of JSXGraph boards
 * @param {Array} elementArrays - Arrays of elements to remove
 */
export function clearBoardElements(boards, elementArrays) {
    elementArrays.forEach(elements => {
        elements.forEach(element => {
            if (element && element.board) {
                element.board.removeObject(element);
            }
        });
    });
}

/**
 * Create coordinate systems on all four boards with individual configurations
 * @param {Array} boards - Array of JSXGraph boards [topLeft, topRight, bottomLeft, bottomRight]
 * @param {Object} configs - Configuration object with settings for each board
 */
export function createGridCoordinateSystems(boards, configs) {
    const [topLeft, topRight, bottomLeft, bottomRight] = boards;
    
    if (configs.topLeft) {
        createCoordinateSystem(topLeft, configs.topLeft);
    }
    if (configs.topRight) {
        createCoordinateSystem(topRight, configs.topRight);
    }
    if (configs.bottomLeft) {
        createCoordinateSystem(bottomLeft, configs.bottomLeft);
    }
    if (configs.bottomRight) {
        createCoordinateSystem(bottomRight, configs.bottomRight);
    }
}

/**
 * Helper to create labeled points on a specific board
 * @param {Object} board - JSXGraph board
 * @param {Array} pointsData - Array of point data [{coords: [x,y], name: 'A', color: COLORS.RED}, ...]
 * @returns {Array} Created points
 */
export function createLabeledPoints(board, pointsData) {
    return pointsData.map(data => {
        const color = data.color || COLORS.BLUE;
        return board.create('point', data.coords, {
            name: data.name,
            size: data.size || 4,
            fillColor: color,
            strokeColor: color + '_DARK',
            fixed: data.fixed !== undefined ? data.fixed : true,
            showInfobox: false,
            label: {
                offset: data.labelOffset || [10, 10],
                fontSize: data.fontSize || 16,
                color: '#000000'
            }
        });
    });
}

/**
 * Create a comparative visualization across boards
 * Useful for showing transformations or different representations
 * @param {Array} boards - Array of JSXGraph boards
 * @param {Function} setupFunc - Function that takes (board, index) and sets up the visualization
 */
export function setupComparativeVisualization(boards, setupFunc) {
    boards.forEach((board, index) => {
        board.suspendUpdate();
        setupFunc(board, index);
        board.unsuspendUpdate();
    });
}

// Re-export common utilities that work across all lesson types
export { COLORS, SIZES, createCoordinateSystem, createVector, mathDisplay };