import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a thin line in 3D space using mathematical coordinates
 * Note: WebGL linewidth > 1 is not supported on most browsers
 * @param {Object} start - Start position in mathematical coordinates {x, y, z}
 * @param {Object} end - End position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the line (default: 0x000000 black)
 * @param {number} options.linewidth - Width of the line (default: 1)
 * @param {number} options.opacity - Opacity of the line (default: 1.0)
 * @returns {THREE.Line} The created line object
 */
export function thinLine(start, end, options = {}) {
    const {
        color = 0x000000,         // Black by default
        linewidth = 1,            // Standard line width
        opacity = 1.0             // Fully opaque
    } = options;
    
    // Transform mathematical coordinates to Three.js coordinates
    const threeStart = transformToThreeJS(start);
    const threeEnd = transformToThreeJS(end);
    
    // Create geometry with two points
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
        threeStart.x, threeStart.y, threeStart.z,
        threeEnd.x, threeEnd.y, threeEnd.z
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create material
    const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: linewidth,
        opacity: opacity,
        transparent: opacity < 1.0
    });
    
    // Create line
    const lineObj = new THREE.Line(geometry, material);
    
    return lineObj;
}

/**
 * Creates a line (cylinder) in 3D space using mathematical coordinates
 * Uses cylinder geometry for visible thickness in 3D
 * @param {Object} start - Start position in mathematical coordinates {x, y, z}
 * @param {Object} end - End position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the line (default: 0x000000 black)
 * @param {number} options.radius - Radius of the cylinder (default: 0.05)
 * @param {number} options.opacity - Opacity of the line (default: 1.0)
 * @param {number} options.segments - Number of segments for cylinder (default: 8)
 * @returns {THREE.Mesh} The created cylinder mesh
 */
export function line(start, end, options = {}) {
    const {
        color = 0x000000,         // Black by default
        radius = 0.06,            // Cylinder radius
        opacity = 1.0,            // Fully opaque
        segments = 8              // Cylinder segments
    } = options;
    
    // Transform mathematical coordinates to Three.js coordinates
    const threeStart = transformToThreeJS(start);
    const threeEnd = transformToThreeJS(end);
    
    // Calculate direction and length
    const direction = new THREE.Vector3().subVectors(threeEnd, threeStart);
    const length = direction.length();
    direction.normalize();
    
    // Create cylinder geometry
    const geometry = new THREE.CylinderGeometry(radius, radius, length, segments);
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0
    });
    
    // Create mesh
    const cylinder = new THREE.Mesh(geometry, material);
    
    // Position at midpoint
    const midpoint = new THREE.Vector3().addVectors(threeStart, threeEnd).multiplyScalar(0.5);
    cylinder.position.copy(midpoint);
    
    // Orient along the line direction
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    cylinder.quaternion.copy(quaternion);
    
    return cylinder;
}

/**
 * Creates a thin dashed line in 3D space using mathematical coordinates
 * Uses WebGL line rendering with dashed material
 * @param {Object} start - Start position in mathematical coordinates {x, y, z}
 * @param {Object} end - End position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the line (default: 0x000000 black)
 * @param {number} options.linewidth - Width of the line (default: 2)
 * @param {boolean} options.dashed - Whether line is dashed (default: true)
 * @param {number} options.dashSize - Size of dash segments (default: 0.1)
 * @param {number} options.gapSize - Size of gaps between dashes (default: 0.05)
 * @param {number} options.opacity - Opacity of the line (default: 1.0)
 * @param {boolean} options.thick - Use cylinder for thick line (default: false)
 * @param {number} options.radius - Radius for thick line cylinder (default: 0.05)
 * @returns {THREE.Line|THREE.Mesh} The created line or cylinder mesh
 */
