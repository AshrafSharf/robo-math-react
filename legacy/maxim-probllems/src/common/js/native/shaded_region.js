/**
 * shaded_region.js
 * Creates shaded regions for mathematical visualizations
 */

import * as THREE from 'three';

/**
 * Creates a shaded region between a curve and an axis
 * @param {Function} curve - Function defining the curve
 * @param {Array} range - [min, max] range for the parameter
 * @param {string} axis - Which axis to close against ('x' or 'y')
 * @param {Object} options - Configuration options
 * @returns {THREE.Mesh} The shaded region mesh
 */
export function shadedRegion(curve, range, axis = 'y', options = {}) {
    const {
        steps = 50,
        color = 0x4488ff,
        opacity = 0.5,
        side = THREE.DoubleSide
    } = options;
    
    const [tMin, tMax] = range;
    
    // Create shape points
    const shape = new THREE.Shape();
    const points = [];
    
    // Generate curve points
    for (let i = 0; i <= steps; i++) {
        const t = tMin + (tMax - tMin) * (i / steps);
        const value = curve(t);
        
        if (axis === 'y') {
            // For y-axis: curve gives x as function of y
            points.push(new THREE.Vector2(value, t));
        } else {
            // For x-axis: curve gives y as function of x
            points.push(new THREE.Vector2(t, value));
        }
    }
    
    // Start from the first curve point
    if (points.length > 0) {
        shape.moveTo(points[0].x, points[0].y);
        
        // Add all curve points
        for (let i = 1; i < points.length; i++) {
            shape.lineTo(points[i].x, points[i].y);
        }
        
        // Close the shape along the axis
        if (axis === 'y') {
            // Close along y-axis (x = 0)
            shape.lineTo(0, points[points.length - 1].y);
            shape.lineTo(0, points[0].y);
        } else {
            // Close along x-axis (y = 0)
            shape.lineTo(points[points.length - 1].x, 0);
            shape.lineTo(points[0].x, 0);
        }
        
        shape.closePath();
    }
    
    // Create geometry from shape
    const geometry = new THREE.ShapeGeometry(shape);
    
    // Create material
    const material = new THREE.MeshBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        side: side
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // ShapeGeometry creates in XY plane, which is what we want
    // No rotation needed for y-axis revolution
    
    // Store original opacity for animation purposes
    mesh.userData.originalOpacity = opacity;
    
    return mesh;
}

/**
 * Creates a shaded region between two curves
 * @param {Function} outerCurve - Function defining the outer/upper curve
 * @param {Function} innerCurve - Function defining the inner/lower curve
 * @param {Array} range - [min, max] range for the parameter
 * @param {string} axis - Parameter axis ('x' or 'y')
 * @param {Object} options - Configuration options
 * @returns {THREE.Mesh} The shaded region mesh
 */
export function shadedRegionBetweenCurves(outerCurve, innerCurve, range, axis = 'x', options = {}) {
    const {
        steps = 50,
        color = 0xffaa00,
        opacity = 0.5,
        doubleSided = true
    } = options;
    
    const [tMin, tMax] = range;
    
    // Create geometry manually for better control
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    // Trace outer curve from left to right
    for (let i = 0; i <= steps; i++) {
        const t = tMin + (tMax - tMin) * (i / steps);
        if (axis === 'x') {
            // For x-axis parameter: curves give y as function of x
            vertices.push(t, outerCurve(t), 0);
        } else {
            // For y-axis parameter: curves give x as function of y
            vertices.push(outerCurve(t), t, 0);
        }
    }
    
    // Trace inner curve from right to left to close the shape
    for (let i = steps; i >= 0; i--) {
        const t = tMin + (tMax - tMin) * (i / steps);
        if (axis === 'x') {
            // For x-axis parameter: curves give y as function of x
            vertices.push(t, innerCurve(t), 0);
        } else {
            // For y-axis parameter: curves give x as function of y
            vertices.push(innerCurve(t), t, 0);
        }
    }
    
    const positions = new Float32Array(vertices);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Calculate indices for triangulation
    const indices = [];
    const numPoints = steps + 1;
    for (let i = 0; i < numPoints - 1; i++) {
        indices.push(i, i + 1, i + numPoints);
        indices.push(i + 1, i + numPoints + 1, i + numPoints);
    }
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Store original opacity for animation purposes
    mesh.userData.originalOpacity = opacity;
    
    return mesh;
}