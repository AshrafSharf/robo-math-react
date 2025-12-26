import * as THREE from 'three';

/**
 * Creates a right angle marker (square corner) between two perpendicular lines
 * Similar to arcByThreePoints, takes three points: point1, vertex, point2
 * @param {Object} point1 - First point in Three.js coordinates {x, y, z}
 * @param {Object} vertex - Vertex point where the right angle is located {x, y, z}
 * @param {Object} point2 - Second point in Three.js coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.size - Size of the right angle square (default: 0.3)
 * @param {number} options.color - Color of the marker (default: 0x666666 gray)
 * @param {number} options.tubeRadius - Thickness of the lines (default: 0.015)
 * @param {number} options.fillColor - Color of the filled square (default: same as color)
 * @param {number} options.fillOpacity - Opacity of the filled square (default: 0.3)
 * @param {boolean} options.filled - Whether to show filled square (default: true)
 * @param {boolean} options.outline - Whether to show outline (default: true)
 * @returns {THREE.Group} Group containing the right angle marker
 */
export function rightAngle(point1, vertex, point2, options = {}) {
    const {
        size = 0.3,               // Square size
        color = 0x666666,         // Gray by default
        tubeRadius = 0.015,       // Line thickness
        fillColor = null,         // Use main color if not specified
        fillOpacity = 0.3,        // Semi-transparent fill
        filled = true,            // Show filled square
        outline = true            // Show outline
    } = options;
    
    // Create vectors from vertex to the two points
    const vector1 = {
        x: point1.x - vertex.x,
        y: point1.y - vertex.y,
        z: point1.z - vertex.z
    };
    
    const vector2 = {
        x: point2.x - vertex.x,
        y: point2.y - vertex.y,
        z: point2.z - vertex.z
    };
    
    // Normalize vectors in Three.js coordinates
    const v1 = new THREE.Vector3(vector1.x, vector1.y, vector1.z).normalize();
    const v2 = new THREE.Vector3(vector2.x, vector2.y, vector2.z).normalize();
    
    // Scale vectors to size
    const dirA = v1.multiplyScalar(size);
    const dirB = v2.multiplyScalar(size);
    
    // Create the four corners of the square in Three.js coordinates (relative to vertex)
    const corner1 = { 
        x: vertex.x + dirA.x, 
        y: vertex.y + dirA.y, 
        z: vertex.z + dirA.z 
    };
    const corner2 = { 
        x: vertex.x + dirA.x + dirB.x, 
        y: vertex.y + dirA.y + dirB.y, 
        z: vertex.z + dirA.z + dirB.z 
    };
    const corner3 = { 
        x: vertex.x + dirB.x, 
        y: vertex.y + dirB.y, 
        z: vertex.z + dirB.z 
    };
    
    // Use Three.js coordinates directly
    const threeVertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
    const threeCorner1 = new THREE.Vector3(corner1.x, corner1.y, corner1.z);
    const threeCorner2 = new THREE.Vector3(corner2.x, corner2.y, corner2.z);
    const threeCorner3 = new THREE.Vector3(corner3.x, corner3.y, corner3.z);
    
    // Create group to hold all elements
    const rightAngleGroup = new THREE.Group();
    
    // Create filled square if requested
    if (filled) {
        const squareGeometry = new THREE.BufferGeometry();
        
        // Define vertices
        const vertices = new Float32Array([
            threeVertex.x, threeVertex.y, threeVertex.z,    // 0: vertex
            threeCorner1.x, threeCorner1.y, threeCorner1.z, // 1: along first vector
            threeCorner2.x, threeCorner2.y, threeCorner2.z, // 2: diagonal corner
            threeCorner3.x, threeCorner3.y, threeCorner3.z  // 3: along second vector
        ]);
        
        // Define triangles for the square
        const indices = [
            0, 1, 2,  // First triangle
            0, 2, 3   // Second triangle
        ];
        
        squareGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        squareGeometry.setIndex(indices);
        squareGeometry.computeVertexNormals();
        
        // Create material for filled square
        const fillMaterial = new THREE.MeshBasicMaterial({
            color: fillColor || color,
            opacity: fillOpacity,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        const squareMesh = new THREE.Mesh(squareGeometry, fillMaterial);
        rightAngleGroup.add(squareMesh);
    }
    
    // Create outline using tubes for better visibility
    if (outline) {
        // Create the two perpendicular lines using tubes
        const points1 = [threeVertex, threeCorner1];
        const points2 = [threeVertex, threeCorner3];
        
        // First line (along vector1)
        const curve1 = new THREE.CatmullRomCurve3(points1);
        const tubeGeometry1 = new THREE.TubeGeometry(
            curve1,
            2,              // Segments
            tubeRadius,     // Radius
            8,              // Radial segments
            false           // Not closed
        );
        
        // Second line (along vector2)
        const curve2 = new THREE.CatmullRomCurve3(points2);
        const tubeGeometry2 = new THREE.TubeGeometry(
            curve2,
            2,              // Segments
            tubeRadius,     // Radius
            8,              // Radial segments
            false           // Not closed
        );
        
        // Material for tubes
        const tubeMaterial = new THREE.MeshBasicMaterial({
            color: color
        });
        
        const tube1 = new THREE.Mesh(tubeGeometry1, tubeMaterial);
        const tube2 = new THREE.Mesh(tubeGeometry2, tubeMaterial);
        
        rightAngleGroup.add(tube1);
        rightAngleGroup.add(tube2);
    }
    
    return rightAngleGroup;
}