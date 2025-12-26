// Common math utilities for demos
// This file is reserved for mathematical calculations and utilities
// No JSXGraph API wrappers should be defined here

import { COLORS } from './colors.js';
import { SIZE_PRESETS_2D } from './sizes.js';

// Re-export colors and sizes for convenience
export { COLORS, SIZE_PRESETS_2D };

// Function to reset container size to default diagram-panel configuration
export function resetContainerSize2D(containerId = 'boards-container') {
    const container = document.getElementById(containerId);
    const deviceType = getDeviceType2D();
    // Use the legacy SIZE_PRESETS_2D format for backward compatibility
    const defaultSize = {
        width: SIZE_PRESETS_2D.TOTAL_WIDTH,
        height: SIZE_PRESETS_2D.HEIGHT,
        fontSize: deviceType === 'mobile' ? 14 : 16
    };
    
    container.style.width = `${defaultSize.width}px`;
    container.style.height = `${defaultSize.height}px`;
    container.setAttribute('data-font-size', defaultSize.fontSize);
}

// Helper function to determine device type for 2D lessons
export function getDeviceType2D() {
    if (window.innerWidth <= 480) {
        return 'mobile';
    } else if (window.innerWidth <= 768) {
        return 'tablet';
    }
    return 'desktop';
}


// Helper function to format π fractions
function formatPiFraction(piMultiple) {
    // Check for zero
    if (Math.abs(piMultiple) < 0.01) return '0';
    
    const rounded = Math.round(piMultiple * 4) / 4; // Round to nearest quarter
    
    if (Math.abs(piMultiple - rounded) < 0.01) {
        // Handle common fractions
        if (rounded === 0.25) return 'π/4';
        if (rounded === 0.5) return 'π/2';
        if (rounded === 0.75) return '3π/4';
        if (rounded === 1) return 'π';
        if (rounded === 1.25) return '5π/4';
        if (rounded === 1.5) return '3π/2';
        if (rounded === 1.75) return '7π/4';
        if (rounded === 2) return '2π';
        if (rounded === -0.25) return '-π/4';
        if (rounded === -0.5) return '-π/2';
        if (rounded === -0.75) return '-3π/4';
        if (rounded === -1) return '-π';
        if (rounded === -1.25) return '-5π/4';
        if (rounded === -1.5) return '-3π/2';
        if (rounded === -1.75) return '-7π/4';
        if (rounded === -2) return '-2π';
        
        // General case for other multiples
        if (rounded === Math.floor(rounded)) {
            return rounded === 1 ? 'π' : rounded + 'π';
        }
    }
    return '';
}




