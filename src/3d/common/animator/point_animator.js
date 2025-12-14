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
 * @param {number} options.duration - Animation duration (default: 0.5)
 * @param {string} options.ease - GSAP easing function
 * @param {number} options.fromScale - Starting scale (default: 0)
 * @param {number} options.toScale - Target scale (default: 1)
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {PenTracer} options.pen - Optional pen tracer for pen following
 * @param {THREE.Camera} options.camera - Camera for 3D projection
 * @param {HTMLElement} options.canvas - Renderer canvas element
 * @returns {Object} GSAP tween object
 */
export function animatePointScale(pointMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "Back.easeOut",
        fromScale = 0,
        toScale = 1,
        onComplete = null,
        pen = null,
        camera = null,
        canvas = null
    } = options;

    // Set initial scale
    pointMesh.scale.set(fromScale, fromScale, fromScale);

    return TweenMax.to(pointMesh.scale, duration, {
        x: toScale,
        y: toScale,
        z: toScale,
        ease: ease,
        onUpdate: () => {
            // Pen moves to point and stays there during scale animation
            if (pen && camera && canvas) {
                pen.emitFromWorld3D(pointMesh.position, camera, canvas);
            }
        },
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
 * @param {number} options.duration - Animation duration (default: 0.5)
 * @param {string} options.ease - GSAP easing function
 * @param {number} options.fromOpacity - Starting opacity (default: 0)
 * @param {number} options.toOpacity - Target opacity (default: 1)
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {PenTracer} options.pen - Optional pen tracer for pen following
 * @param {THREE.Camera} options.camera - Camera for 3D projection
 * @param {HTMLElement} options.canvas - Renderer canvas element
 * @returns {Object} GSAP tween object
 */
export function fadeInPoint(pointMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "Power2.easeInOut",
        fromOpacity = 0,
        toOpacity = 1,
        onComplete = null,
        pen = null,
        camera = null,
        canvas = null
    } = options;

    pointMesh.material.transparent = true;
    pointMesh.material.opacity = fromOpacity;

    const startFadeIn = () => {
        TweenMax.to(pointMesh.material, duration, {
            opacity: toOpacity,
            ease: ease,
            onUpdate: () => {
                // Pen stays at point during fade in
                if (pen && camera && canvas) {
                    pen.emitFromWorld3D(pointMesh.position, camera, canvas);
                }
            },
            onComplete: onComplete
        });
    };

    // Move pen to point first, then fade in
    if (pen && camera && canvas) {
        const worldPos = new THREE.Vector3();
        pointMesh.getWorldPosition(worldPos);
        pen.moveToWorld3D(worldPos, camera, canvas, startFadeIn);
    } else {
        startFadeIn();
    }
}
