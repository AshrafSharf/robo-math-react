import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a vector (arrow) in 3D space using mathematical coordinates
 * Arrow head is placed at the end of the vector by default
 * @param {Object} from - Start position in mathematical coordinates {x, y, z}
 * @param {Object} to - End position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the vector (default: 0xff0000 red)
 * @param {number} options.shaftRadius - Radius of the arrow shaft (default: 0.02)
 * @param {number} options.headRadius - Radius of the arrow head (default: 0.08)
 * @param {number} options.headLength - Length of the arrow head (default: 0.2)
 * @param {string} options.headPosition - Position of arrow head: 'middle' or 'end' (default: 'middle')
 * @param {number} options.emissive - Emissive color (default: 0x000000)
 * @param {number} options.emissiveIntensity - Emissive intensity (default: 0)
 * @param {number} options.shininess - Material shininess (default: 100)
 * @returns {THREE.Group} Group containing the arrow shaft and head
 */
export function vector(from, to, options = {}) {
    const {
        color = 0xff0000,         // Red by default
        shaftRadius = 0.05,       // Visible shaft
        headRadius = 0.15,        // Prominent head
        headLength = 0.3,         // Clear arrow head
        headPosition = 'end',     // Arrow head at end by default
        emissive = 0x000000,      // No emission
        emissiveIntensity = 0,    
        shininess = 100           // Moderately shiny
    } = options;
    
    // Transform mathematical coordinates to Three.js coordinates
    const threeFrom = transformToThreeJS(from);
    const threeTo = transformToThreeJS(to);
    
    // Calculate vector direction and length
    const direction = new THREE.Vector3().subVectors(threeTo, threeFrom);
    const length = direction.length();
    direction.normalize();
    
    // Create group to hold both shaft and head
    const arrowGroup = new THREE.Group();
    
    // Create material for both parts
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        shininess: shininess
    });
    
    // Create shaft and position based on headPosition option
    const up = new THREE.Vector3(0, 1, 0);
    
    if (headPosition === 'end') {
        // Original behavior - arrow at end
        const shaftLength = Math.max(0, length - headLength);
        if (shaftLength > 0) {
            const shaftGeometry = new THREE.CylinderGeometry(
                shaftRadius, 
                shaftRadius, 
                shaftLength, 
                8
            );
            const shaft = new THREE.Mesh(shaftGeometry, material);
            
            // Position shaft at midpoint
            const shaftMidpoint = new THREE.Vector3()
                .addVectors(threeFrom, direction.clone().multiplyScalar(shaftLength / 2));
            shaft.position.copy(shaftMidpoint);
            
            // Orient shaft along direction
            const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
            shaft.quaternion.copy(quaternion);
            
            arrowGroup.add(shaft);
        }
        
        // Create arrowhead at the end
        const coneGeometry = new THREE.ConeGeometry(headRadius, headLength, 8);
        const cone = new THREE.Mesh(coneGeometry, material);
        
        // Position cone at the end
        const conePosition = new THREE.Vector3()
            .addVectors(threeFrom, direction.clone().multiplyScalar(length - headLength / 2));
        cone.position.copy(conePosition);
        
        // Orient cone along direction
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        cone.quaternion.copy(quaternion);
        
        arrowGroup.add(cone);
    } else {
        // Default: arrow at middle - full length shaft
        const shaftGeometry = new THREE.CylinderGeometry(
            shaftRadius, 
            shaftRadius, 
            length, 
            8
        );
        const shaft = new THREE.Mesh(shaftGeometry, material);
        
        // Position shaft at midpoint between from and to
        const shaftMidpoint = new THREE.Vector3()
            .addVectors(threeFrom, direction.clone().multiplyScalar(length / 2));
        shaft.position.copy(shaftMidpoint);
        
        // Orient shaft along direction
        const shaftQuaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        shaft.quaternion.copy(shaftQuaternion);
        
        arrowGroup.add(shaft);
        
        // Create arrowhead at the middle
        const coneGeometry = new THREE.ConeGeometry(headRadius, headLength, 8);
        const cone = new THREE.Mesh(coneGeometry, material);
        
        // Position cone at the middle of the vector
        const conePosition = new THREE.Vector3()
            .addVectors(threeFrom, direction.clone().multiplyScalar(length / 2));
        cone.position.copy(conePosition);
        
        // Orient cone along direction
        const coneQuaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        cone.quaternion.copy(coneQuaternion);
        
        arrowGroup.add(cone);
    }
    
    return arrowGroup;
}

/**
 * Creates a position vector from the origin to a point
 * @param {Object} point - Target point in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options (same as vector)
 * @returns {THREE.Group} Group containing the position vector
 */
export function positionVector(point, options = {}) {
    // Position vector goes from origin to the point
    const origin = { x: 0, y: 0, z: 0 };
    
    // Create vector from origin to point using the existing vector function
    return vector(origin, point, options);
}

/**
 * Creates a unit vector using Three.js ArrowHelper
 * @param {Object} direction - Direction vector in mathematical coordinates {x, y, z}
 * @param {Object} origin - Origin point in mathematical coordinates {x, y, z} (default: {0, 0, 0})
 * @param {Object} options - Configuration options
 * @param {number} options.length - Length of the arrow (default: 1)
 * @param {number} options.color - Color of the arrow (default: 0xff0000 red)
 * @param {number} options.headLength - Length of the arrow head (default: 0.2)
 * @param {number} options.headWidth - Width of the arrow head (default: 0.1)
 * @returns {THREE.ArrowHelper} The created arrow helper
 */
