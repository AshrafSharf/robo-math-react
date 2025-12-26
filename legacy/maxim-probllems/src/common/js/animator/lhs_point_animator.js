/**
 * lhs_point_animator.js
 * GSAP animation methods for point objects from lhs_point.js
 */

import { gsap } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a point appearing with scale effect
 * @param {THREE.Mesh} pointMesh - The point sphere created by point()
 * @param {Object} options - Animation options
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
    
    return gsap.to(pointMesh.scale, {
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
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function animatePointBounce(pointMesh, options = {}) {
    const {
        duration = 1,
        bounceHeight = 1,
        ease = "bounce.out",
        onComplete = null
    } = options;
    
    const timeline = gsap.timeline({ onComplete: onComplete });
    
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
    
    return gsap.to(pointMesh.scale, {
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
    
    return gsap.to(pointMesh.material, {
        emissiveIntensity: glowIntensity,
        duration: duration,
        ease: ease,
        repeat: repeat,
        yoyo: yoyo,
        onComplete: onComplete
    });
}

/**
 * Fade in animation for points (fallback animation)
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
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
    
    return gsap.to(pointMesh.material, {
        opacity: toOpacity,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}