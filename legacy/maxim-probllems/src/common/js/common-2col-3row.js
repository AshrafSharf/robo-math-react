/**
 * Common utilities for 2-column, 3-row lessons
 * Provides helper functions specific to lessons with three diagram panels
 */

import { COLORS, createCoordinateSystem } from './common.js';
import { SIZES } from './sizes.js';

// Re-export for convenience
export { COLORS, SIZES };

/**
 * Create synchronized coordinate systems across multiple boards
 * @param {Array} boards - Array of JSXGraph board instances
 * @param {Object} options - Coordinate system options
 */
export function createSynchronizedCoordinateSystems(boards, options = {}) {
    const defaultOptions = {
        xLabel: 'x',
        yLabel: 'y',
        xTickStep: 1,
        yTickStep: 1,
        showGrid: true,
        gridStyle: {
            strokeColor: '#e0e0e0',
            strokeWidth: 0.5
        }
    };
    
    const mergedOptions = Object.assign({}, defaultOptions, options);
    
    boards.forEach((board, index) => {
        // Allow per-board customization
        const boardOptions = options[`board${index + 1}`] 
            ? Object.assign({}, mergedOptions, options[`board${index + 1}`])
            : mergedOptions;
            
        createCoordinateSystem(board, boardOptions);
    });
}

/**
 * Synchronize zoom and pan across multiple boards
 * @param {Array} boards - Array of JSXGraph board instances
 */
export function synchronizeBoards(boards) {
    boards.forEach((board, i) => {
        board.on('boundingbox', () => {
            const bbox = board.getBoundingBox();
            boards.forEach((otherBoard, j) => {
                if (i !== j) {
                    otherBoard.setBoundingBox(bbox, false);
                }
            });
        });
    });
}

/**
 * Create a point that appears on multiple boards
 * @param {Array} boards - Array of JSXGraph board instances
 * @param {Array} coords - [x, y] coordinates
 * @param {Object} options - Point styling options
 * @returns {Array} Array of created points
 */
export function createMultiBoardPoint(boards, coords, options = {}) {
    const defaultOptions = {
        size: SIZES.POINT.DEFAULT,
        fillColor: COLORS.BLUE,
        strokeColor: COLORS.BLUE_DARK,
        name: '',
        withLabel: true,
        label: {
            fontSize: SIZES.FONT.LABEL,
            offset: [10, 10]
        }
    };
    
    const mergedOptions = Object.assign({}, defaultOptions, options);
    const points = [];
    
    boards.forEach((board, index) => {
        const pointOptions = Object.assign({}, mergedOptions);
        
        // Allow per-board customization
        if (options[`board${index + 1}`]) {
            Object.assign(pointOptions, options[`board${index + 1}`]);
        }
        
        const point = board.create('point', coords, pointOptions);
        points.push(point);
    });
    
    // Synchronize point movement if the first point is draggable
    if (!options.fixed) {
        points[0].on('drag', () => {
            const newCoords = [points[0].X(), points[0].Y()];
            points.slice(1).forEach(point => {
                point.setPosition(JXG.COORDS_BY_USER, newCoords);
            });
        });
    }
    
    return points;
}

/**
 * Create a function graph that appears on multiple boards
 * @param {Array} boards - Array of JSXGraph board instances
 * @param {Function} func - The function to graph
 * @param {Object} options - Graph styling options
 * @returns {Array} Array of created function graphs
 */
export function createMultiBoardFunction(boards, func, options = {}) {
    const defaultOptions = {
        strokeColor: COLORS.BLUE,
        strokeWidth: SIZES.LINE.MEDIUM,
        highlightStrokeColor: COLORS.BLUE_DARK,
        highlightStrokeWidth: SIZES.LINE.THICK
    };
    
    const mergedOptions = Object.assign({}, defaultOptions, options);
    const graphs = [];
    
    boards.forEach((board, index) => {
        const graphOptions = Object.assign({}, mergedOptions);
        
        // Allow per-board customization
        if (options[`board${index + 1}`]) {
            Object.assign(graphOptions, options[`board${index + 1}`]);
        }
        
        const graph = board.create('functiongraph', [func], graphOptions);
        graphs.push(graph);
    });
    
    return graphs;
}

/**
 * Highlight a specific region on a board
 * @param {Object} board - JSXGraph board instance
 * @param {Object} region - Region definition { xMin, xMax, yMin, yMax }
 * @param {Object} options - Styling options
 * @returns {Object} The created polygon representing the region
 */
export function highlightRegion(board, region, options = {}) {
    const { xMin, xMax, yMin, yMax } = region;
    
    const defaultOptions = {
        fillColor: COLORS.YELLOW,
        fillOpacity: 0.2,
        strokeWidth: 0,
        highlightFillOpacity: 0.3,
        fixed: true
    };
    
    const mergedOptions = Object.assign({}, defaultOptions, options);
    
    const vertices = [
        [xMin, yMin],
        [xMax, yMin],
        [xMax, yMax],
        [xMin, yMax]
    ];
    
    const points = vertices.map(coords => 
        board.create('point', coords, {
            visible: false,
            fixed: true
        })
    );
    
    return board.create('polygon', points, mergedOptions);
}

/**
 * Create linked rulers on different boards
 * @param {Object} board1 - First board for x measurement
 * @param {Object} board2 - Second board for y measurement
 * @param {Object} board3 - Third board for result display
 * @param {Object} options - Configuration options
 * @returns {Object} References to created elements
 */
