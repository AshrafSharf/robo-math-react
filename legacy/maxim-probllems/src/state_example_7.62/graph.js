// Graph module for plotting volume equation
import { parametricTube } from '../common/js/native/curve.js';
import { line } from '../common/js/native/line.js';
import { label } from '../common/js/native/label.js';
import { point } from '../common/js/native/point.js';
import * as THREE from 'three';

/**
 * Creates a graph visualization of the volume equation
 * @param {THREE.Scene} scene - The Three.js scene (not used directly, returns a group)
 * @param {Object} options - Configuration options
 * @param {number} options.sheetSize - Size of the square sheet (default: 12)
 * @param {number} options.currentCutSize - Current cut size to highlight (default: 2)
 * @returns {THREE.Group} Group containing the graph visualization
 */
export function plot(scene, options = {}) {
    const {
        sheetSize = 12,
        currentCutSize = 2
    } = options;
    
    const graphGroup = new THREE.Group();
    
    // Graph dimensions and scaling
    const graphWidth = 10;
    const graphHeight = 8;
    const xMin = 0;
    const xMax = sheetSize / 2;  // Maximum valid cut size
    const maxVolume = Math.pow(sheetSize / 6, 1) * Math.pow(sheetSize - 2 * (sheetSize / 6), 2);
    const yMax = Math.ceil(maxVolume / 10) * 10;  // Round up to nearest 10
    
    // Scale factors to fit the graph in our coordinate space
    const xScale = graphWidth / (xMax - xMin);
    const yScale = graphHeight / yMax;
    
    // Position offset to center the graph
    const xOffset = 0;
    const yOffset = 0;
    const zOffset = 0;
    
    // Create axes
    // X-axis (cut size)
    const xAxis = line(
        { x: xOffset - graphWidth/2, y: yOffset, z: zOffset },
        { x: xOffset + graphWidth/2, y: yOffset, z: zOffset },
        {
            color: 0x000000,
            radius: 0.03
        }
    );
    graphGroup.add(xAxis);
    
    // Y-axis (volume)
    const yAxis = line(
        { x: xOffset - graphWidth/2, y: yOffset, z: zOffset },
        { x: xOffset - graphWidth/2, y: yOffset + graphHeight, z: zOffset },
        {
            color: 0x000000,
            radius: 0.03
        }
    );
    graphGroup.add(yAxis);
    
    // Add axis labels
    const xAxisLabel = label('Cut Size (x)', 
        { x: xOffset, y: yOffset - 0.8, z: zOffset },
        {
            color: '#000000',
            fontSize: 24,
            scale: 0.04
        }
    );
    graphGroup.add(xAxisLabel);
    
    const yAxisLabel = label('Volume', 
        { x: xOffset - graphWidth/2 - 1.5, y: yOffset + graphHeight/2, z: zOffset },
        {
            color: '#000000',
            fontSize: 24,
            scale: 0.04
        }
    );
    graphGroup.add(yAxisLabel);
    
    // Add tick marks and labels on X-axis
    const xTicks = [0, 1, 2, 3, 4, 5, 6];
    xTicks.forEach(tick => {
        if (tick <= xMax) {
            const xPos = xOffset - graphWidth/2 + tick * xScale;
            
            // Tick mark
            const tickLine = line(
                { x: xPos, y: yOffset - 0.1, z: zOffset },
                { x: xPos, y: yOffset + 0.1, z: zOffset },
                {
                    color: 0x666666,
                    radius: 0.02
                }
            );
            graphGroup.add(tickLine);
            
            // Tick label
            const tickLabel = label(tick.toString(),
                { x: xPos, y: yOffset - 0.4, z: zOffset },
                {
                    color: '#666666',
                    fontSize: 18,
                    scale: 0.03
                }
            );
            graphGroup.add(tickLabel);
        }
    });
    
    // Add tick marks and labels on Y-axis
    const yTicks = [0, 32, 64, 96, 128];  // For sheet size 12, max volume is 128
    yTicks.forEach(tick => {
        if (tick <= yMax) {
            const yPos = yOffset + tick * yScale;
            
            // Tick mark
            const tickLine = line(
                { x: xOffset - graphWidth/2 - 0.1, y: yPos, z: zOffset },
                { x: xOffset - graphWidth/2 + 0.1, y: yPos, z: zOffset },
                {
                    color: 0x666666,
                    radius: 0.02
                }
            );
            graphGroup.add(tickLine);
            
            // Tick label
            const tickLabel = label(tick.toString(),
                { x: xOffset - graphWidth/2 - 0.6, y: yPos, z: zOffset },
                {
                    color: '#666666',
                    fontSize: 18,
                    scale: 0.03
                }
            );
            graphGroup.add(tickLabel);
        }
    });
    
    // Create the volume function curve using parametricTube
    const volumeCurve = parametricTube(
        (t) => {
            // t goes from 0 to 1, map to x from 0 to xMax
            const x = xMin + t * (xMax - xMin);
            const volume = x * Math.pow(sheetSize - 2 * x, 2);
            
            // Convert to graph coordinates
            const graphX = xOffset - graphWidth/2 + x * xScale;
            const graphY = yOffset + volume * yScale;
            
            return { x: graphX, y: graphY, z: zOffset };
        },
        {
            tMin: 0,
            tMax: 1,
            segments: 100,
            radius: 0.05,
            radialSegments: 8,
            color: 0x4488ff,
            opacity: 0.9
        }
    );
    graphGroup.add(volumeCurve);
    
    // Add a marker for the current cut size
    const currentX = currentCutSize;
    const currentVolume = currentX * Math.pow(sheetSize - 2 * currentX, 2);
    const markerX = xOffset - graphWidth/2 + currentX * xScale;
    const markerY = yOffset + currentVolume * yScale;
    
    // Vertical line at current x
    const currentLine = line(
        { x: markerX, y: yOffset, z: zOffset },
        { x: markerX, y: markerY, z: zOffset },
        {
            color: 0xff6666,
            radius: 0.03
        }
    );
    graphGroup.add(currentLine);
    
    // Point at current position
    const currentPoint = point(
        { x: markerX, y: markerY, z: zOffset },
        {
            color: 0xff0000,
            size: 0.15
        }
    );
    graphGroup.add(currentPoint);
    
    // Label for current value
    const currentLabel = label(
        `(${currentCutSize.toFixed(1)}, ${currentVolume.toFixed(1)})`,
        { x: markerX + 0.5, y: markerY + 0.5, z: zOffset },
        {
            color: '#ff0000',
            fontSize: 20,
            scale: 0.035
        }
    );
    graphGroup.add(currentLabel);
    
    // Mark the maximum point
    const optimalX = sheetSize / 6;
    const optimalVolume = optimalX * Math.pow(sheetSize - 2 * optimalX, 2);
    const optimalMarkerX = xOffset - graphWidth/2 + optimalX * xScale;
    const optimalMarkerY = yOffset + optimalVolume * yScale;
    
    const maxPoint = point(
        { x: optimalMarkerX, y: optimalMarkerY, z: zOffset },
        {
            color: 0x00ff00,
            size: 0.15
        }
    );
    graphGroup.add(maxPoint);
    
    const maxLabel = label(
        'MAX',
        { x: optimalMarkerX, y: optimalMarkerY + 0.5, z: zOffset },
        {
            color: '#00aa00',
            fontSize: 22,
            scale: 0.04
        }
    );
    graphGroup.add(maxLabel);
    
    // Add grid lines (optional, for better readability)
    // Horizontal grid lines
    for (let y = 32; y <= yMax; y += 32) {
        const yPos = yOffset + y * yScale;
        const gridLine = line(
            { x: xOffset - graphWidth/2, y: yPos, z: zOffset - 0.01 },
            { x: xOffset + graphWidth/2, y: yPos, z: zOffset - 0.01 },
            {
                color: 0xe0e0e0,
                radius: 0.01
            }
        );
        graphGroup.add(gridLine);
    }
    
    // Vertical grid lines
    for (let x = 1; x <= xMax; x += 1) {
        const xPos = xOffset - graphWidth/2 + x * xScale;
        const gridLine = line(
            { x: xPos, y: yOffset, z: zOffset - 0.01 },
            { x: xPos, y: yOffset + graphHeight, z: zOffset - 0.01 },
            {
                color: 0xe0e0e0,
                radius: 0.01
            }
        );
        graphGroup.add(gridLine);
    }
    
    // Add title
    const titleLabel = label(
        'Volume Function: V = x(12 - 2x)²',
        { x: xOffset, y: yOffset + graphHeight + 1, z: zOffset },
        {
            color: '#000000',
            fontSize: 28,
            scale: 0.045
        }
    );
    graphGroup.add(titleLabel);
    
    return graphGroup;
}

/**
 * Updates the graph with a new current cut size
 * @param {THREE.Group} graphGroup - The graph group to update
 * @param {number} newCutSize - The new cut size to highlight
 * @param {number} sheetSize - Size of the sheet (default: 12)
 */
export function updateGraphMarker(graphGroup, newCutSize, sheetSize = 12) {
    // This would require storing references to the marker elements
    // For simplicity, it's better to recreate the graph when cut size changes
    // The main file will handle this by removing and recreating the graph
    console.log('Graph marker update requested for cut size:', newCutSize);
}