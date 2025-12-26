// Graph module for cost minimization problem
// Plots C = 280 + 180(x + 4/x)

import { parametricTube } from '../common/js/native/curve.js';
import { line } from '../common/js/native/line.js';
import { label } from '../common/js/native/label.js';
import { point } from '../common/js/native/point.js';
import * as THREE from '../../node_modules/three/build/three.module.js';

/**
 * Creates a graph visualization of the cost function
 * @param {THREE.Scene} scene - The Three.js scene (not used directly)
 * @param {Object} options - Configuration options
 * @returns {THREE.Group} Group containing the graph visualization
 */
export function plot(scene, options = {}) {
    const {
        currentLength = 2  // Current x value
    } = options;
    
    const graphGroup = new THREE.Group();
    
    // Graph dimensions and positioning
    const graphWidth = 10;
    const graphHeight = 8;
    const xMin = 0.5;
    const xMax = 8;
    const optimalLength = 2;  // x = 2 gives minimum cost
    
    // Calculate y-axis range based on cost function
    const minCost = 280 + 180 * (2 + 4/2);  // C(2) = 280 + 180(2 + 2) = 1000
    const maxCostInRange = Math.max(
        280 + 180 * (0.5 + 4/0.5),  // Cost at x = 0.5
        280 + 180 * (8 + 4/8)        // Cost at x = 8
    );
    const yMin = 900;   // Start slightly below minimum
    const yMax = 2200;  // Reasonable max for visualization
    
    // Scale factors to fit graph in coordinate space
    const xScale = graphWidth / (xMax - xMin);
    const yScale = graphHeight / (yMax - yMin);
    
    // Create axes
    // X-axis (length)
    const xAxis = line(
        { x: -graphWidth/2, y: 0, z: 0 },
        { x: graphWidth/2, y: 0, z: 0 },
        {
            color: 0x000000,
            radius: 0.03
        }
    );
    graphGroup.add(xAxis);
    
    // Y-axis (cost)
    const yAxis = line(
        { x: -graphWidth/2, y: 0, z: 0 },
        { x: -graphWidth/2, y: graphHeight, z: 0 },
        {
            color: 0x000000,
            radius: 0.03
        }
    );
    graphGroup.add(yAxis);
    
    // Add axis labels
    const xLabel = label('Length (x) in meters', 
        { x: 0, y: -0.8, z: 0 },
        {
            color: '#000000',
            fontSize: 24,
            scale: 0.04
        }
    );
    graphGroup.add(xLabel);
    
    const yLabel = label('Cost (Rs)', 
        { x: -graphWidth/2 - 1.5, y: graphHeight/2, z: 0 },
        {
            color: '#000000',
            fontSize: 24,
            scale: 0.04
        }
    );
    graphGroup.add(yLabel);
    
    // Create function curve: C = 280 + 180(x + 4/x)
    const costCurve = parametricTube(
        (t) => {
            // Map t from [0,1] to x from [xMin, xMax]
            const x = xMin + t * (xMax - xMin);
            const cost = 280 + 180 * (x + 4/x);
            
            // Convert to graph coordinates
            const graphX = -graphWidth/2 + (x - xMin) * xScale;
            const graphY = (cost - yMin) * yScale;
            
            return {
                x: graphX,
                y: graphY,
                z: 0
            };
        },
        [0, 1],
        {
            segments: 100,
            radius: 0.05,
            color: 0xff9900  // Orange for cost curve
        }
    );
    graphGroup.add(costCurve);
    
    // Add current value marker
    const currentCost = 280 + 180 * (currentLength + 4/currentLength);
    const currentX = -graphWidth/2 + (currentLength - xMin) * xScale;
    const currentY = (currentCost - yMin) * yScale;
    
    // Drop line from current point to x-axis
    const dropLine = line(
        { x: currentX, y: 0, z: 0 },
        { x: currentX, y: currentY, z: 0 },
        {
            color: 0x0066cc,
            radius: 0.02,
            opacity: 0.5
        }
    );
    graphGroup.add(dropLine);
    
    // Current point marker
    const currentPoint = point(
        { x: currentX, y: currentY, z: 0 },
        {
            color: 0x0066cc,
            size: 0.15
        }
    );
    graphGroup.add(currentPoint);
    
    // Current value label
    const currentLabel = label(
        `(${currentLength.toFixed(1)}, ${Math.round(currentCost)})`,
        { x: currentX + 0.5, y: currentY + 0.3, z: 0 },
        {
            color: '#0066cc',
            fontSize: 20,
            scale: 0.035
        }
    );
    graphGroup.add(currentLabel);
    
    // Add optimal point (minimum cost)
    const optimalCost = 1000;  // C(2) = 1000
    const optimalX = -graphWidth/2 + (optimalLength - xMin) * xScale;
    const optimalY = (optimalCost - yMin) * yScale;
    
    // Optimal point highlight ring
    const ringGeometry = new THREE.RingGeometry(0.2, 0.25, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(optimalX, optimalY, 0);
    graphGroup.add(ring);
    
    // Optimal point
    const optimalPoint = point(
        { x: optimalX, y: optimalY, z: 0 },
        {
            color: 0x00ff00,
            size: 0.12
        }
    );
    graphGroup.add(optimalPoint);
    
    // Minimum label
    const minLabel = label('Minimum',
        { x: optimalX, y: optimalY + 0.5, z: 0 },
        {
            color: '#00aa00',
            fontSize: 22,
            scale: 0.04,
            fontWeight: 'bold'
        }
    );
    graphGroup.add(minLabel);
    
    // Add tick marks on x-axis
    for (let x = 1; x <= 8; x++) {
        if (x >= xMin && x <= xMax) {
            const xPos = -graphWidth/2 + (x - xMin) * xScale;
            
            // Tick mark
            const tickMark = line(
                { x: xPos, y: -0.1, z: 0 },
                { x: xPos, y: 0.1, z: 0 },
                {
                    color: 0x333333,
                    radius: 0.015
                }
            );
            graphGroup.add(tickMark);
            
            // Tick label
            const tickLabel = label(x.toString(),
                { x: xPos, y: -0.3, z: 0 },
                {
                    color: '#333333',
                    fontSize: 18,
                    scale: 0.03
                }
            );
            graphGroup.add(tickLabel);
        }
    }
    
    // Add tick marks on y-axis
    for (let y = 1000; y <= yMax; y += 200) {
        if (y >= yMin && y <= yMax) {
            const yPos = (y - yMin) * yScale;
            
            // Tick mark
            const tickMark = line(
                { x: -graphWidth/2 - 0.1, y: yPos, z: 0 },
                { x: -graphWidth/2 + 0.1, y: yPos, z: 0 },
                {
                    color: 0x333333,
                    radius: 0.015
                }
            );
            graphGroup.add(tickMark);
            
            // Tick label
            const tickLabel = label(y.toString(),
                { x: -graphWidth/2 - 0.5, y: yPos, z: 0 },
                {
                    color: '#333333',
                    fontSize: 18,
                    scale: 0.03
                }
            );
            graphGroup.add(tickLabel);
        }
    }
    
    // Add grid lines for better readability (optional, subtle)
    // Vertical grid lines
    for (let x = 1; x <= 8; x++) {
        if (x >= xMin && x <= xMax && x % 2 === 0) {
            const xPos = -graphWidth/2 + (x - xMin) * xScale;
            const gridLine = line(
                { x: xPos, y: 0, z: 0 },
                { x: xPos, y: graphHeight, z: 0 },
                {
                    color: 0xe0e0e0,
                    radius: 0.005
                }
            );
            graphGroup.add(gridLine);
        }
    }
    
    // Horizontal grid lines
    for (let y = 1000; y <= yMax; y += 400) {
        if (y >= yMin && y <= yMax) {
            const yPos = (y - yMin) * yScale;
            const gridLine = line(
                { x: -graphWidth/2, y: yPos, z: 0 },
                { x: graphWidth/2, y: yPos, z: 0 },
                {
                    color: 0xe0e0e0,
                    radius: 0.005
                }
            );
            graphGroup.add(gridLine);
        }
    }
    
    // Add arrow heads to axes
    // X-axis arrow
    const xArrowGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
    const xArrowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const xArrow = new THREE.Mesh(xArrowGeometry, xArrowMaterial);
    xArrow.position.set(graphWidth/2 + 0.15, 0, 0);
    xArrow.rotation.z = -Math.PI / 2;
    graphGroup.add(xArrow);
    
    // Y-axis arrow
    const yArrowGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
    const yArrowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const yArrow = new THREE.Mesh(yArrowGeometry, yArrowMaterial);
    yArrow.position.set(-graphWidth/2, graphHeight + 0.15, 0);
    graphGroup.add(yArrow);
    
    return graphGroup;
}