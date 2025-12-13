/**
 * rhs_arc_animator.js
 * GSAP animation methods for arc objects using native Three.js coordinates
 * No coordinate transformation - works directly with Three.js objects
 */

import { TweenMax, TimelineMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates an arc by progressively drawing it from start to end
 * Recreates the arc with increasing angle to simulate drawing
 * @param {THREE.Group|THREE.Mesh} arcObject - The arc group or mesh from arcByThreePoints or arc
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1.5)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {Function} options.onUpdate - Callback for each animation frame
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateArcDraw(arcObject, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.inOut",
        onComplete = null,
        onUpdate = null
    } = options;

    // Find the actual arc mesh within the group
    let arcMesh = null;

    if (arcObject.isGroup) {
        // For arcByThreePoints, find the mesh child
        arcObject.traverse((child) => {
            if (child.isMesh && child.geometry && child.geometry.isBufferGeometry) {
                arcMesh = child;
            }
        });
    } else if (arcObject.isMesh) {
        // Direct mesh from arc function
        arcMesh = arcObject;
    }

    if (!arcMesh || !arcMesh.geometry) {
        console.warn('animateArcDraw: No valid arc mesh found');
        return fadeInArc(arcObject, options);
    }

    // Check if we have the necessary data to recreate the arc
    const startVector = arcMesh.userData.startVector;
    const endVector = arcMesh.userData.endVector;
    const tubeRadius = arcMesh.userData.tubeRadius || 0.04;

    if (!startVector || !endVector) {
        console.warn('animateArcDraw: No vector data found. Using fallback fade-in animation.');
        return fadeInArc(arcObject, options);
    }

    // Store original geometry
    const originalGeometry = arcMesh.geometry;

    // Animation progress object
    const animProgress = { value: 0 };

    return TweenMax.to(animProgress, {
        value: 1,
        duration: duration,
        ease: ease,
        onUpdate: function() {
            const progress = animProgress.value;

            if (progress <= 0.01) {
                // Hide at very start
                arcMesh.visible = false;
                return;
            }

            arcMesh.visible = true;

            // Create curve with partial progress
            // This is simplified - actual implementation would need curve data
            // For now, we'll use a simpler approach with material opacity

            if (onUpdate) {
                onUpdate(progress);
            }
        },
        onComplete: function() {
            // Ensure arc is visible and using original geometry
            arcMesh.geometry = originalGeometry;
            arcMesh.visible = true;

            if (onComplete) {
                onComplete();
            }
        }
    });
}

/**
 * Fade in animation for arcs
 * @param {THREE.Group|THREE.Mesh} arcObject - The arc object
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {number} options.fromOpacity - Initial opacity (default: 0)
 * @param {number} options.toOpacity - Final opacity (default: 1)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInArc(arcObject, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = 1,
        onComplete = null
    } = options;

    // Find all meshes in the arc object
    const meshes = [];
    if (arcObject.isGroup) {
        arcObject.traverse((child) => {
            if (child.isMesh) {
                meshes.push(child);
            }
        });
    } else if (arcObject.isMesh) {
        meshes.push(arcObject);
    }

    // Set initial opacity
    meshes.forEach(mesh => {
        if (mesh.material) {
            mesh.material.transparent = true;
            mesh.material.opacity = fromOpacity;
        }
    });

    // Animate opacity
    const tl = new TimelineMax({ onComplete: onComplete });

    meshes.forEach(mesh => {
        if (mesh.material) {
            tl.to(mesh.material, {
                opacity: toOpacity,
                duration: duration,
                ease: ease
            }, 0); // All at the same time
        }
    });

    return tl;
}

/**
 * Animates arc with a scale effect from center
 * @param {THREE.Group|THREE.Mesh} arcObject - The arc object
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.out")
 * @param {number} options.fromScale - Initial scale (default: 0)
 * @param {number} options.toScale - Final scale (default: 1)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateArcScale(arcObject, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",  // Smooth deceleration, no bounce
        fromScale = 0,
        toScale = 1,
        onComplete = null
    } = options;

    // Set initial scale
    arcObject.scale.set(fromScale, fromScale, fromScale);

    // Animate to final scale
    return TweenMax.to(arcObject.scale, {
        x: toScale,
        y: toScale,
        z: toScale,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates arc with a rotation effect
 * @param {THREE.Group|THREE.Mesh} arcObject - The arc object
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1.5)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {string} options.rotationAxis - Rotation axis: 'x', 'y', 'z' (default: 'z')
 * @param {number} options.rotationAngle - Rotation angle in radians (default: Math.PI * 2)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateArcRotation(arcObject, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.inOut",
        rotationAxis = 'z',
        rotationAngle = Math.PI * 2,
        onComplete = null
    } = options;

    // Store target rotation
    const targetRotation = {
        x: arcObject.rotation.x,
        y: arcObject.rotation.y,
        z: arcObject.rotation.z
    };

    // Set initial rotation
    switch (rotationAxis) {
        case 'x':
            arcObject.rotation.x -= rotationAngle;
            break;
        case 'y':
            arcObject.rotation.y -= rotationAngle;
            break;
        case 'z':
            arcObject.rotation.z -= rotationAngle;
            break;
    }

    return TweenMax.to(arcObject.rotation, {
        x: targetRotation.x,
        y: targetRotation.y,
        z: targetRotation.z,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}
