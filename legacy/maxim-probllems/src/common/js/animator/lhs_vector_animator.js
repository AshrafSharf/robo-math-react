/**
 * lhs_vector_animator.js
 * GSAP animation methods for vector objects from lhs_vector.js
 */

import { gsap } from 'gsap';
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
    
    return gsap.to(progress, {
        value: 1,
        duration: duration,
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
    
    const timeline = gsap.timeline({ onComplete: onComplete });
    
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
        timeline.to(shaft.scale, {
            y: originalScale,
            duration: duration * 0.7,
            ease: ease
        }, 0);
    }
    
    if (cone) {
        // Animate cone scale with delay
        cone.scale.set(0, 0, 0);
        timeline.to(cone.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration * 0.3,
            ease: "back.out(1.7)"
        }, duration * 0.7);
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
    
    const timeline = gsap.timeline({ onComplete: onComplete });
    
    // Animate all meshes in the group
    vectorGroup.children.forEach(child => {
        if (child.material) {
            const originalOpacity = child.material.opacity || 1;
            child.material.transparent = true;
            child.material.opacity = 0;
            
            timeline.to(child.material, {
                opacity: originalOpacity,
                duration: duration,
                ease: ease
            }, 0);
        }
    });
    
    return timeline;
}