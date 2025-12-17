/**
 * vector_animator.js
 * Common GSAP animation methods for vector (arrow) objects
 * Works with both LHS and RHS coordinate systems (animation is in Three.js space)
 */

import { TweenMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a vector (arrow) growing from start point to end point
 * The shaft grows while the cone (arrowhead) follows the tip
 *
 * @param {THREE.Group} vectorGroup - The vector group containing shaft (cylinder) and cone
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {PenTracer} options.pen - Optional pen tracer for pen following
 * @param {THREE.Camera} options.camera - Camera for 3D projection
 * @param {HTMLElement} options.canvas - Renderer canvas element
 * @returns {Object} GSAP tween object
 */
export function animateVector(vectorGroup, options = {}) {
    const {
        duration = 1,
        ease = "Power2.easeOut",
        onComplete = null,
        pen = null,
        camera = null,
        canvas = null
    } = options;

    // Find shaft (cylinder) and cone (arrowhead) in the group
    const shaft = vectorGroup.children.find(child =>
        child.geometry && child.geometry.type === 'CylinderGeometry' &&
        child.geometry.parameters.radiusTop === child.geometry.parameters.radiusBottom
    );
    const cone = vectorGroup.children.find(child =>
        child.geometry && child.geometry.type === 'ConeGeometry'
    );

    if (!shaft) {
        // Fallback: just fade in
        if (onComplete) onComplete();
        return;
    }

    // Store original state
    const originalShaftPosition = shaft.position.clone();
    const originalShaftScaleY = shaft.scale.y;
    const originalConePosition = cone ? cone.position.clone() : null;
    const originalConeScale = cone ? cone.scale.clone() : null;

    // Get shaft direction (local Y axis after rotation)
    const direction = new THREE.Vector3(0, 1, 0);
    direction.applyQuaternion(shaft.quaternion);

    // Calculate half length of shaft
    const halfLength = shaft.geometry.parameters.height / 2;

    // Calculate start and end positions
    const startPosition = originalShaftPosition.clone().sub(direction.clone().multiplyScalar(halfLength));
    const endPosition = originalShaftPosition.clone().add(direction.clone().multiplyScalar(halfLength));

    // Set initial state: shaft at start position with zero scale
    shaft.position.copy(startPosition);
    shaft.scale.y = 0.001;

    // Hide cone initially, position at start
    if (cone) {
        cone.position.copy(startPosition);
        cone.scale.set(0, 0, 0);
    }

    const startDrawing = () => {
        const animData = { t: 0 };

        TweenMax.to(animData, duration, {
            t: 1,
            ease: ease,
            onUpdate: () => {
                // Animate shaft: move position toward midpoint AND scale up
                shaft.position.lerpVectors(startPosition, originalShaftPosition, animData.t);
                shaft.scale.y = 0.001 + (originalShaftScaleY - 0.001) * animData.t;

                // Calculate current tip position
                const currentTip = startPosition.clone().add(
                    direction.clone().multiplyScalar(halfLength * 2 * animData.t)
                );

                // Animate cone: follow tip and scale in
                if (cone && originalConePosition) {
                    // Cone should be at the current tip
                    cone.position.copy(currentTip);

                    // Scale cone in during the last 30% of animation
                    const coneProgress = Math.max(0, (animData.t - 0.7) / 0.3);
                    cone.scale.set(coneProgress, coneProgress, coneProgress);
                }

                // Emit pen position at current tip
                if (pen && camera && canvas) {
                    pen.emitFromWorld3D(currentTip, camera, canvas);
                }
            },
            onComplete: () => {
                // Ensure final state
                shaft.position.copy(originalShaftPosition);
                shaft.scale.y = originalShaftScaleY;
                if (cone && originalConePosition && originalConeScale) {
                    cone.position.copy(originalConePosition);
                    cone.scale.copy(originalConeScale);
                }
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
 * Fade in animation for vector
 * @param {THREE.Group} vectorGroup - The vector group
 * @param {Object} options - Animation options
 * @returns {Object} GSAP tween object
 */
export function fadeInVector(vectorGroup, options = {}) {
    const {
        duration = 0.5,
        ease = "Power2.easeInOut",
        onComplete = null
    } = options;

    // Animate all meshes in the group
    vectorGroup.children.forEach(child => {
        if (child.material) {
            const originalOpacity = child.material.opacity || 1;
            child.material.transparent = true;
            child.material.opacity = 0;

            TweenMax.to(child.material, duration, {
                opacity: originalOpacity,
                ease: ease
            });
        }
    });

    // Call onComplete after duration
    if (onComplete) {
        setTimeout(onComplete, duration * 1000);
    }
}
