import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a right angle marker (square corner) between two perpendicular lines
 * Similar to arcByThreePoints, takes three points: point1, vertex, point2
 * @param {Object} point1 - First point in mathematical coordinates {x, y, z}
 * @param {Object} vertex - Vertex point where the right angle is located {x, y, z}
 * @param {Object} point2 - Second point in mathematical coordinates {x, y, z}
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
    
    // Normalize vectors in mathematical coordinates
    const v1 = new THREE.Vector3(vector1.x, vector1.y, vector1.z).normalize();
    const v2 = new THREE.Vector3(vector2.x, vector2.y, vector2.z).normalize();
    
    // Scale vectors to size
    const dirA = v1.multiplyScalar(size);
    const dirB = v2.multiplyScalar(size);
    
    // Create the four corners of the square in mathematical coordinates (relative to vertex)
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
    
    // Transform corners to Three.js coordinates
    const threeVertex = transformToThreeJS(vertex);
    const threeCorner1 = transformToThreeJS(corner1);
    const threeCorner2 = transformToThreeJS(corner2);
    const threeCorner3 = transformToThreeJS(corner3);
    
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
    
    // Create outline using tube geometry for the complete square
    if (outline) {
        // Create a complete square path with all four sides
        const squarePoints = [
            new THREE.Vector3(threeVertex.x, threeVertex.y, threeVertex.z),
            new THREE.Vector3(threeCorner1.x, threeCorner1.y, threeCorner1.z),
            new THREE.Vector3(threeCorner2.x, threeCorner2.y, threeCorner2.z),
            new THREE.Vector3(threeCorner3.x, threeCorner3.y, threeCorner3.z),
            new THREE.Vector3(threeVertex.x, threeVertex.y, threeVertex.z)  // Close the square
        ];
        
        // Create a curve through all points
        const squareCurve = new THREE.CatmullRomCurve3(squarePoints, false, 'catmullrom', 0);
        
        // Create tube geometry following the square path
        const tubeGeometry = new THREE.TubeGeometry(
            squareCurve,
            100,            // Many segments for smooth corners
            tubeRadius,     // Radius
            16,             // Radial segments for round tube
            false           // Not closed (we manually closed the path)
        );
        
        // Material for tube - use Phong for better visibility
        const tubeMaterial = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3  // Slight glow for visibility
        });
        
        const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        rightAngleGroup.add(tubeMesh);
    }
    
    return rightAngleGroup;
}