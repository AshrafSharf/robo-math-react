/**
 * lhs_transform.js
 * Coordinate transformation utilities for mathematical to Three.js coordinates
 */

import * as THREE from 'three';

/**
 * Transforms mathematical coordinates (X=right, Y=forward, Z=up) to Three.js coordinates
 * @param {Object} mathCoords - {x, y, z} in mathematical coordinate system
 * @returns {THREE.Vector3} Three.js coordinate vector
 */
export function transformToThreeJS(mathCoords) {
    // Mathematical(X,Y,Z) -> Three.js(-Y,Z,-X)
    // X (right) -> Three.js -Z
    // Y (forward) -> Three.js -X  
    // Z (up) -> Three.js Y
    return new THREE.Vector3(-mathCoords.y, mathCoords.z, -mathCoords.x);
}

/**
 * Transforms Three.js coordinates back to mathematical coordinates
 * @param {THREE.Vector3} threeCoords - Three.js coordinate vector
 * @returns {Object} {x, y, z} in mathematical coordinate system
 */
export function transformFromThreeJS(threeCoords) {
    // Three.js(X,Y,Z) -> Mathematical(-Z,-X,Y)
    return {
        x: -threeCoords.z, // Three.js -Z -> Math X (right)
        y: -threeCoords.x, // Three.js -X -> Math Y (forward)
        z: threeCoords.y   // Three.js Y -> Math Z (up)
    };
}