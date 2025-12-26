// Angle visualization utilities for 3D Three.js lessons
import * as THREE from 'three';
import { COLORS_3D, transformToThreeJS } from './core-3d.js';
import { createLabel } from './labels-3d.js';
import { addInteractiveObject, projectionSystem } from './interactive-3d.js';

/**
 * Creates a right angle square symbol
 * @private
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {THREE.Vector3} normA - First normalized vector (Three.js coordinates)
 * @param {THREE.Vector3} normB - Second normalized vector (Three.js coordinates)
 * @param {Object} options - Square options
 * @returns {Object} - {arc: THREE.Group, label: THREE.Sprite, angle: number}
 */
function createRightAngleSquare(parent, normA, normB, options = {}) {
    const {
        size = 0.3,
        color = COLORS.GRAY,
        opacity = 0.8,
        fillOpacity = 0.6,
        angleType = 'vectors',
        interactive = true
    } = options;
    
    // Create a group to hold the square
    const squareGroup = new THREE.Group();
    
    // Calculate the two perpendicular directions
    const dirA = normA.clone().multiplyScalar(size);
    const dirB = normB.clone().multiplyScalar(size);
    
    // Create the four corners of the square
    const origin = new THREE.Vector3(0, 0, 0);
    const corner1 = origin.clone().add(dirA);
    const corner2 = corner1.clone().add(dirB);
    const corner3 = origin.clone().add(dirB);
    
    // Create square geometry
    const vertices = [];
    const indices = [];
    
    // Add vertices (origin, corner1, corner2, corner3)
    vertices.push(0, 0, 0);           // 0: origin
    vertices.push(dirA.x, dirA.y, dirA.z);     // 1: along first vector
    vertices.push(corner2.x, corner2.y, corner2.z); // 2: diagonal corner
    vertices.push(dirB.x, dirB.y, dirB.z);     // 3: along second vector
    
    // Create triangles for the square (two triangles)
    indices.push(0, 1, 2);  // First triangle
    indices.push(0, 2, 3);  // Second triangle
    
    // Create filled square
    const squareGeometry = new THREE.BufferGeometry();
    squareGeometry.setIndex(indices);
    squareGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    squareGeometry.computeVertexNormals();
    
    const fillMaterial = new THREE.MeshBasicMaterial({
        color: color,
        opacity: fillOpacity,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    
    const squareMesh = new THREE.Mesh(squareGeometry, fillMaterial);
    squareGroup.add(squareMesh);
    
    // Create outline
    const outlinePoints = [origin, corner1, corner2, corner3, origin];
    const outlineGeometry = new THREE.BufferGeometry().setFromPoints(outlinePoints);
    const outlineMaterial = new THREE.LineBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1,
        linewidth: 2
    });
    const outlineLine = new THREE.Line(outlineGeometry, outlineMaterial);
    squareGroup.add(outlineLine);
    
    parent.add(squareGroup);
    
    // Add interactive functionality if enabled
    if (interactive && projectionSystem.isEnabled) {
        const typeLabels = {
            'vectors': 'Between Vectors',
            'vectorToPlane': 'Vector to Plane',
            'planes': 'Between Planes',
            'lines': 'Between Lines',
            'vectorToXYPlane': 'Vector to XY Plane',
            'vectorToXZPlane': 'Vector to XZ Plane',
            'vectorToYZPlane': 'Vector to YZ Plane',
            'vectorToXAxis': 'Vector to X Axis',
            'vectorToYAxis': 'Vector to Y Axis',
            'vectorToZAxis': 'Vector to Z Axis'
        };
        // Add interactivity only if angleGetter is provided
        if (options.angleGetter) {
            addInteractiveObject(
                squareGroup,
                options.angleGetter,
                'Right Angle: 90°'
            );
        }
    }
    
    return { arc: squareGroup, label: null, angle: Math.PI / 2 };
}

