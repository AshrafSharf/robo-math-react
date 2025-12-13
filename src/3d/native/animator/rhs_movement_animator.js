/**
 * rhs_movement_animator.js
 * GSAP animation methods for movement and transformation using native Three.js coordinates
 * No coordinate transformation - works directly with Three.js objects
 */

import { TweenMax, TimelineMax } from 'gsap';
import { fadeInLabel } from './rhs_label_animator.js';

/**
 * Animates a vector moving from its original position to a target position
 * @param {THREE.Group} vectorGroup - The vector group to animate
 * @param {Object} fromPos - Starting position {x, y, z} in Three.js coordinates
 * @param {Object} toPos - Target position {x, y, z} in Three.js coordinates
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} The GSAP tween
 */
export function animateVectorMovement(vectorGroup, fromPos, toPos, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        onComplete = null
    } = options;

    // Set initial position
    vectorGroup.position.set(
        fromPos.x || 0,
        fromPos.y || 0,
        fromPos.z || 0
    );

    // Animate to target position
    return TweenMax.to(vectorGroup.position, {
        x: toPos.x || 0,
        y: toPos.y || 0,
        z: toPos.z || 0,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates the creation of a reversed vector (flipped direction)
 * @param {THREE.Group} reversedVector - The reversed vector group
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.out")
 * @param {Object} options.position - Position to place the vector {x, y, z}
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} The GSAP tween
 */
export function animateReverseVectorCreation(reversedVector, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",
        onComplete = null,
        position = null
    } = options;

    // If position is provided, set it directly (no transformation needed in RHS)
    if (position) {
        reversedVector.position.set(
            position.x || 0,
            position.y || 0,
            position.z || 0
        );
    }

    // Start with scale at 0 and grow to show the flip animation
    reversedVector.scale.set(0, 0, 0);

    return TweenMax.to(reversedVector.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: duration,
        ease: ease,
        onComplete: () => {
            // Show label after animation
            if (reversedVector.label) {
                reversedVector.label.visible = true;
                fadeInLabel(reversedVector.label, { duration: duration * 0.3 });
            }

            if (onComplete) {
                onComplete(reversedVector);
            }
        }
    });
}

/**
 * Animates a vector sliding forward or backward along its direction
 * @param {THREE.Group} vectorGroup - The vector group to animate
 * @param {Object} start - Start point of vector in Three.js coordinates {x, y, z}
 * @param {Object} end - End point of vector in Three.js coordinates {x, y, z}
 * @param {number} scalar - Amount to slide (positive = forward, negative = backward)
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {boolean} options.returnToOriginal - Whether to return to original position (default: true)
 * @param {number} options.pauseDuration - Pause duration before returning (default: 0.5)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Timeline} The GSAP timeline
 */
export function animateVectorSlide(vectorGroup, start, end, scalar, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        returnToOriginal = true,
        pauseDuration = 0.5,
        onComplete = null
    } = options;

    // Calculate direction in Three.js coordinates (no transformation needed)
    const direction = {
        x: (end.x || 0) - (start.x || 0),
        y: (end.y || 0) - (start.y || 0),
        z: (end.z || 0) - (start.z || 0)
    };

    // Calculate slide offset
    const slideOffset = {
        x: direction.x * scalar,
        y: direction.y * scalar,
        z: direction.z * scalar
    };

    // Store original position
    const originalPosition = {
        x: vectorGroup.position.x,
        y: vectorGroup.position.y,
        z: vectorGroup.position.z
    };

    // Create timeline
    const timeline = new TimelineMax({ onComplete });

    // Slide to target position
    timeline.to(vectorGroup.position, {
        x: originalPosition.x + slideOffset.x,
        y: originalPosition.y + slideOffset.y,
        z: originalPosition.z + slideOffset.z,
        duration: duration,
        ease: ease
    });

    // Optionally return to original position
    if (returnToOriginal) {
        timeline.to(vectorGroup.position, {
            x: originalPosition.x,
            y: originalPosition.y,
            z: originalPosition.z,
            duration: duration,
            ease: ease,
            delay: pauseDuration
        });
    }

    return timeline;
}
