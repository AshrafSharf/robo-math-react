/**
 * arc_animator.js
 * Generic arc animation for 3D shape rotation
 * Works with any shape type via getRotatedState/createShape callbacks
 *
 * GSAP 2 syntax: TweenMax.to(target, duration, {props})
 */

import { TweenMax } from 'gsap';

/**
 * Animates a shape rotating along an arc path
 * Creates new shape each frame, removes old one
 *
 * @param {Function} getRotatedState - (currentAngle) => state object for shape at that angle
 * @param {Function} createShape - (state) => THREE.Object3D - creates shape from state
 * @param {number} targetAngle - Final rotation angle in degrees
 * @param {THREE.Scene|THREE.Group} parent - Parent to add/remove shapes from
 * @param {Object} options - Animation options
 * @returns {Object} { getFinalShape: () => THREE.Object3D }
 */
export function animateArc(getRotatedState, createShape, targetAngle, parent, options = {}) {
    const {
        duration = 2,
        ease = "Power2.easeInOut",
        onComplete = null
    } = options;

    const animState = { angle: 0 };
    let currentShape = null;
    let finalShape = null;

    TweenMax.to(animState, duration, {
        angle: targetAngle,
        ease: ease,
        onUpdate: () => {
            // Remove previous frame's shape
            if (currentShape && parent) {
                parent.remove(currentShape);
            }

            // Get rotated state at current angle
            const state = getRotatedState(animState.angle);

            // Create new shape at rotated position
            currentShape = createShape(state);
            if (parent) {
                parent.add(currentShape);
            }
        },
        onComplete: () => {
            // Remove last intermediate shape
            if (currentShape && parent) {
                parent.remove(currentShape);
            }

            // Create final shape at exact final angle
            const finalState = getRotatedState(targetAngle);
            finalShape = createShape(finalState);
            if (parent) {
                parent.add(finalShape);
            }

            if (onComplete) onComplete(finalShape);
        }
    });

    return { getFinalShape: () => finalShape };
}
