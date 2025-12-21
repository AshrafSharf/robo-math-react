/**
 * scale_animator.js
 * Generic scale animation for 3D shapes
 * Works with any shape type via getScaledState/createShape callbacks
 *
 * GSAP 2 syntax: TweenMax.to(target, duration, {props})
 */

import { TweenMax } from 'gsap';

/**
 * Animates a shape scaling from original size to target size
 * Creates new shape each frame, removes old one
 *
 * @param {Function} getScaledState - (progress) => state object for shape at that progress (0-1)
 * @param {Function} createShape - (state) => THREE.Object3D - creates shape from state
 * @param {THREE.Scene|THREE.Group} parent - Parent to add/remove shapes from
 * @param {Object} options - Animation options
 * @returns {Object} { getFinalShape: () => THREE.Object3D }
 */
export function animateScale(getScaledState, createShape, parent, options = {}) {
    const {
        duration = 2,
        ease = "Power2.easeInOut",
        onComplete = null
    } = options;

    const animState = { progress: 0 };
    let currentShape = null;
    let finalShape = null;

    TweenMax.to(animState, duration, {
        progress: 1,
        ease: ease,
        onUpdate: () => {
            // Remove previous frame's shape
            if (currentShape && parent) {
                parent.remove(currentShape);
            }

            // Get scaled state at current progress
            const state = getScaledState(animState.progress);

            // Create new shape at scaled position
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

            // Create final shape at exact final scale
            const finalState = getScaledState(1);
            finalShape = createShape(finalState);
            if (parent) {
                parent.add(finalShape);
            }

            if (onComplete) onComplete(finalShape);
        }
    });

    return { getFinalShape: () => finalShape };
}
