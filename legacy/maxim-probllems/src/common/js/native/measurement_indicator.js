import { line } from './line.js';
import { label as createLabel } from './label.js';
import * as THREE from 'three';

/**
 * Creates a measurement indicator line with end markers
 * @param {Object} start - Start position {x, y, z}
 * @param {Object} end - End position {x, y, z}
 * @param {Object} options - Configuration options
 * @returns {THREE.Group} Group containing the measurement indicator
 */
export function measurementIndicator(start, end, options = {}) {
    const {
        color = 0xff0000,
        mainRadius = 0.03,
        markerRadius = 0.02,
        markerLength = 0.2,
        label = null,
        labelPosition = 'middle', // 'middle', 'start', 'end', or {x, y, z}
        fontSize = 24,
        scale = 0.02
    } = options;
    
    const group = new THREE.Group();
    
    // Main measurement line
    const mainLine = line(start, end, {
        color: color,
        radius: mainRadius
    });
    group.add(mainLine);
    
    // Calculate direction vector
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;
    const length = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // Normalize direction
    const dirX = dx / length;
    const dirY = dy / length;
    const dirZ = dz / length;
    
    // Find perpendicular direction (for markers)
    let perpX, perpY, perpZ;
    
    // If line is mostly vertical (along Y-axis), use X-axis for perpendicular
    if (Math.abs(dirY) > 0.9) {
        perpX = 1;
        perpY = 0;
        perpZ = 0;
    } 
    // If line is mostly along Z-axis, perpendicular should be in X direction
    else if (Math.abs(dirZ) > Math.abs(dirX)) {
        // Line is primarily along Z, so perpendicular is in XY plane
        // Use cross product with up vector (0,1,0)
        perpX = 1;
        perpY = 0;
        perpZ = 0;
    }
    // If line is mostly along X-axis, perpendicular should be in Y direction
    else {
        // Line is primarily along X, so perpendicular goes up
        perpX = 0;
        perpY = 1;
        perpZ = 0;
    }
    
    // Scale perpendicular by marker length
    const halfMarker = markerLength / 2;
    perpX *= halfMarker;
    perpY *= halfMarker;
    perpZ *= halfMarker;
    
    // Add start marker
    const startMarker = line(
        { 
            x: start.x - perpX, 
            y: start.y - perpY, 
            z: start.z - perpZ 
        },
        { 
            x: start.x + perpX, 
            y: start.y + perpY, 
            z: start.z + perpZ 
        },
        {
            color: color,
            radius: markerRadius
        }
    );
    group.add(startMarker);
    
    // Add end marker
    const endMarker = line(
        { 
            x: end.x - perpX, 
            y: end.y - perpY, 
            z: end.z - perpZ 
        },
        { 
            x: end.x + perpX, 
            y: end.y + perpY, 
            z: end.z + perpZ 
        },
        {
            color: color,
            radius: markerRadius
        }
    );
    group.add(endMarker);
    
    // Add label if provided
    if (label) {
        let labelPos;
        if (labelPosition === 'middle') {
            // Calculate label offset based on line direction
            let offsetX = 0, offsetY = 0, offsetZ = 0;
            
            // If line is mostly vertical (Y-axis), offset in X or Z
            if (Math.abs(dirY) > 0.8) {
                offsetX = 0.3;  // Offset to the side
            }
            // If line is mostly along Z-axis, offset in X direction
            else if (Math.abs(dirZ) > 0.8) {
                offsetX = 0.3;  // Offset to the side
            }
            // For other orientations (mostly horizontal), offset upward
            else {
                offsetY = 0.3;  // Offset above
            }
            
            labelPos = {
                x: (start.x + end.x) / 2 + offsetX,
                y: (start.y + end.y) / 2 + offsetY,
                z: (start.z + end.z) / 2 + offsetZ
            };
        } else if (labelPosition === 'start') {
            labelPos = { x: start.x, y: start.y + 0.3, z: start.z };
        } else if (labelPosition === 'end') {
            labelPos = { x: end.x, y: end.y + 0.3, z: end.z };
        } else {
            labelPos = labelPosition;
        }
        
        const labelMesh = createLabel(label, labelPos, {
            color: '#000000',
            fontSize: fontSize,
            scale: scale,
            sizeAttenuation: false  // Critical for orthographic cameras
        });
        group.add(labelMesh);
    }
    
    // Store metadata for animations
    group.userData.measurementData = {
        start: start,
        end: end,
        color: color,
        label: label
    };
    
    // For animation compatibility
    group.userData.animateDiskMeshes = group.children;
    
    return group;
}
