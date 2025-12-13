import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a sphere in 3D space using mathematical coordinates
 * @param {Object} center - Center position in mathematical coordinates {x, y, z}
 * @param {number} radius - Radius of the sphere
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the sphere (default: 0x4444ff)
 * @param {number} options.opacity - Opacity of the sphere (default: 1.0)
 * @param {number} options.widthSegments - Number of horizontal segments (default: 32)
 * @param {number} options.heightSegments - Number of vertical segments (default: 16)
 * @param {boolean} options.wireframe - Whether to render as wireframe (default: false)
 * @param {number} options.emissive - Emissive color (default: 0x000000)
 * @param {number} options.emissiveIntensity - Emissive intensity (default: 0)
 * @param {number} options.shininess - Material shininess (default: 100)
 * @returns {THREE.Mesh} The created sphere mesh
 */
export function sphere(center, radius, options = {}) {
    const {
        color = 0x4444ff,
        opacity = 1.0,
        widthSegments = 32,
        heightSegments = 16,
        wireframe = false,
        emissive = 0x000000,
        emissiveIntensity = 0,
        shininess = 100
    } = options;
    
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        shininess: shininess,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const sphereMesh = new THREE.Mesh(geometry, material);
    
    // Transform center position and apply to mesh
    const threeCenter = transformToThreeJS(center);
    sphereMesh.position.set(threeCenter.x, threeCenter.y, threeCenter.z);
    
    return sphereMesh;
}

/**
 * Creates a cylinder in 3D space using mathematical coordinates
 * @param {Object} baseCenter - Center of the base in mathematical coordinates {x, y, z}
 * @param {Object} topCenter - Center of the top in mathematical coordinates {x, y, z}
 * @param {number} radius - Radius of the cylinder (use radiusTop/radiusBottom for different radii)
 * @param {Object} options - Configuration options
 * @param {number} options.radiusTop - Top radius (overrides radius if specified)
 * @param {number} options.radiusBottom - Bottom radius (overrides radius if specified)
 * @param {number} options.color - Color of the cylinder (default: 0x44ff44)
 * @param {number} options.opacity - Opacity of the cylinder (default: 1.0)
 * @param {number} options.radialSegments - Number of segments around the circumference (default: 32)
 * @param {number} options.heightSegments - Number of segments along the height (default: 1)
 * @param {boolean} options.openEnded - Whether the cylinder is open-ended (default: false)
 * @param {boolean} options.wireframe - Whether to render as wireframe (default: false)
 * @param {number} options.emissive - Emissive color (default: 0x000000)
 * @param {number} options.emissiveIntensity - Emissive intensity (default: 0)
 * @param {number} options.shininess - Material shininess (default: 100)
 * @returns {THREE.Mesh} The created cylinder mesh
 */
export function cylinder(baseCenter, topCenter, radius, options = {}) {
    const {
        radiusTop = radius,
        radiusBottom = radius,
        color = 0x44ff44,
        opacity = 1.0,
        radialSegments = 32,
        heightSegments = 1,
        openEnded = false,
        wireframe = false,
        emissive = 0x000000,
        emissiveIntensity = 0,
        shininess = 100
    } = options;
    
    // Transform centers to Three.js coordinates
    const threeBase = transformToThreeJS(baseCenter);
    const threeTop = transformToThreeJS(topCenter);
    
    // Calculate height and center position
    const direction = new THREE.Vector3().subVectors(threeTop, threeBase);
    const height = direction.length();
    const center = new THREE.Vector3().addVectors(threeBase, threeTop).multiplyScalar(0.5);
    
    // Create cylinder geometry
    const geometry = new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
        heightSegments,
        openEnded
    );
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        shininess: shininess,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const cylinderMesh = new THREE.Mesh(geometry, material);
    
    // Position at center
    cylinderMesh.position.copy(center);
    
    // Orient cylinder from base to top
    // Default cylinder is aligned with Y axis, need to rotate to match direction
    direction.normalize();
    const up = new THREE.Vector3(0, 1, 0);
    
    // Only rotate if not already aligned with Y axis
    if (Math.abs(direction.dot(up)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        cylinderMesh.quaternion.copy(quaternion);
    }
    
    return cylinderMesh;
}

