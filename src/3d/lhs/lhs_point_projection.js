import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates projection lines showing rectangular coordinates
 * First drops to XY plane, then from there to X and Y axes
 * @param {Object} point - Point in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.radius - Radius/thickness of projection lines (default: 0.025)
 * @param {number} options.opacity - Opacity of lines (default: 0.6)
 * @param {boolean} options.dashed - Whether lines are dashed (default: true)
 * @param {number} options.dashSize - Size of dash segments (default: 0.1)
 * @param {number} options.gapSize - Size of gaps between dashes (default: 0.05)
 * @param {Object} options.colors - Colors for different projections
 * @param {number} options.colors.x - Color for projection to X axis (default: 0xff0000 red)
 * @param {number} options.colors.y - Color for projection to Y axis (default: 0x00ff00 green)
 * @param {number} options.colors.z - Color for projection to XY plane (default: 0x0000ff blue)
 * @returns {THREE.Group} Group containing the projection lines
 */
export function pointProjection(point, options = {}) {
    const {
        radius = 0.025,  // Thickness of the cylinder lines
        opacity = 0.6,
        dashed = true,
        dashSize = 0.1,
        gapSize = 0.05,
        colors = {}
    } = options;
    
    // Default colors for projections
    const projectionColors = {
        x: 0xff0000,   // Red for line parallel to X
        y: 0x00ff00,   // Green for line parallel to Y  
        z: 0x0000ff,   // Blue for line parallel to Z
        ...colors
    };
    
    // Create group to hold the 3 projection lines
    const projectionGroup = new THREE.Group();
    
    // Transform point to Three.js coordinates
    const threePoint = transformToThreeJS(point);
    
    // Helper function to create a dashed projection line using cylinders
    function createProjectionLine(from, to, color) {
        const lineGroup = new THREE.Group();
        
        // Calculate direction and total length
        const direction = new THREE.Vector3().subVectors(to, from);
        const totalLength = direction.length();
        direction.normalize();
        
        // Material for all cylinder segments
        const material = new THREE.MeshPhongMaterial({
            color: color,
            opacity: opacity,
            transparent: opacity < 1.0
        });
        
        if (dashed) {
            // Create dashed line using cylinders
            
            // If line is too short, just create a single segment
            if (totalLength < dashSize) {
                const geometry = new THREE.CylinderGeometry(radius, radius, totalLength, 8);
                const cylinder = new THREE.Mesh(geometry, material);
                
                // Position at midpoint
                const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
                cylinder.position.copy(midpoint);
                
                // Orient along direction
                const up = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
                cylinder.quaternion.copy(quaternion);
                
                lineGroup.add(cylinder);
            } else {
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
                    const dashCenter = from.clone().add(
                        direction.clone().multiplyScalar(segmentStart + dashSize / 2)
                    );
                    dash.position.copy(dashCenter);
                    
                    // Orient the dash along the line direction
                    const up = new THREE.Vector3(0, 1, 0);
                    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
                    dash.quaternion.copy(quaternion);
                    
                    lineGroup.add(dash);
                }
                
                // Add final segment if there's remaining space
                const remainingLength = totalLength - (numFullSegments * segmentLength);
                if (remainingLength > 0.01) {
                    const finalDashLength = Math.min(remainingLength, dashSize);
                    const finalGeometry = new THREE.CylinderGeometry(radius, radius, finalDashLength, 8);
                    const finalDash = new THREE.Mesh(finalGeometry, material);
                    
                    // Position the final dash
                    const finalCenter = from.clone().add(
                        direction.clone().multiplyScalar(numFullSegments * segmentLength + finalDashLength / 2)
                    );
                    finalDash.position.copy(finalCenter);
                    
                    // Orient along direction
                    const up = new THREE.Vector3(0, 1, 0);
                    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
                    finalDash.quaternion.copy(quaternion);
                    
                    lineGroup.add(finalDash);
                }
            }
        } else {
            // Create solid line using a single cylinder
            const geometry = new THREE.CylinderGeometry(radius, radius, totalLength, 8);
            const cylinder = new THREE.Mesh(geometry, material);
            
            // Position at midpoint
            const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
            cylinder.position.copy(midpoint);
            
            // Orient along direction
            const up = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
            cylinder.quaternion.copy(quaternion);
            
            lineGroup.add(cylinder);
        }
        
        return lineGroup;
    }
    
    // Create projection lines for rectangular coordinate system:
    
    // 1. First, drop to XY plane (z = 0)
    const xyPlanePoint = transformToThreeJS({ x: point.x, y: point.y, z: 0 });
    const lineToXYPlane = createProjectionLine(threePoint, xyPlanePoint, projectionColors.z);
    projectionGroup.add(lineToXYPlane);
    
    // 2. From XY plane projection, drop to X axis (y = 0, z = 0)  
    const xAxisPoint = transformToThreeJS({ x: point.x, y: 0, z: 0 });
    const lineToXAxis = createProjectionLine(xyPlanePoint, xAxisPoint, projectionColors.x);
    projectionGroup.add(lineToXAxis);
    
    // 3. From XY plane projection, drop to Y axis (x = 0, z = 0)
    const yAxisPoint = transformToThreeJS({ x: 0, y: point.y, z: 0 });
    const lineToYAxis = createProjectionLine(xyPlanePoint, yAxisPoint, projectionColors.y);
    projectionGroup.add(lineToYAxis);
    
    return projectionGroup;
}

