/**
 * plane.js
 * Plane creation using native Three.js coordinates
 */

import * as THREE from 'three';

/**
 * Creates a plane in 3D space
 * @param {Object} point - Point on the plane {x, y, z}
 * @param {Object} normal - Normal vector {x, y, z}
 * @param {Object} options - Configuration options
 * @returns {THREE.Mesh} The created plane mesh
 */
export function plane(point, normal, options = {}) {
    const {
        size = 10,
        color = 0x0077ff,
        opacity = 0.3,
        doubleSided = true
    } = options;
    
    const geometry = new THREE.PlaneGeometry(size, size);
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position at the point
    mesh.position.set(point.x, point.y, point.z || 0);
    
    // Orient based on normal
    const normalVec = new THREE.Vector3(normal.x, normal.y, normal.z || 0).normalize();
    const up = new THREE.Vector3(0, 0, 1);
    
    if (!normalVec.equals(up)) {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, normalVec);
        mesh.quaternion.copy(quaternion);
    }
    
    mesh.userData = {
        point: point,
        normal: normal,
        planeOptions: options
    };
    
    return mesh;
}