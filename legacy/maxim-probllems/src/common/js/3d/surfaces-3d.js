/**
 * Surface visualization utilities for 3D Three.js lessons
 * This module provides functions for creating various types of surfaces and curves in 3D space
 */

import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

// Import required utilities
import { COLORS } from '../colors.js';

/**
 * Internal: Transforms user coordinates to Three.js coordinates
 * @param {Object} userCoords - {x, y, z} in user coordinate system
 * @returns {THREE.Vector3} Three.js coordinate vector
 */
function transformToThreeJS(userCoords) {
    // User(X,Y,Z) -> Three.js(-Y,Z,-X)
    // X (towards screen) -> Three.js -Z
    // Y (towards right) -> Three.js -X  
    // Z (towards up) -> Three.js Y
    return new THREE.Vector3(-userCoords.y, userCoords.z, -userCoords.x);
}

/**
 * Internal: Transforms Three.js coordinates back to user coordinates
 * @param {THREE.Vector3} threeCoords - Three.js coordinate vector
 * @returns {Object} {x, y, z} in user coordinate system
 */
function transformFromThreeJS(threeCoords) {
    // Three.js(X,Y,Z) -> User(-Z,-X,Y)
    return {
        x: -threeCoords.z, // Three.js -Z -> User X (towards screen)
        y: -threeCoords.x, // Three.js -X -> User Y (towards right)
        z: threeCoords.y   // Three.js Y -> User Z (towards up)
    };
}

// Colormap functions
function viridisColor(t) {
    const c0 = { r: 0.267004, g: 0.004874, b: 0.329415 };
    const c1 = { r: 0.127568, g: 0.566949, b: 0.550556 };
    const c2 = { r: 0.993248, g: 0.906157, b: 0.143936 };
    
    if (t < 0.5) {
        const s = t * 2;
        return {
            r: c0.r + s * (c1.r - c0.r),
            g: c0.g + s * (c1.g - c0.g),
            b: c0.b + s * (c1.b - c0.b)
        };
    } else {
        const s = (t - 0.5) * 2;
        return {
            r: c1.r + s * (c2.r - c1.r),
            g: c1.g + s * (c2.g - c1.g),
            b: c1.b + s * (c2.b - c1.b)
        };
    }
}

function plasmaColor(t) {
    const r = Math.min(1, Math.max(0, 0.987 * t + 0.002));
    const g = Math.min(1, Math.max(0, -2.157 * t * t + 1.881 * t + 0.002));
    const b = Math.min(1, Math.max(0, 3.089 * t * t * t - 4.096 * t * t + 0.297 * t + 0.735));
    return { r, g, b };
}

function coolwarmColor(t) {
    const r = t;
    const g = 0.5;
    const b = 1 - t;
    return { r, g, b };
}

/**
 * Creates a surface mesh from a function z = f(x, y)
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Function} surfaceFunction - Function (x, y) => z
 * @param {Object} options - Surface options
 * @returns {THREE.Mesh|Object} Surface mesh or object with surface and wireframe
 */
export function createSurfaceView(parent, surfaceFunction, options = {}) {
    const {
        xMin = -2,
        xMax = 2,
        yMin = -2,
        yMax = 2,
        resolution = 50,
        colormap = 'viridis', // 'viridis', 'plasma', 'coolwarm', or custom function
        opacity = 0.9,
        shininess = 100,
        specular = 0x666666,
        wireframe = false,
        wireframeOpacity = 0.1
    } = options;
    
    // Create geometry for the surface
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const indices = [];
    
    // Generate vertices
    let minZ = Infinity, maxZ = -Infinity;
    const zValues = [];
    
    for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
            const x = xMin + (xMax - xMin) * i / resolution;
            const y = yMin + (yMax - yMin) * j / resolution;
            const z = surfaceFunction(x, y);
            
            zValues.push(z);
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
            
            const threePos = transformToThreeJS({ x, y, z });
            vertices.push(threePos.x, threePos.y, threePos.z);
        }
    }
    
    // Generate colors based on height
    for (let i = 0; i < zValues.length; i++) {
        const normalizedZ = (zValues[i] - minZ) / (maxZ - minZ || 1);
        let color;
        
        if (typeof colormap === 'function') {
            color = colormap(normalizedZ);
        } else if (colormap === 'viridis') {
            color = viridisColor(normalizedZ);
        } else if (colormap === 'plasma') {
            color = plasmaColor(normalizedZ);
        } else if (colormap === 'coolwarm') {
            color = coolwarmColor(normalizedZ);
        } else {
            color = viridisColor(normalizedZ); // default
        }
        
        colors.push(color.r, color.g, color.b);
    }
    
    // Generate indices
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const a = i * (resolution + 1) + j;
            const b = a + 1;
            const c = a + resolution + 1;
            const d = c + 1;
            
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Use MeshPhongMaterial like the sphere for consistent appearance
    const material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: opacity < 1,
        opacity: opacity,
        shininess: 150,
        specular: 0x444444
    });
    
    const surfaceMesh = new THREE.Mesh(geometry, material);
    parent.add(surfaceMesh);
    
    // Add wireframe overlay if requested
    if (wireframe) {
        const wireframeGeometry = geometry.clone();
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333,
            wireframe: true,
            transparent: true,
            opacity: wireframeOpacity
        });
        const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        parent.add(wireframeMesh);
        
        return { surface: surfaceMesh, wireframe: wireframeMesh };
    }
    
    return surfaceMesh;
}