/**
 * Internal helper: Creates the actual angle arc visualization
 * @private
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {THREE.Vector3} normA - First normalized vector (Three.js coordinates)
 * @param {THREE.Vector3} normB - Second normalized vector (Three.js coordinates)
 * @param {number} angle - Angle in radians
 * @param {Object} options - Arc options
 * @returns {Object} - {arc: THREE.Group, label: THREE.Sprite, angle: number}
 */
function createAngleArc(parent, normA, normB, angle, options = {}) {
    const {
        radius = 0.5,
        color = COLORS.GRAY,
        opacity = 0.8,
        fillOpacity = 0.6,     // Fill opacity for the sector
        segments = 32,
        showLabel = false,     // Changed to false by default
        labelOffset = 0.1,
        fontSize = 10,
        angleType = 'vectors', // Type of angle: 'vectors', 'vectorToPlane', 'planes', 'lines'
        interactive = true     // Enable click interaction by default
    } = options;
    
    // Check if angle is approximately 90 degrees (π/2 radians)
    const isRightAngle = Math.abs(angle - Math.PI / 2) < 0.05; // 5 degree tolerance
    
    if (isRightAngle) {
        // Create a right angle square instead of an arc
        return createRightAngleSquare(parent, normA, normB, {
            size: radius * 0.6, // Make square size proportional to radius
            color,
            opacity,
            fillOpacity,
            angleType,
            interactive
        });
    }
    
    // Create arc geometry
    const arcPoints = [];
    const vertices = [];
    const uvs = [];
    
    // Add center point first
    vertices.push(0, 0, 0);
    uvs.push(0.5, 0.5);
    
    // Generate arc points
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        // Interpolate between vectors using spherical interpolation
        const theta = angle * t;
        
        // Use quaternion rotation instead of Rodrigues' formula
        const axis = new THREE.Vector3().crossVectors(normA, normB);
        
        if (axis.length() < 0.001) {
            return null; // Vectors are parallel
        }
        
        axis.normalize();
        
        // Create quaternion for rotation around axis
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(axis, theta);
        
        // Apply rotation to normA
        const rotatedVec = normA.clone().applyQuaternion(quaternion);
        const point = rotatedVec.multiplyScalar(radius);
        arcPoints.push(point);
        vertices.push(point.x, point.y, point.z);
        
        // UV coordinates for texture mapping
        uvs.push(0.5 + 0.5 * Math.cos(theta), 0.5 + 0.5 * Math.sin(theta));
    }
    
    // Create a group to hold both fill and outline
    const arcGroup = new THREE.Group();
    
    // Create filled sector geometry
    const sectorGeometry = new THREE.BufferGeometry();
    const indices = [];
    
    // Create triangles from center to arc points
    for (let i = 1; i <= segments; i++) {
        indices.push(0, i, i + 1);
    }
    
    sectorGeometry.setIndex(indices);
    sectorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    sectorGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    sectorGeometry.computeVertexNormals();
    
    // Create fill material
    const fillMaterial = new THREE.MeshBasicMaterial({
        color: color,
        opacity: fillOpacity,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    
    const sectorMesh = new THREE.Mesh(sectorGeometry, fillMaterial);
    arcGroup.add(sectorMesh);
    
    // Create outline
    const outlineGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const outlineMaterial = new THREE.LineBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1,
        linewidth: 2
    });
    const outlineLine = new THREE.Line(outlineGeometry, outlineMaterial);
    arcGroup.add(outlineLine);
    
    parent.add(arcGroup);
    
    // Format angle in degrees (used for both label and interactive display)
    const degrees = (angle * 180 / Math.PI).toFixed(1);
    
    // Create angle label if requested
    let label = null;
    if (showLabel) {
        // Position label at the middle of the arc
        const midIndex = Math.floor(segments / 2);
        const labelPos = arcPoints[midIndex].clone();
        
        // Move label slightly away from arc
        const midDir = labelPos.clone().normalize();
        labelPos.addScaledVector(midDir, labelOffset);
        
        const labelText = `${degrees}°`;
        
        label = createLabel(labelText, labelPos, {
            color: color,
            fontSize: fontSize,
            backgroundColor: 'transparent'
        });
        parent.add(label);
    }
    
    // Add interactive functionality if enabled
    if (interactive && projectionSystem.isEnabled) {
        const typeLabels = {
            'vectors': 'Between Vectors',
            'vectorToPlane': 'Vector to Plane',
            'planes': 'Between Planes',
            'lines': 'Between Lines',
            'vectorToXYPlane': 'Vector to XY Plane',
            'vectorToXZPlane': 'Vector to XZ Plane',
            'vectorToYZPlane': 'Vector to YZ Plane',
            'vectorToXAxis': 'Vector to X Axis',
            'vectorToYAxis': 'Vector to Y Axis',
            'vectorToZAxis': 'Vector to Z Axis'
        };
        
        if (options.angleGetter) {
            addInteractiveObject(
                arcGroup,
                options.angleGetter,
                `${typeLabels[angleType] || 'Angle'}: ${degrees}°`
            );
        }
    }
    
    return { arc: arcGroup, label: label, angle: angle };
}

