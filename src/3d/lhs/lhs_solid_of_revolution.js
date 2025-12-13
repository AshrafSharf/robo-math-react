/**
 * lhs_solid_of_revolution.js
 * Creates solids of revolution by rotating curves around axes
 */

import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a solid of revolution by rotating a curve around an axis
 * @param {Function|Array} curve - Either a function or array of points defining the curve
 *   - Function mode: (t) => {x, y} for parametric, or (y) => x for functional
 *   - Array mode: [{x, y}, {x, y}, ...] array of points
 * @param {string} axis - Axis of rotation: 'x', 'y', or 'z' (default: 'y')
 * @param {Array} range - Parameter range [min, max] for function mode
 * @param {Object} options - Configuration options
 * @param {number} options.steps - Number of steps along the curve (default: 50)
 * @param {number} options.segments - Number of rotation segments (default: 32)
 * @param {number} options.startAngle - Starting angle in radians (default: 0)
 * @param {number} options.angle - Total rotation angle in radians (default: 2π)
 * @param {number} options.color - Color of the solid (default: 0x4488ff)
 * @param {number} options.opacity - Opacity (default: 0.8)
 * @param {boolean} options.wireframe - Show as wireframe (default: false)
 * @param {number} options.shininess - Material shininess (default: 100)
 * @param {boolean} options.doubleSided - Show both sides (default: true)
 * @returns {THREE.Mesh} The solid of revolution mesh
 */
