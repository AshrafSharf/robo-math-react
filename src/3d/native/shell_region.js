import * as THREE from 'three';

/**
 * Creates a bounded region between curves (used for shell method visualization)
 * Region defined by y = f(x) between x boundaries
 * @param {Object} config - Configuration object for the shell region
 * @param {Function} config.topCurve - Function for the top boundary y = f(x)
 * @param {Function} config.bottomCurve - Function for the bottom boundary y = g(x) (default: y = 0)
 * @param {number} config.xMin - Left boundary
 * @param {number} config.xMax - Right boundary
 * @param {number} config.steps - Number of steps for curve resolution (default: 30)
 * @param {number} config.color - Color of the region (default: 0xffaa00)
 * @param {number} config.opacity - Opacity of the region (default: 0.4)
 * @returns {THREE.Mesh} The bounded region mesh
 */
export function shellRegion(config) {
    const {
        topCurve,
        bottomCurve = (x) => 0,  // Default to x-axis
        xMin,
        xMax,
        steps = 30,
        color = 0xffaa00,
        opacity = 0.4
    } = config;

    const shape = new THREE.Shape();
    
    // Start from the left boundary at the bottom curve
    const startY = bottomCurve(xMin);
    shape.moveTo(xMin, startY);
    
    // Draw the top curve from left to right
    for (let i = 0; i <= steps; i++) {
        const x = xMin + (xMax - xMin) * (i / steps);
        const y = topCurve(x);
        shape.lineTo(x, y);
    }
    
    // Draw the bottom curve from right to left
    for (let i = steps; i >= 0; i--) {
        const x = xMin + (xMax - xMin) * (i / steps);
        const y = bottomCurve(x);
        shape.lineTo(x, y);
    }
    
    // Close the shape
    shape.lineTo(xMin, startY);
    
    // Create geometry and mesh
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const region = new THREE.Mesh(geometry, material);
    
    return region;
}

