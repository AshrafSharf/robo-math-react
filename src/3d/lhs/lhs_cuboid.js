import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a cuboid (rectangular box) from two diagonal corner points
 * @param {Object} corner1 - First corner point in mathematical coordinates {x, y, z}
 * @param {Object} corner2 - Opposite diagonal corner in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the cuboid faces (default: 0x4488ff blue)
 * @param {number} options.opacity - Opacity of faces (default: 0.2)
 * @param {boolean} options.transparent - Whether faces are transparent (default: true)
 * @param {boolean} options.showEdges - Show cuboid edges (default: true)
 * @param {number} options.edgeColor - Color of edges (default: 0x0000ff darker blue)
 * @param {number} options.edgeOpacity - Opacity of edges (default: 0.8)
 * @param {number} options.linewidth - Width of edge lines (default: 1)
 * @param {boolean} options.wireframe - Show only wireframe (default: false)
 * @returns {THREE.Group} Group containing the cuboid mesh and optional edges
 */
export function cuboid(corner1, corner2, options = {}) {
    const {
        color = 0x4488ff,
        opacity = 0.2,
        transparent = true,
        showEdges = true,
        edgeColor = 0x0000ff,
        edgeOpacity = 0.8,
        linewidth = 1,
        wireframe = false
    } = options;
    
    // Create group to hold cuboid and edges
    const cuboidGroup = new THREE.Group();
    
    // Get min and max coordinates for each axis
    const minX = Math.min(corner1.x, corner2.x);
    const maxX = Math.max(corner1.x, corner2.x);
    const minY = Math.min(corner1.y, corner2.y);
    const maxY = Math.max(corner1.y, corner2.y);
    const minZ = Math.min(corner1.z, corner2.z);
    const maxZ = Math.max(corner1.z, corner2.z);
    
    // Define all 8 vertices of the cuboid in mathematical coordinates
    const vertices = [
        { x: minX, y: minY, z: minZ },  // 0: bottom-left-back
        { x: maxX, y: minY, z: minZ },  // 1: bottom-right-back
        { x: maxX, y: maxY, z: minZ },  // 2: bottom-right-front
        { x: minX, y: maxY, z: minZ },  // 3: bottom-left-front
        { x: minX, y: minY, z: maxZ },  // 4: top-left-back
        { x: maxX, y: minY, z: maxZ },  // 5: top-right-back
        { x: maxX, y: maxY, z: maxZ },  // 6: top-right-front
        { x: minX, y: maxY, z: maxZ }   // 7: top-left-front
    ];
    
    // Transform vertices to Three.js coordinates
    const threeVertices = vertices.map(v => transformToThreeJS(v));
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Flatten vertices for buffer attribute
    const positions = [];
    threeVertices.forEach(v => {
        positions.push(v.x, v.y, v.z);
    });
    
    // Define faces (two triangles per face)
    const indices = [
        // Bottom face (z = minZ)
        0, 1, 2,  0, 2, 3,
        // Top face (z = maxZ)
        4, 7, 6,  4, 6, 5,
        // Front face (y = maxY)
        3, 2, 6,  3, 6, 7,
        // Back face (y = minY)
        0, 4, 5,  0, 5, 1,
        // Left face (x = minX)
        0, 3, 7,  0, 7, 4,
        // Right face (x = maxX)
        1, 5, 6,  1, 6, 2
    ];
    
    // Set geometry attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Create material
    let material;
    if (wireframe) {
        material = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            opacity: opacity,
            transparent: transparent
        });
    } else {
        material = new THREE.MeshBasicMaterial({
            color: color,
            opacity: opacity,
            transparent: transparent,
            side: THREE.DoubleSide
        });
    }
    
    // Create mesh
    const cuboidMesh = new THREE.Mesh(geometry, material);
    cuboidGroup.add(cuboidMesh);
    
    // Add edges if requested
    if (showEdges && !wireframe) {
        const edges = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: edgeColor,
            opacity: edgeOpacity,
            transparent: edgeOpacity < 1.0,
            linewidth: linewidth
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
        cuboidGroup.add(edgeLines);
    }
    
    return cuboidGroup;
}

/**
 * Creates a wireframe cuboid (edges only) from two diagonal corner points
 * @param {Object} corner1 - First corner point in mathematical coordinates {x, y, z}
 * @param {Object} corner2 - Opposite diagonal corner in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the edges (default: 0x000000 black)
 * @param {number} options.opacity - Opacity of edges (default: 1.0)
 * @param {number} options.linewidth - Width of edge lines (default: 2)
 * @returns {THREE.LineSegments} The wireframe cuboid
 */
export function wireframeCuboid(corner1, corner2, options = {}) {
    const {
        color = 0x000000,
        opacity = 1.0,
        linewidth = 2
    } = options;
    
    // Get min and max coordinates
    const minX = Math.min(corner1.x, corner2.x);
    const maxX = Math.max(corner1.x, corner2.x);
    const minY = Math.min(corner1.y, corner2.y);
    const maxY = Math.max(corner1.y, corner2.y);
    const minZ = Math.min(corner1.z, corner2.z);
    const maxZ = Math.max(corner1.z, corner2.z);
    
    // Define vertices in mathematical coordinates
    const vertices = [
        { x: minX, y: minY, z: minZ },
        { x: maxX, y: minY, z: minZ },
        { x: maxX, y: maxY, z: minZ },
        { x: minX, y: maxY, z: minZ },
        { x: minX, y: minY, z: maxZ },
        { x: maxX, y: minY, z: maxZ },
        { x: maxX, y: maxY, z: maxZ },
        { x: minX, y: maxY, z: maxZ }
    ];
    
    // Transform to Three.js coordinates
    const threeVertices = vertices.map(v => transformToThreeJS(v));
    
    // Define edges (pairs of vertex indices)
    const edgeIndices = [
        // Bottom face edges
        0, 1,  1, 2,  2, 3,  3, 0,
        // Top face edges
        4, 5,  5, 6,  6, 7,  7, 4,
        // Vertical edges
        0, 4,  1, 5,  2, 6,  3, 7
    ];
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Create positions array for edges
    const positions = [];
    for (let i = 0; i < edgeIndices.length; i += 2) {
        const v1 = threeVertices[edgeIndices[i]];
        const v2 = threeVertices[edgeIndices[i + 1]];
        positions.push(v1.x, v1.y, v1.z);
        positions.push(v2.x, v2.y, v2.z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    // Create material
    const material = new THREE.LineBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        linewidth: linewidth
    });
    
    // Create line segments
    const wireframe = new THREE.LineSegments(geometry, material);
    
    return wireframe;
}

/**
 * Creates a bounding box cuboid around a set of points
 * @param {Array<Object>} points - Array of points in mathematical coordinates [{x, y, z}, ...]
 * @param {Object} options - Configuration options (same as cuboid)
 * @returns {THREE.Group} Group containing the bounding box cuboid
 */
export function boundingBoxCuboid(points, options = {}) {
    if (!points || points.length === 0) {
        console.warn('No points provided for bounding box');
        return new THREE.Group();
    }
    
    // Find min and max coordinates
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        minZ = Math.min(minZ, point.z);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
        maxZ = Math.max(maxZ, point.z);
    });
    
    // Create cuboid from the bounding corners
    return cuboid(
        { x: minX, y: minY, z: minZ },
        { x: maxX, y: maxY, z: maxZ },
        options
    );
}