/**
 * Creates a cube/box in 3D space using mathematical coordinates
 * @param {Object} center - Center position in mathematical coordinates {x, y, z}
 * @param {number|Object} size - Size of the cube (number for uniform, or {x, y, z} for box)
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the cube (default: 0xff4444)
 * @param {number} options.opacity - Opacity of the cube (default: 1.0)
 * @param {number} options.widthSegments - Number of segments along X (default: 1)
 * @param {number} options.heightSegments - Number of segments along Y (default: 1)
 * @param {number} options.depthSegments - Number of segments along Z (default: 1)
 * @param {boolean} options.wireframe - Whether to render as wireframe (default: false)
 * @param {number} options.emissive - Emissive color (default: 0x000000)
 * @param {number} options.emissiveIntensity - Emissive intensity (default: 0)
 * @param {number} options.shininess - Material shininess (default: 100)
 * @returns {THREE.Mesh} The created cube/box mesh
 */
export function cube(center, size, options = {}) {
    const {
        color = 0xff4444,
        opacity = 1.0,
        widthSegments = 1,
        heightSegments = 1,
        depthSegments = 1,
        wireframe = false,
        emissive = 0x000000,
        emissiveIntensity = 0,
        shininess = 100
    } = options;
    
    // Handle size parameter - can be number or {x, y, z}
    let width, height, depth;
    if (typeof size === 'number') {
        width = height = depth = size;
    } else {
        width = size.x || 1;
        height = size.y || 1;
        depth = size.z || 1;
    }
    
    // Create box geometry
    const geometry = new THREE.BoxGeometry(
        width,
        height,
        depth,
        widthSegments,
        heightSegments,
        depthSegments
    );
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        shininess: shininess,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const cubeMesh = new THREE.Mesh(geometry, material);
    
    // Transform center position and apply to mesh
    const threeCenter = transformToThreeJS(center);
    cubeMesh.position.set(threeCenter.x, threeCenter.y, threeCenter.z);
    
    return cubeMesh;
}

/**
 * Creates a cone in 3D space using mathematical coordinates
 * @param {Object} apex - Apex (tip) position in mathematical coordinates {x, y, z}
 * @param {Object} baseCenter - Center of the base in mathematical coordinates {x, y, z}
 * @param {number} radius - Radius of the cone base
 * @param {Object} options - Configuration options (similar to cylinder)
 * @returns {THREE.Mesh} The created cone mesh
 */
export function cone(apex, baseCenter, radius, options = {}) {
    // A cone is just a cylinder with radiusTop = 0
    return cylinder(baseCenter, apex, radius, {
        ...options,
        radiusTop: 0,
        radiusBottom: radius
    });
}

/**
 * Creates a torus in 3D space using mathematical coordinates
 * @param {Object} center - Center position in mathematical coordinates {x, y, z}
 * @param {number} radius - Distance from center to tube center
 * @param {number} tubeRadius - Radius of the tube
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the torus (default: 0xffaa00)
 * @param {number} options.opacity - Opacity of the torus (default: 1.0)
 * @param {number} options.radialSegments - Number of segments around the tube (default: 16)
 * @param {number} options.tubularSegments - Number of segments around the torus (default: 100)
 * @param {boolean} options.wireframe - Whether to render as wireframe (default: false)
 * @param {Object} options.axis - Axis of rotation in mathematical coords (default: {x:0, y:0, z:1})
 * @returns {THREE.Mesh} The created torus mesh
 */