// Create complete coordinate system with axes and ticks using JSXGraph's native axis
export function createCoordinateSystem(board, options = {}) {
    const defaultOptions = {
        xLabel: 'x',
        yLabel: 'y',
        xTickStep: 1,
        yTickStep: 1,
        xTickType: 'numeric',  // 'numeric' or 'pi'
        yTickType: 'numeric',
        xFormatter: null,
        yFormatter: null,
        axisOptions: {}
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Configure x-axis ticks
    let xTickConfig = {
        drawZero: opts.axisOptions?.drawZero !== false,  // Default true unless explicitly false
        majorHeight: 10,  // Finite tick height (no grid lines)
        minorHeight: 5,
        strokeColor: '#000000',
        label: {
            offset: [-4, -12],
            fontSize: 14,
            color: '#000000'
        }
    };
    
    if (opts.xTickType === 'pi') {
        // Use custom formatting for π ticks with fractions
        xTickConfig = {
            ...xTickConfig,
            ticksDistance: opts.xTickStep,
            insertTicks: false,
            minorTicks: 0,
            majorHeight: 10,  // Keep finite tick height
            minorHeight: 5,
            generateLabelText: function(tick, zero) {
                const val = tick.usrCoords[1];
                if (Math.abs(val) < 0.01 && !xTickConfig.drawZero) return '';
                const piMultiple = val / Math.PI;
                return formatPiFraction(piMultiple);
            }
        };
    } else {
        // Regular numeric ticks
        xTickConfig = {
            ...xTickConfig,
            ticksDistance: opts.xTickStep,
            generateLabelText: opts.xFormatter || function(tick, zero) {
                const val = tick.usrCoords[1];
                if (Math.abs(val) < 0.01 && !xTickConfig.drawZero) return '';
                // For integer tick steps, only show labels at integer positions
                if (opts.xTickStep === Math.floor(opts.xTickStep)) {
                    if (Math.abs(val - Math.round(val)) < 0.01) {
                        return Math.round(val).toString();
                    }
                    return ''; // Hide non-integer ticks for integer steps
                }
                // For non-integer steps, show appropriate precision
                return val.toFixed(1);
            }
        };
    }
    
    // Create x-axis with native JSXGraph axis
    const xAxis = board.create('axis', [[0, 0], [1, 0]], {
        name: opts.xLabel,
        withLabel: true,
        label: {
            position: 'rt',
            offset: [-10, -10],
            fontSize: 16,
            color: '#000000'
        },
        strokeColor: '#000000',
        ticks: xTickConfig,
        grid: false,  // Disable grid lines for this axis
        ...opts.axisOptions
    });
    
    // Configure y-axis ticks
    let yTickConfig = {
        drawZero: false,  // Don't draw 0 on y-axis since x-axis already has it
        majorHeight: 10,  // Finite tick height (no grid lines)
        minorHeight: 5,
        strokeColor: '#000000',
        label: {
            offset: [8, -2],
            fontSize: 14,
            color: '#000000'
        }
    };
    
    if (opts.yTickType === 'pi') {
        // Use custom formatting for π ticks with fractions
        yTickConfig = {
            ...yTickConfig,
            ticksDistance: opts.yTickStep,
            insertTicks: false,
            minorTicks: 0,
            majorHeight: 10,  // Keep finite tick height
            minorHeight: 5,
            generateLabelText: function(tick, zero) {
                const val = tick.usrCoords[2];
                if (Math.abs(val) < 0.01) return '';  // Never show 0 on y-axis
                const piMultiple = val / Math.PI;
                return formatPiFraction(piMultiple);
            }
        };
    } else {
        // Regular numeric ticks
        yTickConfig = {
            ...yTickConfig,
            ticksDistance: opts.yTickStep,
            generateLabelText: opts.yFormatter || function(tick, zero) {
                const val = tick.usrCoords[2];
                // For integer tick steps, only show labels at integer positions
                if (opts.yTickStep === Math.floor(opts.yTickStep)) {
                    if (Math.abs(val - Math.round(val)) < 0.01) {
                        return Math.round(val).toString();
                    }
                    return ''; // Hide non-integer ticks for integer steps
                }
                // For non-integer steps, show appropriate precision
                return val.toFixed(1);
            }
        };
    }
    
    // Create y-axis with native JSXGraph axis
    const yAxis = board.create('axis', [[0, 0], [0, 1]], {
        name: opts.yLabel,
        withLabel: true,
        label: {
            position: 'rt',
            offset: [10, 0],
            fontSize: 16,
            color: '#000000'
        },
        strokeColor: '#000000',
        ticks: yTickConfig,
        grid: false,  // Disable grid lines for this axis
        ...opts.axisOptions
    });
    
    return { xAxis, yAxis };
}

/**
 * Create an angle between x-axis and a vector (works correctly for all quadrants)
 * @param {JXG.Board} board - The JSXGraph board
 * @param {JXG.Point} vectorEnd - The endpoint of the vector
 * @param {Object} options - Options for the angle
 * @param {string} options.name - Label for the angle (default: '')
 * @param {number} options.radius - Radius of the angle arc (default: 0.3)
 * @param {string} options.fillColor - Fill color (default: COLORS.ORANGE)
 * @param {number} options.fillOpacity - Fill opacity (default: 0.3)
 * @param {string} options.strokeColor - Stroke color (default: COLORS.ORANGE_DARK)
 * @param {number} options.strokeWidth - Stroke width (default: 1)
 * @param {Object} options.labelOptions - Additional options for the label
 * @returns {Object} Object containing angle element and reference point
 */
export function createAngleFromXAxis(board, vectorEnd, options = {}) {
    const opts = {
        name: '',
        radius: 0.3,
        fillColor: COLORS.ORANGE,
        fillOpacity: 0.3,
        strokeColor: COLORS.ORANGE_DARK,
        strokeWidth: 1,
        labelOptions: {
            fontSize: 16,
            color: '#000000'
        },
        ...options
    };
    
    // Create origin if not provided
    const origin = board.create('point', [0, 0], {
        visible: false,
        fixed: true,
        showInfobox: false
    });
    
    // Create invisible reference point on positive x-axis
    const xAxisRef = board.create('point', [1, 0], {
        visible: false,
        fixed: true,
        showInfobox: false
    });
    
    // Determine angle direction based on quadrant
    // For 4th quadrant (negative y), reverse the order to get clockwise angle
    const isInLowerHalf = () => {
        if (typeof vectorEnd === 'function') {
            return vectorEnd()[1] < 0;
        }
        return vectorEnd.Y ? vectorEnd.Y() < 0 : vectorEnd[1] < 0;
    };
    
    // Create angle with dynamic order
    const angle = board.create('angle', [
        () => isInLowerHalf() ? vectorEnd : xAxisRef,
        origin,
        () => isInLowerHalf() ? xAxisRef : vectorEnd
    ], {
        name: opts.name,
        radius: opts.radius,
        fillColor: opts.fillColor,
        fillOpacity: opts.fillOpacity,
        strokeColor: opts.strokeColor,
        strokeWidth: opts.strokeWidth,
        highlight: false,
        type: 'sector',
        orthoType: 'sector',
        label: opts.labelOptions
    });
    
    return {
        angle: angle,
        xAxisRef: xAxisRef,
        origin: origin
    };
}

/**
 * Create a vector with mid-arrow following established patterns
 * @param {JXG.Board} board - The JSXGraph board
 * @param {Array|Function|JXG.Point} start - Start point [x,y], function returning [x,y], or JXG.Point
 * @param {Array|Function|JXG.Point} end - End point [x,y], function returning [x,y], or JXG.Point
 * @param {Object} options - Options for the vector
 * @param {string} options.strokeColor - Color of the vector (default: COLORS.BLUE)
 * @param {number} options.strokeWidth - Width of the vector line (default: 3)
 * @param {string} options.name - Optional label for the vector
 * @param {number} options.labelOffset - Offset for label position (default: 0.1)
 * @param {Object} options.labelOptions - Additional options for the label
 * @param {boolean} options.withArrow - Whether to show arrow (default: true)
 * @param {number} options.arrowPosition - Position of arrow along vector (0-1, default: 0.5 for midpoint)
 * @returns {Object} Object containing segment, arrow, midpoint, and label references
 */
export function createVector(board, start, end, options = {}) {
    const opts = {
        strokeColor: COLORS.BLUE,
        strokeWidth: 3,
        name: '',
        labelOffset: 0.1,  // Default perpendicular distance from vector
        labelOptions: {},
        withArrow: true,
        arrowPosition: 0.5,  // Default to midpoint
        fixed: true,
        highlight: false,
        ...options
    };
    
    // Create the line segment
    const segment = board.create('segment', [start, end], {
        strokeColor: opts.strokeColor,
        strokeWidth: opts.strokeWidth,
        fixed: opts.fixed,
        highlight: opts.highlight,
        withLabel: false
    });
    
    let arrow = null;
    let midpoint = null;
    
    if (opts.withArrow) {
        // Create midpoint for arrow positioning
        midpoint = board.create('point', [
            () => {
                const s = segment.point1;
                const e = segment.point2;
                return s.X() + opts.arrowPosition * (e.X() - s.X());
            },
            () => {
                const s = segment.point1;
                const e = segment.point2;
                return s.Y() + opts.arrowPosition * (e.Y() - s.Y());
            }
        ], { visible: false });
        
        // Calculate direction
        const getDirection = () => {
            const s = segment.point1;
            const e = segment.point2;
            const dx = e.X() - s.X();
            const dy = e.Y() - s.Y();
            const len = Math.sqrt(dx * dx + dy * dy);
            return { dx: dx / len, dy: dy / len, len: len };
        };
        
        // Create arrow at specified position
        // Use a reasonable arrow segment length for visibility
        const arrowOffset = 0.5; // Increased offset for better visibility
        
        arrow = board.create('arrow', [
            [
                () => midpoint.X() - arrowOffset * getDirection().dx,
                () => midpoint.Y() - arrowOffset * getDirection().dy
            ],
            [
                () => midpoint.X() + arrowOffset * getDirection().dx,
                () => midpoint.Y() + arrowOffset * getDirection().dy
            ]
        ], {
            strokeColor: opts.strokeColor,
            strokeWidth: opts.strokeWidth,
            lastArrow: { 
                type: 1,  // Use type 1 for filled arrow
                size: 6  // Fixed size for all arrows
            },
            fixed: opts.fixed,
            highlight: opts.highlight,
            straightFirst: false,
            straightLast: false
        });
    }
    
    let label = null;
    if (opts.name) {
        // Create label for the vector
        const labelX = () => {
            const s = segment.point1;
            const e = segment.point2;
            const mx = (s.X() + e.X()) / 2;
            const dy = e.Y() - s.Y();
            const len = Math.sqrt((e.X() - s.X()) ** 2 + dy ** 2);
            // Perpendicular offset
            return mx - opts.labelOffset * dy / len;
        };
        
        const labelY = () => {
            const s = segment.point1;
            const e = segment.point2;
            const my = (s.Y() + e.Y()) / 2;
            const dx = e.X() - s.X();
            const len = Math.sqrt(dx ** 2 + (e.Y() - s.Y()) ** 2);
            // Perpendicular offset
            return my + opts.labelOffset * dx / len;
        };
        
        label = board.create('text', [labelX, labelY, opts.name], {
            fontSize: 16,
            color: '#000000',
            fixed: true,
            anchorX: 'middle',
            anchorY: 'middle',
            ...opts.labelOptions
        });
    }
    
    return {
        segment: segment,
        arrow: arrow,
        midpoint: midpoint,
        label: label,
        // Convenience methods
        hide: function() {
            segment.setAttribute({ visible: false });
            if (arrow) arrow.setAttribute({ visible: false });
            if (label) label.setAttribute({ visible: false });
        },
        show: function() {
            segment.setAttribute({ visible: true });
            if (arrow) arrow.setAttribute({ visible: true });
            if (label) label.setAttribute({ visible: true });
        },
        setColor: function(color) {
            segment.setAttribute({ strokeColor: color });
            if (arrow) arrow.setAttribute({ strokeColor: color });
        }
    };
}

/**
 * Creates a manual label positioned inside an angle sector
 * @param {Object} board - JSXGraph board
 * @param {Object} point1 - First point defining the angle
 * @param {Object} vertex - Vertex point of the angle
 * @param {Object} point2 - Second point defining the angle
 * @param {string} labelText - Text to display in the label
 * @param {Object} options - Additional options
 * @param {number} options.distance - Absolute distance from vertex (default: 0.42)
 * @param {number} options.fontSize - Font size for the label (default: 18)
 * @param {Object} options.labelOptions - Additional JSXGraph text options
 * @returns {Object} The created text element
 */
export function createAngleLabel(board, point1, vertex, point2, labelText, options = {}) {
    const opts = {
        distance: 0.42,  // Absolute distance from vertex
        fontSize: 18,
        labelOptions: {},
        ...options
    };
    
    // Calculate angle bisector
    const getBisector = () => {
        const v1 = [point1.X() - vertex.X(), point1.Y() - vertex.Y()];
        const v2 = [point2.X() - vertex.X(), point2.Y() - vertex.Y()];
        const angle1 = Math.atan2(v1[1], v1[0]);
        const angle2 = Math.atan2(v2[1], v2[0]);
        let bisector = (angle1 + angle2) / 2;
        
        // Handle angle wrap-around
        if (Math.abs(angle2 - angle1) > Math.PI) {
            bisector += Math.PI;
        }
        
        return bisector;
    };
    
    // Create the label
    return board.create('text', [
        () => vertex.X() + opts.distance * Math.cos(getBisector()),
        () => vertex.Y() + opts.distance * Math.sin(getBisector()),
        labelText
    ], {
        fontSize: opts.fontSize,
        color: '#000000',
        fixed: true,
        anchorX: 'middle',
        anchorY: 'middle',
        ...opts.labelOptions
    });
}

// Initialize MathJax integration with JSXGraph
export function initializeMathJax() {
    if (typeof window !== 'undefined' && typeof JXG !== 'undefined') {
        // Set JSXGraph options - try to enable MathJax
        JXG.Options.text.useMathJax = true;
        JXG.Options.text.parse = false;
    }
}

// Create MathJax text element that works reliably
export function createMathText(board, x, y, text, options = {}) {
    // Create the text element without useMathJax first
    const textElement = board.create('text', [x, y, text], {
        ...options,
        useMathJax: false // We'll handle MathJax manually
    });
    
    // Get the DOM element and manually trigger MathJax rendering
    setTimeout(() => {
        const element = textElement.rendNode;
        if (element && window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([element]).catch((err) => {
                console.warn('MathJax rendering error for text element:', err);
            });
        }
    }, 50);
    
    return textElement;
}

// Update board and re-render dynamic content (including MathJax)
export function updateBoard(board) {
    board.update();
    
    // Re-render MathJax if available and ready
    if (typeof window !== 'undefined' && window.MathJax) {
        // Wait for MathJax to be ready before processing
        const processMathJax = () => {
            if (window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([board.containerObj]).catch((err) => {
                    console.warn('MathJax rendering error:', err);
                });
            }
        };
        
        // If MathJax is ready, process immediately
        if (window.MathJaxReady || (window.MathJax.startup && window.MathJax.startup.document.state() >= 8)) {
            processMathJax();
        } else {
            // Wait for MathJax to be ready
            if (window.MathJax.startup) {
                window.MathJax.startup.promise.then(processMathJax);
            } else {
                // Fallback: try again after a short delay
                setTimeout(processMathJax, 100);
            }
        }
    }
}

// Legacy compatibility export - deprecated, use updateBoard instead
export const updateBoardWithMathJax = updateBoard;

// Enable keyboard navigation for any point (free points, gliders, etc.)
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