export function unitVector(direction, origin = {x: 0, y: 0, z: 0}, options = {}) {
    const {
        length = 1,               // Unit length
        color = 0xff0000,         // Red by default
        headLength = 0.2,         // Arrow head length
        headWidth = 0.1           // Arrow head width
    } = options;
    
    // Transform direction and origin to Three.js coordinates
    const threeDir = transformToThreeJS(direction);
    const threeOrigin = transformToThreeJS(origin);
    
    // Normalize the direction
    threeDir.normalize();
    
    // Create ArrowHelper
    const arrow = new THREE.ArrowHelper(
        threeDir,           // Direction (normalized)
        threeOrigin,        // Origin
        length,             // Length
        color,              // Color
        headLength,         // Head length
        headWidth           // Head width
    );
    
    return arrow;
}

/**
 * Creates a dashed vector (arrow) in 3D space using mathematical coordinates
 * @param {Object} from - Start position in mathematical coordinates {x, y, z}
 * @param {Object} to - End position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the vector (default: 0x9c27b0 purple)
 * @param {number} options.dashSize - Length of each dash (default: 0.2)
 * @param {number} options.gapSize - Length of gaps between dashes (default: 0.1)
 * @param {number} options.shaftRadius - Radius of the dash cylinders (default: 0.04)
 * @param {number} options.headRadius - Radius of the arrow head (default: 0.15)
 * @param {number} options.headLength - Length of the arrow head (default: 0.3)
 * @param {number} options.opacity - Initial opacity for fade-in effect (default: 1)
 * @returns {THREE.Group} Group containing the dashed cylinders and arrow head
 */
export function dashedVector(from, to, options = {}) {
    const {
        color = 0x9c27b0,         // Purple by default
        dashSize = 0.2,           // Dash length
        gapSize = 0.1,            // Gap length
        shaftRadius = 0.04,       // Standard thickness
        headRadius = 0.15,        // Arrow head radius
        headLength = 0.3,         // Arrow head length
        opacity = 1               // Opacity for fade-in
    } = options;
    
    // Transform mathematical coordinates to Three.js coordinates
    const threeFrom = transformToThreeJS(from);
    const threeTo = transformToThreeJS(to);
    
    // Calculate vector direction and length
    const direction = new THREE.Vector3().subVectors(threeTo, threeFrom);
    const length = direction.length();
    direction.normalize();
    
    // Create group to hold dashed cylinders and head
    const dashedGroup = new THREE.Group();
    
    // Calculate line length (excluding arrow head)
    const lineLength = length - headLength;
    
    // Create material for dashes
    const dashMaterial = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1,
        emissive: color,
        emissiveIntensity: 0.1,
        shininess: 100
    });
    
    // Create dashed line using cylinders
    const segmentLength = dashSize + gapSize;
    const numSegments = Math.floor(lineLength / segmentLength);
    
    for (let i = 0; i < numSegments; i++) {
        const startDist = i * segmentLength;
        const endDist = Math.min(startDist + dashSize, lineLength);
        const dashLength = endDist - startDist;
        
        if (dashLength > 0) {
            // Create cylinder for this dash
            const dashGeometry = new THREE.CylinderGeometry(
                shaftRadius, 
                shaftRadius, 
                dashLength, 
                8
            );
            const dash = new THREE.Mesh(dashGeometry, dashMaterial);
            
            // Position dash at midpoint
            const dashMidpoint = new THREE.Vector3()
                .addVectors(threeFrom, direction.clone().multiplyScalar(startDist + dashLength / 2));
            dash.position.copy(dashMidpoint);
            
            // Orient dash along direction
            const up = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
            dash.quaternion.copy(quaternion);
            
            dashedGroup.add(dash);
        }
    }
    
    // Handle remaining partial dash if needed
    const remainingDist = lineLength - (numSegments * segmentLength);
    if (remainingDist > 0) {
        const dashLength = Math.min(remainingDist, dashSize);
        const dashGeometry = new THREE.CylinderGeometry(
            shaftRadius, 
            shaftRadius, 
            dashLength, 
            8
        );
        const dash = new THREE.Mesh(dashGeometry, dashMaterial);
        
        const dashMidpoint = new THREE.Vector3()
            .addVectors(threeFrom, direction.clone().multiplyScalar(numSegments * segmentLength + dashLength / 2));
        dash.position.copy(dashMidpoint);
        
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        dash.quaternion.copy(quaternion);
        
        dashedGroup.add(dash);
    }
    
    // Create arrow head (cone)
    const coneMaterial = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1,
        emissive: color,
        emissiveIntensity: 0.1,
        shininess: 100
    });
    
    const coneGeometry = new THREE.ConeGeometry(headRadius, headLength, 8);
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    
    // Position cone at the end
    const conePosition = new THREE.Vector3()
        .addVectors(threeFrom, direction.clone().multiplyScalar(length - headLength / 2));
    cone.position.copy(conePosition);
    
    // Orient cone along direction
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    cone.quaternion.copy(quaternion);
    
    dashedGroup.add(cone);
    
    // Add fade-in animation support
    dashedGroup.userData.fadeIn = true;
    
    return dashedGroup;
}