export function createLinkedRulers(board1, board2, board3, options = {}) {
    // Create draggable point on board1 for x-coordinate
    const xPoint = board1.create('point', [options.initialX || 0, 0], {
        name: 'x',
        size: SIZES.POINT.LARGE,
        fillColor: COLORS.RED,
        strokeColor: COLORS.RED_DARK,
        constrainY: true,  // Only move horizontally
        y: () => 0
    });
    
    // Create draggable point on board2 for y-coordinate
    const yPoint = board2.create('point', [0, options.initialY || 0], {
        name: 'y',
        size: SIZES.POINT.LARGE,
        fillColor: COLORS.GREEN,
        strokeColor: COLORS.GREEN_DARK,
        constrainX: true,  // Only move vertically
        x: () => 0
    });
    
    // Create result point on board3
    const resultPoint = board3.create('point', [
        () => xPoint.X(),
        () => yPoint.Y()
    ], {
        name: options.resultLabel || 'P',
        size: SIZES.POINT.LARGE,
        fillColor: COLORS.BLUE,
        strokeColor: COLORS.BLUE_DARK,
        fixed: true
    });
    
    // Add visual guides if requested
    if (options.showGuides) {
        // Vertical line on board1
        board1.create('line', [[() => xPoint.X(), -10], [() => xPoint.X(), 10]], {
            strokeColor: COLORS.RED,
            strokeWidth: 1,
            strokeOpacity: 0.5,
            straightFirst: false,
            straightLast: false,
            fixed: true
        });
        
        // Horizontal line on board2
        board2.create('line', [[-10, () => yPoint.Y()], [10, () => yPoint.Y()]], {
            strokeColor: COLORS.GREEN,
            strokeWidth: 1,
            strokeOpacity: 0.5,
            straightFirst: false,
            straightLast: false,
            fixed: true
        });
        
        // Crosshairs on board3
        board3.create('line', [[() => resultPoint.X(), -10], [() => resultPoint.X(), 10]], {
            strokeColor: COLORS.GRAY,
            strokeWidth: 1,
            strokeOpacity: 0.3,
            straightFirst: false,
            straightLast: false,
            fixed: true
        });
        
        board3.create('line', [[-10, () => resultPoint.Y()], [10, () => resultPoint.Y()]], {
            strokeColor: COLORS.GRAY,
            strokeWidth: 1,
            strokeOpacity: 0.3,
            straightFirst: false,
            straightLast: false,
            fixed: true
        });
    }
    
    return {
        xPoint,
        yPoint,
        resultPoint,
        getCoordinates: () => ({
            x: xPoint.X(),
            y: yPoint.Y()
        })
    };
}

/**
 * Create a comparison visualization across three boards
 * @param {Object} board1 - First board
 * @param {Object} board2 - Second board  
 * @param {Object} board3 - Third board
 * @param {Function} func1 - Function for board 1
 * @param {Function} func2 - Function for board 2
 * @param {Function} func3 - Function for board 3
 * @param {Object} options - Styling and behavior options
 * @returns {Object} References to created elements
 */
export function createComparisonVisualization(board1, board2, board3, func1, func2, func3, options = {}) {
    const graphs = [];
    
    // Create function on board 1
    const graph1 = board1.create('functiongraph', [func1], {
        strokeColor: options.color1 || COLORS.BLUE,
        strokeWidth: SIZES.LINE.MEDIUM,
        name: options.name1 || ''
    });
    graphs.push(graph1);
    
    // Create function on board 2
    const graph2 = board2.create('functiongraph', [func2], {
        strokeColor: options.color2 || COLORS.RED,
        strokeWidth: SIZES.LINE.MEDIUM,
        name: options.name2 || ''
    });
    graphs.push(graph2);
    
    // Create function on board 3
    const graph3 = board3.create('functiongraph', [func3], {
        strokeColor: options.color3 || COLORS.GREEN,
        strokeWidth: SIZES.LINE.MEDIUM,
        name: options.name3 || ''
    });
    graphs.push(graph3);
    
    // Add synchronized trace points if requested
    if (options.showTracePoints) {
        const traceX = options.initialTraceX || 0;
        
        // Master trace point on board 1
        const tracePoint1 = board1.create('glider', [traceX, func1(traceX), graph1], {
            name: '',
            size: SIZES.POINT.SMALL,
            fillColor: options.color1 || COLORS.BLUE,
            strokeColor: options.color1 || COLORS.BLUE
        });
        
        // Dependent trace points
        const tracePoint2 = board2.create('point', [
            () => tracePoint1.X(),
            () => func2(tracePoint1.X())
        ], {
            name: '',
            size: SIZES.POINT.SMALL,
            fillColor: options.color2 || COLORS.RED,
            strokeColor: options.color2 || COLORS.RED,
            fixed: true
        });
        
        const tracePoint3 = board3.create('point', [
            () => tracePoint1.X(),
            () => func3(tracePoint1.X())
        ], {
            name: '',
            size: SIZES.POINT.SMALL,
            fillColor: options.color3 || COLORS.GREEN,
            strokeColor: options.color3 || COLORS.GREEN,
            fixed: true
        });
        
        return {
            graphs,
            tracePoints: [tracePoint1, tracePoint2, tracePoint3],
            getTraceX: () => tracePoint1.X()
        };
    }
    
    return { graphs };
}

/**
 * Clear all user-created objects from multiple boards
 * @param {Array} boards - Array of JSXGraph board instances
 * @param {Array} preserveNames - Names of objects to preserve
 */
export function clearAllBoards(boards, preserveNames = []) {
    boards.forEach(board => {
        const objectsToRemove = [];
        
        for (let el in board.objects) {
            const obj = board.objects[el];
            if (obj.type && 
                !preserveNames.includes(obj.name) &&
                obj.type !== 'axis' &&
                obj.type !== 'ticks' &&
                obj.elType !== 'axis' &&
                obj.elType !== 'ticks') {
                objectsToRemove.push(obj);
            }
        }
        
        objectsToRemove.forEach(obj => board.removeObject(obj));
    });
}