export function torus(center, radius, tubeRadius, options = {}) {
    const {
        color = 0xffaa00,
        opacity = 1.0,
        radialSegments = 16,
        tubularSegments = 100,
        wireframe = false,
        axis = {x: 0, y: 0, z: 1}
    } = options;
    
    // Create torus geometry
    const geometry = new THREE.TorusGeometry(
        radius,
        tubeRadius,
        radialSegments,
        tubularSegments
    );
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const torusMesh = new THREE.Mesh(geometry, material);
    
    // Transform center position
    const threeCenter = transformToThreeJS(center);
    torusMesh.position.set(threeCenter.x, threeCenter.y, threeCenter.z);
    
    // Orient torus based on axis
    // Default torus lies in XY plane (normal along Z)
    const threeAxis = transformToThreeJS(axis);
    const defaultNormal = new THREE.Vector3(0, 0, 1);
    threeAxis.normalize();
    
    if (Math.abs(threeAxis.dot(defaultNormal)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultNormal, threeAxis);
        torusMesh.quaternion.copy(quaternion);
    }
    
    return torusMesh;
}

/**
 * Creates a prism in 3D space using mathematical coordinates
 * @param {Object} baseCenter - Center of the base in mathematical coordinates {x, y, z}
 * @param {Array|number} baseShape - Array of 2D points [{x, z}, ...] for base shape, or number of sides for regular polygon
 * @param {number} height - Height of the prism
 * @param {Object} options - Configuration options
 * @param {number} options.baseRadius - Radius for regular polygon base (default: 1, used when baseShape is a number)
 * @param {number} options.color - Color of the prism (default: 0x44ff88)
 * @param {number} options.opacity - Opacity of the prism (default: 1.0)
 * @param {boolean} options.wireframe - Whether to render as wireframe (default: false)
 * @param {Object} options.direction - Direction vector for prism extrusion (default: {x:0, y:1, z:0})
 * @returns {THREE.Mesh} The created prism mesh
 */
