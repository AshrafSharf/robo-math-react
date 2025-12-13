/**
 * lhs_disk_stack.js
 * Creates disk stacks for disk/washer method visualizations
 * Uses mathematical coordinate system (X=right, Y=forward, Z=up)
 */

import * as THREE from 'three';
import { cylinder, washer } from './lhs_3d_primitives.js';
import { line } from './lhs_line.js';
import { label } from './lhs_label.js';

/**
 * Creates a single disk (cylinder) for visualization
 * @param {Object} baseCenter - Base center point in mathematical coordinates {x, y, z}
 * @param {Object} topCenter - Top center point in mathematical coordinates {x, y, z}
 * @param {Number} radius - Radius of the disk
 * @param {Object} options - Material options
 * @returns {THREE.Mesh} Disk mesh
 */
export function disk(baseCenter, topCenter, radius, options = {}) {
    return cylinder(baseCenter, topCenter, radius, options);
}

/**
 * Creates a stack of disks to illustrate the disk method
 * @param {Function|Array} curveFunc - Function(t) returning radius value, or array of {x, y} points
 * @param {Array} range - [min, max] range for the parameter
 * @param {Object} options - Configuration options
 * @param {number} options.numDisks - Number of disks to create (default: 12)
 * @param {string} options.axis - Axis of revolution ('x' or 'y', default: 'y')
 * @param {number} options.color - Color of the disks (default: 0x4488ff)
 * @param {number} options.opacity - Opacity of the disks (default: 0.9)
 * @param {number} options.radialSegments - Number of radial segments (default: 32)
 * @param {boolean} options.wireframe - Whether to render as wireframe (default: false)
 * @param {number} options.shininess - Material shininess (default: 100)
 * @param {number} options.emissive - Emissive color (default: auto-calculated)
 * @param {number} options.emissiveIntensity - Emissive intensity (default: 0.05)
 * @param {boolean} options.visible - Initial visibility (default: false)
 * @param {Function|number} options.innerRadius - Inner radius for washer method (null for solid disk)
 * @returns {THREE.Group} Group containing all disk meshes
 */
