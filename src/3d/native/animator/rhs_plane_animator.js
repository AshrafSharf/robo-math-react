/**
 * rhs_plane_animator.js
 * GSAP animation methods for plane objects using native Three.js coordinates
 * No coordinate transformation - works directly with Three.js objects
 */

import { TweenMax, TimelineMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a plane with a parametric sweep effect
 * The plane grows from a line to its full size
 * @param {THREE.Mesh} planeMesh - The plane mesh created by plane()
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1.5)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {string} options.sweepDirection - Sweep direction: 'horizontal', 'vertical', 'diagonal', 'radial' (default: 'horizontal')
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePlaneParametricSweep(planeMesh, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.inOut",
        sweepDirection = 'horizontal', // 'horizontal', 'vertical', 'diagonal', 'radial'
        onComplete = null
    } = options;

    // Ensure material is properly configured for visibility
    if (planeMesh.material) {
        // Store original opacity if not already stored
        if (planeMesh.userData.originalOpacity === undefined) {
            planeMesh.userData.originalOpacity = planeMesh.material.opacity || 0.7;
        }

        // Ensure material is transparent and visible
        planeMesh.material.transparent = true;
        planeMesh.material.opacity = planeMesh.userData.originalOpacity;
        planeMesh.material.visible = true;
        planeMesh.material.needsUpdate = true;
    }

    // Make sure mesh is visible
    planeMesh.visible = true;

    // Get the plane geometry
    const geometry = planeMesh.geometry;

    if (!geometry.isBufferGeometry) {
        console.warn('animatePlaneParametricSweep: Geometry is not BufferGeometry');
        return null;
    }

    // Get positions
    const positions = geometry.attributes.position.array;

    // Store original positions if not already stored
    if (!geometry.userData.originalPositions) {
        geometry.userData.originalPositions = Float32Array.from(positions);
    }
    const originalPositions = geometry.userData.originalPositions;

    // Reset positions to collapsed state first
    for (let i = 0; i < positions.length; i += 3) {
        switch (sweepDirection) {
            case 'horizontal':
                positions[i] = 0; // Collapse X
                positions[i + 1] = originalPositions[i + 1];
                positions[i + 2] = originalPositions[i + 2];
                break;
            case 'vertical':
                positions[i] = originalPositions[i];
                positions[i + 1] = 0; // Collapse Y
                positions[i + 2] = originalPositions[i + 2];
                break;
            case 'radial':
            case 'diagonal':
                positions[i] = 0;
                positions[i + 1] = 0;
                positions[i + 2] = 0;
                break;
        }
    }
    geometry.attributes.position.needsUpdate = true;

    // Create animation based on sweep direction
    const animationProgress = { value: 0 };

    return TweenMax.to(animationProgress, duration, {
        value: 1,
        ease: ease,
        onUpdate: function() {
            const progress = animationProgress.value;

            for (let i = 0; i < positions.length; i += 3) {
                const x = originalPositions[i];
                const y = originalPositions[i + 1];
                const z = originalPositions[i + 2];

                switch (sweepDirection) {
                    case 'horizontal':
                        // Sweep from left to right
                        positions[i] = x * progress;
                        positions[i + 1] = y;
                        positions[i + 2] = z;
                        break;

                    case 'vertical':
                        // Sweep from bottom to top
                        positions[i] = x;
                        positions[i + 1] = y * progress;
                        positions[i + 2] = z;
                        break;

                    case 'diagonal':
                        // Sweep diagonally
                        positions[i] = x * progress;
                        positions[i + 1] = y * progress;
                        positions[i + 2] = z;
                        break;

                    case 'radial':
                        // Grow from center outward
                        positions[i] = x * progress;
                        positions[i + 1] = y * progress;
                        positions[i + 2] = z * progress;
                        break;

                    default:
                        // Default to scale
                        positions[i] = x * progress;
                        positions[i + 1] = y * progress;
                        positions[i + 2] = z * progress;
                }
            }

            geometry.attributes.position.needsUpdate = true;
            geometry.computeVertexNormals();
        },
        onComplete: function() {
            // Restore original positions
            for (let i = 0; i < positions.length; i++) {
                positions[i] = originalPositions[i];
            }
            geometry.attributes.position.needsUpdate = true;
            geometry.computeVertexNormals();
            if (onComplete) onComplete();
        }
    });
}

