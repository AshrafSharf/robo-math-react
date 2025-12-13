import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates an angle arc between two vectors in 3D space using mathematical coordinates
 * The arc is drawn from startVector to endVector around their common origin
 * @param {Object} startVector - Start vector in mathematical coordinates {x, y, z}
 * @param {Object} endVector - End vector in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.radius - Radius of the arc (default: 1.0)
 * @param {number} options.color - Color of the arc (default: 0xff0000 red)
 * @param {number} options.tubeRadius - Thickness of the arc tube (default: 0.02)
 * @param {number} options.segments - Number of arc segments (default: 64)
 * @param {number} options.radialSegments - Number of tube radial segments (default: 8)
 * @param {number} options.opacity - Opacity of the arc (default: 1.0)
 * @returns {THREE.Mesh|null} The created arc mesh or null if vectors are parallel
 */
export function arc(startVector, endVector, options = {}) {
    const {
        radius = 1.0,             // Arc radius (good default visibility)
        color = 0x00ff00,         // Green by default (angle indicator)
        tubeRadius = 0.04,        // Tube thickness (visible but not overwhelming)
        segments = 32,            // Arc smoothness (balanced quality/performance)
        radialSegments = 8,       // Tube roundness
        opacity = 1.0             // Fully opaque
    } = options;
    
    // Normalize vectors in mathematical coordinates
    const start = new THREE.Vector3(startVector.x, startVector.y, startVector.z).normalize();
    const end = new THREE.Vector3(endVector.x, endVector.y, endVector.z).normalize();
    
    // Calculate angle and rotation axis
    const angle = start.angleTo(end);
    const axis = new THREE.Vector3().crossVectors(start, end).normalize();
    
    // Skip if vectors are parallel (no valid arc)
    if (axis.length() < 0.001 || angle < 0.001) {
        return null;
    }
    
    // Generate arc points in mathematical coordinates
    const arcPoints = [];
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const currentAngle = t * angle;
        
        // Rotate start vector around axis by currentAngle
        const point = start.clone()
            .multiplyScalar(radius)
            .applyAxisAngle(axis, currentAngle);
        
        // Transform to Three.js coordinates
        const threePoint = transformToThreeJS({
            x: point.x,
            y: point.y,
            z: point.z
        });
        
        arcPoints.push(threePoint);
    }
    
    // Create a smooth curve through the points
    const curve = new THREE.CatmullRomCurve3(arcPoints);
    
    // Create tube geometry for the arc
    const tubeGeometry = new THREE.TubeGeometry(
        curve,
        segments,         // Curve segments
        tubeRadius,       // Tube radius
        radialSegments,   // Radial segments
        false             // Not closed
    );
    
    // Create material
    const material = new THREE.MeshBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0
    });
    
    // Create mesh
    const arcMesh = new THREE.Mesh(tubeGeometry, material);
    
    return arcMesh;
}

/**
 * Creates an angle arc between two vectors formed by three points
 * The arc is drawn at the vertex (middle point) between the two vectors
 * @param {Object} point1 - First point in mathematical coordinates {x, y, z}
 * @param {Object} vertex - Vertex point (where angle is formed) in mathematical coordinates {x, y, z}
 * @param {Object} point2 - Second point in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options (same as arc)
 * @returns {THREE.Group|null} Group containing the arc positioned at vertex, or null if points are collinear
 */
export function arcByThreePoints(point1, vertex, point2, options = {}) {
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
    
    // Create the arc using the two vectors
    const arcMesh = arc(vector1, vector2, options);
    
    if (!arcMesh) {
        return null;
    }
    
    // Create a group to hold and position the arc
    const group = new THREE.Group();
    group.add(arcMesh);
    
    // Transform vertex position to Three.js coordinates and position the group
    const threeVertex = transformToThreeJS(vertex);
    group.position.set(threeVertex.x, threeVertex.y, threeVertex.z);
    
    return group;
}