export function diskStack(curveFunc, range, options = {}) {
    const {
        numDisks = 12,
        axis = 'y',
        color = 0x4488ff,
        opacity = 0.9,
        radialSegments = 32,
        wireframe = false,
        shininess = 100,
        emissive = null,
        emissiveIntensity = 0.05,
        visible = false,
        innerRadius = null  // For washer method (null means solid disk)
    } = options;
    
    const diskStackGroup = new THREE.Group();
    const diskMeshes = [];
    
    const [min, max] = range;
    const thickness = (max - min) / numDisks;
    
    // Auto-set emissive if not provided
    const emissiveColor = emissive !== null ? emissive : 
        new THREE.Color(color).multiplyScalar(0.5).getHex();
    
    for (let i = 0; i < numDisks; i++) {
        const bottom = min + i * thickness;
        const top = min + (i + 1) * thickness;
        const center = (bottom + top) / 2;
        
        let diskMesh;
        
        if (axis === 'y') {
            // Revolving around y-axis
            const radius = typeof curveFunc === 'function' ? 
                Math.abs(curveFunc(center)) : 
                interpolateRadius(curveFunc, center, 'y');
            
            if (innerRadius !== null) {
                // Create washer (hollow cylinder)
                const innerR = typeof innerRadius === 'function' ? 
                    Math.abs(innerRadius(center)) : innerRadius;
                
                diskMesh = washer(
                    { x: 0, y: bottom, z: 0 },
                    { x: 0, y: top, z: 0 },
                    innerR,
                    radius,
                    {
                        color,
                        opacity,
                        radialSegments,
                        wireframe,
                        shininess,
                        emissive: emissiveColor,
                        emissiveIntensity
                    }
                );
            } else {
                // Create solid disk
                diskMesh = disk(
                    { x: 0, y: bottom, z: 0 },
                    { x: 0, y: top, z: 0 },
                    radius,
                    {
                        color,
                        opacity,
                        radialSegments,
                        wireframe,
                        shininess,
                        emissive: emissiveColor,
                        emissiveIntensity
                    }
                );
            }
        } else if (axis === 'x') {
            // Revolving around x-axis
            const radius = typeof curveFunc === 'function' ? 
                Math.abs(curveFunc(center)) : 
                interpolateRadius(curveFunc, center, 'x');
            
            if (innerRadius !== null) {
                const innerR = typeof innerRadius === 'function' ? 
                    Math.abs(innerRadius(center)) : innerRadius;
                
                diskMesh = washer(
                    { x: bottom, y: 0, z: 0 },
                    { x: top, y: 0, z: 0 },
                    innerR,
                    radius,
                    {
                        color,
                        opacity,
                        radialSegments,
                        wireframe,
                        shininess,
                        emissive: emissiveColor,
                        emissiveIntensity
                    }
                );
            } else {
                diskMesh = disk(
                    { x: bottom, y: 0, z: 0 },
                    { x: top, y: 0, z: 0 },
                    radius,
                    {
                        color,
                        opacity,
                        radialSegments,
                        wireframe,
                        shininess,
                        emissive: emissiveColor,
                        emissiveIntensity
                    }
                );
            }
        } else if (axis === 'z') {
            // Revolving around z-axis
            const radius = typeof curveFunc === 'function' ? 
                Math.abs(curveFunc(center)) : 
                interpolateRadius(curveFunc, center, 'z');
            
            if (innerRadius !== null) {
                const innerR = typeof innerRadius === 'function' ? 
                    Math.abs(innerRadius(center)) : innerRadius;
                
                diskMesh = washer(
                    { x: 0, y: 0, z: bottom },
                    { x: 0, y: 0, z: top },
                    innerR,
                    radius,
                    {
                        color,
                        opacity,
                        radialSegments,
                        wireframe,
                        shininess,
                        emissive: emissiveColor,
                        emissiveIntensity
                    }
                );
            } else {
                diskMesh = disk(
                    { x: 0, y: 0, z: bottom },
                    { x: 0, y: 0, z: top },
                    radius,
                    {
                        color,
                        opacity,
                        radialSegments,
                        wireframe,
                        shininess,
                        emissive: emissiveColor,
                        emissiveIntensity
                    }
                );
            }
        }
        
        // Set initial visibility
        diskMesh.visible = visible;
        
        // Store metadata for animation
        diskMesh.userData.diskIndex = i;
        diskMesh.userData.diskPosition = center;
        diskMesh.userData.diskThickness = thickness;
        diskMesh.userData.type = 'disk';
        
        diskStackGroup.add(diskMesh);
        diskMeshes.push(diskMesh);
    }
    
    // Store metadata on group
    diskStackGroup.userData.diskMeshes = diskMeshes;
    diskStackGroup.userData.diskStackData = {
        numDisks,
        axis,
        range,
        thickness
    };
    diskStackGroup.userData.type = 'diskStack';
    
    return diskStackGroup;
}

/**
 * Creates a shell stack for the shell method
 * @param {Function} outerFunc - Function for outer curve radius
 * @param {Function} innerFunc - Function for inner curve radius
 * @param {Array} range - [min, max] range for the parameter
 * @param {Object} options - Configuration options
 * @param {number} options.numShells - Number of shells to create (default: 8)
 * @param {string} options.axis - Axis of revolution ('x', 'y', or 'z', default: 'y')
 * @param {number} options.color - Color of the shells (default: 0x44ff88)
 * @param {number} options.opacity - Opacity of the shells (default: 0.7)
 * @returns {THREE.Group} Group containing shell meshes
 */
export function shellStack(outerFunc, innerFunc, range, options = {}) {
    const {
        numShells = 8,
        axis = 'y',
        color = 0x44ff88,
        opacity = 0.7,
        ...otherOptions
    } = options;
    
    // Use diskStack with inner radius for shells
    const stack = diskStack(outerFunc, range, {
        numDisks: numShells,
        axis,
        color,
        opacity,
        innerRadius: innerFunc,
        ...otherOptions
    });
    
    // Update type metadata
    stack.userData.type = 'shellStack';
    
    return stack;
}

