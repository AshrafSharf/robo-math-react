// Common utilities for 2D-2D lessons
// Provides shared functionality for lessons with two JSXGraph boards

import { COLORS } from './colors.js';
import { SIZES } from './sizes.js';

// Re-export for convenience
export { COLORS, SIZES };

// Create coordinate system for either board
export function createCoordinateSystem2D2D(board, options = {}) {
        const defaults = {
            xLabel: 'x',
            yLabel: 'y',
            xTickStep: 1,
            yTickStep: 1,
            showGrid: true,
            fontSize: SIZES.FONT.AXIS
        };
        
        const config = { ...defaults, ...options };
        
        // Create axes
        const xAxis = board.create('axis', [[0, 0], [1, 0]], {
            name: config.xLabel,
            withLabel: true,
            label: {
                position: 'rt',
                offset: [-10, 15],
                fontSize: config.fontSize,
                color: COLORS.TEXT
            },
            strokeColor: COLORS.BLACK,
            strokeWidth: 2,
            ticks: {
                strokeColor: COLORS.BLACK,
                majorHeight: 8,
                drawZero: true,
                ticksDistance: config.xTickStep,
                label: config.xTickLabels === false ? false : {
                    fontSize: config.fontSize - 2,
                    color: COLORS.TEXT
                }
            }
        });
        
        const yAxis = board.create('axis', [[0, 0], [0, 1]], {
            name: config.yLabel,
            withLabel: true,
            label: {
                position: 'rt',
                offset: [10, 0],
                fontSize: config.fontSize,
                color: COLORS.TEXT
            },
            strokeColor: COLORS.BLACK,
            strokeWidth: 2,
            ticks: {
                strokeColor: COLORS.BLACK,
                majorHeight: 8,
                drawZero: false,
                ticksDistance: config.yTickStep,
                label: {
                    fontSize: config.fontSize - 2,
                    color: COLORS.TEXT
                }
            }
        });
        
        // Create grid if requested
        if (config.showGrid) {
            board.create('grid', [], {
                strokeColor: COLORS.GRID,
                strokeWidth: 1,
                strokeOpacity: 0.5
            });
        }
        
        return { xAxis, yAxis };
}

// Create a synchronized point between two boards
export function createSynchronizedPoints(board1, board2, coords1, coords2, options = {}) {
        const defaults = {
            size: SIZES.POINT.DEFAULT,
            fillColor: COLORS.RED,
            strokeColor: COLORS.RED_DARK,
            name1: '',
            name2: '',
            fixed: false,
            showInfobox: false
        };
        
        const config = { ...defaults, ...options };
        
        // Create point on board1
        const point1 = board1.create('point', coords1, {
            size: config.size,
            fillColor: config.fillColor,
            strokeColor: config.strokeColor,
            name: config.name1,
            fixed: config.fixed,
            showInfobox: config.showInfobox
        });
        
        // Create point on board2
        const point2 = board2.create('point', coords2, {
            size: config.size,
            fillColor: config.fillColor,
            strokeColor: config.strokeColor,
            name: config.name2,
            fixed: true, // Board2 point is always dependent
            showInfobox: config.showInfobox
        });
        
        // Synchronize points if specified
        if (options.syncFunction) {
            point1.on('drag', () => {
                const newCoords = options.syncFunction(point1.X(), point1.Y());
                point2.moveTo(newCoords);
            });
        }
        
        return { point1, point2 };
}

// Create trace points for visualization
export function createTrace2D2D(board, maxPoints = 100) {
        const tracePoints = [];
        
        const addTracePoint = (x, y, options = {}) => {
            const defaults = {
                size: 2,
                fillColor: COLORS.TRACE,
                strokeColor: COLORS.TRACE,
                fixed: true,
                withLabel: false,
                showInfobox: false
            };
            
            const config = { ...defaults, ...options };
            
            const point = board.create('point', [x, y], config);
            tracePoints.push(point);
            
            // Remove oldest point if we exceed maxPoints
            if (tracePoints.length > maxPoints) {
                const oldPoint = tracePoints.shift();
                board.removeObject(oldPoint);
            }
            
            return point;
        };
        
        const clearTrace = () => {
            tracePoints.forEach(point => board.removeObject(point));
            tracePoints.length = 0;
        };
        
        return { addTracePoint, clearTrace, tracePoints };
}

// Animation utilities for 2D-2D lessons
export function createAnimation2D2D(updateFunction, options = {}) {
        const defaults = {
            duration: 4000, // 4 seconds
            fps: 60,
            loop: false
        };
        
        const config = { ...defaults, ...options };
        
        let animationId = null;
        let startTime = null;
        let isAnimating = false;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / config.duration, 1);
            
            updateFunction(progress);
            
            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else if (config.loop) {
                startTime = null;
                animationId = requestAnimationFrame(animate);
            } else {
                isAnimating = false;
                if (config.onComplete) config.onComplete();
            }
        };
        
        const start = () => {
            if (!isAnimating) {
                isAnimating = true;
                startTime = null;
                animationId = requestAnimationFrame(animate);
            }
        };
        
        const stop = () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
                isAnimating = false;
                startTime = null;
            }
        };
        
        const toggle = () => {
            if (isAnimating) {
                stop();
            } else {
                start();
            }
        };
        
        return { start, stop, toggle, isAnimating: () => isAnimating };
}

// Angle utilities
export function normalizeAngle(angle) {
        // Normalize angle to [0, 2π)
        angle = angle % (2 * Math.PI);
        if (angle < 0) angle += 2 * Math.PI;
        return angle;
}

export function radToDeg(rad) {
        return (rad * 180) / Math.PI;
}

export function degToRad(deg) {
        return (deg * Math.PI) / 180;
}