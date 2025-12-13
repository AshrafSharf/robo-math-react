/**
 * point_animator.js
 * Common GSAP animation methods for point objects
 * Works with both LHS and RHS coordinate systems
 */

import { TweenMax, TimelineMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a point appearing with scale effect
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @returns {Object} GSAP tween object
 */
export function animatePointScale(pointMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "Back.easeOut",
        fromScale = 0,
        toScale = 1,
        onComplete = null
    } = options;

    // Set initial scale
    pointMesh.scale.set(fromScale, fromScale, fromScale);

    return TweenMax.to(pointMesh.scale, duration, {
        x: toScale,
        y: toScale,
        z: toScale,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates point with a bounce effect
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @returns {Object} GSAP timeline
 */
export function animatePointBounce(pointMesh, options = {}) {
    const {
        duration = 1,
        bounceHeight = 1,
        ease = "Bounce.easeOut",
        onComplete = null
    } = options;

    const timeline = new TimelineMax({ onComplete: onComplete });

    // Store original position
    const originalY = pointMesh.position.y;

    // Start from above
    pointMesh.position.y = originalY + bounceHeight;

    // Bounce to position
    timeline.to(pointMesh.position, duration, {
        y: originalY,
        ease: ease
    });

    return timeline;
}

/**
 * Animates point pulsing effect
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @returns {Object} GSAP tween object
 */
export function animatePointPulse(pointMesh, options = {}) {
    const {
        duration = 1,
        ease = "Power2.easeInOut",
        scaleMin = 0.8,
        scaleMax = 1.2,
        repeat = -1,
        yoyo = true,
        onComplete = null
    } = options;

    return TweenMax.to(pointMesh.scale, duration, {
        x: scaleMax,
        y: scaleMax,
        z: scaleMax,
        ease: ease,
        repeat: repeat,
        yoyo: yoyo,
        onComplete: onComplete
    });
}

/**
 * Fade in animation for points
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @returns {Object} GSAP tween object
 */
export function fadeInPoint(pointMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "Power2.easeInOut",
        fromOpacity = 0,
        toOpacity = 1,
        onComplete = null
    } = options;

    pointMesh.material.transparent = true;
    pointMesh.material.opacity = fromOpacity;

    return TweenMax.to(pointMesh.material, duration, {
        opacity: toOpacity,
        ease: ease,
        onComplete: onComplete
    });
}
