import * as THREE from 'three';

/**
 * Creates a sphere in 3D space (native Three.js coordinates)
 * @param {Object} center - Center position {x, y, z}
 * @param {number} radius - Radius of the sphere
 * @param {Object} options - Configuration options
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
    
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    
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
    
    const sphereMesh = new THREE.Mesh(geometry, material);
    sphereMesh.position.set(center.x, center.y, center.z);
    
    return sphereMesh;
}

/**
 * Creates a cylinder in 3D space (native Three.js coordinates)
 * @param {Object} baseCenter - Center of the base {x, y, z}
 * @param {Object} topCenter - Center of the top {x, y, z}
 * @param {number} radius - Radius of the cylinder
 * @param {Object} options - Configuration options
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
    
    const direction = new THREE.Vector3(
        topCenter.x - baseCenter.x,
        topCenter.y - baseCenter.y,
        topCenter.z - baseCenter.z
    );
    const height = direction.length();
    const center = new THREE.Vector3(
        (baseCenter.x + topCenter.x) / 2,
        (baseCenter.y + topCenter.y) / 2,
        (baseCenter.z + topCenter.z) / 2
    );
    
    const geometry = new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
        heightSegments,
        openEnded
    );
    
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
    
    const cylinderMesh = new THREE.Mesh(geometry, material);
    cylinderMesh.position.copy(center);
    
    direction.normalize();
    const up = new THREE.Vector3(0, 1, 0);
    
    if (Math.abs(direction.dot(up)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        cylinderMesh.quaternion.copy(quaternion);
    }
    
    return cylinderMesh;
}

/**
 * Creates a cube/box in 3D space (native Three.js coordinates)
 * @param {Object} center - Center position {x, y, z}
 * @param {number|Object} size - Size of the cube (number for uniform, or {x, y, z} for box)
 * @param {Object} options - Configuration options
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
    
    let width, height, depth;
    if (typeof size === 'number') {
        width = height = depth = size;
    } else {
        width = size.x || 1;
        height = size.y || 1;
        depth = size.z || 1;
    }
    
    const geometry = new THREE.BoxGeometry(
        width,
        height,
        depth,
        widthSegments,
        heightSegments,
        depthSegments
    );
    
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
    
    const cubeMesh = new THREE.Mesh(geometry, material);
    cubeMesh.position.set(center.x, center.y, center.z);
    
    return cubeMesh;
}

/**
 * Creates a cone in 3D space (native Three.js coordinates)
 * @param {Object} apex - Apex position {x, y, z}
 * @param {Object} baseCenter - Center of the base {x, y, z}
 * @param {number} radius - Radius of the cone base
 * @param {Object} options - Configuration options
 */
export function cone(apex, baseCenter, radius, options = {}) {
    return cylinder(baseCenter, apex, radius, {
        ...options,
        radiusTop: 0,
        radiusBottom: radius
    });
}

/**
 * Creates a torus in 3D space (native Three.js coordinates)
 * @param {Object} center - Center position {x, y, z}
 * @param {number} radius - Distance from center to tube center
 * @param {number} tubeRadius - Radius of the tube
 * @param {Object} options - Configuration options
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
    
    const geometry = new THREE.TorusGeometry(
        radius,
        tubeRadius,
        radialSegments,
        tubularSegments
    );
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        side: THREE.DoubleSide
    });
    
    const torusMesh = new THREE.Mesh(geometry, material);
    torusMesh.position.set(center.x, center.y, center.z);
    
    const threeAxis = new THREE.Vector3(axis.x, axis.y, axis.z);
    const defaultNormal = new THREE.Vector3(0, 0, 1);
    threeAxis.normalize();
    
    if (Math.abs(threeAxis.dot(defaultNormal)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultNormal, threeAxis);
        torusMesh.quaternion.copy(quaternion);
    }
    
    return torusMesh;
}

/**
 * Creates a prism in 3D space (native Three.js coordinates)
 * @param {Object} baseCenter - Center of the base {x, y, z}
 * @param {Array|number} baseShape - Array of 2D points or number of sides for regular polygon
 * @param {number} height - Height of the prism
 * @param {Object} options - Configuration options
 */
