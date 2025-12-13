/**
 * rhs_point_animator.js
 * GSAP animation methods for point objects using native Three.js coordinates
 * No coordinate transformation - works directly with Three.js objects
 */

import { TweenMax, TimelineMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a point appearing with scale effect
 * @param {THREE.Mesh} pointMesh - The point sphere created by point()
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 0.5)
 * @param {string} options.ease - GSAP easing function (default: "back.out(1.7)")
 * @param {number} options.fromScale - Initial scale (default: 0)
 * @param {number} options.toScale - Final scale (default: 1)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePointScale(pointMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "back.out(1.7)",
        fromScale = 0,
        toScale = 1,
        onComplete = null
    } = options;

    // Set initial scale
    pointMesh.scale.set(fromScale, fromScale, fromScale);

    return TweenMax.to(pointMesh.scale, {
        x: toScale,
        y: toScale,
        z: toScale,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates point with a bounce effect
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {number} options.bounceHeight - Height of the bounce (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "bounce.out")
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function animatePointBounce(pointMesh, options = {}) {
    const {
        duration = 1,
        bounceHeight = 1,
        ease = "bounce.out",
        onComplete = null
    } = options;

    const timeline = new TimelineMax({ onComplete: onComplete });

    // Store original position
    const originalY = pointMesh.position.y;

    // Start from above
    pointMesh.position.y = originalY + bounceHeight;

    // Bounce to position
    timeline.to(pointMesh.position, {
        y: originalY,
        duration: duration,
        ease: ease
    });

    return timeline;
}

/**
 * Animates point pulsing effect
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {number} options.scaleMin - Minimum scale (default: 0.8)
 * @param {number} options.scaleMax - Maximum scale (default: 1.2)
 * @param {number} options.repeat - Number of repeats, -1 for infinite (default: -1)
 * @param {boolean} options.yoyo - Whether to yoyo back and forth (default: true)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePointPulse(pointMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        scaleMin = 0.8,
        scaleMax = 1.2,
        repeat = -1,
        yoyo = true,
        onComplete = null
    } = options;

    return TweenMax.to(pointMesh.scale, {
        x: scaleMax,
        y: scaleMax,
        z: scaleMax,
        duration: duration,
        ease: ease,
        repeat: repeat,
        yoyo: yoyo,
        onComplete: onComplete
    });
}

/**
 * Animates point glow effect using emissive properties
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {number} options.glowColor - Glow color as hex (default: 0xffffff)
 * @param {number} options.glowIntensity - Glow intensity (default: 1)
 * @param {number} options.repeat - Number of repeats, -1 for infinite (default: -1)
 * @param {boolean} options.yoyo - Whether to yoyo back and forth (default: true)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePointGlow(pointMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        glowColor = 0xffffff,
        glowIntensity = 1,
        repeat = -1,
        yoyo = true,
        onComplete = null
    } = options;

    // Set initial emissive
    pointMesh.material.emissive = new THREE.Color(glowColor);
    pointMesh.material.emissiveIntensity = 0;

    return TweenMax.to(pointMesh.material, {
        emissiveIntensity: glowIntensity,
        duration: duration,
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
 * @param {number} options.duration - Animation duration (default: 0.5)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {number} options.fromOpacity - Initial opacity (default: 0)
 * @param {number} options.toOpacity - Final opacity (default: 1)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInPoint(pointMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = 1,
        onComplete = null
    } = options;

    // Ensure material is transparent
    pointMesh.material.transparent = true;
    pointMesh.material.opacity = fromOpacity;

    return TweenMax.to(pointMesh.material, {
        opacity: toOpacity,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}