export function prism(baseCenter, baseShape, height, options = {}) {
    const {
        baseRadius = 1,
        color = 0x44ff88,
        opacity = 1.0,
        wireframe = false,
        direction = {x: 0, y: 1, z: 0}
    } = options;
    
    // Create base shape points
    let shapePoints = [];
    
    if (typeof baseShape === 'number') {
        // Create regular polygon with baseShape sides
        const sides = Math.max(3, Math.floor(baseShape));
        for (let i = 0; i < sides; i++) {
            const angle = (2 * Math.PI * i) / sides;
            shapePoints.push(new THREE.Vector2(
                baseRadius * Math.cos(angle),
                baseRadius * Math.sin(angle)
            ));
        }
    } else if (Array.isArray(baseShape)) {
        // Use provided points
        shapePoints = baseShape.map(p => new THREE.Vector2(p.x, p.z || p.y));
    } else {
        console.warn('Invalid baseShape: must be number of sides or array of points');
        return new THREE.Mesh();
    }
    
    // Create shape for extrusion
    const shape = new THREE.Shape(shapePoints);
    
    // Create extrude geometry
    const extrudeSettings = {
        depth: height,
        bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const prismMesh = new THREE.Mesh(geometry, material);
    
    // Transform and position
    const threeBase = transformToThreeJS(baseCenter);
    
    // Center the prism at base center
    // ExtrudeGeometry creates shape in XY plane, extruded along Z
    // We need to rotate it to align with the desired direction
    const threeDir = transformToThreeJS(direction);
    threeDir.normalize();
    
    // Default extrusion is along Z axis in Three.js
    const defaultDir = new THREE.Vector3(0, 0, 1);
    
    if (Math.abs(threeDir.dot(defaultDir)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultDir, threeDir);
        prismMesh.quaternion.copy(quaternion);
    }
    
    // Position at base center
    prismMesh.position.copy(threeBase);
    
    return prismMesh;
}

/**
 * Creates a frustum (truncated pyramid/cone) in 3D space using mathematical coordinates
 * @param {Object} baseCenter - Center of the base in mathematical coordinates {x, y, z}
 * @param {Object} topCenter - Center of the top in mathematical coordinates {x, y, z}
 * @param {number} baseRadius - Radius or size of the base
 * @param {number} topRadius - Radius or size of the top
 * @param {Object} options - Configuration options
 * @param {number} options.sides - Number of sides (3=triangular, 4=square, etc.) (default: 4)
 * @param {number} options.color - Color of the frustum (default: 0xff8844)
 * @param {number} options.opacity - Opacity of the frustum (default: 1.0)
 * @param {boolean} options.wireframe - Whether to render as wireframe (default: false)
 * @param {boolean} options.openEnded - Whether the frustum is open-ended (default: false)
 * @returns {THREE.Mesh} The created frustum mesh
 */
export function frustum(baseCenter, topCenter, baseRadius, topRadius, options = {}) {
    const {
        sides = 4,
        color = 0xff8844,
        opacity = 1.0,
        wireframe = false,
        openEnded = false
    } = options;
    
    // Transform centers to Three.js coordinates
    const threeBase = transformToThreeJS(baseCenter);
    const threeTop = transformToThreeJS(topCenter);
    
    // Calculate height and center position
    const direction = new THREE.Vector3().subVectors(threeTop, threeBase);
    const height = direction.length();
    const center = new THREE.Vector3().addVectors(threeBase, threeTop).multiplyScalar(0.5);
    
    let geometry;
    
    if (sides <= 2) {
        // Invalid number of sides
        console.warn('Frustum must have at least 3 sides');
        return new THREE.Mesh();
    } else if (sides >= 50) {
        // Use cylinder geometry for many sides (approximates circle)
        geometry = new THREE.CylinderGeometry(
            topRadius,
            baseRadius,
            height,
            sides,
            1,
            openEnded
        );
    } else {
        // Create custom geometry for pyramid/prism frustum
        const vertices = [];
        const indices = [];
        
        // Create vertices for base
        for (let i = 0; i < sides; i++) {
            const angle = (2 * Math.PI * i) / sides;
            vertices.push(
                baseRadius * Math.cos(angle),
                -height / 2,
                baseRadius * Math.sin(angle)
            );
        }
        
        // Create vertices for top
        for (let i = 0; i < sides; i++) {
            const angle = (2 * Math.PI * i) / sides;
            vertices.push(
                topRadius * Math.cos(angle),
                height / 2,
                topRadius * Math.sin(angle)
            );
        }
        
        // Create side faces
        for (let i = 0; i < sides; i++) {
            const next = (i + 1) % sides;
            
            // Triangle 1
            indices.push(i, next, sides + i);
            // Triangle 2
            indices.push(next, sides + next, sides + i);
        }
        
        // Create base and top faces if not open-ended
        if (!openEnded) {
            // Base center vertex
            const baseCenterIndex = vertices.length / 3;
            vertices.push(0, -height / 2, 0);
            
            // Top center vertex
            const topCenterIndex = vertices.length / 3;
            vertices.push(0, height / 2, 0);
            
            // Base triangles
            for (let i = 0; i < sides; i++) {
                const next = (i + 1) % sides;
                indices.push(baseCenterIndex, next, i);
            }
            
            // Top triangles
            for (let i = 0; i < sides; i++) {
                const next = (i + 1) % sides;
                indices.push(topCenterIndex, sides + i, sides + next);
            }
        }
        
        // Create buffer geometry
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
    }
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const frustumMesh = new THREE.Mesh(geometry, material);
    
    // Position at center
    frustumMesh.position.copy(center);
    
    // Orient frustum from base to top
    direction.normalize();
    const up = new THREE.Vector3(0, 1, 0);
    
    // Only rotate if not already aligned with Y axis
    if (Math.abs(direction.dot(up)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        frustumMesh.quaternion.copy(quaternion);
    }
    
    return frustumMesh;
}

/**
 * Creates a disk (circle) in 3D space using mathematical coordinates
 * @param {Object} center - Center position in mathematical coordinates {x, y, z}
 * @param {number} radius - Radius of the disk
 * @param {Object} orientation - Normal vector direction in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the disk (default: 0xffd700)
 * @param {number} options.opacity - Opacity of the disk (default: 1.0)
 * @param {number} options.segments - Number of segments around the circle (default: 64)
 * @param {boolean} options.outline - Whether to add an outline (default: false)
 * @param {number} options.outlineColor - Color of the outline (default: 0x000000)
 * @param {number} options.outlineThickness - Thickness of the outline (default: 0.02)
 * @param {boolean} options.wireframe - Whether to render as wireframe (default: false)
 * @param {number} options.emissive - Emissive color (default: 0x000000)
 * @param {number} options.emissiveIntensity - Emissive intensity (default: 0)
 * @param {number} options.shininess - Material shininess (default: 30)
 * @param {string} options.side - Which side(s) to render ('front', 'back', 'double') (default: 'double')
 * @returns {THREE.Group|THREE.Mesh} The created disk mesh, or group if outline is included
 */
export function disk(center, radius, orientation, options = {}) {
    const {
        color = 0xffd700,
        opacity = 1.0,
        segments = 64,
        outline = false,
        outlineColor = 0x000000,
        outlineThickness = 0.02,
        wireframe = false,
        emissive = 0x000000,
        emissiveIntensity = 0,
        shininess = 30,
        side = 'double'
    } = options;
    
    // Create circle geometry
    const geometry = new THREE.CircleGeometry(radius, segments);
    
    // Determine Three.js side rendering
    let threeSide;
    switch(side) {
        case 'front':
            threeSide = THREE.FrontSide;
            break;
        case 'back':
            threeSide = THREE.BackSide;
            break;
        case 'double':
        default:
            threeSide = THREE.DoubleSide;
            break;
    }
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        shininess: shininess,
        side: threeSide
    });
    
    // Create mesh
    const diskMesh = new THREE.Mesh(geometry, material);
    
    // Transform center position
    const threeCenter = transformToThreeJS(center);
    diskMesh.position.set(threeCenter.x, threeCenter.y, threeCenter.z);
    
    // Orient disk based on normal vector
    // Default disk normal is along +Z axis in Three.js
    const threeNormal = transformToThreeJS(orientation);
    threeNormal.normalize();
    const defaultNormal = new THREE.Vector3(0, 0, 1);
    
    // Only rotate if not already aligned with default normal
    if (Math.abs(threeNormal.dot(defaultNormal)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultNormal, threeNormal);
        diskMesh.quaternion.copy(quaternion);
    }
    
    // If no outline requested, return just the disk
    if (!outline) {
        return diskMesh;
    }
    
    // Create group to hold disk and outline
    const group = new THREE.Group();
    group.add(diskMesh);
    
    // Create outline using a ring geometry
    const innerRadius = Math.max(0, radius - outlineThickness);
    const outerRadius = radius + outlineThickness;
    const outlineGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
    
    const outlineMaterial = new THREE.MeshBasicMaterial({
        color: outlineColor,
        side: threeSide
    });
    
    const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
    
    // Apply same position and rotation to outline
    outlineMesh.position.copy(diskMesh.position);
    outlineMesh.quaternion.copy(diskMesh.quaternion);
    
    // Slightly offset outline to prevent z-fighting
    const offset = threeNormal.clone().multiplyScalar(0.001);
    outlineMesh.position.add(offset);
    
    group.add(outlineMesh);
    
    // Position the group at the center
    group.position.set(0, 0, 0);
    
    return group;
}