/**
 * Creates a parametric surface from a function (u, v) => {x, y, z}
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Function} surfaceFunction - Function (u, v) => {x, y, z}
 * @param {Object} options - Surface options
 * @returns {THREE.Mesh|Object} Surface mesh or object with surface and wireframe
 */
export function createParametricSurfaceView(parent, surfaceFunction, options = {}) {
    const {
        uRange = [0, 1],
        vRange = [0, 1],
        uSegments = 50,
        vSegments = 50,
        color = COLORS.SURFACE_BLUE,
        opacity = 0.9,
        shininess = 100,
        specular = 0x666666,
        wireframe = false,
        wireframeOpacity = 0.1,
        vertexColors = false,
        colorFunction = null // Function (u, v, point) => THREE.Color
    } = options;
    
    // Create parametric function for Three.js
    const parametricFunction = (u, v, target) => {
        const u_mapped = uRange[0] + u * (uRange[1] - uRange[0]);
        const v_mapped = vRange[0] + v * (vRange[1] - vRange[0]);
        
        const point = surfaceFunction(u_mapped, v_mapped);
        const threePos = transformToThreeJS(point);
        
        target.set(threePos.x, threePos.y, threePos.z);
    };
    
    // Create geometry
    const geometry = new ParametricGeometry(parametricFunction, uSegments, vSegments);
    
    // Apply vertex colors if needed
    if (vertexColors && colorFunction) {
        const colors = [];
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const u = (i % (uSegments + 1)) / uSegments;
            const v = Math.floor(i / (uSegments + 1)) / vSegments;
            
            const u_mapped = uRange[0] + u * (uRange[1] - uRange[0]);
            const v_mapped = vRange[0] + v * (vRange[1] - vRange[0]);
            
            const point = surfaceFunction(u_mapped, v_mapped);
            const color = colorFunction(u_mapped, v_mapped, point);
            
            colors.push(color.r, color.g, color.b);
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: vertexColors ? undefined : color,
        vertexColors: vertexColors,
        side: THREE.DoubleSide,
        transparent: opacity < 1,
        opacity: opacity,
        shininess: shininess,
        specular: specular
    });
    
    const surfaceMesh = new THREE.Mesh(geometry, material);
    parent.add(surfaceMesh);
    
    // Add wireframe overlay if requested
    if (wireframe) {
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333,
            wireframe: true,
            transparent: true,
            opacity: wireframeOpacity
        });
        const wireframeMesh = new THREE.Mesh(geometry.clone(), wireframeMaterial);
        parent.add(wireframeMesh);
        
        return { surface: surfaceMesh, wireframe: wireframeMesh };
    }
    
    return surfaceMesh;
}

/**
 * Creates a tangent plane at a point on a surface
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} point - Point on surface {x, y, z}
 * @param {Object} partials - Partial derivatives {dfdx, dfdy}
 * @param {Object} options - Plane options
 * @returns {THREE.Mesh} Tangent plane mesh
 */
