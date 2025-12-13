/**
 * line.js
 * Line creation using native Three.js coordinates
 */

import * as THREE from 'three';

/**
 * Creates a 3D line (cylinder) between two points
 * @param {Object} start - Start position {x, y, z}
 * @param {Object} end - End position {x, y, z}
 * @param {Object} options - Configuration options
 * @returns {THREE.Mesh} The created line mesh
 */
export function line(start, end, options = {}) {
    const {
        color = 0x000000,
        radius = 0.02,
        opacity = 1.0
    } = options;
    
    // Direct use of Three.js coordinates
    const startVec = new THREE.Vector3(start.x, start.y, start.z || 0);
    const endVec = new THREE.Vector3(end.x, end.y, end.z || 0);
    
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();
    direction.normalize();
    
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position at midpoint
    const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    mesh.position.copy(midpoint);
    
    // Align with direction
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(up, direction);
    mesh.quaternion.copy(quaternion);
    
    mesh.userData = {
        start: start,
        end: end,
        lineOptions: options
    };
    
    return mesh;
}

/**
 * Creates a thin line using LineBasicMaterial
 * @param {Object} start - Start position {x, y, z}
 * @param {Object} end - End position {x, y, z}
 * @param {Object} options - Configuration options
 * @returns {THREE.Line} The created line object
 */
export function thinLine(start, end, options = {}) {
    const {
        color = 0x666666,
        linewidth = 1,
        opacity = 1.0
    } = options;
    
    const points = [
        new THREE.Vector3(start.x, start.y, start.z || 0),
        new THREE.Vector3(end.x, end.y, end.z || 0)
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: linewidth,
        opacity: opacity,
        transparent: opacity < 1.0
    });
    
    return new THREE.Line(geometry, material);
}