/**
 * lhs_parallelogram_animator.js
 * GSAP animation methods for parallelogram objects from lhs_parallelogram.js
 */

import { fadeInPolygon, animatePolygonScale } from './lhs_polygon_animator.js';

/**
 * Fade in animation for parallelograms
 * Delegates to polygon animator since parallelogram returns a polygon mesh
 * @param {THREE.Mesh|THREE.Group} parallelogramMesh - The parallelogram mesh or group
 * @param {Object} options - Animation options
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
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateParallelogramScale(parallelogramMesh, options = {}) {
    return animatePolygonScale(parallelogramMesh, options);
}