export function createTangentPlaneView(parent, point, partials, options = {}) {
    const {
        size = 1.5,
        color = 0xffaa44,
        emissive = 0x332211,
        opacity = 0.6,
        segments = 1,
        shininess = 100,
        specular = 0x222222
    } = options;
    
    // Transform point to Three.js coordinates
    const threePoint = transformToThreeJS(point);
    
    // Calculate normal vector from partial derivatives in user space
    // Normal = (-dfdx, -dfdy, 1) normalized
    const normalUser = { x: -partials.dfdx, y: -partials.dfdy, z: 1 };
    const normalLength = Math.sqrt(normalUser.x * normalUser.x + normalUser.y * normalUser.y + normalUser.z * normalUser.z);
    const normalUserNorm = {
        x: normalUser.x / normalLength,
        y: normalUser.y / normalLength,
        z: normalUser.z / normalLength
    };
    
    // Transform normal to Three.js coordinates
    const normal = transformToThreeJS(normalUserNorm).normalize();
    
    // Create two basis vectors for the plane in user space
    const basis1User = { x: 1, y: 0, z: partials.dfdx };
    const basis1Length = Math.sqrt(1 + partials.dfdx * partials.dfdx);
    const basis1UserNorm = {
        x: basis1User.x / basis1Length,
        y: basis1User.y / basis1Length,
        z: basis1User.z / basis1Length
    };
    
    // Transform basis1 to Three.js coordinates
    const basis1 = transformToThreeJS(basis1UserNorm).normalize();
    
    // Create basis2 as cross product in Three.js space
    const basis2 = normal.clone().cross(basis1).normalize();
    
    // Create plane geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    // Generate vertices
    for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
            const u = (i / segments - 0.5) * size * 2;
            const v = (j / segments - 0.5) * size * 2;
            
            const vertex = threePoint.clone()
                .add(basis1.clone().multiplyScalar(u))
                .add(basis2.clone().multiplyScalar(v));
            
            vertices.push(vertex.x, vertex.y, vertex.z);
        }
    }
    
    // Generate indices
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + 1;
            const c = a + segments + 1;
            const d = c + 1;
            
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Create material - use MeshPhongMaterial like the sphere
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: 0.2,
        shininess: 150,
        specular: 0x444444,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide
    });
    
    const planeMesh = new THREE.Mesh(geometry, material);
    parent.add(planeMesh);
    
    return planeMesh;
}

/**
 * Legacy function - Creates a parametric surface (deprecated, use createParametricSurfaceView)
 * @param {THREE.Object3D} scene - Three.js scene
 * @param {Function} paramFunction - Function (u, v, target) => void that sets target vector
 * @param {Object} options - Surface options
 * @returns {THREE.Mesh} Surface mesh
 */
export function createParametricSurface(scene, paramFunction, options = {}) {
    const {
        uRange = [-1, 1],
        vRange = [-1, 1],
        resolution = 64,
        color = COLORS.SURFACE_BLUE,
        opacity = 0.9,
        wireframe = false
    } = options;
    
    // Create parametric geometry
    const geometry = new ParametricGeometry(
        (u, v, target) => {
            const uMapped = uRange[0] + u * (uRange[1] - uRange[0]);
            const vMapped = vRange[0] + v * (vRange[1] - vRange[0]);
            paramFunction(uMapped, vMapped, target);
        },
        resolution,
        resolution
    );
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: opacity < 1,
        opacity: opacity,
        wireframe: wireframe
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    return mesh;
}

/**
 * Creates a plane visualization in 3D space
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {THREE.Vector3} normal - Normal vector to the plane
 * @param {number} size - Size of the plane
 * @param {Object} options - Plane options
 * @returns {THREE.Mesh} Plane mesh
 */
export function createPlaneView(parent, normal, size = 5, options = {}) {
    const {
        color = COLORS.SURFACE_BLUE,
        opacity = 0.3,
        wireframe = false
    } = options;
    
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(size * 2, size * 2);
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        wireframe: wireframe,
        side: THREE.DoubleSide,
        shininess: 100,
        specular: 0x444444
    });
    
    const plane = new THREE.Mesh(geometry, material);
    
    // Transform normal vector to Three.js coordinates
    const threeNormal = transformToThreeJS(normal);
    
    // Orient the plane to be perpendicular to the normal
    const normalizedNormal = threeNormal.normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normalizedNormal);
    plane.quaternion.copy(quaternion);
    
    // Ensure the plane renders on top of grid planes
    plane.renderOrder = 1;
    
    parent.add(plane);
    return plane;
}

/**
 * Creates a 3D curve from a parametric function
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Function} curveFunction - Function t => {x, y, z}
 * @param {Object} options - Curve options
 * @returns {THREE.Mesh} Curve mesh (tube geometry)
 */
export function createCurveView(parent, curveFunction, options = {}) {
    const {
        tRange = [0, 2 * Math.PI],
        resolution = 256,
        color = COLORS.RED,
        radius = 0.02,
        opacity = 1.0,
        tubeSegments = 8,
        radialSegments = 8
    } = options;
    
    // Create curve points
    const points = [];
    for (let i = 0; i <= resolution; i++) {
        const t = tRange[0] + (tRange[1] - tRange[0]) * i / resolution;
        const point = curveFunction(t);
        const threePoint = transformToThreeJS(point);
        points.push(threePoint);
    }
    
    // Create curve from points
    const curve = new THREE.CatmullRomCurve3(points);
    
    // Create tube geometry for better visibility
    const geometry = new THREE.TubeGeometry(
        curve,
        tubeSegments,
        radius,
        radialSegments,
        false
    );
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: opacity < 1,
        opacity: opacity
    });
    
    const curveMesh = new THREE.Mesh(geometry, material);
    parent.add(curveMesh);
    
    return curveMesh;
}

// Export colormap functions for external use
export { viridisColor, plasmaColor, coolwarmColor };