/**
 * Creates a visual angle arc between two vectors
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} vectorA - First vector {x, y, z} in user coordinate system
 * @param {Object} vectorB - Second vector {x, y, z} in user coordinate system
 * @param {Object} options - Arc options
 * @returns {Object} - {arc: THREE.Group, label: THREE.Sprite, angle: number} or null if vectors are parallel
 */
export function createVectorAngleView(parent, vectorA, vectorB, options = {}) {
    // Transform vectors to Three.js coordinates
    const vecA = transformToThreeJS(vectorA);
    const vecB = transformToThreeJS(vectorB);
    
    // Normalize vectors
    const normA = vecA.clone().normalize();
    const normB = vecB.clone().normalize();
    
    // Calculate angle
    const dot = normA.dot(normB);
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
    
    // Skip if vectors are parallel (angle too small or too close to π)
    if (angle < 0.01 || Math.abs(angle - Math.PI) < 0.01) {
        return null;
    }
    
    return createAngleArc(parent, normA, normB, angle, {
        ...options,
        angleType: 'vectors'
    });
}

/**
 * Creates an angle arc between a vector and a plane
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} vector - Vector {x, y, z} in user coordinate system
 * @param {Object} planeNormal - Plane normal vector {x, y, z} in user coordinate system
 * @param {Object} options - Arc options
 * @returns {Object} - {arc: THREE.Group, label: THREE.Sprite, angle: number} or null
 */
export function createVectorPlaneAngleView(parent, vector, planeNormal, options = {}) {
    // Transform to Three.js coordinates
    const vec = transformToThreeJS(vector);
    const normal = transformToThreeJS(planeNormal);
    
    // Normalize
    const normVec = vec.clone().normalize();
    const normNormal = normal.clone().normalize();
    
    // Project vector onto the plane
    const dotVN = normVec.dot(normNormal);
    const projection = normVec.clone().sub(normNormal.clone().multiplyScalar(dotVN));
    
    // If projection is zero (vector is perpendicular to plane)
    if (projection.length() < 0.01) {
        return null; // Can't show angle arc for perpendicular vector
    }
    
    projection.normalize();
    
    // The angle between vector and plane
    const angle = Math.acos(Math.max(-1, Math.min(1, normVec.dot(projection))));
    
    // Skip if angle is too small (almost parallel to plane)
    if (angle < 0.01) {
        return null;
    }
    
    return createAngleArc(parent, normVec, projection, angle, {
        ...options,
        angleType: 'vectorToPlane'
    });
}

