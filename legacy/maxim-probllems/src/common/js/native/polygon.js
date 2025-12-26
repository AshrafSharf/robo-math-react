import * as THREE from 'three';

/**
 * Creates a filled polygon in 3D space using Three.js coordinates
 * @param {Array<Object>} vertices - Array of vertices in Three.js coordinates [{x, y, z}, ...]
 * @param {Object} options - Configuration options
 * @param {number} options.color - Fill color of the polygon (default: 0x4444ff blue)
 * @param {number} options.opacity - Opacity of the polygon (default: 0.7)
 * @param {boolean} options.doubleSided - Whether polygon is visible from both sides (default: true)
 * @param {boolean} options.wireframe - Show as wireframe (default: false)
 * @param {boolean} options.showEdges - Show polygon edges (default: false)
 * @param {number} options.edgeColor - Color of edges if shown (default: 0x000000 black)
 * @returns {THREE.Group|THREE.Mesh} Group with polygon and edges, or just the mesh
 */
export function polygon(vertices, options = {}) {
    const {
        color = 0x4444ff,         // Blue by default
        opacity = 0.7,            // Semi-transparent
        doubleSided = true,       // Visible from both sides
        wireframe = false,        // Solid fill by default
        showEdges = false,        // Don't show edges by default
        edgeColor = 0x000000      // Black edges
    } = options;
    
    // Validate input
    if (!vertices || vertices.length < 3) {
        console.error('Polygon requires at least 3 vertices');
        return new THREE.Group();
    }
    
    // Use Three.js coordinates directly
    const threeVertices = vertices.map(v => new THREE.Vector3(v.x, v.y, v.z));
    
    // Create shape using THREE.Shape for proper triangulation
    const shape = new THREE.Shape();
    
    // Project vertices onto a plane for triangulation
    // Find the normal of the polygon plane using first 3 vertices
    const v1 = new THREE.Vector3().subVectors(threeVertices[1], threeVertices[0]);
    const v2 = new THREE.Vector3().subVectors(threeVertices[2], threeVertices[0]);
    const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
    
    // Create basis vectors for the plane
    let basisX = new THREE.Vector3(1, 0, 0);
    if (Math.abs(normal.dot(basisX)) > 0.9) {
        basisX = new THREE.Vector3(0, 1, 0);
    }
    const basisY = new THREE.Vector3().crossVectors(normal, basisX).normalize();
    basisX = new THREE.Vector3().crossVectors(basisY, normal).normalize();
    
    // Project vertices onto 2D plane
    const points2D = threeVertices.map(vertex => {
        const relative = new THREE.Vector3().subVectors(vertex, threeVertices[0]);
        return new THREE.Vector2(
            relative.dot(basisX),
            relative.dot(basisY)
        );
    });
    
    // Create shape from 2D points
    shape.moveTo(points2D[0].x, points2D[0].y);
    for (let i = 1; i < points2D.length; i++) {
        shape.lineTo(points2D[i].x, points2D[i].y);
    }
    shape.closePath();
    
    // Create geometry from shape
    const shapeGeometry = new THREE.ShapeGeometry(shape);
    
    // Transform geometry back to 3D
    const positions = shapeGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const point2D = new THREE.Vector2(positions[i], positions[i + 1]);
        const point3D = new THREE.Vector3()
            .addScaledVector(basisX, point2D.x)
            .addScaledVector(basisY, point2D.y)
            .add(threeVertices[0]);
        
        positions[i] = point3D.x;
        positions[i + 1] = point3D.y;
        positions[i + 2] = point3D.z;
    }
    shapeGeometry.attributes.position.needsUpdate = true;
    shapeGeometry.computeVertexNormals();
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
        wireframe: wireframe
    });
    
    // Create mesh
    const polygonMesh = new THREE.Mesh(shapeGeometry, material);
    
    // If edges are requested, create edge lines
    if (showEdges && !wireframe) {
        const group = new THREE.Group();
        group.add(polygonMesh);
        
        // Create edge lines
        const edgeGeometry = new THREE.BufferGeometry();
        const edgePositions = [];
        
        for (let i = 0; i < threeVertices.length; i++) {
            const current = threeVertices[i];
            const next = threeVertices[(i + 1) % threeVertices.length];
            
            edgePositions.push(current.x, current.y, current.z);
            edgePositions.push(next.x, next.y, next.z);
        }
        
        edgeGeometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(edgePositions, 3));
        
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: edgeColor,
            linewidth: 2
        });
        
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        group.add(edges);
        
        return group;
    }
    
    return polygonMesh;
}

/**
 * Creates a parallelogram from two vectors in 3D space
 * @param {Object} origin - Starting point in Three.js coordinates {x, y, z}
 * @param {Object} vector1 - First vector defining one side {x, y, z}
 * @param {Object} vector2 - Second vector defining adjacent side {x, y, z}
 * @param {Object} options - Configuration options (same as polygon)
 * @returns {THREE.Group|THREE.Mesh} The parallelogram mesh or group with edges
 * 
 * @example
 * // Create a parallelogram at origin with sides along x and y axes
 * const para = parallelogram(
 *     {x: 0, y: 0, z: 0},
 *     {x: 3, y: 0, z: 0},
 *     {x: 1, y: 2, z: 0},
 *     {color: 0xff0000, opacity: 0.5}
 * );
 * scene.add(para);
 */
export function parallelogram(origin, vector1, vector2, options = {}) {
    // Calculate the four vertices of the parallelogram
    const vertices = [
        origin,                                           // Origin point
        {                                                // Origin + vector1
            x: origin.x + vector1.x,
            y: origin.y + vector1.y,
            z: origin.z + vector1.z
        },
        {                                                // Origin + vector1 + vector2
            x: origin.x + vector1.x + vector2.x,
            y: origin.y + vector1.y + vector2.y,
            z: origin.z + vector1.z + vector2.z
        },
        {                                                // Origin + vector2
            x: origin.x + vector2.x,
            y: origin.y + vector2.y,
            z: origin.z + vector2.z
        }
    ];
    
    // Create polygon with the calculated vertices
    return polygon(vertices, options);
}