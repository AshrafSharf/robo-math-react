/**
 * inspect_disk.js
 * Creates an inspection view of a disk from the disk method
 * Shows a disk with radius and height annotations
 */

import * as THREE from 'three';
import { disk } from './disk_stack.js';
import { line } from './line.js';
import { label } from './label.js';

/**
 * Creates an inspection disk - a copy of a disk from the stack positioned for annotation
 * @param {Function|Number} radiusFunc - Function(y) returning radius or constant radius
 * @param {Number} yPosition - Y position of the disk in the stack
 * @param {Number} thickness - Thickness (Δy) of the disk
 * @param {Number} index - Index of the disk in the stack
 * @param {Object} options - Configuration options
 * @returns {THREE.Group} Group containing inspection disk and annotations
 */
export function inspectDisk(radiusFunc, yPosition, thickness, index, options = {}) {
    const {
        // Disk appearance
        color = 0x4488ff,
        opacity = 0.9,
        
        // Position offset for inspection
        offsetX = 4,  // Move right
        offsetY = 2,  // Move up
        offsetZ = 0,
        
        // Annotation options
        showRadius = true,
        showHeight = true,
        radiusLabel = 'r(y)',
        heightLabel = 'Δy',
        radiusColor = 0xff0000,
        heightColor = 0x00ff00,
        labelColor = '#000000',
        labelScale = 0.03,
        
        // Initial visibility
        diskVisible = false,
        annotationsVisible = false
    } = options;
    
    const inspectionGroup = new THREE.Group();
    
    // Calculate radius at this y position
    const radius = typeof radiusFunc === 'function' ? radiusFunc(yPosition) : radiusFunc;
    
    // Create the inspection disk at offset position
    const inspectionDisk = disk(
        { x: offsetX, y: offsetY + yPosition - thickness/2, z: offsetZ },
        { x: offsetX, y: offsetY + yPosition + thickness/2, z: offsetZ },
        radius,
        {
            color,
            opacity
        }
    );
    
    inspectionDisk.visible = diskVisible;
    inspectionGroup.add(inspectionDisk);
    
    // Store metadata
    inspectionGroup.userData.inspectionDisk = inspectionDisk;
    inspectionGroup.userData.diskIndex = index;
    inspectionGroup.userData.yPosition = yPosition;
    inspectionGroup.userData.thickness = thickness;
    inspectionGroup.userData.radius = radius;
    
    // Create radius line and label
    if (showRadius) {
        const radiusLine = line(
            { x: offsetX, y: offsetY + yPosition, z: offsetZ },
            { x: offsetX + radius, y: offsetY + yPosition, z: offsetZ },
            {
                color: radiusColor,
                radius: 0.02
            }
        );
        radiusLine.visible = annotationsVisible;
        inspectionGroup.add(radiusLine);
        inspectionGroup.userData.radiusLine = radiusLine;
        
        // Add radius label at midpoint
        const radiusLabelMesh = label(radiusLabel, 
            { x: offsetX + radius/2, y: offsetY + yPosition + 0.3, z: offsetZ },
            {
                color: labelColor,
                fontSize: 32,
                scale: labelScale
            }
        );
        if (radiusLabelMesh) {
            radiusLabelMesh.visible = annotationsVisible;
            inspectionGroup.add(radiusLabelMesh);
            inspectionGroup.userData.radiusLabel = radiusLabelMesh;
        }
    }
    
    // Create height/thickness indicator and label
    if (showHeight) {
        // Position height line to the right of the disk
        const heightX = offsetX + radius + 0.3;
        
        const heightLine = line(
            { x: heightX, y: offsetY + yPosition - thickness/2, z: offsetZ },
            { x: heightX, y: offsetY + yPosition + thickness/2, z: offsetZ },
            {
                color: heightColor,
                radius: 0.02
            }
        );
        heightLine.visible = annotationsVisible;
        inspectionGroup.add(heightLine);
        inspectionGroup.userData.heightLine = heightLine;
        
        // Add height label
        const heightLabelMesh = label(heightLabel,
            { x: heightX + 0.3, y: offsetY + yPosition, z: offsetZ },
            {
                color: labelColor,
                fontSize: 32,
                scale: labelScale
            }
        );
        if (heightLabelMesh) {
            heightLabelMesh.visible = annotationsVisible;
            inspectionGroup.add(heightLabelMesh);
            inspectionGroup.userData.heightLabel = heightLabelMesh;
        }
    }
    
    return inspectionGroup;
}

/**
 * Creates inspection disk from disk stack parameters
 * @param {Number} index - Index of disk to inspect (0-based)
 * @param {Function} curveFunc - Function defining the curve
 * @param {Array} range - [min, max] range
 * @param {Number} numDisks - Total number of disks in stack
 * @param {Object} options - Configuration options
 * @returns {THREE.Group} Inspection group
 */
export function inspectDiskFromStack(index, curveFunc, range, numDisks, options = {}) {
    const [min, max] = range;
    const thickness = (max - min) / numDisks;
    const yPosition = min + (index + 0.5) * thickness;
    
    return inspectDisk(curveFunc, yPosition, thickness, index, options);
}