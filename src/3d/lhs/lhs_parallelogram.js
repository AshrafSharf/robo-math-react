import { polygon } from './lhs_polygon.js';

/**
 * Creates a parallelogram from two coterminal vectors in 3D space
 * @param {Object} origin - Starting point in mathematical coordinates {x, y, z}
 * @param {Object} vector1End - End point of first vector {x, y, z}
 * @param {Object} vector2End - End point of second vector {x, y, z}
 * @param {Object} options - Configuration options (passed to polygon)
 * @param {number} options.color - Fill color of the parallelogram (default: 0x4444ff blue)
 * @param {number} options.opacity - Opacity of the parallelogram (default: 0.5)
 * @param {boolean} options.showEdges - Whether to show edges (default: true)
 * @param {number} options.edgeColor - Color of edges (default: 0x000000 black)
 * @returns {THREE.Mesh|THREE.Group} The parallelogram mesh or group with edges
 */
export function parallelogram(origin, vector1End, vector2End, options = {}) {
    // Set defaults specific to parallelograms
    const parallelogramOptions = {
        color: 0x4444ff,
        opacity: 0.5,
        showEdges: true,
        edgeColor: 0x000000,
        doubleSided: true,
        ...options
    };
    
    // Calculate the fourth vertex (opposite corner)
    // This is origin + both vectors
    const oppositeVertex = {
        x: origin.x + (vector1End.x - origin.x) + (vector2End.x - origin.x),
        y: origin.y + (vector1End.y - origin.y) + (vector2End.y - origin.y),
        z: origin.z + (vector1End.z - origin.z) + (vector2End.z - origin.z)
    };
    
    // Create vertices for the parallelogram in correct order
    const vertices = [
        origin,
        vector1End,
        oppositeVertex,
        vector2End
    ];
    
    // Delegate to polygon to create the mesh
    return polygon(vertices, parallelogramOptions);
}