import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a tangent plane to a surface at a given point
 * The plane is defined by the point and the partial derivatives at that point
 * @param {Object} point - Point on the surface in mathematical coordinates {x, y, z}
 * @param {Object} partials - Partial derivatives at the point
 * @param {number} partials.dfdx - Partial derivative with respect to x (∂f/∂x)
 * @param {number} partials.dfdy - Partial derivative with respect to y (∂f/∂y)
 * @param {Object} options - Configuration options
 * @param {number} options.size - Size of the tangent plane (default: 1.5)
 * @param {number} options.color - Color of the plane (default: 0xffaa44 orange)
 * @param {number} options.emissive - Emissive color (default: 0x332211)
 * @param {number} options.opacity - Opacity of the plane (default: 0.6)
 * @param {number} options.segments - Number of segments for plane detail (default: 1)
 * @param {number} options.shininess - Material shininess (default: 100)
 * @param {number} options.specular - Specular color (default: 0x222222)
 * @param {boolean} options.doubleSided - Whether plane is visible from both sides (default: true)
 * @param {boolean} options.transparent - Whether plane is transparent (default: true)
 * @returns {THREE.Mesh} The created tangent plane mesh
 */
export function tangentPlane(point, partials, options = {}) {
    const {
        size = 1.5,               // Plane size
        color = 0xffaa44,         // Orange by default
        emissive = 0x332211,      // Warm glow
        opacity = 0.6,            // Semi-transparent
        segments = 1,             // Simple plane by default
        shininess = 100,          // Shiny surface
        specular = 0x222222,      // Dark specular
        doubleSided = true,       // Visible from both sides
        transparent = true        // Transparent by default
    } = options;
    
    // Transform point to Three.js coordinates
    const threePoint = transformToThreeJS(point);
    
    // Calculate normal vector from partial derivatives in mathematical space
    // For a surface z = f(x, y), the normal vector is (-∂f/∂x, -∂f/∂y, 1)
    const normalMath = { 
        x: -partials.dfdx, 
        y: -partials.dfdy, 
        z: 1 
    };
    
    // Normalize the normal vector
    const normalLength = Math.sqrt(
        normalMath.x * normalMath.x + 
        normalMath.y * normalMath.y + 
        normalMath.z * normalMath.z
    );
    
    const normalMathNorm = {
        x: normalMath.x / normalLength,
        y: normalMath.y / normalLength,
        z: normalMath.z / normalLength
    };
    
    // Transform normal to Three.js coordinates
    const normal = transformToThreeJS(normalMathNorm);
    normal.normalize();
    
    // Create two orthogonal basis vectors for the plane in mathematical space
    // First basis vector: tangent in x-direction
    const basis1Math = { 
        x: 1, 
        y: 0, 
        z: partials.dfdx 
    };
    
    // Normalize first basis vector
    const basis1Length = Math.sqrt(
        basis1Math.x * basis1Math.x + 
        basis1Math.y * basis1Math.y + 
        basis1Math.z * basis1Math.z
    );
    
    const basis1MathNorm = {
        x: basis1Math.x / basis1Length,
        y: basis1Math.y / basis1Length,
        z: basis1Math.z / basis1Length
    };
    
    // Transform first basis to Three.js coordinates
    const basis1 = transformToThreeJS(basis1MathNorm);
    basis1.normalize();
    
    // Create second basis vector as cross product (perpendicular to both normal and basis1)
    const basis2 = new THREE.Vector3().crossVectors(normal, basis1);
    basis2.normalize();
    
    // Create plane geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    
    // Generate vertices in a grid pattern
    for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
            // Map to [-size, size] range
            const u = (i / segments - 0.5) * size * 2;
            const v = (j / segments - 0.5) * size * 2;
            
            // Calculate vertex position
            const vertex = threePoint.clone()
                .add(basis1.clone().multiplyScalar(u))
                .add(basis2.clone().multiplyScalar(v));
            
            vertices.push(vertex.x, vertex.y, vertex.z);
            
            // Add UV coordinates for texture mapping if needed
            uvs.push(i / segments, j / segments);
        }
    }
    
    // Generate triangular faces
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + 1;
            const c = a + segments + 1;
            const d = c + 1;
            
            // Two triangles per quad
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    
    // Set geometry attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Create material with Phong shading for better appearance
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: emissive,
        opacity: opacity,
        transparent: transparent && opacity < 1.0,
        shininess: shininess,
        specular: specular,
        side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
    });
    
    // Create and return the mesh
    const planeMesh = new THREE.Mesh(geometry, material);
    return planeMesh;
}

/**
 * Creates a tangent plane from a surface function at a given point
 * Automatically calculates the partial derivatives numerically
 * @param {Function} surfaceFunction - Function f(x, y) that returns z value
 * @param {Object} point - Point on surface in mathematical coordinates {x, y} (z will be calculated)
 * @param {Object} options - Configuration options
 * @param {number} options.epsilon - Small value for numerical derivative (default: 0.001)
 * @param {...} options - Other options passed to tangentPlane function
 * @returns {THREE.Mesh} The created tangent plane mesh
 */
export function tangentPlaneFromFunction(surfaceFunction, point, options = {}) {
    const {
        epsilon = 0.001,
        ...planeOptions
    } = options;
    
    // Calculate z value at the point
    const z = surfaceFunction(point.x, point.y);
    const fullPoint = { x: point.x, y: point.y, z: z };
    
    // Calculate partial derivatives numerically
    const dfdx = (surfaceFunction(point.x + epsilon, point.y) - surfaceFunction(point.x - epsilon, point.y)) / (2 * epsilon);
    const dfdy = (surfaceFunction(point.x, point.y + epsilon) - surfaceFunction(point.x, point.y - epsilon)) / (2 * epsilon);
    
    // Create tangent plane with calculated derivatives
    return tangentPlane(fullPoint, { dfdx, dfdy }, planeOptions);
}

/**
 * Creates a tangent plane with analytical partial derivatives
 * @param {Object} point - Point on surface in mathematical coordinates {x, y, z}
 * @param {Function} partialX - Function that returns ∂f/∂x at (x, y)
 * @param {Function} partialY - Function that returns ∂f/∂y at (x, y)
 * @param {Object} options - Configuration options passed to tangentPlane
 * @returns {THREE.Mesh} The created tangent plane mesh
 */
export function tangentPlaneAnalytical(point, partialX, partialY, options = {}) {
    // Calculate partial derivatives at the point
    const dfdx = partialX(point.x, point.y);
    const dfdy = partialY(point.x, point.y);
    
    // Create tangent plane with calculated derivatives
    return tangentPlane(point, { dfdx, dfdy }, options);
}