/**
 * Animates plane scaling from zero to full size
 * @param {THREE.Mesh} planeMesh - The plane mesh
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.out")
 * @param {number} options.fromScale - Initial scale (default: 0.01)
 * @param {number} options.toScale - Final scale (default: 1)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePlaneScale(planeMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",  // Smooth deceleration, no bounce
        fromScale = 0.01,
        toScale = 1,
        onComplete = null
    } = options;

    // Ensure material is properly configured for visibility
    if (planeMesh.material) {
        // Store original opacity if not already stored
        if (planeMesh.userData.originalOpacity === undefined) {
            planeMesh.userData.originalOpacity = planeMesh.material.opacity || 0.7;
        }

        // Ensure material is transparent and visible
        planeMesh.material.transparent = true;
        planeMesh.material.opacity = planeMesh.userData.originalOpacity;
        planeMesh.material.visible = true;

        // Ensure proper rendering
        planeMesh.material.needsUpdate = true;
    }

    // Make sure mesh is visible
    planeMesh.visible = true;

    // Reset to small scale for animation
    planeMesh.scale.set(fromScale, fromScale, fromScale);

    // Animate to full scale
    return TweenMax.to(planeMesh.scale, duration, {
        x: toScale,
        y: toScale,
        z: toScale,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates plane rotation into position
 * @param {THREE.Mesh} planeMesh - The plane mesh
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1.5)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {string} options.rotationAxis - Rotation axis: 'x', 'y', 'z' (default: 'y')
 * @param {number} options.rotationAngle - Rotation angle in radians (default: Math.PI * 2)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePlaneRotation(planeMesh, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.inOut",
        rotationAxis = 'y', // 'x', 'y', 'z'
        rotationAngle = Math.PI * 2,
        onComplete = null
    } = options;

    // Store target rotation
    const targetRotation = {
        x: planeMesh.rotation.x,
        y: planeMesh.rotation.y,
        z: planeMesh.rotation.z
    };

    // Set initial rotation
    switch (rotationAxis) {
        case 'x':
            planeMesh.rotation.x -= rotationAngle;
            break;
        case 'y':
            planeMesh.rotation.y -= rotationAngle;
            break;
        case 'z':
            planeMesh.rotation.z -= rotationAngle;
            break;
    }

    return TweenMax.to(planeMesh.rotation, duration, {
        x: targetRotation.x,
        y: targetRotation.y,
        z: targetRotation.z,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates plane material properties (opacity, color)
 * @param {THREE.Mesh} planeMesh - The plane mesh
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {number} options.fromOpacity - Initial opacity (default: 0)
 * @param {number} options.toOpacity - Final opacity, null to use current (default: null)
 * @param {number|string} options.fromColor - Initial color (default: null)
 * @param {number|string} options.toColor - Final color (default: null)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function animatePlaneMaterial(planeMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = null, // Use current opacity if not specified
        fromColor = null,
        toColor = null,
        onComplete = null
    } = options;

    const timeline = new TimelineMax({ onComplete: onComplete });

    // Ensure material is transparent if animating opacity
    if (toOpacity !== null) {
        planeMesh.material.transparent = true;
        planeMesh.material.opacity = fromOpacity;

        timeline.to(planeMesh.material, duration, {
            opacity: toOpacity || planeMesh.material.opacity,
            ease: ease
        }, 0);
    }

    // Animate color if specified
    if (fromColor && toColor) {
        const startColor = new THREE.Color(fromColor);
        const endColor = new THREE.Color(toColor);

        planeMesh.material.color.copy(startColor);

        timeline.to(planeMesh.material.color, duration, {
            r: endColor.r,
            g: endColor.g,
            b: endColor.b,
            ease: ease
        }, 0);
    }

    return timeline;
}

/**
 * Fade in animation for planes
 * @param {THREE.Mesh} planeMesh - The plane mesh
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 0.5)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {number} options.fromOpacity - Initial opacity (default: 0)
 * @param {number} options.toOpacity - Final opacity (default: 0.3)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInPlane(planeMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = 0.3, // Default plane opacity
        onComplete = null
    } = options;

    // Ensure material is transparent
    planeMesh.material.transparent = true;
    planeMesh.material.opacity = fromOpacity;

    return TweenMax.to(planeMesh.material, duration, {
        opacity: toOpacity,
        ease: ease,
        onComplete: onComplete
    });
}
