/**
 * line_animator.js
 * Common GSAP animation methods for line objects
 * Works with both LHS and RHS coordinate systems (animation is in Three.js space)
 */

import { TweenMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a thinLine drawing effect by interpolating from start to end
 * @param {THREE.Line} lineObj - The thin line object
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {PenTracer} options.pen - Optional pen tracer for pen following
 * @param {THREE.Camera} options.camera - Camera for 3D projection
 * @param {HTMLElement} options.canvas - Renderer canvas element
 * @returns {Object} GSAP tween object
 */
export function animateThinLine(lineObj, options = {}) {
    const {
        duration = 1,
        ease = "Power2.easeInOut",
        onComplete = null,
        pen = null,
        camera = null,
        canvas = null
    } = options;

    const positions = lineObj.geometry.attributes.position.array;

    // Store original positions if not already stored
    if (!lineObj.geometry.userData.originalPositions) {
        lineObj.geometry.userData.originalPositions = Float32Array.from(positions);
    }
    const originalPositions = lineObj.geometry.userData.originalPositions;

    // Get start and end positions
    const startVec3 = new THREE.Vector3(positions[0], positions[1], positions[2]);
    const endVec3 = new THREE.Vector3(originalPositions[3], originalPositions[4], originalPositions[5]);

    // Collapse to start point initially
    positions[3] = positions[0];
    positions[4] = positions[1];
    positions[5] = positions[2];
    lineObj.geometry.attributes.position.needsUpdate = true;

    const startDrawing = () => {
        // Animate to end position
        const animatedEnd = {
            x: positions[0],
            y: positions[1],
            z: positions[2]
        };

        TweenMax.to(animatedEnd, duration, {
            x: endVec3.x,
            y: endVec3.y,
            z: endVec3.z,
            ease: ease,
            onUpdate: function() {
                positions[3] = animatedEnd.x;
                positions[4] = animatedEnd.y;
                positions[5] = animatedEnd.z;
                lineObj.geometry.attributes.position.needsUpdate = true;

                // Emit pen position at current drawing point
                if (pen && camera && canvas) {
                    const currentPos = new THREE.Vector3(animatedEnd.x, animatedEnd.y, animatedEnd.z);
                    pen.emitFromWorld3D(currentPos, camera, canvas);
                }
            },
            onComplete: onComplete
        });
    };

    // Move pen to start position first, then draw
    if (pen && camera && canvas) {
        pen.moveToWorld3D(startVec3, camera, canvas, startDrawing);
    } else {
        startDrawing();
    }
}

/**
 * Animates a line (cylinder) drawing from start to end
 *
 * Math:
 *   - Cylinder is centered at midpoint with full length
 *   - Move to start position, set scale to 0
 *   - Animate position toward midpoint AND scale up together
 *   - Creates illusion of line drawing from start to end
 *
 * @param {THREE.Mesh} cylinder - The cylinder mesh
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {PenTracer} options.pen - Optional pen tracer for pen following
 * @param {THREE.Camera} options.camera - Camera for 3D projection
 * @param {HTMLElement} options.canvas - Renderer canvas element
 * @returns {Object} GSAP tween object
 */
export function animateLine(cylinder, options = {}) {
    const {
        duration = 1,
        ease = "Power2.easeOut",
        onComplete = null,
        pen = null,
        camera = null,
        canvas = null
    } = options;

    // Store original state (cylinder is at midpoint with full length)
    const originalPosition = cylinder.position.clone();
    const originalScaleY = cylinder.scale.y;

    // Get the cylinder's local Y axis (the direction it points)
    const direction = new THREE.Vector3(0, 1, 0);
    direction.applyQuaternion(cylinder.quaternion);

    // Calculate half the length (distance from midpoint to start)
    const geometry = cylinder.geometry;
    const halfLength = geometry.parameters.height / 2;

    // Start position: move cylinder to the start point
    const startPosition = originalPosition.clone().sub(direction.clone().multiplyScalar(halfLength));

    // End position: the tip of the line at full length
    const endPosition = originalPosition.clone().add(direction.clone().multiplyScalar(halfLength));

    // Set initial state: at start position, zero scale
    cylinder.position.copy(startPosition);
    cylinder.scale.y = 0.001;

    const startDrawing = () => {
        // Animate: move position toward midpoint AND scale up together
        const animData = { t: 0 };

        TweenMax.to(animData, duration, {
            t: 1,
            ease: ease,
            onUpdate: () => {
                cylinder.position.lerpVectors(startPosition, originalPosition, animData.t);
                cylinder.scale.y = 0.001 + (originalScaleY - 0.001) * animData.t;

                // Emit pen position at current tip of the line
                if (pen && camera && canvas) {
                    // Calculate current tip position: start + direction * currentLength
                    const currentTip = startPosition.clone().add(
                        direction.clone().multiplyScalar(halfLength * 2 * animData.t)
                    );
                    pen.emitFromWorld3D(currentTip, camera, canvas);
                }
            },
            onComplete: () => {
                cylinder.position.copy(originalPosition);
                cylinder.scale.y = originalScaleY;
                if (onComplete) onComplete();
            }
        });
    };

    // Move pen to start position first, then draw
    if (pen && camera && canvas) {
        pen.moveToWorld3D(startPosition, camera, canvas, startDrawing);
    } else {
        startDrawing();
    }
}

/**
 * Fade in animation for any line type
 * @param {THREE.Line|THREE.Mesh} lineObj - Any line object
 * @param {Object} options - Animation options
 * @returns {Object} GSAP tween object
 */
export function fadeInLine(lineObj, options = {}) {
    const {
        duration = 0.5,
        ease = "Power2.easeInOut",
        onComplete = null
    } = options;

    const originalOpacity = lineObj.material.opacity || 1;

    lineObj.material.transparent = true;
    lineObj.material.opacity = 0;

    return TweenMax.to(lineObj.material, duration, {
        opacity: originalOpacity,
        ease: ease,
        onComplete: onComplete
    });
}
