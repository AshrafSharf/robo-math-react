/**
 * primitives-3d.js
 * Module for basic 3D primitive creation functions
 * Part of the modularized common-3d system
 */

import * as THREE from 'three';
import { COLORS } from './core-3d.js';

/**
 * Creates an arrow view with proper thickness for visibility
 * @param {THREE.Vector3} origin - Origin point of the arrow
 * @param {THREE.Vector3} direction - Direction vector (will be normalized)
 * @param {number} length - Length of the arrow
 * @param {number} color - Color of the arrow
 * @param {Object} options - Additional options
 * @returns {THREE.ArrowHelper} The created arrow helper
 */
export function createArrowView(origin, direction, length, color, options = {}) {
    const {
        headLength = Math.max(length * 0.2, 0.3),
        headWidth = Math.max(headLength * 0.5, 0.15),
        thickness = 0.05
    } = options;
    
    // Normalize the direction vector
    const dir = direction.clone().normalize();
    
    // Create ArrowHelper - it handles all the positioning automatically
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, color, headLength, headWidth);
    
    // Replace the thin line with a thick cylinder for better visibility
    if (arrowHelper.line) {
        // Hide the original line
        arrowHelper.line.visible = false;
        
        // Create a cylinder for the vector shaft
        const shaftLength = length - headLength;
        const cylinderGeometry = new THREE.CylinderGeometry(thickness, thickness, shaftLength, 16);
        const cylinderMaterial = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 150,
            specular: 0x444444,
            transparent: false
        });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        
        // Position cylinder at half the shaft length
        cylinder.position.y = shaftLength / 2;
        
        // Add the cylinder to the arrow helper
        arrowHelper.add(cylinder);
    }
    
    // Update the cone (arrow head) material to use Phong material
    if (arrowHelper.cone) {
        arrowHelper.cone.material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 150,
            specular: 0x444444,
            transparent: false,
            side: THREE.DoubleSide
        });
    }
    
    return arrowHelper;
}

/**
 * Creates a 3D polyline from an array of points
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Array} points - Array of points [{x, y, z}, ...] in Three.js coordinate system
 * @param {Object} options - Line options
 * @returns {THREE.Line} The created polyline
 */
export function createPolylineView(parent, points, options = {}) {
    const {
        color = COLORS.BLACK,
        linewidth = 2,
        closed = false
    } = options;
    
    // Convert points to Three.js Vector3 objects
    const threePoints = points.map(p => new THREE.Vector3(p.x, p.y, p.z));
    
    // Add first point at end if closed
    if (closed && points.length > 2) {
        threePoints.push(threePoints[0]);
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(threePoints);
    const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: linewidth
    });
    
    const line = new THREE.Line(geometry, material);
    parent.add(line);
    return line;
}

/**
 * Creates a 3D line between two points
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} start - Start point {x, y, z} in Three.js coordinate system
 * @param {Object} end - End point {x, y, z} in Three.js coordinate system
 * @param {Object} options - Line options
 * @returns {THREE.Line|THREE.Mesh} The created line (or cylinder for thick lines)
 */
export function createLineView(parent, start, end, options = {}) {
    const {
        color = COLORS.BLACK,
        linewidth = 2,
        dashed = false,
        dashSize = 0.1,
        gapSize = 0.05
    } = options;
    
    // Create Three.js vectors from input (already in Three.js coordinates)
    const threeStart = new THREE.Vector3(start.x, start.y, start.z);
    const threeEnd = new THREE.Vector3(end.x, end.y, end.z);
    
    // Use cylinder for thick lines (linewidth > 10)
    if (linewidth > 10) {
        // Calculate line properties
        const direction = new THREE.Vector3().subVectors(threeEnd, threeStart);
        const length = direction.length();
        direction.normalize();
        
        // Create cylinder geometry (convert linewidth to radius)
        const radius = linewidth * 0.004; // Scale factor for appropriate thickness
        const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100
        });
        
        const cylinder = new THREE.Mesh(geometry, material);
        
        // Position cylinder at midpoint
        const midpoint = new THREE.Vector3().addVectors(threeStart, threeEnd).multiplyScalar(0.5);
        cylinder.position.copy(midpoint);
        
        // Orient cylinder along the line direction
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, direction);
        cylinder.setRotationFromQuaternion(quaternion);
        
        parent.add(cylinder);
        return cylinder;
    } else {
        // Use regular line for thin lines
        const geometry = new THREE.BufferGeometry().setFromPoints([threeStart, threeEnd]);
        
        let material;
        if (dashed) {
            material = new THREE.LineDashedMaterial({
                color: color,
                linewidth: linewidth,
                dashSize: dashSize,
                gapSize: gapSize
            });
        } else {
            material = new THREE.LineBasicMaterial({
                color: color,
                linewidth: linewidth
            });
        }
        
        const line = new THREE.Line(geometry, material);
        
        // Update dash pattern if dashed
        if (dashed) {
            line.computeLineDistances();
        }
        
        parent.add(line);
        return line;
    }
}

/**
 * Creates a parametric curve in 3D space
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Function} curveFunction - Function (t) => {x, y, z} in Three.js coordinates
 * @param {Object} options - Curve options
 * @returns {THREE.Mesh} The created curve mesh
 */
export function createCurveView(parent, curveFunction, options = {}) {
    const {
        tRange = [0, 2 * Math.PI],
        resolution = 256,
        color = COLORS.RED,
        radius = 0.02,
        radialSegments = 8
    } = options;
    
    // Generate points in Three.js coordinates
    const points = [];
    for (let i = 0; i <= resolution; i++) {
        const t = tRange[0] + (i / resolution) * (tRange[1] - tRange[0]);
        const point = curveFunction(t);
        const threePoint = new THREE.Vector3(point.x, point.y, point.z);
        points.push(threePoint);
    }
    
    // Create curve
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, resolution, radius, radialSegments, false);
    const material = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 100,
        specular: 0x444444
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    parent.add(mesh);
    return mesh;
}

/**
 * Creates a parametric curve using line segments (lighter weight than tube)
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Function} curveFunction - Function (t) => {x, y, z} in Three.js coordinates
 * @param {Object} options - Curve options
 * @returns {THREE.Line} The created curve line
 */
export function createParametricCurve(parent, curveFunction, options = {}) {
    const {
        tRange = [0, 2 * Math.PI],
        segments = 100,
        color = COLORS.RED,
        linewidth = 2
    } = options;
    
    // Generate points
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const t = tRange[0] + (i / segments) * (tRange[1] - tRange[0]);
        const point = curveFunction(t);
        const threePoint = new THREE.Vector3(point.x, point.y, point.z);
        points.push(threePoint);
    }
    
    // Create line
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: linewidth
    });
    
    const curve = new THREE.Line(geometry, material);
    parent.add(curve);
    
    return curve;
}