/**
 * Creates an extracted disk with radius and height annotations
 * Used to illustrate the disk method formula
 * @param {Function|Number} radiusFunc - Function or value for radius
 * @param {Number} position - Position along the axis
 * @param {Number} thickness - Thickness (dx, dy, or dz) of the disk
 * @param {Object} options - Configuration options
 * @param {string} options.axis - Axis of revolution ('x', 'y', or 'z', default: 'y')
 * @param {number} options.color - Color of the disk (default: 0x4488ff)
 * @param {number} options.opacity - Opacity of the disk (default: 0.9)
 * @param {number} options.extractDistance - How far to slide out (default: 3)
 * @param {boolean} options.showRadius - Whether to show radius line (default: true)
 * @param {boolean} options.showHeight - Whether to show height line (default: true)
 * @param {string} options.radiusLabel - Label for radius (default: 'r = y² + 1')
 * @param {string} options.heightLabel - Label for height (default: 'Δy')
 * @param {string} options.labelColor - Color for labels (default: '#000000')
 * @param {number} options.labelScale - Scale for labels (default: 0.025)
 * @returns {THREE.Group} Group containing disk and annotations
 */
export function extractedDisk(radiusFunc, position, thickness, options = {}) {
    const {
        axis = 'y',
        color = 0x4488ff,
        opacity = 0.9,
        extractDistance = 3,  // How far to slide out
        showRadius = true,
        showHeight = true,
        radiusLabel = 'r = f(y)',
        heightLabel = axis === 'y' ? 'Δy' : (axis === 'x' ? 'Δx' : 'Δz'),
        labelColor = '#000000',
        labelScale = 0.025
    } = options;
    
    const extractedGroup = new THREE.Group();
    
    // Calculate radius at this position
    const radius = typeof radiusFunc === 'function' ? 
        Math.abs(radiusFunc(position)) : radiusFunc;
    
    // Create the disk at extracted position based on axis
    let baseCenter, topCenter, extractedPosition;
    
    if (axis === 'y') {
        baseCenter = { x: extractDistance, y: position - thickness/2, z: 0 };
        topCenter = { x: extractDistance, y: position + thickness/2, z: 0 };
        extractedPosition = { x: extractDistance, y: position, z: 0 };
    } else if (axis === 'x') {
        baseCenter = { x: position - thickness/2, y: extractDistance, z: 0 };
        topCenter = { x: position + thickness/2, y: extractDistance, z: 0 };
        extractedPosition = { x: position, y: extractDistance, z: 0 };
    } else { // axis === 'z'
        baseCenter = { x: extractDistance, y: 0, z: position - thickness/2 };
        topCenter = { x: extractDistance, y: 0, z: position + thickness/2 };
        extractedPosition = { x: extractDistance, y: 0, z: position };
    }
    
    const extractedDiskMesh = disk(
        baseCenter,
        topCenter,
        radius,
        {
            color,
            opacity,
            radialSegments: 32
        }
    );
    
    // Initially hidden (will be animated to appear)
    extractedDiskMesh.visible = false;
    extractedGroup.add(extractedDiskMesh);
    
    // Store extraction data for animation
    extractedGroup.userData.extractedDisk = extractedDiskMesh;
    extractedGroup.userData.extractDistance = extractDistance;
    extractedGroup.userData.radius = radius;
    extractedGroup.userData.thickness = thickness;
    extractedGroup.userData.position = position;
    extractedGroup.userData.axis = axis;
    extractedGroup.userData.type = 'extractedDisk';
    
    // Create radius line and label (initially hidden)
    if (showRadius) {
        let radiusLineStart, radiusLineEnd, radiusLabelPos;
        
        if (axis === 'y') {
            radiusLineStart = extractedPosition;
            radiusLineEnd = { x: extractDistance + radius, y: position, z: 0 };
            radiusLabelPos = { x: extractDistance + radius/2, y: position + 0.3, z: 0 };
        } else if (axis === 'x') {
            radiusLineStart = extractedPosition;
            radiusLineEnd = { x: position, y: extractDistance + radius, z: 0 };
            radiusLabelPos = { x: position + 0.3, y: extractDistance + radius/2, z: 0 };
        } else { // axis === 'z'
            radiusLineStart = extractedPosition;
            radiusLineEnd = { x: extractDistance + radius, y: 0, z: position };
            radiusLabelPos = { x: extractDistance + radius/2, y: 0.3, z: position };
        }
        
        const radiusLine = line(
            radiusLineStart,
            radiusLineEnd,
            {
                color: 0xff0000,
                radius: 0.02
            }
        );
        radiusLine.visible = false;
        extractedGroup.add(radiusLine);
        extractedGroup.userData.radiusLine = radiusLine;
        
        // Add radius label
        const radiusLabelMesh = label(radiusLabel, 
            radiusLabelPos,
            {
                color: labelColor,
                fontSize: 28,
                scale: labelScale
            }
        );
        radiusLabelMesh.visible = false;
        extractedGroup.add(radiusLabelMesh);
        extractedGroup.userData.radiusLabel = radiusLabelMesh;
    }
    
    // Create height line and label (initially hidden)
    if (showHeight) {
        let heightLineStart, heightLineEnd, heightLabelPos;
        
        if (axis === 'y') {
            heightLineStart = { x: extractDistance + radius + 0.5, y: position - thickness/2, z: 0 };
            heightLineEnd = { x: extractDistance + radius + 0.5, y: position + thickness/2, z: 0 };
            heightLabelPos = { x: extractDistance + radius + 0.8, y: position, z: 0 };
        } else if (axis === 'x') {
            heightLineStart = { x: position - thickness/2, y: extractDistance + radius + 0.5, z: 0 };
            heightLineEnd = { x: position + thickness/2, y: extractDistance + radius + 0.5, z: 0 };
            heightLabelPos = { x: position, y: extractDistance + radius + 0.8, z: 0 };
        } else { // axis === 'z'
            heightLineStart = { x: extractDistance + radius + 0.5, y: 0, z: position - thickness/2 };
            heightLineEnd = { x: extractDistance + radius + 0.5, y: 0, z: position + thickness/2 };
            heightLabelPos = { x: extractDistance + radius + 0.8, y: 0, z: position };
        }
        
        const heightLine = line(
            heightLineStart,
            heightLineEnd,
            {
                color: 0x00ff00,
                radius: 0.02
            }
        );
        heightLine.visible = false;
        extractedGroup.add(heightLine);
        extractedGroup.userData.heightLine = heightLine;
        
        // Add height label
        const heightLabelMesh = label(heightLabel,
            heightLabelPos,
            {
                color: labelColor,
                fontSize: 28,
                scale: labelScale
            }
        );
        heightLabelMesh.visible = false;
        extractedGroup.add(heightLabelMesh);
        extractedGroup.userData.heightLabel = heightLabelMesh;
    }
    
    return extractedGroup;
}

