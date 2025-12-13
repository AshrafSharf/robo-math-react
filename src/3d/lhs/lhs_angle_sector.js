import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a filled angle sector (pie slice) between two vectors in 3D space
 * @param {Object} startVector - Start vector in mathematical coordinates {x, y, z}
 * @param {Object} endVector - End vector in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.radius - Radius of the sector (default: 1.0)
 * @param {number} options.color - Color of the sector (default: 0x4444ff blue)
 * @param {number} options.fillOpacity - Opacity of the filled sector (default: 0.5)
 * @param {number} options.outlineColor - Color of the outline (default: same as color)
 * @param {number} options.outlineOpacity - Opacity of the outline (default: 1.0)
 * @param {boolean} options.showOutline - Whether to show outline (default: true)
 * @param {number} options.segments - Number of arc segments (default: 32)
 * @returns {THREE.Group|null} Group containing the sector or null if vectors are parallel
 */
export function sector(startVector, endVector, options = {}) {
    const {
        radius = 1.0,             // Sector radius
        color = 0x4444ff,         // Blue by default
        fillOpacity = 0.5,        // Semi-transparent fill
        outlineColor = null,      // Use main color if not specified
        outlineOpacity = 1.0,     // Solid outline
        showOutline = true,       // Show outline by default
        segments = 32             // Arc smoothness
    } = options;
    
    // Normalize vectors in mathematical coordinates
    const start = new THREE.Vector3(startVector.x, startVector.y, startVector.z).normalize();
    const end = new THREE.Vector3(endVector.x, endVector.y, endVector.z).normalize();
    
    // Calculate angle and rotation axis
    const angle = start.angleTo(end);
    const axis = new THREE.Vector3().crossVectors(start, end).normalize();
    
    // Skip if vectors are parallel (no valid sector)
    if (axis.length() < 0.001 || angle < 0.001) {
        return null;
    }
    
    // Create group to hold sector elements
    const sectorGroup = new THREE.Group();
    
    // Generate sector vertices in mathematical coordinates
    const vertices = [];
    const indices = [];
    const arcPoints = [];
    
    // Add center point (origin)
    const origin = transformToThreeJS({ x: 0, y: 0, z: 0 });
    vertices.push(origin.x, origin.y, origin.z);
    
    // Generate arc points
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
        
        // Add to vertices array (for filled geometry)
        vertices.push(threePoint.x, threePoint.y, threePoint.z);
        
        // Store for outline
        arcPoints.push(threePoint);
    }
    
    // Create triangles from center to arc points
    for (let i = 0; i < segments; i++) {
        indices.push(0, i + 1, i + 2);
    }
    
    // Create filled sector geometry
    const sectorGeometry = new THREE.BufferGeometry();
    sectorGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    sectorGeometry.setIndex(indices);
    sectorGeometry.computeVertexNormals();
    
    // Create material for filled sector
    const fillMaterial = new THREE.MeshBasicMaterial({
        color: color,
        opacity: fillOpacity,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    
    const sectorMesh = new THREE.Mesh(sectorGeometry, fillMaterial);
    sectorGroup.add(sectorMesh);
    
    // Create outline if requested
    if (showOutline) {
        // Create outline points (origin -> arc -> back to origin)
        const outlinePoints = [origin];
        outlinePoints.push(...arcPoints);
        outlinePoints.push(origin);
        
        // Create outline geometry
        const outlineGeometry = new THREE.BufferGeometry().setFromPoints(outlinePoints);
        
        // Create outline material
        const outlineMaterial = new THREE.LineBasicMaterial({
            color: outlineColor || color,
            opacity: outlineOpacity,
            transparent: outlineOpacity < 1.0,
            linewidth: 2
        });
        
        // Create outline
        const outline = new THREE.Line(outlineGeometry, outlineMaterial);
        sectorGroup.add(outline);
    }
    
    return sectorGroup;
}

/**
 * Creates a filled angle sector between two vectors formed by three points
 * The sector is drawn at the vertex (middle point) between the two vectors
 * @param {Object} point1 - First point in mathematical coordinates {x, y, z}
 * @param {Object} vertex - Vertex point (where angle is formed) in mathematical coordinates {x, y, z}
 * @param {Object} point2 - Second point in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options (same as sector)
 * @returns {THREE.Group|null} Group containing the sector positioned at vertex, or null if points are collinear
 */
export function sectorByThreePoints(point1, vertex, point2, options = {}) {
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
    
    // Create the sector using the two vectors
    const sectorGroup = sector(vector1, vector2, options);
    
    if (!sectorGroup) {
        return null;
    }
    
    // Create a group to hold and position the sector
    const group = new THREE.Group();
    group.add(sectorGroup);
    
    // Transform vertex position to Three.js coordinates and position the group
    const threeVertex = transformToThreeJS(vertex);
    group.position.set(threeVertex.x, threeVertex.y, threeVertex.z);
    
    return group;
}