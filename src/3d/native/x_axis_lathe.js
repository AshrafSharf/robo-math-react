import * as THREE from 'three';

/**
 * Creates a lathe geometry by revolving a closed path around the X-axis
 * Similar to THREE.LatheGeometry but for X-axis rotation
 * 
 * @param {Array} profilePoints - Array of Vector2 points defining the closed profile
 *                                Points should be in (x, y) where x is position along axis
 *                                and y is the radius from the axis
 * @param {Object} options - Configuration options
 * @returns {THREE.BufferGeometry} The generated geometry
 */
export function xAxisLathe(profilePoints, options = {}) {
    const {
        segments = 32,           // Number of segments around the rotation
        phiStart = 0,           // Starting angle
        phiLength = Math.PI * 2 // Angle to rotate (2PI for full revolution)
    } = options;
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const uvs = [];
    const indices = [];
    
    // Generate vertices by rotating the profile around X-axis
    for (let i = 0; i < profilePoints.length; i++) {
        const point = profilePoints[i];
        const x = point.x;       // Position along X-axis
        const radius = Math.max(0, point.y);  // Distance from X-axis (ensure non-negative)
        
        for (let j = 0; j <= segments; j++) {
            // Calculate rotation angle
            const phi = phiStart + (j / segments) * phiLength;
            
            // Calculate vertex position
            // X stays the same, Y and Z are rotated
            const vx = x;
            const vy = radius * Math.cos(phi);
            const vz = radius * Math.sin(phi);
            
            vertices.push(vx, vy, vz);
            
            // UV coordinates
            const u = i / (profilePoints.length - 1);
            const v = j / segments;
            uvs.push(u, v);
        }
    }
    
    // Generate indices for triangulation
    for (let i = 0; i < profilePoints.length - 1; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + segments + 1;
            const c = a + 1;
            const d = b + 1;
            
            // Create two triangles for each quad
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }
    
    // Set geometry attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    
    // Compute proper normals - let Three.js calculate them based on face geometry
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    
    return geometry;
}

/**
 * Creates a washer solid by revolving the region between two curves around the X-axis
 * The profile at each x position is a rectangle from inner radius to outer radius
 * 
 * @param {Function} outerCurve - Function y = f(x) defining the outer boundary
 * @param {Function} innerCurve - Function y = g(x) defining the inner boundary
 * @param {Number} xMin - Start x value
 * @param {Number} xMax - End x value
 * @param {Object} options - Configuration options
 * @returns {THREE.Mesh} The washer solid mesh
 */
export function washerSolidXAxis(outerCurve, innerCurve, xMin, xMax, options = {}) {
    const {
        curveSegments = 50,     // Number of points along the curves
        rotationSegments = 64,   // Number of segments around rotation
        color = 0x4488ff,        // Color of the solid
        opacity = 0.8,           // Opacity
        wireframe = false        // Show as wireframe
    } = options;
    
    console.log('Creating X-axis washer solid:', { xMin, xMax, curveSegments, rotationSegments });
    
    // Create the profile path
    // The profile represents the boundary of the shaded region in the xy-plane
    // When revolved around x-axis, y-values become radii
    const profilePoints = [];
    
    // Start from a small offset to avoid degenerate geometry at x=0 where both curves meet
    const startOffset = 0.02;
    const adjustedXMin = xMin + startOffset;
    const dx = (xMax - adjustedXMin) / curveSegments;
    
    // FORWARD PASS: Trace along the OUTER curve (y = x)
    // This forms the outer surface of the funnel
    for (let i = 0; i <= curveSegments; i++) {
        const x = adjustedXMin + i * dx;
        const outerY = Math.abs(outerCurve(x));  // y = x, this becomes the radius
        profilePoints.push(new THREE.Vector2(x, outerY));
    }
    
    // BACKWARD PASS: Trace along the INNER curve (y = x²/4) going backwards
    // This forms the inner (hollow) surface of the funnel
    for (let i = curveSegments; i >= 0; i--) {
        const x = adjustedXMin + i * dx;
        const innerY = Math.abs(innerCurve(x));  // y = x²/4, this becomes the radius
        profilePoints.push(new THREE.Vector2(x, innerY));
    }
    
    // Close the path to create a closed cross-section
    profilePoints.push(profilePoints[0].clone());
    
    console.log('Profile has', profilePoints.length, 'points');
    console.log('First 5 points:', profilePoints.slice(0, 5).map(p => `(x=${p.x.toFixed(2)}, r=${p.y.toFixed(2)})`));
    console.log('Points at transition:', profilePoints.slice(curveSegments, curveSegments + 15).map(p => `(x=${p.x.toFixed(2)}, r=${p.y.toFixed(2)})`));
    
    // Verify we have a proper closed loop with thickness
    const minRadius = Math.min(...profilePoints.map(p => p.y));
    const maxRadius = Math.max(...profilePoints.map(p => p.y));
    console.log('Radius range:', { min: minRadius, max: maxRadius });
    
    // Create the geometry using our custom X-axis lathe
    const geometry = xAxisLathe(profilePoints, {
        segments: rotationSegments,
        phiStart: 0,
        phiLength: Math.PI * 2
    });
    
    console.log('Geometry created with:', {
        vertices: geometry.attributes.position.count,
        indices: geometry.index ? geometry.index.count : 'none'
    });
    
    // Compute bounding box to check if geometry is valid
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    console.log('Bounding box:', geometry.boundingBox);
    console.log('Bounding sphere radius:', geometry.boundingSphere?.radius);
    
    // Create material with enhanced 3D appearance
    const material = wireframe ?
        new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            opacity: opacity,
            transparent: opacity < 1.0,
            side: THREE.DoubleSide
        }) :
        new THREE.MeshPhongMaterial({
            color: color,
            opacity: opacity,
            transparent: opacity < 1.0,
            side: THREE.DoubleSide,
            shininess: 30,               // Lower shininess for softer highlights
            specular: 0x222222,          // Dimmer specular for subtle highlights
            emissive: 0x000000,          // No emissive - let lighting do the work
            flatShading: false           // Ensure smooth shading
        });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Add edge geometry to highlight the structure
    const edges = new THREE.EdgesGeometry(geometry, 30); // 30 degree threshold for edges
    const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x000000, 
        opacity: 0.3,
        transparent: true,
        linewidth: 1
    });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    mesh.add(edgeLines); // Add edges as child of mesh so they move together
    
    // Store metadata for animation
    mesh.userData.washerData = {
        outerCurve,
        innerCurve,
        xMin,
        xMax,
        profilePoints: profilePoints.length
    };
    
    // Store revolution data for animation (similar to Y-axis revolution)
    mesh.userData.revolutionData = {
        axis: 'x',
        startAngle: 0,
        fullAngle: Math.PI * 2,
        curvePoints: profilePoints,
        segments: rotationSegments,
        outerCurve,
        innerCurve,
        xMin,
        xMax
    };
    
    console.log('Mesh created successfully');
    
    return mesh;
}