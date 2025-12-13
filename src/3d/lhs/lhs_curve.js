import * as THREE from 'three';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a parametric curve in 3D space
 * @param {Function} curveFunction - Function that takes parameter t and returns {x, y, z} in mathematical coordinates
 * @param {Object} options - Configuration options
 * @param {number} options.tMin - Minimum parameter value (default: 0)
 * @param {number} options.tMax - Maximum parameter value (default: 1)
 * @param {number} options.segments - Number of curve segments (default: 100)
 * @param {number} options.color - Color of the curve (default: 0x0000ff blue)
 * @param {number} options.lineWidth - Width of the curve line (default: 2)
 * @param {number} options.opacity - Opacity of the curve (default: 1.0)
 * @param {boolean} options.dashed - Whether to use dashed line (default: false)
 * @param {number} options.dashSize - Size of dashes if dashed (default: 0.1)
 * @param {number} options.gapSize - Size of gaps if dashed (default: 0.05)
 * @returns {THREE.Line} The created curve as a Three.js Line object
 */
export function parametricCurve(curveFunction, options = {}) {
    const {
        tMin = 0,
        tMax = 1,
        segments = 100,
        color = 0x0000ff,
        lineWidth = 2,
        opacity = 1.0,
        dashed = false,
        dashSize = 0.1,
        gapSize = 0.05
    } = options;
    
    // Generate points along the curve
    const points = [];
    const step = (tMax - tMin) / segments;
    
    for (let i = 0; i <= segments; i++) {
        const t = tMin + i * step;
        const mathPoint = curveFunction(t);
        
        // Skip invalid points
        if (!mathPoint || 
            !isFinite(mathPoint.x) || 
            !isFinite(mathPoint.y) || 
            !isFinite(mathPoint.z)) {
            continue;
        }
        
        // Transform to Three.js coordinates
        const threePoint = transformToThreeJS(mathPoint);
        points.push(new THREE.Vector3(threePoint.x, threePoint.y, threePoint.z));
    }
    
    // Create geometry from points
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create material
    let material;
    if (dashed) {
        material = new THREE.LineDashedMaterial({
            color: color,
            linewidth: lineWidth,
            opacity: opacity,
            transparent: opacity < 1.0,
            dashSize: dashSize,
            gapSize: gapSize
        });
    } else {
        material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: lineWidth,
            opacity: opacity,
            transparent: opacity < 1.0
        });
    }
    
    // Create line
    const curve = new THREE.Line(geometry, material);
    
    // Compute line distances for dashed material
    if (dashed) {
        curve.computeLineDistances();
    }
    
    return curve;
}


/**
 * Creates a tube mesh along a parametric curve
 * @param {Function} curveFunction - Function that takes parameter t and returns {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.tMin - Minimum parameter value (default: 0)
 * @param {number} options.tMax - Maximum parameter value (default: 1)
 * @param {number} options.segments - Number of curve segments (default: 100)
 * @param {number} options.radius - Tube radius (default: 0.05)
 * @param {number} options.radialSegments - Number of radial segments (default: 8)
 * @param {number} options.color - Color of the tube (default: 0x0000ff)
 * @param {number} options.opacity - Opacity of the tube (default: 1.0)
 * @returns {THREE.Mesh} The created tube mesh
 */
export function parametricTube(curveFunction, options = {}) {
    const {
        tMin = 0,
        tMax = 1,
        segments = 100,
        radius = 0.05,
        radialSegments = 8,
        color = 0x0000ff,
        opacity = 1.0
    } = options;
    
    // Generate points for the curve
    const points = [];
    const step = (tMax - tMin) / segments;
    
    for (let i = 0; i <= segments; i++) {
        const t = tMin + i * step;
        const mathPoint = curveFunction(t);
        
        if (!mathPoint || 
            !isFinite(mathPoint.x) || 
            !isFinite(mathPoint.y) || 
            !isFinite(mathPoint.z)) {
            continue;
        }
        
        const threePoint = transformToThreeJS(mathPoint);
        points.push(new THREE.Vector3(threePoint.x, threePoint.y, threePoint.z));
    }
    
    // Create a smooth curve through the points
    const curve = new THREE.CatmullRomCurve3(points);
    
    // Create tube geometry
    const geometry = new THREE.TubeGeometry(
        curve,
        segments,
        radius,
        radialSegments,
        false
    );
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const tube = new THREE.Mesh(geometry, material);
    
    return tube;
}