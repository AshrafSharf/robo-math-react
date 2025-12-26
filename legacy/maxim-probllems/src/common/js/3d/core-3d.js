// Core utilities and constants for 3D Three.js lessons
import * as THREE from 'three';
import { COLORS } from '../colors.js';

// Re-export for convenience
export { COLORS };

/**
 * Internal: Transforms user coordinates (X=screen, Y=right, Z=up) to Three.js coordinates
 * @param {Object} userCoords - {x, y, z} in user coordinate system
 * @returns {THREE.Vector3} Three.js coordinate vector
 */
export function transformToThreeJS(userCoords) {
    // User(X,Y,Z) -> Three.js(-Y,Z,-X)
    // X (towards screen) -> Three.js -Z
    // Y (towards right) -> Three.js -X  
    // Z (towards up) -> Three.js Y
    return new THREE.Vector3(-userCoords.y, userCoords.z, -userCoords.x);
}

/**
 * Internal: Transforms Three.js coordinates back to user coordinates
 * @param {THREE.Vector3} threeCoords - Three.js coordinate vector
 * @returns {Object} {x, y, z} in user coordinate system
 */
export function transformFromThreeJS(threeCoords) {
    // Three.js(X,Y,Z) -> User(-Z,-X,Y)
    return {
        x: -threeCoords.z, // Three.js -Z -> User X (towards screen)
        y: -threeCoords.x, // Three.js -X -> User Y (towards right)
        z: threeCoords.y   // Three.js Y -> User Z (towards up)
    };
}