/**
 * Creates a washer (hollow cylinder) in 3D space using mathematical coordinates
 * @param {Object} baseCenter - Base center position in mathematical coordinates {x, y, z}
 * @param {Object} topCenter - Top center position in mathematical coordinates {x, y, z}
 * @param {number} innerRadius - Inner radius of the washer (hole radius)
 * @param {number} outerRadius - Outer radius of the washer
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the washer (default: 0x4488ff)
 * @param {number} options.opacity - Opacity of the washer (default: 0.8)
 * @param {number} options.radialSegments - Number of segments around the washer (default: 32)
 * @param {boolean} options.wireframe - Whether to render as wireframe (default: false)
 * @param {number} options.shininess - Material shininess (default: 100)
 * @param {number} options.emissive - Emissive color (default: 0x2244aa)
 * @param {number} options.emissiveIntensity - Emissive intensity (default: 0.1)
 * @returns {THREE.Mesh} The washer mesh
 */
export function washer(baseCenter, topCenter, innerRadius, outerRadius, options = {}) {
    const {
        color = 0x4488ff,
        opacity = 0.8,
        radialSegments = 32,
        wireframe = false,
        shininess = 100,
        emissive = 0x2244aa,
        emissiveIntensity = 0.1
    } = options;
    
    // Transform centers to Three.js coordinates
    const threeBase = transformToThreeJS(baseCenter);
    const threeTop = transformToThreeJS(topCenter);
    
    // Calculate height
    const height = Math.sqrt(
        Math.pow(threeTop.x - threeBase.x, 2) +
        Math.pow(threeTop.y - threeBase.y, 2) +
        Math.pow(threeTop.z - threeBase.z, 2)
    );
    
    // Create washer shape using ExtrudeGeometry
    const shape = new THREE.Shape();
    const holePath = new THREE.Path();
    
    // Outer circle
    shape.moveTo(outerRadius, 0);
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    
    // Inner hole
    holePath.moveTo(innerRadius, 0);
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);
    
    // Extrude settings
    const extrudeSettings = {
        depth: height,
        bevelEnabled: false,
        curveSegments: radialSegments
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        opacity: opacity,
        transparent: opacity < 1,
        wireframe: wireframe,
        shininess: shininess,
        emissive: new THREE.Color(emissive),
        emissiveIntensity: emissiveIntensity,
        side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position the washer at the base center
    mesh.position.set(threeBase.x, threeBase.y, threeBase.z);
    
    // Calculate rotation to align washer with the axis from base to top
    const direction = new THREE.Vector3(
        threeTop.x - threeBase.x,
        threeTop.y - threeBase.y,
        threeTop.z - threeBase.z
    ).normalize();
    
    // Default extrusion is along z-axis in Three.js
    // We need to rotate it to align with our direction
    const defaultDirection = new THREE.Vector3(0, 0, 1);
    
    // Only rotate if directions are different
    if (!direction.equals(defaultDirection)) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultDirection, direction);
        mesh.quaternion.copy(quaternion);
    }
    
    // Store metadata
    mesh.userData.type = 'washer';
    mesh.userData.innerRadius = innerRadius;
    mesh.userData.outerRadius = outerRadius;
    mesh.userData.height = height;
    
    return mesh;
}

