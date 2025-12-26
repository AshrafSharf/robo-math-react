/**
 * disk_stack.js
 * Native Three.js implementation for creating disk stacks
 * Used to illustrate the disk/washer method in solid of revolution
 */

import * as THREE from 'three';
import { cylinder } from './3d_primitives.js';
import { line } from './line.js';
import { label } from './label.js';

/**
 * Creates a single disk (cylinder) for visualization
 * @param {Object} baseCenter - Base center point {x, y, z}
 * @param {Object} topCenter - Top center point {x, y, z}
 * @param {Number} radius - Radius of the disk
 * @param {Object} options - Material options
 * @returns {THREE.Mesh} Disk mesh
 */
export function disk(baseCenter, topCenter, radius, options = {}) {
    return cylinder(baseCenter, topCenter, radius, options);
}

/**
 * Creates a stack of disks to illustrate the disk method
 * @param {Function|Array} curveFunc - Function(y) returning x value, or array of {x, y} points
 * @param {Array} range - [yMin, yMax] or [xMin, xMax] depending on axis
 * @param {Object} options - Configuration options
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
        
        let diskGeometry;
        let diskMesh;
        
        if (axis === 'y') {
            // Revolving around y-axis
            const radius = typeof curveFunc === 'function' ? 
                curveFunc(center) : 
                interpolateRadius(curveFunc, center, 'y');
            
            if (innerRadius !== null) {
                // Create washer (hollow cylinder)
                const innerR = typeof innerRadius === 'function' ? 
                    innerRadius(center) : innerRadius;
                
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
                curveFunc(center) : 
                interpolateRadius(curveFunc, center, 'x');
            
            if (innerRadius !== null) {
                const innerR = typeof innerRadius === 'function' ? 
                    innerRadius(center) : innerRadius;
                
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
        }
        
        // Set initial visibility
        diskMesh.visible = visible;
        
        // Store metadata for animation
        diskMesh.userData.diskIndex = i;
        diskMesh.userData.diskPosition = center;
        diskMesh.userData.diskThickness = thickness;
        
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
    
    return diskStackGroup;
}

/**
 * Creates a washer (hollow cylinder) for the washer method
 * @param {Object} baseCenter - Base center point {x, y, z}
 * @param {Object} topCenter - Top center point {x, y, z}
 * @param {Number} innerRadius - Inner radius of the washer
 * @param {Number} outerRadius - Outer radius of the washer
 * @param {Object} options - Material options
 * @returns {THREE.Mesh} Washer mesh
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
    
    // Calculate height and position
    const height = Math.sqrt(
        Math.pow(topCenter.x - baseCenter.x, 2) +
        Math.pow(topCenter.y - baseCenter.y, 2) +
        Math.pow(topCenter.z - baseCenter.z, 2)
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
    
    // Position and orient the washer
    const centerX = (baseCenter.x + topCenter.x) / 2;
    const centerY = (baseCenter.y + topCenter.y) / 2;
    const centerZ = (baseCenter.z + topCenter.z) / 2;
    
    mesh.position.set(centerX, centerY, centerZ);
    
    // Rotate to align with axis
    const direction = new THREE.Vector3(
        topCenter.x - baseCenter.x,
        topCenter.y - baseCenter.y,
        topCenter.z - baseCenter.z
    ).normalize();
    
    // Default extrusion is along z-axis, rotate to match direction
    if (Math.abs(direction.y - 1) < 0.001) {
        // Already aligned with y-axis
        mesh.rotation.x = -Math.PI / 2;
    } else if (Math.abs(direction.x - 1) < 0.001) {
        // Align with x-axis
        mesh.rotation.y = Math.PI / 2;
    }
    
    // Adjust position for rotation
    mesh.position.set(baseCenter.x, baseCenter.y, baseCenter.z);
    
    return mesh;
}

/**
 * Interpolates radius from an array of points
 * @param {Array} points - Array of {x, y} points
 * @param {Number} value - Value to interpolate at
 * @param {String} axis - 'x' or 'y' axis
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
        
        const currentVal = axis === 'y' ? current.y : current.x;
        const nextVal = axis === 'y' ? next.y : next.x;
        
        if (currentVal <= value && nextVal >= value) {
            lower = current;
            upper = next;
            break;
        }
    }
    
    // Linear interpolation
    const lowerVal = axis === 'y' ? lower.y : lower.x;
    const upperVal = axis === 'y' ? upper.y : upper.x;
    const lowerRadius = axis === 'y' ? Math.abs(lower.x) : Math.abs(lower.y);
    const upperRadius = axis === 'y' ? Math.abs(upper.x) : Math.abs(upper.y);
    
    if (Math.abs(upperVal - lowerVal) < 0.001) {
        return lowerRadius;
    }
    
    const t = (value - lowerVal) / (upperVal - lowerVal);
    return lowerRadius + t * (upperRadius - lowerRadius);
}

/**
 * Creates a shell stack for the shell method
 * @param {Function} outerFunc - Function for outer curve
 * @param {Function} innerFunc - Function for inner curve
 * @param {Array} range - [min, max] range
 * @param {Object} options - Configuration options
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
    return diskStack(outerFunc, range, {
        numDisks: numShells,
        axis,
        color,
        opacity,
        innerRadius: innerFunc,
        ...otherOptions
    });
}

/**
 * Creates an extracted disk with radius and height annotations
 * Used to illustrate the disk method formula
 * @param {Function|Number} radiusFunc - Function or value for radius
 * @param {Number} yPosition - Y position of the disk
 * @param {Number} thickness - Thickness (dy) of the disk
 * @param {Object} options - Configuration options
 * @returns {THREE.Group} Group containing disk and annotations
 */
