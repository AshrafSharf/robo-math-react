import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a 3D surface plot from a mathematical function z = f(x, y)
 * @param {Function} surfaceFunction - Callback function (x, y) => z that defines the surface
 * @param {Array} xRange - X domain range [xMin, xMax] (default: [-2, 2])
 * @param {Array} yRange - Y domain range [yMin, yMax] (default: [-2, 2])
 * @param {Object} options - Configuration options
 * @param {number} options.xSteps - Number of steps in X direction (default: 50)
 * @param {number} options.ySteps - Number of steps in Y direction (default: 50)
 * @param {number} options.color - Base color of the surface (default: 0x4444ff blue)
 * @param {boolean} options.useColorMap - Use height-based coloring (default: false)
 * @param {string} options.colorMap - Color map type: 'height', 'gradient', 'custom' (default: 'height')
 * @param {Function} options.colorFunction - Custom color function (z) => {r, g, b} (default: null)
 * @param {number} options.opacity - Opacity of the surface (default: 0.9)
 * @param {boolean} options.wireframe - Show as wireframe (default: false)
 * @param {number} options.shininess - Material shininess (default: 100)
 * @param {number} options.specular - Specular color (default: 0x444444)
 * @param {number} options.emissive - Emissive color (default: 0x000000)
 * @param {boolean} options.doubleSided - Show both sides (default: true)
 * @returns {THREE.Mesh} The created surface mesh
 */
export function surface(surfaceFunction, xRange = [-2, 2], yRange = [-2, 2], options = {}) {
    const {
        xSteps = 50,
        ySteps = 50,
        color = 0x4444ff,
        useColorMap = false,
        colorMap = 'height',
        colorFunction = null,
        opacity = 0.9,
        wireframe = false,
        shininess = 100,
        specular = 0x444444,
        emissive = 0x000000,
        doubleSided = true
    } = options;
    
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const indices = [];
    const uvs = [];
    
    // Track z values for color mapping
    let minZ = Infinity;
    let maxZ = -Infinity;
    const zValues = [];
    
    // Generate vertices
    for (let i = 0; i <= xSteps; i++) {
        for (let j = 0; j <= ySteps; j++) {
            // Calculate x, y in mathematical coordinates
            const x = xMin + (xMax - xMin) * i / xSteps;
            const y = yMin + (yMax - yMin) * j / ySteps;
            
            // Get z value from the callback function
            const z = surfaceFunction(x, y);
            
            // Track min/max for color mapping
            zValues.push(z);
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
            
            // Transform to Three.js coordinates
            const threePos = transformToThreeJS({ x, y, z });
            vertices.push(threePos.x, threePos.y, threePos.z);
            
            // Add UV coordinates for texture mapping
            uvs.push(i / xSteps, j / ySteps);
        }
    }
    
    // Generate vertex colors if using color map
    if (useColorMap) {
        for (let i = 0; i < zValues.length; i++) {
            const z = zValues[i];
            const normalizedZ = (z - minZ) / (maxZ - minZ || 1);
            
            let r, g, b;
            
            if (colorFunction) {
                // Use custom color function
                const color = colorFunction(normalizedZ);
                r = color.r;
                g = color.g;
                b = color.b;
            } else if (colorMap === 'gradient') {
                // Blue to red gradient
                r = normalizedZ;
                g = 0.5 * (1 - Math.abs(normalizedZ - 0.5) * 2);
                b = 1 - normalizedZ;
            } else {
                // Default height-based coloring (blue low, red high)
                r = normalizedZ;
                g = 0.4;
                b = 1 - normalizedZ;
            }
            
            colors.push(r, g, b);
        }
    }
    
    // Generate triangular faces
    for (let i = 0; i < xSteps; i++) {
        for (let j = 0; j < ySteps; j++) {
            const a = i * (ySteps + 1) + j;
            const b = a + 1;
            const c = a + ySteps + 1;
            const d = c + 1;
            
            // Two triangles per grid square
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    
    // Set geometry attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    if (useColorMap && colors.length > 0) {
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Create material
    let material;
    
    if (wireframe) {
        material = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            opacity: opacity,
            transparent: opacity < 1.0,
            side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    } else {
        material = new THREE.MeshPhongMaterial({
            color: color,
            vertexColors: useColorMap,
            opacity: opacity,
            transparent: opacity < 1.0,
            shininess: shininess,
            specular: specular,
            emissive: emissive,
            side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    }
    
    // Create and return mesh
    const surfaceMesh = new THREE.Mesh(geometry, material);
    return surfaceMesh;
}

/**
 * Creates a parametric surface from parametric equations
 * @param {Function} parametricFunction - Callback (u, v) => {x, y, z} that defines the surface
 * @param {Array} uRange - U parameter range [uMin, uMax] (default: [0, 1])
 * @param {Array} vRange - V parameter range [vMin, vMax] (default: [0, 1])
 * @param {Object} options - Configuration options
 * @param {number} options.uSteps - Number of steps in U direction (default: 50)
 * @param {number} options.vSteps - Number of steps in V direction (default: 50)
 * @param {...} options - Other options same as surface function
 * @returns {THREE.Mesh} The created parametric surface mesh
 */
export function parametricSurface(parametricFunction, uRange = [0, 1], vRange = [0, 1], options = {}) {
    const {
        uSteps = 50,
        vSteps = 50,
        color = 0x4444ff,
        opacity = 0.9,
        wireframe = false,
        shininess = 100,
        specular = 0x444444,
        emissive = 0x000000,
        doubleSided = true
    } = options;
    
    const [uMin, uMax] = uRange;
    const [vMin, vMax] = vRange;
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    
    // Generate vertices
    for (let i = 0; i <= uSteps; i++) {
        for (let j = 0; j <= vSteps; j++) {
            // Calculate parameters
            const u = uMin + (uMax - uMin) * i / uSteps;
            const v = vMin + (vMax - vMin) * j / vSteps;
            
            // Get point from parametric function
            const point = parametricFunction(u, v);
            
            // Transform to Three.js coordinates
            const threePos = transformToThreeJS(point);
            vertices.push(threePos.x, threePos.y, threePos.z);
            
            // Add UV coordinates
            uvs.push(i / uSteps, j / vSteps);
        }
    }
    
    // Generate triangular faces
    for (let i = 0; i < uSteps; i++) {
        for (let j = 0; j < vSteps; j++) {
            const a = i * (vSteps + 1) + j;
            const b = a + 1;
            const c = a + vSteps + 1;
            const d = c + 1;
            
            // Two triangles per grid square
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    
    // Set geometry attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Create material
    let material;
    
    if (wireframe) {
        material = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            opacity: opacity,
            transparent: opacity < 1.0,
            side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    } else {
        material = new THREE.MeshPhongMaterial({
            color: color,
            opacity: opacity,
            transparent: opacity < 1.0,
            shininess: shininess,
            specular: specular,
            emissive: emissive,
            side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    }
    
    // Create and return mesh
    const surfaceMesh = new THREE.Mesh(geometry, material);
    return surfaceMesh;
}