/**
 * point.js
 * Point creation using native Three.js coordinates
 */

import * as THREE from 'three';

/**
 * Creates a 3D point (sphere) at a position
 * @param {Object} position - Position {x, y, z}
 * @param {Object} options - Configuration options
 * @returns {THREE.Mesh} The created point mesh
 */
export function point(position, options = {}) {
    const {
        radius = 0.15,
        color = 0xff0000,
        opacity = 1.0,
        segments = 16
    } = options;
    
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Direct positioning in Three.js coordinates
    mesh.position.set(position.x, position.y, position.z || 0);
    
    mesh.userData = {
        position: position,
        pointOptions: options
    };
    
    return mesh;
}