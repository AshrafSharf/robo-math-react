// Graph module for plotting volume equation for open box problem
import { parametricTube } from '../common/js/native/curve.js';
import { line } from '../common/js/native/line.js';
import { label } from '../common/js/native/label.js';
import { point } from '../common/js/native/point.js';
import * as THREE from 'three';

/**
 * Creates a graph visualization of the volume equation
 * @param {THREE.Scene} scene - The Three.js scene (not used directly, returns a group)
 * @param {Object} options - Configuration options
 * @param {number} options.surfaceArea - Fixed surface area constraint (default: 108)
 * @param {number} options.currentBaseSize - Current base size to highlight (default: 6)
 * @returns {THREE.Group} Group containing the graph visualization
 */
export function plot(scene, options = {}) {
    const {
        surfaceArea = 108,
        currentBaseSize = 6
    } = options;
    
    const graphGroup = new THREE.Group();
    
    // Calculate the maximum valid x value
    // For x² + 4xy = 108, we need y > 0, so (108 - x²)/(4x) > 0
    // This means x² < 108, so x < √108 ≈ 10.4
    const xMax = Math.sqrt(surfaceArea);
    const xMin = 0.5;  // Start from a small positive value
    
    // Find the maximum volume and optimal x
    const optimalX = 6;  // From calculus: x = 6
    const optimalY = (surfaceArea - optimalX * optimalX) / (4 * optimalX);
    const maxVolume = optimalX * optimalX * optimalY;
    
    // Graph dimensions and scaling
    const graphWidth = 10;
    const graphHeight = 8;
    const yMax = Math.ceil(maxVolume / 10) * 10;  // Round up to nearest 10
    
    // Scale factors to fit the graph in our coordinate space
    const xScale = graphWidth / (xMax - xMin);
    const yScale = graphHeight / yMax;
    
    // Position offset to center the graph
    const xOffset = 0;
    const yOffset = 0;
    const zOffset = 0;
    
    // Create axes
    // X-axis (base size)
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
    const xAxisLabel = label('Base Size (x)', 
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
    const xTicks = [0, 2, 4, 6, 8, 10];
    xTicks.forEach(tick => {
        if (tick >= xMin && tick <= xMax) {
            const xPos = xOffset - graphWidth/2 + (tick - xMin) * xScale;
            
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
    const yTicks = [0, 30, 60, 90, 120];  // Adjust based on max volume
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
    // V = x²y where y = (108 - x²)/(4x)
    // So V = x²(108 - x²)/(4x) = x(108 - x²)/4 = (108x - x³)/4
    const volumeCurve = parametricTube(
        (t) => {
            // t goes from 0 to 1, map to x from xMin to xMax
            const x = xMin + t * (xMax - xMin);
            
            // Calculate y from constraint
            const y = (surfaceArea - x * x) / (4 * x);
            
            // Calculate volume
            const volume = x * x * y;
            
            // Convert to graph coordinates
            const graphX = xOffset - graphWidth/2 + (x - xMin) * xScale;
            const graphY = yOffset + volume * yScale;
            
            return { x: graphX, y: graphY, z: zOffset };
        },
        {
            tMin: 0,
            tMax: 0.95,  // Stop before x gets too close to √108
            segments: 100,
            radius: 0.05,
            radialSegments: 8,
            color: 0x4488ff,
            opacity: 0.9
        }
    );
    graphGroup.add(volumeCurve);
    
    // Add a marker for the current base size
    const currentX = currentBaseSize;
    const currentY = (surfaceArea - currentX * currentX) / (4 * currentX);
    const currentVolume = currentX * currentX * currentY;
    const markerX = xOffset - graphWidth/2 + (currentX - xMin) * xScale;
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
        `(${currentBaseSize.toFixed(1)}, ${currentVolume.toFixed(1)})`,
        { x: markerX + 0.5, y: markerY + 0.5, z: zOffset },
        {
            color: '#ff0000',
            fontSize: 20,
            scale: 0.035
        }
    );
    graphGroup.add(currentLabel);
    
    // Mark the maximum point
    const optimalMarkerX = xOffset - graphWidth/2 + (optimalX - xMin) * xScale;
    const optimalMarkerY = yOffset + maxVolume * yScale;
    
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
    for (let y = 30; y <= yMax; y += 30) {
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
        const xPos = xOffset - graphWidth/2 + (x - xMin) * xScale;
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
        'Volume Function: V = (108x - x³)/4',
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