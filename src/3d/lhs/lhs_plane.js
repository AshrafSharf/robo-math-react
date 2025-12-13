import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a plane in 3D space using mathematical coordinates
 * @param {Object} center - Center position in mathematical coordinates {x, y, z}
 * @param {Object} normal - Normal vector in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.size - Size of the plane (default: 5)
 * @param {number} options.color - Color of the plane (default: 0x0080ff blue)
 * @param {number} options.opacity - Opacity of the plane (default: 0.3)
 * @param {boolean} options.doubleSided - Whether plane is visible from both sides (default: true)
 * @param {boolean} options.wireframe - Show as wireframe (default: false)
 * @returns {THREE.Mesh} The created plane mesh
 */
export function plane(center, normal, options = {}) {
    const {
        size = 12,                // Square plane size
        color = 0x0080ff,         // Blue by default
        opacity = 0.5,            // Semi-transparent (better visibility)
        doubleSided = true,       // Visible from both sides
        wireframe = false         // Solid by default
    } = options;
    
    // Transform mathematical coordinates to Three.js coordinates
    const threeCenter = transformToThreeJS(center);
    const threeNormal = transformToThreeJS(normal);
    threeNormal.normalize();
    
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(size, size);
    
    // Create material with reasonable defaults for educational visualization
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
        wireframe: wireframe,
        shininess: 30,  // Moderate shininess (default is 30 in Three.js)
        specular: new THREE.Color(0x111111)  // Very subtle specular highlight
    });
    
    // Create mesh
    const planeMesh = new THREE.Mesh(geometry, material);
    
    // Position the plane at center
    planeMesh.position.copy(threeCenter);
    
    // Orient the plane to match the normal vector
    // Default plane normal is (0, 0, 1) in Three.js
    const defaultNormal = new THREE.Vector3(0, 0, 1);
    
    // Calculate rotation from default normal to desired normal
    const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultNormal, threeNormal);
    planeMesh.quaternion.copy(quaternion);
    
    return planeMesh;
}

/**
 * Creates a plane from equation coefficients ax + by + cz + d = 0
 * @param {number} a - Coefficient of x in the plane equation
 * @param {number} b - Coefficient of y in the plane equation
 * @param {number} c - Coefficient of z in the plane equation
 * @param {number} d - Constant term in the plane equation
 * @param {Object} options - Configuration options
 * @param {number} options.size - Size of the plane (default: 5)
 * @param {number} options.color - Color of the plane (default: 0x0080ff blue)
 * @param {number} options.opacity - Opacity of the plane (default: 0.3)
 * @param {boolean} options.doubleSided - Whether plane is visible from both sides (default: true)
 * @param {boolean} options.wireframe - Show as wireframe (default: false)
 * @param {Object} options.center - Center position for the plane (default: {x: 0, y: 0, z: 0})
 * @returns {THREE.Mesh} The created plane mesh
 */
export function planeFromEquation(a, b, c, d, options = {}) {
    const {
        size = 12,                // Square plane size
        color = 0x0080ff,         // Blue by default
        opacity = 0.5,            // Semi-transparent (better visibility)
        doubleSided = true,       // Visible from both sides
        wireframe = false,        // Solid by default
        center = { x: 0, y: 0, z: 0 }  // Default center at origin
    } = options;
    
    // Normal vector is (a, b, c)
    const normal = { x: a, y: b, z: c };
    
    // Find a point on the plane
    // If the plane passes through the provided center, use it
    // Otherwise, find the closest point to the center that lies on the plane
    let planeCenter;
    
    // Check if center lies on the plane
    const centerValue = a * center.x + b * center.y + c * center.z + d;
    
    if (Math.abs(centerValue) < 0.001) {
        // Center is already on the plane
        planeCenter = center;
    } else {
        // Project center onto the plane
        // The closest point on the plane to the center is:
        // point = center - ((a*cx + b*cy + c*cz + d) / (a² + b² + c²)) * normal
        const normalMagnitudeSquared = a * a + b * b + c * c;
        
        if (normalMagnitudeSquared < 0.001) {
            // Degenerate plane equation
            console.warn('Invalid plane equation: normal vector is zero');
            return new THREE.Mesh();
        }
        
        const t = (a * center.x + b * center.y + c * center.z + d) / normalMagnitudeSquared;
        
        planeCenter = {
            x: center.x - t * a,
            y: center.y - t * b,
            z: center.z - t * c
        };
    }
    
    // Create the plane using the normal and computed center
    return plane(planeCenter, normal, {
        size: size,
        color: color,
        opacity: opacity,
        doubleSided: doubleSided,
        wireframe: wireframe
    });
}

/**
 * Creates a plane from three points in 3D space
 * @param {Object} point1 - First point in mathematical coordinates {x, y, z}
 * @param {Object} point2 - Second point in mathematical coordinates {x, y, z}
 * @param {Object} point3 - Third point in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options (same as plane function)
 * @returns {THREE.Mesh} The created plane mesh
 */
export function planeFromThreePoints(point1, point2, point3, options = {}) {
    // Create vectors from point1 to point2 and point1 to point3
    const v1 = {
        x: point2.x - point1.x,
        y: point2.y - point1.y,
        z: point2.z - point1.z
    };
    
    const v2 = {
        x: point3.x - point1.x,
        y: point3.y - point1.y,
        z: point3.z - point1.z
    };
    
    // Calculate normal vector using cross product v1 × v2
    const normal = {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    };
    
    // Check if points are collinear
    const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    if (normalLength < 0.001) {
        console.warn('Points are collinear - cannot form a unique plane');
        return new THREE.Mesh();
    }
    
    // Normalize the normal vector
    normal.x /= normalLength;
    normal.y /= normalLength;
    normal.z /= normalLength;
    
    // Calculate center as centroid of the three points
    const center = {
        x: (point1.x + point2.x + point3.x) / 3,
        y: (point1.y + point2.y + point3.y) / 3,
        z: (point1.z + point2.z + point3.z) / 3
    };
    
    // Create and return the plane mesh
    return plane(center, normal, options);
}