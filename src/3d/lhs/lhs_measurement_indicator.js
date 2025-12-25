import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a measurement indicator line with end markers
 * @param {Object} start - Start position in mathematical coordinates {x, y, z}
 * @param {Object} end - End position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @returns {THREE.Group} Group containing the measurement indicator
 */
export function measurementIndicator(start, end, options = {}) {
    const {
        color = 0xff0000,
        mainRadius = 0.04,
        markerRadius = 0.04,
        markerLength = 0.5,
        label = null,
        labelPosition = 'middle', // 'middle', 'start', 'end', or {x, y, z}
        offset = null  // Offset vector to position the indicator parallel to the measurement
    } = options;
    
    const group = new THREE.Group();
    
    // Transform mathematical coordinates to Three.js coordinates
    let threeStart = transformToThreeJS(start);
    let threeEnd = transformToThreeJS(end);
    
    // Apply offset if provided (to position indicator parallel to actual measurement)
    if (offset) {
        const threeOffset = transformToThreeJS(offset);
        // Apply the offset to both start and end points
        threeStart = threeStart.clone().add(threeOffset);
        threeEnd = threeEnd.clone().add(threeOffset);
    }
    
    // Calculate direction vector and length in Three.js space
    const direction = new THREE.Vector3().subVectors(threeEnd, threeStart);
    const length = direction.length();
    direction.normalize();
    
    // Create material for all components
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.1
    });
    
    // === Create main measurement line (cylinder) ===
    const mainGeometry = new THREE.CylinderGeometry(mainRadius, mainRadius, length, 8);
    const mainCylinder = new THREE.Mesh(mainGeometry, material);
    
    // Position at midpoint
    const midpoint = new THREE.Vector3().addVectors(threeStart, threeEnd).multiplyScalar(0.5);
    mainCylinder.position.copy(midpoint);
    
    // Orient along the line direction
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    mainCylinder.quaternion.copy(quaternion);
    
    group.add(mainCylinder);
    
    // === Create end markers ===
    // Find perpendicular direction for markers
    let perpVector;
    
    // If line is mostly vertical, use x-axis for perpendicular
    if (Math.abs(direction.y) > 0.9) {
        perpVector = new THREE.Vector3(1, 0, 0);
    } 
    // Otherwise, use cross product with y-axis
    else {
        perpVector = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0));
        perpVector.normalize();
    }
    
    // Create start marker (perpendicular line at start)
    const startMarkerGeometry = new THREE.CylinderGeometry(markerRadius, markerRadius, markerLength, 8);
    const startMarker = new THREE.Mesh(startMarkerGeometry, material);
    
    // Position at start point
    startMarker.position.copy(threeStart);
    
    // Orient perpendicular to main line
    const perpQuaternion = new THREE.Quaternion().setFromUnitVectors(up, perpVector);
    startMarker.quaternion.copy(perpQuaternion);
    
    group.add(startMarker);
    
    // Create end marker (perpendicular line at end)
    const endMarkerGeometry = new THREE.CylinderGeometry(markerRadius, markerRadius, markerLength, 8);
    const endMarker = new THREE.Mesh(endMarkerGeometry, material);
    
    // Position at end point
    endMarker.position.copy(threeEnd);
    
    // Orient perpendicular to main line (same as start marker)
    endMarker.quaternion.copy(perpQuaternion);
    
    group.add(endMarker);
    
    // Store metadata for animations
    group.userData.measurementData = {
        start: start,
        end: end,
        color: color,
        label: label
    };
    
    return group;
}
