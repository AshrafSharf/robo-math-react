/**
 * rhs_parallelogram_animator.js
 * GSAP animation methods for parallelogram objects using native Three.js coordinates
 * No coordinate transformation - works directly with Three.js objects
 */

import { fadeInPolygon, animatePolygonScale } from './rhs_polygon_animator.js';

/**
 * Fade in animation for parallelograms
 * Delegates to polygon animator since parallelogram returns a polygon mesh
 * @param {THREE.Mesh|THREE.Group} parallelogramMesh - The parallelogram mesh or group
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 0.5)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {number} options.fromOpacity - Initial opacity (default: 0)
 * @param {number} options.toOpacity - Final opacity (default: 0.7)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInParallelogram(parallelogramMesh, options = {}) {
    // Use polygon animator since parallelogram is just a special polygon
    return fadeInPolygon(parallelogramMesh, options);
}

/**
 * Scale animation for parallelograms
 * Delegates to polygon animator
 * @param {THREE.Mesh|THREE.Group} parallelogramMesh - The parallelogram mesh or group
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 0.8)
 * @param {string} options.ease - GSAP easing function (default: "back.out(1.4)")
 * @param {number} options.fromScale - Initial scale (default: 0)
 * @param {number} options.toScale - Final scale (default: 1)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateParallelogramScale(parallelogramMesh, options = {}) {
    return animatePolygonScale(parallelogramMesh, options);
}
