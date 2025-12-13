import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a box product (scalar triple product) volume visualization
 * Volume = |a · (b × c)|
 * @param {Object} vectorA - First vector in mathematical coordinates {x, y, z}
 * @param {Object} vectorB - Second vector in mathematical coordinates {x, y, z}
 * @param {Object} vectorC - Third vector in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the volume (default: 0x4444ff)
 * @param {number} options.opacity - Opacity of the volume (default: 0.6)
 * @param {boolean} options.showEdges - Whether to show edges (default: true)
 * @param {number} options.edgeColor - Color of edges (default: 0x000000)
 * @returns {THREE.Group} Group containing the box product volume
 */
export function boxProduct(vectorA, vectorB, vectorC, options = {}) {
    const {
        color = 0x4444ff,
        opacity = 0.6,
        showEdges = true,
        edgeColor = 0x000000
    } = options;
    
    // Transform vectors to Three.js coordinates
    const threeA = transformToThreeJS(vectorA);
    const threeB = transformToThreeJS(vectorB);
    const threeC = transformToThreeJS(vectorC);
    
    // Create group to hold the volume
    const volumeGroup = new THREE.Group();
    
    // Create the parallelepiped using BufferGeometry
    const geometry = new THREE.BufferGeometry();
    
    // Define the 8 vertices of the parallelepiped
    const vertices = [
        0, 0, 0,                                          // 0: Origin
        threeA.x, threeA.y, threeA.z,                   // 1: A
        threeB.x, threeB.y, threeB.z,                   // 2: B
        threeA.x + threeB.x, threeA.y + threeB.y, threeA.z + threeB.z,  // 3: A+B
        threeC.x, threeC.y, threeC.z,                   // 4: C
        threeA.x + threeC.x, threeA.y + threeC.y, threeA.z + threeC.z,  // 5: A+C
        threeB.x + threeC.x, threeB.y + threeC.y, threeB.z + threeC.z,  // 6: B+C
        threeA.x + threeB.x + threeC.x, threeA.y + threeB.y + threeC.y, threeA.z + threeB.z + threeC.z  // 7: A+B+C
    ];
    
    // Define the faces (12 triangles for 6 faces)
    const indices = [
        // Bottom face (origin plane)
        0, 1, 2,  1, 3, 2,
        // Top face (translated by C)
        4, 6, 5,  5, 6, 7,
        // Front face
        0, 4, 1,  1, 4, 5,
        // Back face
        2, 3, 6,  3, 7, 6,
        // Left face
        0, 2, 4,  2, 6, 4,
        // Right face
        1, 5, 3,  3, 5, 7
    ];
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Create material for the volume
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    volumeGroup.add(mesh);
    
    // Add edges if requested
    if (showEdges) {
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: edgeColor,
            linewidth: 2
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        volumeGroup.add(edges);
    }
    
    // Calculate volume for metadata
    const crossBC = new THREE.Vector3().crossVectors(threeB, threeC);
    const scalarTriple = threeA.dot(crossBC);
    const absVolume = Math.abs(scalarTriple);
    
    // Store metadata for animation
    volumeGroup.userData = {
        type: 'boxProduct',
        vectorA: vectorA,
        vectorB: vectorB,
        vectorC: vectorC,
        volume: absVolume
    };
    
    return volumeGroup;
}