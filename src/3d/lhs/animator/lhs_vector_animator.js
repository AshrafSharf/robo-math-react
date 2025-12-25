/**
 * lhs_vector_animator.js
 * GSAP animation methods for vector objects from lhs_vector.js
 */

import { TweenMax, TimelineMax, Back } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a vector arrow growing from origin point to target
 * @param {THREE.Group} vectorGroup - The vector group created by vector()
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateVectorGrowth(vectorGroup, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",
        onComplete = null
    } = options;
    
    // Get shaft and cone from the group
    const shaft = vectorGroup.children.find(child => 
        child.geometry && child.geometry.type === 'CylinderGeometry'
    );
    const cone = vectorGroup.children.find(child => 
        child.geometry && child.geometry.type === 'ConeGeometry'
    );
    
    if (!shaft && !cone) {
        // If no shaft or cone found, just fade in the group
        return fadeInVector(vectorGroup, options);
    }
    
    // Animation progress
    const progress = { value: 0 };
    
    // Store original scales and positions if not already stored
    if (shaft && shaft.userData.originalScale === undefined) {
        shaft.userData.originalScale = shaft.scale.y;
    }
    if (cone && !cone.userData.originalPosition) {
        cone.userData.originalPosition = cone.position.clone();
    }
    
    const originalShaftScale = shaft ? (shaft.userData.originalScale || shaft.scale.y) : 1;
    const originalConePosition = cone ? (cone.userData.originalPosition || cone.position).clone() : new THREE.Vector3();
    const shaftPosition = shaft ? shaft.position.clone() : new THREE.Vector3();
    
    // Start with zero length
    if (shaft) {
        shaft.scale.y = 0.001;
    }
    if (cone) {
        cone.position.copy(shaftPosition);
        cone.scale.set(0, 0, 0);
    }
    
    return TweenMax.to(progress, duration, {
        value: 1,
        ease: ease,
        onUpdate: function() {
            if (shaft) {
                shaft.scale.y = progress.value * originalShaftScale;
            }
            if (cone) {
                // Interpolate cone position
                cone.position.lerpVectors(shaftPosition, originalConePosition, progress.value);
                // Scale cone
                const coneScale = Math.min(1, progress.value * 2); // Cone appears faster
                cone.scale.set(coneScale, coneScale, coneScale);
            }
        },
        onComplete: function() {
            // Ensure final state
            if (shaft) shaft.scale.y = originalShaftScale;
            if (cone) {
                cone.position.copy(originalConePosition);
                cone.scale.set(1, 1, 1);
            }
            if (onComplete) onComplete();
        }
    });
}

/**
 * Animates vector components (shaft then head)
 * @param {THREE.Group} vectorGroup - The vector group
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function animateVectorComponents(vectorGroup, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    const timeline = new TimelineMax({ onComplete: onComplete });
    
    // Get shaft and cone
    const shaft = vectorGroup.children.find(child => 
        child.geometry && child.geometry.type === 'CylinderGeometry'
    );
    const cone = vectorGroup.children.find(child => 
        child.geometry && child.geometry.type === 'ConeGeometry'
    );
    
    if (shaft) {
        // Store and animate shaft scale
        const originalScale = shaft.scale.y;
        shaft.scale.y = 0.001;
        timeline.to(shaft.scale, duration * 0.7, {
            y: originalScale,
            ease: ease
        }, 0);
    }

    if (cone) {
        // Animate cone scale with delay
        cone.scale.set(0, 0, 0);
        timeline.to(cone.scale, duration * 0.3, {
            x: 1,
            y: 1,
            z: 1,
            ease: Back.easeOut.config(1.7)
        }, duration * 0.7);
    }
    
    return timeline;
}

/**
 * Animates a vector sliding/translating from one position to another
 * Used for parallel translation animations where a vector moves while maintaining orientation
 * @param {THREE.Group} vectorGroup - The newly created vector group to translate
 * @param {Object} fromPosition - Starting position {x, y, z} (where vector was created)
 * @param {Object} toPosition - Target position {x, y, z} (where vector should move to)
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateParallelTranslation(vectorGroup, fromPosition, toPosition, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        delay = 0,
        onStart = null,
        onComplete = null
    } = options;
    
    // Start vector at the original position (it should already be there from creation)
    vectorGroup.position.set(
        fromPosition.x || 0,
        fromPosition.y || 0,
        fromPosition.z || 0
    );
    
    // Ensure vector is visible
    vectorGroup.visible = true;
    
    // Animate sliding to the new position
    return TweenMax.to(vectorGroup.position, duration, {
        x: toPosition.x || 0,
        y: toPosition.y || 0,
        z: toPosition.z || 0,
        ease: ease,
        delay: delay,
        onStart: onStart,
        onComplete: onComplete
    });
}

/**
 * Animates a vector sliding forward or backward along its direction
 * The vector moves forward (positive scalar) or backward (negative scalar) along its direction
 * @param {THREE.Group} vectorGroup - The vector group to slide
 * @param {number} scalar - The scalar amount to slide (1 = forward by vector length, -1 = backward by vector length)
 * @param {Object} originalPosition - The original position before sliding
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP timeline with sliding and optional return animations
 */
export function animateSlideAlongDirection(vectorGroup, scalar, originalPosition, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        returnToOriginal = true,
        pauseDuration = 0.5,
        onComplete = null
    } = options;
    
    // Get vector direction from userData
    const start = vectorGroup.userData?.start || {x: 0, y: 0, z: 0};
    const end = vectorGroup.userData?.end || {x: 1, y: 1, z: 1};
    
    // Calculate direction vector
    const direction = {
        x: end.x - start.x,
        y: end.y - start.y,
        z: end.z - start.z
    };
    
    // Calculate slide offset
    const slideOffset = {
        x: direction.x * scalar,
        y: direction.y * scalar,
        z: direction.z * scalar
    };
    
    // Calculate target position
    const targetPosition = {
        x: (originalPosition?.x || vectorGroup.position.x) + slideOffset.x,
        y: (originalPosition?.y || vectorGroup.position.y) + slideOffset.y,
        z: (originalPosition?.z || vectorGroup.position.z) + slideOffset.z
    };
    
    const timeline = new TimelineMax({ onComplete });
    
    // Slide to target position
    timeline.to(vectorGroup.position, duration, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        ease: ease
    });

    // Optionally return to original position
    if (returnToOriginal) {
        timeline.to(vectorGroup.position, duration, {
            x: originalPosition?.x || 0,
            y: originalPosition?.y || 0,
            z: originalPosition?.z || 0,
            ease: ease,
            delay: pauseDuration
        });
    }
    
    return timeline;
}

/**
 * Fade in animation for vectors (fallback animation)
 * @param {THREE.Group} vectorGroup - The vector group
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function fadeInVector(vectorGroup, options = {}) {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    const timeline = new TimelineMax({ onComplete: onComplete });
    
    // Animate all meshes in the group
    vectorGroup.children.forEach(child => {
        if (child.material) {
            const originalOpacity = child.material.opacity || 1;
            child.material.transparent = true;
            child.material.opacity = 0;

            timeline.to(child.material, duration, {
                opacity: originalOpacity,
                ease: ease
            }, 0);
        }
    });
    
    return timeline;
}