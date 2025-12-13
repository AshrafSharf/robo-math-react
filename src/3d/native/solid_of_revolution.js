/**
 * solid_of_revolution.js
 * Creates solids of revolution using native Three.js coordinates
 */

import * as THREE from 'three';

/**
 * Generates curve points for a capped solid of revolution
 * Includes axis points at top and bottom for a closed solid
 * @param {Function} curveFunc - Function that returns radius for a given parameter
 * @param {Array} range - [min, max] parameter range
 * @param {Object} options - Configuration options
 * @returns {Array} Array of {x, y} points including caps
 */
export function generateCappedCurvePoints(curveFunc, range, options = {}) {
    const {
        steps = 50,
        axis = 'y',
        includeCaps = true
    } = options;
    
    const [min, max] = range;
    const curvePoints = [];
    
    // Add bottom cap point on axis if requested
    if (includeCaps) {
        if (axis === 'y') {
            curvePoints.push({ x: 0, y: min });
        } else if (axis === 'x') {
            curvePoints.push({ x: min, y: 0 });
        }
    }
    
    // Add curve points from bottom to top
    for (let i = 0; i <= steps; i++) {
        const t = min + (max - min) * (i / steps);
        const radius = curveFunc(t);
        
        if (axis === 'y') {
            curvePoints.push({ x: radius, y: t });
        } else if (axis === 'x') {
            curvePoints.push({ x: t, y: radius });
        }
    }
    
    // Add top cap point on axis if requested
    if (includeCaps) {
        if (axis === 'y') {
            curvePoints.push({ x: 0, y: max });
        } else if (axis === 'x') {
            curvePoints.push({ x: max, y: 0 });
        }
    }
    
    return curvePoints;
}

/**
 * Creates a solid of revolution by rotating a curve around an axis
 * @param {Function|Array} curve - Either a function or array of points defining the curve
 * @param {string} axis - Axis of rotation: 'x', 'y', or 'z' (default: 'y')
 * @param {Array} range - Parameter range [min, max] for function mode
 * @param {Object} options - Configuration options
 * @returns {THREE.Mesh} The solid of revolution mesh
 */
export function solidOfRevolution(curve, axis = 'y', range = null, options = {}) {
    const {
        steps = 50,
        segments = 32,
        startAngle = 0,
        angle = Math.PI * 2,
        color = 0x4488ff,
        opacity = 0.8,
        wireframe = false,
        shininess = 100,
        doubleSided = true
    } = options;

    // Generate curve points
    let curvePoints = [];
    
    if (typeof curve === 'function') {
        if (!range || range.length !== 2) {
            throw new Error('Range [min, max] required for function curve');
        }
        
        const [tMin, tMax] = range;
        for (let i = 0; i <= steps; i++) {
            const t = tMin + (tMax - tMin) * (i / steps);
            const point = curve(t);
            
            if (typeof point === 'object' && point.x !== undefined && point.y !== undefined) {
                curvePoints.push(point);
            } else if (typeof point === 'number') {
                if (axis === 'y') {
                    // Revolving around y-axis: t is y, result is x (radius)
                    curvePoints.push({ x: point, y: t });
                } else if (axis === 'x') {
                    // Revolving around x-axis: t is x, result is y (radius)
                    curvePoints.push({ x: t, y: point });
                }
            }
        }
    } else if (Array.isArray(curve)) {
        curvePoints = curve;
    } else {
        throw new Error('Curve must be a function or array of points');
    }
    
    // Filter out points with negative radius
    curvePoints = curvePoints.filter(p => {
        if (axis === 'y') return p.x >= 0;
        if (axis === 'x') return p.y >= 0;
        if (axis === 'z') return Math.sqrt(p.x * p.x + p.y * p.y) >= 0;
        return true;
    });
    
    if (curvePoints.length < 2) {
        throw new Error('Need at least 2 valid points for revolution');
    }
    
    // Create geometry based on axis of rotation
    let geometry;
    
    if (axis === 'y') {
        // Use Three.js LatheGeometry for Y-axis rotation
        const lathePoints = curvePoints.map(p => 
            new THREE.Vector2(Math.abs(p.x), p.y)  // radius, height
        );
        
        geometry = new THREE.LatheGeometry(
            lathePoints,
            segments,
            startAngle,
            angle
        );
    } else if (axis === 'x') {
        geometry = createXAxisRevolution(curvePoints, segments, startAngle, angle);
    } else if (axis === 'z') {
        geometry = createZAxisRevolution(curvePoints, segments, startAngle, angle);
    } else {
        throw new Error('Axis must be "x", "y", or "z"');
    }
    
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
            specular: 0x444444,
            emissive: 0x000000,
            side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Store metadata for animations
    mesh.userData.revolutionData = {
        axis: axis,
        startAngle: startAngle,
        fullAngle: angle,
        curvePoints: curvePoints,
        segments: segments
    };
    
    return mesh;
}