export function dashedThinLine(start, end, options = {}) {
    const {
        color = 0x000000,         // Black by default
        linewidth = 2,            // Standard line width
        dashed = true,            // Dashed by default for this function
        dashSize = 0.1,           // Dash segment size
        gapSize = 0.05,           // Gap size
        opacity = 1.0,            // Fully opaque
        thick = false,            // Use thick cylinder
        radius = 0.05             // Cylinder radius if thick
    } = options;
    
    // If thick line requested, use cylinder approach
    if (thick || linewidth > 10) {
        return line(start, end, {
            color: color,
            radius: linewidth > 10 ? linewidth / 200 : radius,
            opacity: opacity
        });
    }
    
    // Transform mathematical coordinates to Three.js coordinates
    const threeStart = transformToThreeJS(start);
    const threeEnd = transformToThreeJS(end);
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
        threeStart.x, threeStart.y, threeStart.z,
        threeEnd.x, threeEnd.y, threeEnd.z
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    let material;
    let lineObj;
    
    if (dashed) {
        // Create dashed line material
        material = new THREE.LineDashedMaterial({
            color: color,
            linewidth: linewidth,
            dashSize: dashSize,
            gapSize: gapSize,
            opacity: opacity,
            transparent: opacity < 1.0
        });
        
        // Create line
        lineObj = new THREE.Line(geometry, material);
        
        // Compute line distances for dashed material to work
        lineObj.computeLineDistances();
    } else {
        // Create solid line material
        material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: linewidth,
            opacity: opacity,
            transparent: opacity < 1.0
        });
        
        // Create line
        lineObj = new THREE.Line(geometry, material);
    }
    
    return lineObj;
}

/**
 * Creates a thick dashed line in 3D space using cylinder segments
 * Creates true 3D dashed lines with cylinder geometry for better visibility
 * @param {Object} start - Start position in mathematical coordinates {x, y, z}
 * @param {Object} end - End position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the line (default: 0x000000 black)
 * @param {number} options.dashSize - Size of dash segments (default: 0.3)
 * @param {number} options.gapSize - Size of gaps between dashes (default: 0.15)
 * @param {number} options.radius - Radius of cylinder segments (default: 0.025)
 * @param {number} options.opacity - Opacity of the line (default: 0.9)
 * @returns {THREE.Group} Group containing cylinder dash segments
 */
export function dashedThickLine(start, end, options = {}) {
    const {
        color = 0x000000,         // Black by default
        dashSize = 0.3,           // Length of each dash
        gapSize = 0.15,           // Length of gap between dashes
        radius = 0.025,           // Thickness of the line
        opacity = 0.9             // Slightly transparent
    } = options;
    
    // Transform mathematical coordinates to Three.js coordinates
    const threeStart = transformToThreeJS(start);
    const threeEnd = transformToThreeJS(end);
    
    // Create group to hold all dash segments
    const group = new THREE.Group();
    
    // Calculate direction and total length
    const direction = new THREE.Vector3().subVectors(threeEnd, threeStart);
    const totalLength = direction.length();
    direction.normalize();
    
    // If line is too short, just create a single segment
    if (totalLength < dashSize) {
        const geometry = new THREE.CylinderGeometry(radius, radius, totalLength, 8);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            opacity: opacity,
            transparent: opacity < 1.0
        });
        const cylinder = new THREE.Mesh(geometry, material);
        
        // Position at midpoint
        const midpoint = new THREE.Vector3().addVectors(threeStart, threeEnd).multiplyScalar(0.5);
        cylinder.position.copy(midpoint);
        
        // Orient along direction
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        cylinder.quaternion.copy(quaternion);
        
        group.add(cylinder);
        return group;
    }
    
    // Create material once for all segments
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0
    });
    
    // Parameters for dashed line
    const segmentLength = dashSize + gapSize;
    const numFullSegments = Math.floor(totalLength / segmentLength);
    
    // Create dash segments
    for (let i = 0; i < numFullSegments; i++) {
        const segmentStart = i * segmentLength;
        
        // Create cylinder for this dash
        const dashGeometry = new THREE.CylinderGeometry(radius, radius, dashSize, 8);
        const dash = new THREE.Mesh(dashGeometry, material);
        
        // Position the dash
        const dashCenter = threeStart.clone().add(
            direction.clone().multiplyScalar(segmentStart + dashSize / 2)
        );
        dash.position.copy(dashCenter);
        
        // Orient the dash along the line direction
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        dash.quaternion.copy(quaternion);
        
        group.add(dash);
    }
    
    // Add final segment if there's remaining space
    const remainingLength = totalLength - (numFullSegments * segmentLength);
    if (remainingLength > 0.1) {
        const finalDashLength = Math.min(dashSize, remainingLength);
        const dashGeometry = new THREE.CylinderGeometry(radius, radius, finalDashLength, 8);
        const dash = new THREE.Mesh(dashGeometry, material);
        
        const dashCenter = threeStart.clone().add(
            direction.clone().multiplyScalar(numFullSegments * segmentLength + finalDashLength / 2)
        );
        dash.position.copy(dashCenter);
        
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        dash.quaternion.copy(quaternion);
        
        group.add(dash);
    }
    
    return group;
}