/**
 * Creates a pyramid in 3D space using mathematical coordinates
 * @param {Object} position - Base center position in mathematical coordinates {x, y, z}
 * @param {number} sides - Number of sides for the pyramid (3=triangular, 4=square, 5=pentagonal, etc.)
 * @param {number} height - Height of the pyramid
 * @param {number} size - Size/radius of the base
 * @param {Object} orientation - Direction vector from base to apex in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options for appearance
 * @param {number} options.color - Color of the pyramid (default: 0xffaa44)
 * @param {number} options.opacity - Opacity of the pyramid (default: 1.0)
 * @param {boolean} options.wireframe - Whether to render as wireframe (default: false)
 * @param {number} options.emissive - Emissive color (default: 0x000000)
 * @param {number} options.emissiveIntensity - Emissive intensity (default: 0)
 * @param {number} options.shininess - Material shininess (default: 100)
 * @param {string} options.side - Which side(s) to render ('front', 'back', 'double') (default: 'double')
 * @returns {THREE.Mesh} The created pyramid mesh
 * 
 * @example
 * // Square pyramid pointing up
 * const squarePyramid = pyramid(
 *     {x: 0, y: 0, z: 0},   // base center
 *     4,                     // 4 sides (square)
 *     5,                     // height
 *     3,                     // base size
 *     {x: 0, y: 1, z: 0}    // pointing up
 * );
 * 
 * @example
 * // Hexagonal pyramid pointing diagonally
 * const hexPyramid = pyramid(
 *     {x: 0, y: 0, z: 0},   // base center
 *     6,                     // 6 sides (hexagonal)
 *     8,                     // height
 *     3,                     // base size
 *     {x: 1, y: 1, z: 0},   // diagonal orientation
 *     { color: 0x00ff00 }   // green color
 * );
 * 
 * @example
 * // Triangular pyramid (tetrahedron) pointing forward
 * const tetrahedron = pyramid(
 *     {x: 0, y: 0, z: 0},   // base center
 *     3,                     // 3 sides (triangular)
 *     4,                     // height
 *     2,                     // base size
 *     {x: 0, y: 0, z: 1}    // pointing forward
 * );
 */
