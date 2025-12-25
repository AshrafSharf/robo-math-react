import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a point (sphere) in 3D space using mathematical coordinates
 * @param {Object} position - Position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the point (default: 0xff0000 red)
 * @param {number} options.radius - Radius of the point sphere (default: 0.1)
 * @param {number} options.segments - Number of segments for sphere (default: 16)
 * @param {number} options.emissive - Emissive color (default: 0x000000)
 * @param {number} options.emissiveIntensity - Emissive intensity (default: 0)
 * @param {number} options.shininess - Material shininess (default: 150)
 * @param {number} options.specular - Specular color (default: 0x444444)
 * @returns {THREE.Mesh} The created point mesh
 */
export function point(position, options = {}) {
    const {
        color = 0xff0000,        // Red by default
        radius = 0.15,            // Visible sphere
        segments = 16,            // Smooth enough sphere
        emissive = 0x000000,      // No emission
        emissiveIntensity = 0,    
        shininess = 150,          // Shiny surface
        specular = 0x444444       // Gray specular highlights
    } = options;
    
    // Transform mathematical coordinates to Three.js coordinates
    const threePos = transformToThreeJS(position);
    
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    
    // Create material with Phong shading for better 3D appearance
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        shininess: shininess,
        specular: specular
    });
    
    // Create mesh
    const sphere = new THREE.Mesh(geometry, material);
    
    // Position the sphere
    sphere.position.set(threePos.x, threePos.y, threePos.z);
    
    return sphere;
}

/**
 * Creates a particle (box) in 3D space using mathematical coordinates
 * @param {Object} position - Position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the particle (default: 0xffeb3b yellow)
 * @param {number} options.width - Width of the box (default: 0.3)
 * @param {number} options.height - Height of the box (default: 0.15)
 * @param {number} options.depth - Depth of the box (default: 0.2)
 * @returns {THREE.Mesh} The created particle mesh
 */
export function particle(position, options = {}) {
    const {
        color = 0xffeb3b,         // Yellow by default
        width = 0.3,              // Box width
        height = 0.15,            // Box height  
        depth = 0.2               // Box depth
    } = options;
    
    // Transform mathematical coordinates to Three.js coordinates
    const threePos = transformToThreeJS(position);
    
    // Create box geometry
    const geometry = new THREE.BoxGeometry(width, height, depth);
    
    // Create material
    const material = new THREE.MeshLambertMaterial({
        color: color
    });
    
    // Create mesh
    const box = new THREE.Mesh(geometry, material);
    
    // Position the box
    box.position.set(threePos.x, threePos.y, threePos.z);
    
    return box;
}