export function prism(baseCenter, baseShape, height, options = {}) {
    const {
        baseRadius = 1,
        color = 0x44ff88,
        opacity = 1.0,
        wireframe = false,
        direction = {x: 0, y: 1, z: 0}
    } = options;
    
    let shapePoints = [];
    
    if (typeof baseShape === 'number') {
        const sides = Math.max(3, Math.floor(baseShape));
        for (let i = 0; i < sides; i++) {
            const angle = (2 * Math.PI * i) / sides;
            shapePoints.push(new THREE.Vector2(
                baseRadius * Math.cos(angle),
                baseRadius * Math.sin(angle)
            ));
        }
    } else if (Array.isArray(baseShape)) {
        shapePoints = baseShape.map(p => new THREE.Vector2(p.x, p.z || p.y));
    } else {
        console.warn('Invalid baseShape: must be number of sides or array of points');
        return new THREE.Mesh();
    }
    
    const shape = new THREE.Shape(shapePoints);
    
    const extrudeSettings = {
        depth: height,
        bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        side: THREE.DoubleSide
    });
    
    const prismMesh = new THREE.Mesh(geometry, material);
    
    const threeDir = new THREE.Vector3(direction.x, direction.y, direction.z);
    threeDir.normalize();
    
    const defaultDir = new THREE.Vector3(0, 0, 1);
    
    if (Math.abs(threeDir.dot(defaultDir)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultDir, threeDir);
        prismMesh.quaternion.copy(quaternion);
    }
    
    prismMesh.position.set(baseCenter.x, baseCenter.y, baseCenter.z);
    
    return prismMesh;
}

/**
 * Creates a frustum (truncated pyramid/cone) in 3D space (native Three.js coordinates)
 * @param {Object} baseCenter - Center of the base {x, y, z}
 * @param {Object} topCenter - Center of the top {x, y, z}
 * @param {number} baseRadius - Radius or size of the base
 * @param {number} topRadius - Radius or size of the top
 * @param {Object} options - Configuration options
 */
export function frustum(baseCenter, topCenter, baseRadius, topRadius, options = {}) {
    const {
        sides = 4,
        color = 0xff8844,
        opacity = 1.0,
        wireframe = false,
        openEnded = false
    } = options;
    
    const direction = new THREE.Vector3(
        topCenter.x - baseCenter.x,
        topCenter.y - baseCenter.y,
        topCenter.z - baseCenter.z
    );
    const height = direction.length();
    const center = new THREE.Vector3(
        (baseCenter.x + topCenter.x) / 2,
        (baseCenter.y + topCenter.y) / 2,
        (baseCenter.z + topCenter.z) / 2
    );
    
    let geometry;
    
    if (sides <= 2) {
        console.warn('Frustum must have at least 3 sides');
        return new THREE.Mesh();
    } else if (sides >= 50) {
        geometry = new THREE.CylinderGeometry(
            topRadius,
            baseRadius,
            height,
            sides,
            1,
            openEnded
        );
    } else {
        const vertices = [];
        const indices = [];
        
        for (let i = 0; i < sides; i++) {
            const angle = (2 * Math.PI * i) / sides;
            vertices.push(
                baseRadius * Math.cos(angle),
                -height / 2,
                baseRadius * Math.sin(angle)
            );
        }
        
        for (let i = 0; i < sides; i++) {
            const angle = (2 * Math.PI * i) / sides;
            vertices.push(
                topRadius * Math.cos(angle),
                height / 2,
                topRadius * Math.sin(angle)
            );
        }
        
        for (let i = 0; i < sides; i++) {
            const next = (i + 1) % sides;
            indices.push(i, next, sides + i);
            indices.push(next, sides + next, sides + i);
        }
        
        if (!openEnded) {
            const baseCenterIndex = vertices.length / 3;
            vertices.push(0, -height / 2, 0);
            
            const topCenterIndex = vertices.length / 3;
            vertices.push(0, height / 2, 0);
            
            for (let i = 0; i < sides; i++) {
                const next = (i + 1) % sides;
                indices.push(baseCenterIndex, next, i);
            }
            
            for (let i = 0; i < sides; i++) {
                const next = (i + 1) % sides;
                indices.push(topCenterIndex, sides + i, sides + next);
            }
        }
        
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
    }
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        wireframe: wireframe,
        side: THREE.DoubleSide
    });
    
    const frustumMesh = new THREE.Mesh(geometry, material);
    frustumMesh.position.copy(center);
    
    direction.normalize();
    const up = new THREE.Vector3(0, 1, 0);
    
    if (Math.abs(direction.dot(up)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        frustumMesh.quaternion.copy(quaternion);
    }
    
    return frustumMesh;
}

