import { line } from './line.js';
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
        labelPosition = 'middle' // 'middle', 'start', 'end', or {x, y, z}
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
    
    // If line is mostly vertical, use x-axis for perpendicular
    if (Math.abs(dirY) > 0.9) {
        perpX = 1;
        perpY = 0;
        perpZ = 0;
    } 
    // If line is mostly horizontal, use y-axis for perpendicular
    else {
        perpX = -dirY;
        perpY = dirX;
        perpZ = 0;
        // Normalize
        const perpLength = Math.sqrt(perpX*perpX + perpY*perpY);
        perpX /= perpLength;
        perpY /= perpLength;
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