export function solidOfRevolution(curve, axis = 'y', range = null, options = {}) {
    const {
        steps = 50,
        segments = 32,
        startAngle = 0,
        angle = Math.PI * 2,
        color = 0x4488ff,
        opacity = 0.8,
        wireframe = false,
        shininess = 100,
        doubleSided = true
    } = options;

    // Generate curve points
    let curvePoints = [];
    
    if (typeof curve === 'function') {
        // Function mode - need range
        if (!range || range.length !== 2) {
            throw new Error('Range [min, max] required for function curve');
        }
        
        const [tMin, tMax] = range;
        for (let i = 0; i <= steps; i++) {
            const t = tMin + (tMax - tMin) * (i / steps);
            const point = curve(t);
            
            // Handle both parametric and functional forms
            if (typeof point === 'object' && point.x !== undefined && point.y !== undefined) {
                // Parametric: curve returns {x, y}
                curvePoints.push(point);
            } else if (typeof point === 'number') {
                // Functional: curve returns x value for given y (or vice versa)
                if (axis === 'y') {
                    // Revolving around y-axis: t is y, result is x (radius)
                    curvePoints.push({ x: point, y: t });
                } else if (axis === 'x') {
                    // Revolving around x-axis: t is x, result is y (radius)
                    curvePoints.push({ x: t, y: point });
                }
            }
        }
    } else if (Array.isArray(curve)) {
        // Array mode - direct points
        curvePoints = curve;
    } else {
        throw new Error('Curve must be a function or array of points');
    }
    
    // Filter out points with negative radius (for functional forms)
    curvePoints = curvePoints.filter(p => {
        if (axis === 'y') return p.x >= 0;
        if (axis === 'x') return p.y >= 0;
        if (axis === 'z') return Math.sqrt(p.x * p.x + p.y * p.y) >= 0;
        return true;
    });
    
    if (curvePoints.length < 2) {
        throw new Error('Need at least 2 valid points for revolution');
    }
    
    // Create geometry based on axis of rotation
    let geometry;
    
    if (axis === 'y') {
        // Use Three.js LatheGeometry for Y-axis rotation
        // LatheGeometry expects points as Vector2(radius, height)
        const lathePoints = curvePoints.map(p => 
            new THREE.Vector2(Math.abs(p.x), p.y)  // radius, height
        );
        
        geometry = new THREE.LatheGeometry(
            lathePoints,
            segments,
            startAngle,
            angle
        );
    } else if (axis === 'x') {
        // Custom geometry for X-axis rotation
        geometry = createXAxisRevolution(curvePoints, segments, startAngle, angle);
    } else if (axis === 'z') {
        // Custom geometry for Z-axis rotation
        geometry = createZAxisRevolution(curvePoints, segments, startAngle, angle);
    } else {
        throw new Error('Axis must be "x", "y", or "z"');
    }
    
    // Transform to mathematical coordinate system
    // (LatheGeometry already creates in Three.js coordinates)
    
    // Create material
    let material;
    if (wireframe) {
        material = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            opacity: opacity,
            transparent: opacity < 1.0,
            side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    } else {
        material = new THREE.MeshPhongMaterial({
            color: color,
            opacity: opacity,
            transparent: opacity < 1.0,
            shininess: shininess,
            specular: 0x444444,
            emissive: 0x000000,
            side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Store metadata for animations
    mesh.userData.revolutionData = {
        axis: axis,
        startAngle: startAngle,
        fullAngle: angle,
        curvePoints: curvePoints,
        segments: segments
    };
    
    return mesh;
}

/**
 * Creates geometry for rotation around X-axis
 * @private
 */
function createXAxisRevolution(curvePoints, segments, startAngle, angle) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const normals = [];
    const uvs = [];
    
    // Generate vertices
    for (let i = 0; i < curvePoints.length; i++) {
        const point = curvePoints[i];
        const radius = Math.abs(point.y);  // Distance from X-axis
        const x = point.x;
        
        for (let j = 0; j <= segments; j++) {
            const theta = startAngle + (angle * j / segments);
            
            // Rotate around X-axis
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            
            // Transform to Three.js coordinates
            const threePos = transformToThreeJS({ x, y, z });
            vertices.push(threePos.x, threePos.y, threePos.z);
            
            // UV coordinates
            uvs.push(i / (curvePoints.length - 1), j / segments);
        }
    }
    
    // Generate faces
    for (let i = 0; i < curvePoints.length - 1; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + 1;
            const c = (i + 1) * (segments + 1) + j;
            const d = c + 1;
            
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
}

/**
 * Creates geometry for rotation around Z-axis
 * @private
 */
function createZAxisRevolution(curvePoints, segments, startAngle, angle) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    
    // Generate vertices
    for (let i = 0; i < curvePoints.length; i++) {
        const point = curvePoints[i];
        const radius = Math.sqrt(point.x * point.x + point.y * point.y);
        const z = point.z || 0;  // Allow for 2D curves
        
        for (let j = 0; j <= segments; j++) {
            const theta = startAngle + (angle * j / segments);
            
            // Rotate around Z-axis
            const x = radius * Math.cos(theta);
            const y = radius * Math.sin(theta);
            
            // Transform to Three.js coordinates
            const threePos = transformToThreeJS({ x, y, z });
            vertices.push(threePos.x, threePos.y, threePos.z);
            
            // UV coordinates
            uvs.push(i / (curvePoints.length - 1), j / segments);
        }
    }
    
    // Generate faces
    for (let i = 0; i < curvePoints.length - 1; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + 1;
            const c = (i + 1) * (segments + 1) + j;
            const d = c + 1;
            
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
}

/**
 * Creates a disc or washer at a specific position along the axis
 * Useful for visualizing the disc method in calculus
 * @param {number} position - Position along the axis
 * @param {number} innerRadius - Inner radius (0 for disc, >0 for washer)
 * @param {number} outerRadius - Outer radius
 * @param {string} axis - Axis perpendicular to the disc ('x', 'y', or 'z')
 * @param {Object} options - Styling options
 * @returns {THREE.Mesh} The disc/washer mesh
 */
export function revolutionDisc(position, innerRadius, outerRadius, axis = 'y', options = {}) {
    const {
        color = 0x4488ff,
        opacity = 0.5,
        segments = 32
    } = options;
    
    // Create ring geometry
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const disc = new THREE.Mesh(geometry, material);
    
    // Position and orient based on axis
    if (axis === 'y') {
        // Disc perpendicular to Y-axis
        disc.rotation.x = Math.PI / 2;
        disc.position.y = position;
    } else if (axis === 'x') {
        // Disc perpendicular to X-axis
        disc.rotation.y = Math.PI / 2;
        disc.position.x = position;
    } else if (axis === 'z') {
        // Disc perpendicular to Z-axis (already correct orientation)
        disc.position.z = position;
    }
    
    return disc;
}

/**
 * Creates the 2D curve that will be revolved
 * Useful for showing the original curve before revolution
 * @param {Function|Array} curve - Curve definition (same as solidOfRevolution)
 * @param {Array} range - Parameter range for function curves
 * @param {Object} options - Styling options
 * @returns {THREE.Line} The curve as a line object
 */
export function revolutionCurve(curve, range = null, options = {}) {
    const {
        steps = 50,
        color = 0xff0000,
        linewidth = 2
    } = options;
    
    // Generate curve points (reuse logic from solidOfRevolution)
    let curvePoints = [];
    
    if (typeof curve === 'function' && range) {
        const [tMin, tMax] = range;
        for (let i = 0; i <= steps; i++) {
            const t = tMin + (tMax - tMin) * (i / steps);
            const point = curve(t);
            
            if (typeof point === 'object') {
                curvePoints.push(point);
            } else if (typeof point === 'number') {
                curvePoints.push({ x: point, y: t, z: 0 });
            }
        }
    } else if (Array.isArray(curve)) {
        curvePoints = curve.map(p => ({ ...p, z: p.z || 0 }));
    }
    
    // Create line geometry
    const points = curvePoints.map(p => {
        const threePos = transformToThreeJS(p);
        return new THREE.Vector3(threePos.x, threePos.y, threePos.z);
    });
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: linewidth
    });
    
    return new THREE.Line(geometry, material);
}