/**
 * Creates a disk (circle) in 3D space (native Three.js coordinates)
 * @param {Object} center - Center position {x, y, z}
 * @param {number} radius - Radius of the disk
 * @param {Object} orientation - Normal vector direction {x, y, z}
 * @param {Object} options - Configuration options
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
    
    const geometry = new THREE.CircleGeometry(radius, segments);
    
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
    
    const diskMesh = new THREE.Mesh(geometry, material);
    diskMesh.position.set(center.x, center.y, center.z);
    
    const threeNormal = new THREE.Vector3(orientation.x, orientation.y, orientation.z);
    threeNormal.normalize();
    const defaultNormal = new THREE.Vector3(0, 0, 1);
    
    if (Math.abs(threeNormal.dot(defaultNormal)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultNormal, threeNormal);
        diskMesh.quaternion.copy(quaternion);
    }
    
    if (!outline) {
        return diskMesh;
    }
    
    const group = new THREE.Group();
    group.add(diskMesh);
    
    const innerRadius = Math.max(0, radius - outlineThickness);
    const outerRadius = radius + outlineThickness;
    const outlineGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
    
    const outlineMaterial = new THREE.MeshBasicMaterial({
        color: outlineColor,
        side: threeSide
    });
    
    const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
    outlineMesh.position.copy(diskMesh.position);
    outlineMesh.quaternion.copy(diskMesh.quaternion);
    
    const offset = threeNormal.clone().multiplyScalar(0.001);
    outlineMesh.position.add(offset);
    
    group.add(outlineMesh);
    group.position.set(0, 0, 0);
    
    return group;
}

/**
 * Creates a pyramid in 3D space (native Three.js coordinates)
 * @param {Object} position - Base center position {x, y, z}
 * @param {number} sides - Number of sides for the pyramid
 * @param {number} height - Height of the pyramid
 * @param {number} size - Size/radius of the base
 * @param {Object} orientation - Direction vector from base to apex {x, y, z}
 * @param {Object} options - Configuration options
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
    
    const threeBaseCenter = new THREE.Vector3(position.x, position.y, position.z);
    const threeOrientation = new THREE.Vector3(orientation.x, orientation.y, orientation.z);
    threeOrientation.normalize();
    
    const threeApex = new THREE.Vector3()
        .copy(threeBaseCenter)
        .addScaledVector(threeOrientation, height);
    
    const baseVertices = [];
    const angleStep = (2 * Math.PI) / sides;
    
    let perpVector1 = new THREE.Vector3(1, 0, 0);
    if (Math.abs(threeOrientation.dot(perpVector1)) > 0.9) {
        perpVector1 = new THREE.Vector3(0, 1, 0);
    }
    
    const perpVector2 = new THREE.Vector3().crossVectors(threeOrientation, perpVector1);
    perpVector2.normalize();
    perpVector1.crossVectors(perpVector2, threeOrientation);
    perpVector1.normalize();
    
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
    
    const vertices = [];
    const indices = [];
    
    vertices.push(threeApex.x, threeApex.y, threeApex.z);
    
    baseVertices.forEach(v => {
        vertices.push(v.x, v.y, v.z);
    });
    
    const numBaseVertices = baseVertices.length;
    
    for (let i = 0; i < numBaseVertices; i++) {
        const next = (i + 1) % numBaseVertices;
        indices.push(0, i + 1, next + 1);
    }
    
    for (let i = 1; i < numBaseVertices - 1; i++) {
        indices.push(1, i + 1, i + 2);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
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
    
    const pyramidMesh = new THREE.Mesh(geometry, material);
    
    return pyramidMesh;
}