/**
 * Creates an angle arc between two planes
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} normal1 - First plane normal {x, y, z} in user coordinate system
 * @param {Object} normal2 - Second plane normal {x, y, z} in user coordinate system
 * @param {Object} options - Arc options
 * @returns {Object} - {arc: THREE.Group, label: THREE.Sprite, angle: number} or null
 */
export function createPlaneAngleView(parent, normal1, normal2, options = {}) {
    // The angle between two planes is the angle between their normals
    return createVectorAngleView(parent, normal1, normal2, {
        ...options,
        angleType: 'planes'
    });
}

/**
 * Creates an angle arc between two lines
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} line1 - First line {point: {x,y,z}, direction: {x,y,z}} in user coordinates
 * @param {Object} line2 - Second line {point: {x,y,z}, direction: {x,y,z}} in user coordinates
 * @param {Object} options - Arc options
 * @returns {Object} - {arc: THREE.Group, label: THREE.Sprite, angle: number} or null
 */
export function createLineAngleView(parent, line1, line2, options = {}) {
    // The angle between two lines is the angle between their direction vectors
    // Lines can be skew (not intersecting), so we use the smaller angle
    const result = createVectorAngleView(parent, line1.direction, line2.direction, {
        ...options,
        angleType: 'lines'
    });
    
    // For lines, we always want the acute angle
    if (result && result.angle > Math.PI / 2) {
        result.angle = Math.PI - result.angle;
    }
    
    return result;
}

/**
 * Creates an angle arc between a vector and a coordinate plane (XY, XZ, or YZ)
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} vector - Vector {x, y, z} in user coordinate system
 * @param {String} plane - Plane name: 'XY', 'XZ', or 'YZ'
 * @param {Object} options - Arc options
 * @returns {Object} - {arc: THREE.Group, label: THREE.Sprite, angle: number} or null
 */
export function createVectorCoordinatePlaneAngleView(parent, vector, plane, options = {}) {
    // Define plane normals in user coordinate system
    const planeNormals = {
        'XY': { x: 0, y: 0, z: 1 },  // Z-axis is normal to XY plane
        'XZ': { x: 0, y: 1, z: 0 },  // Y-axis is normal to XZ plane
        'YZ': { x: 1, y: 0, z: 0 }   // X-axis is normal to YZ plane
    };
    
    const planeNormal = planeNormals[plane.toUpperCase()];
    if (!planeNormal) {
        console.error(`Invalid plane: ${plane}. Use 'XY', 'XZ', or 'YZ'`);
        return null;
    }
    
    // Add plane identifier to options
    return createVectorPlaneAngleView(parent, vector, planeNormal, {
        ...options,
        planeName: plane.toUpperCase(),
        angleType: `vectorTo${plane.toUpperCase()}Plane`
    });
}

/**
 * Creates an angle arc between a vector and a coordinate axis (X, Y, or Z)
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} vector - Vector {x, y, z} in user coordinate system
 * @param {String} axis - Axis name: 'X', 'Y', or 'Z'
 * @param {Object} options - Arc options
 * @returns {Object} - {arc: THREE.Group, label: THREE.Sprite, angle: number} or null
 */
export function createVectorAxisAngleView(parent, vector, axis, options = {}) {
    // Define axis vectors in user coordinate system
    const axisVectors = {
        'X': { x: 1, y: 0, z: 0 },  // X-axis unit vector
        'Y': { x: 0, y: 1, z: 0 },  // Y-axis unit vector
        'Z': { x: 0, y: 0, z: 1 }   // Z-axis unit vector
    };
    
    const axisVector = axisVectors[axis.toUpperCase()];
    if (!axisVector) {
        console.error(`Invalid axis: ${axis}. Use 'X', 'Y', or 'Z'`);
        return null;
    }
    
    // Add axis identifier to options
    return createVectorAngleView(parent, vector, axisVector, {
        ...options,
        axisName: axis.toUpperCase(),
        angleType: `vectorTo${axis.toUpperCase()}Axis`
    });
}