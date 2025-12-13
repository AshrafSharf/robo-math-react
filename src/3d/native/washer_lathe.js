import * as THREE from 'three';

/**
 * Creates a washer solid by revolving the region between two curves around the x-axis
 * For the washer method, we need to create circular cross-sections perpendicular to the x-axis
 * @param {Function} outerCurve - Function defining outer boundary y = f(x)
 * @param {Function} innerCurve - Function defining inner boundary y = g(x)  
 * @param {Number} xMin - Start x value
 * @param {Number} xMax - End x value
 * @param {Object} options - Configuration options
 * @returns {THREE.Group} The washer solid as a group of disks
 */
export function createWasherSolid(outerFunc, innerFunc, xMin, xMax, options = {}) {
    const {
        segments = 100,       // Number of washers along x-axis
        radialSegments = 32, // Number of segments around each circle
        color = 0x4488ff,    // Color of the solid
        opacity = 0.8,       // Opacity
        wireframe = false    // Show as wireframe
    } = options;
    
    console.log('Creating washer solid from x =', xMin, 'to x =', xMax);
    
    const group = new THREE.Group();
    const dx = (xMax - xMin) / segments;
    
    // Create material once for all washers
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
            shininess: 100,
            specular: 0x444444
        });
    
    // Create washers along the x-axis
    for (let i = 0; i < segments; i++) {
        const x = xMin + (i + 0.5) * dx;
        const outerRadius = Math.abs(outerFunc(x));
        const innerRadius = Math.abs(innerFunc(x));
        
        // Skip if radii are invalid
        if (outerRadius <= 0 || innerRadius < 0 || innerRadius >= outerRadius) {
            continue;
        }
        
        // Create washer shape with hole
        const shape = new THREE.Shape();
        
        // Outer circle
        const outerTheta = [];
        for (let j = 0; j <= radialSegments; j++) {
            const theta = (j / radialSegments) * Math.PI * 2;
            outerTheta.push(theta);
        }
        
        // Create outer circle
        for (let j = 0; j <= radialSegments; j++) {
            const theta = outerTheta[j];
            const px = outerRadius * Math.cos(theta);
            const py = outerRadius * Math.sin(theta);
            if (j === 0) {
                shape.moveTo(px, py);
            } else {
                shape.lineTo(px, py);
            }
        }
        
        // Add inner hole if it exists
        if (innerRadius > 0.001) {
            const hole = new THREE.Path();
            for (let j = 0; j <= radialSegments; j++) {
                const theta = outerTheta[j];
                const px = innerRadius * Math.cos(theta);
                const py = innerRadius * Math.sin(theta);
                if (j === 0) {
                    hole.moveTo(px, py);
                } else {
                    hole.lineTo(px, py);
                }
            }
            shape.holes.push(hole);
        }
        
        // Extrude to create washer
        const extrudeSettings = {
            depth: dx * 0.98, // Slightly smaller to avoid z-fighting
            bevelEnabled: false,
            curveSegments: radialSegments
        };
        
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const washer = new THREE.Mesh(geometry, material);
        
        // Position and orient the washer
        washer.rotation.y = Math.PI / 2; // Rotate to align with x-axis
        washer.position.x = x - dx / 2;
        
        group.add(washer);
    }
    
    console.log('Created', group.children.length, 'washers');
    
    return group;
}

/**
 * Generates a single washer at a specific x position
 * @param {Number} x - Position along x-axis
 * @param {Number} thickness - Thickness of the washer
 * @param {Function} outerCurve - Outer boundary function
 * @param {Function} innerCurve - Inner boundary function
 * @param {THREE.Material} material - Material for the washer
 * @returns {THREE.Mesh} The washer mesh
 */
