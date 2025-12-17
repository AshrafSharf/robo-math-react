/**
 * vector_slide_animator.js
 * Common GSAP animation methods for sliding vectors forward/backward
 * Works with both LHS and RHS coordinate systems
 *
 * GSAP 2 syntax: TweenMax.to(target, duration, {props})
 */

import { TweenMax } from 'gsap';

/**
 * Animates a vector sliding from original position to final position
 * Creates new vector each frame, removes old one
 *
 * @param {Object} fromStart - Original start point {x, y, z}
 * @param {Object} fromEnd - Original end point {x, y, z}
 * @param {Object} toStart - Final start point {x, y, z}
 * @param {Object} toEnd - Final end point {x, y, z}
 * @param {Function} createVector - Function to create vector: (start, end) => THREE.Group
 * @param {THREE.Scene|THREE.Group} parent - Parent to add/remove vectors from
 * @param {Object} options - Animation options
 * @returns {Object} { finalVector, tween }
 */
export function animateVectorSlide(fromStart, fromEnd, toStart, toEnd, createVector, parent, options = {}) {
    const {
        duration = 2,
        ease = "Power2.easeInOut",
        onComplete = null
    } = options;

    const animState = { progress: 0 };
    let currentVector = null;
    let finalVector = null;

    TweenMax.to(animState, duration, {
        progress: 1,
        ease: ease,
        onUpdate: () => {
            const t = animState.progress;

            // Remove previous frame's vector
            if (currentVector && parent) {
                parent.remove(currentVector);
            }

            // Interpolate start and end points
            const currentStart = {
                x: fromStart.x + (toStart.x - fromStart.x) * t,
                y: fromStart.y + (toStart.y - fromStart.y) * t,
                z: fromStart.z + (toStart.z - fromStart.z) * t
            };
            const currentEnd = {
                x: fromEnd.x + (toEnd.x - fromEnd.x) * t,
                y: fromEnd.y + (toEnd.y - fromEnd.y) * t,
                z: fromEnd.z + (toEnd.z - fromEnd.z) * t
            };

            // Create new vector at interpolated position
            currentVector = createVector(currentStart, currentEnd);
            if (parent) {
                parent.add(currentVector);
            }
        },
        onComplete: () => {
            // Remove last intermediate vector
            if (currentVector && parent) {
                parent.remove(currentVector);
            }

            // Create final vector at exact final position
            finalVector = createVector(toStart, toEnd);
            if (parent) {
                parent.add(finalVector);
            }

            if (onComplete) onComplete(finalVector);
        }
    });

    return { getFinalVector: () => finalVector };
}
