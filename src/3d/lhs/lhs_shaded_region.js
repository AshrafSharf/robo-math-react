/**
 * lhs_shaded_region.js
 * Creates shaded regions for mathematical visualizations
 * Uses mathematical coordinate system (X=right, Y=forward, Z=up)
 */

import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a shaded region between a curve and an axis
 * @param {Function} curve - Function defining the curve (uses mathematical coordinates)
 * @param {Array} range - [min, max] range for the parameter
 * @param {string} axis - Axis of revolution ('x', 'y', or 'z')
 * @param {Object} options - Configuration options
 * @param {number} options.steps - Number of steps for curve resolution (default: 50)
 * @param {number} options.color - Color of the region (default: 0x4488ff)
 * @param {number} options.opacity - Opacity of the region (default: 0.5)
 * @param {THREE.Side} options.side - Which side to render (default: THREE.DoubleSide)
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
    
    // Create shape points in mathematical coordinates
    const mathPoints = [];
    
    // Generate curve points
    for (let i = 0; i <= steps; i++) {
        const t = tMin + (tMax - tMin) * (i / steps);
        const value = curve(t);
        
        if (axis === 'x') {
            // Revolving around x-axis: curve gives z as function of x
            // In math coords: point is (t, 0, value)
            mathPoints.push({ x: t, y: 0, z: value });
        } else if (axis === 'y') {
            // Revolving around y-axis: curve gives x as function of y
            // In math coords: point is (value, t, 0)
            mathPoints.push({ x: value, y: t, z: 0 });
        } else { // axis === 'z'
            // Revolving around z-axis: curve gives x as function of z
            // In math coords: point is (value, 0, t)
            mathPoints.push({ x: value, y: 0, z: t });
        }
    }
    
    // Transform to Three.js coordinates and create shape
    const shape = new THREE.Shape();
    const points = [];
    
    // Convert mathematical points to Three.js 2D points
    // ShapeGeometry creates shapes in Three.js XY plane
    for (let i = 0; i < mathPoints.length; i++) {
        const mathPoint = mathPoints[i];
        const threePoint = transformToThreeJS(mathPoint);
        
        // Project the 3D point onto the appropriate 2D plane for ShapeGeometry
        if (axis === 'x') {
            // For x-axis rotation, we need the shape in YZ plane (Three.js)
            points.push(new THREE.Vector2(threePoint.y, threePoint.z));
        } else if (axis === 'y') {
            // For y-axis rotation, we need the shape in XZ plane (Three.js)
            points.push(new THREE.Vector2(threePoint.x, threePoint.z));
        } else { // axis === 'z'
            // For z-axis rotation, we need the shape in XY plane (Three.js)
            points.push(new THREE.Vector2(threePoint.x, threePoint.y));
        }
    }
    
    // Start from the first curve point
    if (points.length > 0) {
        shape.moveTo(points[0].x, points[0].y);
        
        // Add all curve points
        for (let i = 1; i < points.length; i++) {
            shape.lineTo(points[i].x, points[i].y);
        }
        
        // Close the shape along the axis (connect back to axis at origin)
        if (axis === 'x') {
            // Close along x-axis (z = 0 in Three.js YZ plane)
            shape.lineTo(points[points.length - 1].x, 0);
            shape.lineTo(points[0].x, 0);
        } else if (axis === 'y') {
            // Close along y-axis (x = 0 in Three.js XZ plane)
            const originPoint = transformToThreeJS({ x: 0, y: tMax, z: 0 });
            const originPoint2 = transformToThreeJS({ x: 0, y: tMin, z: 0 });
            shape.lineTo(originPoint.x, originPoint.z);
            shape.lineTo(originPoint2.x, originPoint2.z);
        } else { // axis === 'z'
            // Close along z-axis (x = 0 in Three.js XY plane)
            const originPoint = transformToThreeJS({ x: 0, y: 0, z: tMax });
            const originPoint2 = transformToThreeJS({ x: 0, y: 0, z: tMin });
            shape.lineTo(originPoint.x, originPoint.y);
            shape.lineTo(originPoint2.x, originPoint2.y);
        }
        
        shape.closePath();
    }
    
    // Create geometry from shape
    const geometry = new THREE.ShapeGeometry(shape);
    
    // Rotate geometry based on axis of revolution
    // ShapeGeometry creates shapes in Three.js XY plane by default
    if (axis === 'x') {
        // Shape was created in YZ plane projection, rotate to align
        geometry.rotateY(Math.PI / 2);
    } else if (axis === 'y') {
        // Shape was created in XZ plane projection, rotate to align
        geometry.rotateX(-Math.PI / 2);
    }
    // For z-axis, shape is already in XY plane, no rotation needed
    
    // Create material
    const material = new THREE.MeshBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        side: side
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Store original opacity for animation purposes
    mesh.userData.originalOpacity = opacity;
    mesh.userData.type = 'shadedRegion';
    
    return mesh;
}