export function singleWasher(x, thickness, outerCurve, innerCurve, material) {
    const outerRadius = outerCurve(x);
    const innerRadius = innerCurve(x);
    
    // Generate the washer geometry manually (ring shape)
    const washerGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    const segments = 32;
    // Generate vertices for washer (outer and inner circles, top and bottom)
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        // Top outer
        vertices.push(x + thickness/2, outerRadius * cos, outerRadius * sin);
        // Top inner
        vertices.push(x + thickness/2, innerRadius * cos, innerRadius * sin);
        // Bottom outer
        vertices.push(x - thickness/2, outerRadius * cos, outerRadius * sin);
        // Bottom inner
        vertices.push(x - thickness/2, innerRadius * cos, innerRadius * sin);
    }
    
    // Generate faces
    for (let i = 0; i < segments; i++) {
        const a = i * 4;
        const b = (i + 1) * 4;
        
        // Top face (ring)
        indices.push(a, b, b + 1);
        indices.push(a, b + 1, a + 1);
        
        // Bottom face (ring)
        indices.push(a + 2, b + 3, b + 2);
        indices.push(a + 2, a + 3, b + 3);
        
        // Outer face
        indices.push(a, a + 2, b + 2);
        indices.push(a, b + 2, b);
        
        // Inner face
        indices.push(a + 1, b + 1, b + 3);
        indices.push(a + 1, b + 3, a + 3);
    }
    
    washerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    washerGeometry.setIndex(indices);
    washerGeometry.computeVertexNormals();
    
    const washerMesh = new THREE.Mesh(washerGeometry, material);
    return washerMesh;
}

/**
 * Generates a stack of washers for visualization
 * @param {Function} outerCurve - Outer boundary function
 * @param {Function} innerCurve - Inner boundary function
 * @param {Number} xMin - Start x value
 * @param {Number} xMax - End x value
 * @param {Object} options - Configuration options
 * @returns {THREE.Group} Group containing the washer stack
 */
export function washerStack(outerCurve, innerCurve, xMin, xMax, options = {}) {
    const {
        numWashers = 12,
        color = 0x4488ff,
        opacity = 0.7,
        visible = false
    } = options;
    
    const stackGroup = new THREE.Group();
    stackGroup.visible = visible;
    stackGroup.name = 'washerStack';
    
    const washerThickness = (xMax - xMin) / numWashers;
    const washerMeshes = [];
    
    // Material for washers in the stack
    const stackMaterial = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        side: THREE.DoubleSide,
        shininess: 30,
        specular: 0x222222
    });
    
    // Generate individual washers for the stack
    for (let i = 0; i < numWashers; i++) {
        const x = xMin + (i + 0.5) * washerThickness;
        const washer = singleWasher(x, washerThickness * 0.8, outerCurve, innerCurve, stackMaterial);
        washer.userData.stackIndex = i;
        stackGroup.add(washer);
        washerMeshes.push(washer);
    }
    
    // Store washers for animation
    stackGroup.userData.washerMeshes = washerMeshes;
    stackGroup.userData.isTemporary = true;  // Mark for cleanup on reset
    
    return stackGroup;
}

/**
 * Generates an extracted washer for detailed inspection
 * @param {Function} outerCurve - Outer boundary function
 * @param {Function} innerCurve - Inner boundary function
 * @param {Number} xMin - Start x value
 * @param {Number} xMax - End x value
 * @param {Object} options - Configuration options
 * @returns {THREE.Mesh} The extracted washer mesh
 */
export function extractedWasher(outerCurve, innerCurve, xMin, xMax, options = {}) {
    const {
        extractIndex = Math.floor(12 / 3),  // Default to 1/3 of the way through
        numWashers = 12,
        color = 0x4488ff,
        opacity = 0.95,
        visible = false
    } = options;
    
    const washerThickness = (xMax - xMin) / numWashers;
    const extractX = xMin + (extractIndex + 0.5) * washerThickness;
    
    // Material for the extracted washer
    const extractMaterial = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        side: THREE.DoubleSide,
        shininess: 30,
        specular: 0x222222
    });
    
    const washer = singleWasher(extractX, washerThickness * 0.8, outerCurve, innerCurve, extractMaterial);
    washer.visible = visible;
    washer.userData.isTemporary = true;  // Mark for cleanup on reset
    
    return washer;
}