export function pyramid(position, sides, height, size, orientation, options = {}) {
    const {
        color = 0xffaa44,
        opacity = 1.0,
        wireframe = false,
        emissive = 0x000000,
        emissiveIntensity = 0,
        shininess = 100,
        side = 'double'
    } = options;
    
    // Transform position and orientation to Three.js coordinates
    const threeBaseCenter = transformToThreeJS(position);
    const threeOrientation = transformToThreeJS(orientation);
    threeOrientation.normalize();
    
    // Calculate apex position based on base center, orientation, and height
    const threeApex = new THREE.Vector3()
        .copy(threeBaseCenter)
        .addScaledVector(threeOrientation, height);
    
    // Generate regular polygon base vertices
    const baseVertices = [];
    const angleStep = (2 * Math.PI) / sides;
    
    // Find two perpendicular vectors in the base plane
    let perpVector1 = new THREE.Vector3(1, 0, 0);
    if (Math.abs(threeOrientation.dot(perpVector1)) > 0.9) {
        perpVector1 = new THREE.Vector3(0, 1, 0);
    }
    
    const perpVector2 = new THREE.Vector3().crossVectors(threeOrientation, perpVector1);
    perpVector2.normalize();
    perpVector1.crossVectors(perpVector2, threeOrientation);
    perpVector1.normalize();
    
    // Generate vertices around the base center
    for (let i = 0; i < sides; i++) {
        const angle = i * angleStep;
        const x = Math.cos(angle) * size;
        const z = Math.sin(angle) * size;
        
        const vertex = new THREE.Vector3()
            .addScaledVector(perpVector1, x)
            .addScaledVector(perpVector2, z)
            .add(threeBaseCenter);
        
        baseVertices.push(vertex);
    }
    
    // Create geometry manually
    const vertices = [];
    const indices = [];
    
    // Add apex vertex (index 0)
    vertices.push(threeApex.x, threeApex.y, threeApex.z);
    
    // Add base vertices
    baseVertices.forEach(v => {
        vertices.push(v.x, v.y, v.z);
    });
    
    const numBaseVertices = baseVertices.length;
    
    // Create triangular faces from apex to base edges
    for (let i = 0; i < numBaseVertices; i++) {
        const next = (i + 1) % numBaseVertices;
        // Face: apex -> base[i] -> base[next]
        indices.push(0, i + 1, next + 1);
    }
    
    // Create base face(s)
    // For convex polygons, we can use a simple fan triangulation
    for (let i = 1; i < numBaseVertices - 1; i++) {
        // Face: base[0] -> base[i] -> base[i+1]
        indices.push(1, i + 1, i + 2);
    }
    
    // Create BufferGeometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Determine Three.js side rendering
    let threeSide;
    switch(side) {
        case 'front':
            threeSide = THREE.FrontSide;
            break;
        case 'back':
            threeSide = THREE.BackSide;
            break;
        case 'double':
        default:
            threeSide = THREE.DoubleSide;
            break;
    }
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        shininess: shininess,
        side: threeSide
    });
    
    // Create mesh
    const pyramidMesh = new THREE.Mesh(geometry, material);
    
    return pyramidMesh;
}