export function extractedDisk(radiusFunc, yPosition, thickness, options = {}) {
    const {
        color = 0x4488ff,
        opacity = 0.9,
        extractDistance = 3,  // How far to slide out
        showRadius = true,
        showHeight = true,
        radiusLabel = 'r = y² + 1',
        heightLabel = 'Δy',
        labelColor = '#000000',
        labelScale = 0.025
    } = options;
    
    const extractedGroup = new THREE.Group();
    
    // Calculate radius at this y position
    const radius = typeof radiusFunc === 'function' ? radiusFunc(yPosition) : radiusFunc;
    
    // Create the disk at extracted position
    const extractedDisk = disk(
        { x: extractDistance, y: yPosition - thickness/2, z: 0 },
        { x: extractDistance, y: yPosition + thickness/2, z: 0 },
        radius,
        {
            color,
            opacity,
            radialSegments: 32
        }
    );
    
    // Initially position at origin (will be animated to slide out)
    extractedDisk.position.x = -extractDistance;
    extractedDisk.visible = false;
    extractedGroup.add(extractedDisk);
    
    // Store extraction data for animation
    extractedGroup.userData.extractedDisk = extractedDisk;
    extractedGroup.userData.extractDistance = extractDistance;
    extractedGroup.userData.radius = radius;
    extractedGroup.userData.thickness = thickness;
    extractedGroup.userData.yPosition = yPosition;
    
    // Create radius line and label (initially hidden)
    if (showRadius) {
        const radiusLine = line(
            { x: extractDistance, y: yPosition, z: 0 },
            { x: extractDistance + radius, y: yPosition, z: 0 },
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
            { x: extractDistance + radius/2, y: yPosition + 0.3, z: 0 },
            {
                color: labelColor,
                fontSize: 28,
                scale: labelScale
            }
        );
        if (radiusLabelMesh) {
            radiusLabelMesh.visible = false;
            extractedGroup.add(radiusLabelMesh);
            extractedGroup.userData.radiusLabel = radiusLabelMesh;
        }
    }
    
    // Create height indicator and label (initially hidden)
    if (showHeight) {
        const heightLine = line(
            { x: extractDistance + radius + 0.3, y: yPosition - thickness/2, z: 0 },
            { x: extractDistance + radius + 0.3, y: yPosition + thickness/2, z: 0 },
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
            { x: extractDistance + radius + 0.6, y: yPosition, z: 0 },
            {
                color: labelColor,
                fontSize: 28,
                scale: labelScale
            }
        );
        if (heightLabelMesh) {
            heightLabelMesh.visible = false;
            extractedGroup.add(heightLabelMesh);
            extractedGroup.userData.heightLabel = heightLabelMesh;
        }
    }
    
    return extractedGroup;
}