/**
 * Interpolates radius from an array of points
 * @param {Array} points - Array of {x, y} points
 * @param {Number} value - Value to interpolate at
 * @param {String} axis - 'x', 'y', or 'z' axis
 * @returns {Number} Interpolated radius
 */
function interpolateRadius(points, value, axis) {
    if (!points || points.length === 0) return 0;
    
    // Find surrounding points
    let lower = points[0];
    let upper = points[points.length - 1];
    
    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        
        const currentVal = axis === 'y' ? current.y : (axis === 'x' ? current.x : current.z);
        const nextVal = axis === 'y' ? next.y : (axis === 'x' ? next.x : next.z);
        
        if (currentVal <= value && nextVal >= value) {
            lower = current;
            upper = next;
            break;
        }
    }
    
    // Linear interpolation
    const lowerVal = axis === 'y' ? lower.y : (axis === 'x' ? lower.x : lower.z);
    const upperVal = axis === 'y' ? upper.y : (axis === 'x' ? upper.x : upper.z);
    const lowerRadius = axis === 'y' ? Math.abs(lower.x) : 
                        (axis === 'x' ? Math.abs(lower.y) : Math.abs(lower.x));
    const upperRadius = axis === 'y' ? Math.abs(upper.x) : 
                        (axis === 'x' ? Math.abs(upper.y) : Math.abs(upper.x));
    
    if (Math.abs(upperVal - lowerVal) < 0.001) {
        return lowerRadius;
    }
    
    const t = (value - lowerVal) / (upperVal - lowerVal);
    return lowerRadius + t * (upperRadius - lowerRadius);
}