/**
 * Creates geometry for rotation around X-axis
 * @private
 */
function createXAxisRevolution(curvePoints, segments, startAngle, angle) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    
    // Generate vertices
    for (let i = 0; i < curvePoints.length; i++) {
        const point = curvePoints[i];
        const radius = Math.abs(point.y);
        const x = point.x;
        
        for (let j = 0; j <= segments; j++) {
            const theta = startAngle + (angle * j / segments);
            
            // Rotate around X-axis in Three.js coordinates
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            
            vertices.push(x, y, z);
            uvs.push(i / (curvePoints.length - 1), j / segments);
        }
    }
    
    // Generate faces
    for (let i = 0; i < curvePoints.length - 1; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + 1;
            const c = (i + 1) * (segments + 1) + j;
            const d = c + 1;
            
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
}

/**
 * Creates geometry for rotation around Z-axis
 * @private
 */
function createZAxisRevolution(curvePoints, segments, startAngle, angle) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    
    // Generate vertices
    for (let i = 0; i < curvePoints.length; i++) {
        const point = curvePoints[i];
        const radius = Math.sqrt(point.x * point.x + point.y * point.y);
        const z = point.z || 0;
        
        for (let j = 0; j <= segments; j++) {
            const theta = startAngle + (angle * j / segments);
            
            // Rotate around Z-axis in Three.js coordinates
            const x = radius * Math.cos(theta);
            const y = radius * Math.sin(theta);
            
            vertices.push(x, y, z);
            uvs.push(i / (curvePoints.length - 1), j / segments);
        }
    }
    
    // Generate faces
    for (let i = 0; i < curvePoints.length - 1; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + 1;
            const c = (i + 1) * (segments + 1) + j;
            const d = c + 1;
            
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
}

/**
 * Creates a disc or washer at a specific position along the axis
 * @param {number} position - Position along the axis
 * @param {number} innerRadius - Inner radius (0 for disc, >0 for washer)
 * @param {number} outerRadius - Outer radius
 * @param {string} axis - Axis perpendicular to the disc ('x', 'y', or 'z')
 * @param {Object} options - Styling options
 * @returns {THREE.Mesh} The disc/washer mesh
 */
export function revolutionDisc(position, innerRadius, outerRadius, axis = 'y', options = {}) {
    const {
        color = 0x4488ff,
        opacity = 0.5,
        segments = 32
    } = options;
    
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const disc = new THREE.Mesh(geometry, material);
    
    // Position and orient based on axis
    if (axis === 'y') {
        // Disc perpendicular to Y-axis
        disc.rotation.x = Math.PI / 2;
        disc.position.y = position;
    } else if (axis === 'x') {
        // Disc perpendicular to X-axis
        disc.rotation.y = Math.PI / 2;
        disc.position.x = position;
    } else if (axis === 'z') {
        // Disc perpendicular to Z-axis (already correct orientation)
        disc.position.z = position;
    }
    
    return disc;
}

/**
 * Creates the 2D curve that will be revolved
 * @param {Function|Array} curve - Curve definition
 * @param {Array} range - Parameter range for function curves
 * @param {Object} options - Styling options
 * @returns {THREE.Mesh} The curve as a tube mesh
 */
export function revolutionCurve(curve, range = null, options = {}) {
    const {
        steps = 50,
        color = 0xff0000,
        radius = 0.04  // Changed from linewidth to radius for tube geometry
    } = options;
    
    let curvePoints = [];
    
    if (typeof curve === 'function' && range) {
        const [tMin, tMax] = range;
        for (let i = 0; i <= steps; i++) {
            const t = tMin + (tMax - tMin) * (i / steps);
            const point = curve(t);
            
            if (typeof point === 'object') {
                curvePoints.push(point);
            } else if (typeof point === 'number') {
                curvePoints.push({ x: point, y: t, z: 0 });
            }
        }
    } else if (Array.isArray(curve)) {
        curvePoints = curve.map(p => ({ ...p, z: p.z || 0 }));
    }
    
    // Create curve using CatmullRomCurve3 for smooth interpolation
    const points = curvePoints.map(p => 
        new THREE.Vector3(p.x, p.y, p.z || 0)
    );
    
    const curvePath = new THREE.CatmullRomCurve3(points);
    
    // Create tube geometry for visible thickness
    const tubeGeometry = new THREE.TubeGeometry(
        curvePath,
        steps * 2,  // Tubular segments
        radius,     // Radius
        8,          // Radial segments
        false       // Closed
    );
    
    const material = new THREE.MeshPhongMaterial({
        color: color
    });
    
    return new THREE.Mesh(tubeGeometry, material);
}