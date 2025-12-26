// Graph module for plotting volume equation for rectangular sheet
import { parametricTube } from '../common/js/native/curve.js';
import { line } from '../common/js/native/line.js';
import { label } from '../common/js/native/label.js';
import { point } from '../common/js/native/point.js';
import * as THREE from 'three';

/**
 * Creates a graph visualization of the volume equation
 * @param {THREE.Scene} scene - The Three.js scene (not used directly, returns a group)
 * @param {Object} options - Configuration options
 * @param {number} options.sheetLength - Length of the rectangular sheet (default: 45)
 * @param {number} options.sheetWidth - Width of the rectangular sheet (default: 24)
 * @param {number} options.currentCutSize - Current cut size to highlight (default: 5)
 * @returns {THREE.Group} Group containing the graph visualization
 */
export function plot(scene, options = {}) {
    const {
        sheetLength = 45,
        sheetWidth = 24,
        currentCutSize = 5
    } = options;
    
    const graphGroup = new THREE.Group();
    
    // Graph dimensions and scaling
    const graphWidth = 12;
    const graphHeight = 10;
    const xMin = 0;
    const xMax = sheetWidth / 2;  // Maximum valid cut size (12 cm)
    const optimalCut = 5;  // From step-by-step.json
    const maxVolume = optimalCut * (sheetLength - 2 * optimalCut) * (sheetWidth - 2 * optimalCut);
    const yMax = Math.ceil(maxVolume / 500) * 500;  // Round up to nearest 500
    
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
    const xAxisLabel = label('Cut Size x (cm)', 
        { x: xOffset, y: yOffset - 0.8, z: zOffset },
        {
            color: '#000000',
            fontSize: 24,
            scale: 0.04
        }
    );
    graphGroup.add(xAxisLabel);
    
    const yAxisLabel = label('Volume (cm³)', 
        { x: xOffset - graphWidth/2 - 1.8, y: yOffset + graphHeight/2, z: zOffset },
        {
            color: '#000000',
            fontSize: 24,
            scale: 0.04
        }
    );
    graphGroup.add(yAxisLabel);
    
    // Add tick marks and labels on X-axis
    const xTicks = [0, 2, 4, 6, 8, 10, 12];
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
    const yTicks = [0, 500, 1000, 1500, 2000, 2500];
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
                { x: xOffset - graphWidth/2 - 0.8, y: yPos, z: zOffset },
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
    // V = x(45 - 2x)(24 - 2x) = 4x³ - 138x² + 1080x
    const volumeCurve = parametricTube(
        (t) => {
            // t goes from 0 to 1, map to x from 0 to xMax
            const x = xMin + t * (xMax - xMin);
            const volume = x * (sheetLength - 2 * x) * (sheetWidth - 2 * x);
            
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
    const currentVolume = currentX * (sheetLength - 2 * currentX) * (sheetWidth - 2 * currentX);
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
        `(${currentCutSize.toFixed(1)}, ${currentVolume.toFixed(0)})`,
        { x: markerX + 0.5, y: markerY + 0.5, z: zOffset },
        {
            color: '#ff0000',
            fontSize: 20,
            scale: 0.035
        }
    );
    graphGroup.add(currentLabel);
    
    // Mark the maximum point
    const optimalX = optimalCut;
    const optimalVolume = optimalX * (sheetLength - 2 * optimalX) * (sheetWidth - 2 * optimalX);
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
    
    // Add grid lines for better readability
    // Horizontal grid lines
    for (let y = 500; y <= yMax; y += 500) {
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
    for (let x = 2; x <= xMax; x += 2) {
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
        'Volume Function: V = x(45 - 2x)(24 - 2x)',
        { x: xOffset, y: yOffset + graphHeight + 1, z: zOffset },
        {
            color: '#000000',
            fontSize: 28,
            scale: 0.045
        }
    );
    graphGroup.add(titleLabel);
    
    // Add critical points annotation
    const criticalLabel = label(
        'Critical points: x = 5, x = 18 (infeasible)',
        { x: xOffset, y: yOffset + graphHeight + 0.5, z: zOffset },
        {
            color: '#666666',
            fontSize: 20,
            scale: 0.035
        }
    );
    graphGroup.add(criticalLabel);
    
    return graphGroup;
}

/**
 * Updates the graph with a new current cut size
 * @param {THREE.Group} graphGroup - The graph group to update
 * @param {number} newCutSize - The new cut size to highlight
 * @param {number} sheetLength - Length of the sheet (default: 45)
 * @param {number} sheetWidth - Width of the sheet (default: 24)
 */
export function updateGraphMarker(graphGroup, newCutSize, sheetLength = 45, sheetWidth = 24) {
    // This would require storing references to the marker elements
    // For simplicity, it's better to recreate the graph when cut size changes
    // The main file will handle this by removing and recreating the graph
    console.log('Graph marker update requested for cut size:', newCutSize);
}