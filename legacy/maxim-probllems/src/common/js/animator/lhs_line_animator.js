/**
 * lhs_line_animator.js
 * GSAP animation methods for line objects from lhs_line.js
 */

import { gsap } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a thinLine drawing effect by interpolating from start to end
 * @param {THREE.Line} lineObj - The thin line object created by thinLine()
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateThinLine(lineObj, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    // Get the positions buffer
    const positions = lineObj.geometry.attributes.position.array;
    
    // Store original positions if not already stored
    if (!lineObj.geometry.userData.originalPositions) {
        lineObj.geometry.userData.originalPositions = Float32Array.from(positions);
    }
    const originalPositions = lineObj.geometry.userData.originalPositions;
    
    // Get the end position from stored original
    const endX = originalPositions[3];
    const endY = originalPositions[4];
    const endZ = originalPositions[5];
    
    // Collapse to start point initially
    positions[3] = positions[0];
    positions[4] = positions[1];
    positions[5] = positions[2];
    lineObj.geometry.attributes.position.needsUpdate = true;
    
    // Animate to end position
    const animatedEnd = {
        x: positions[0],
        y: positions[1],
        z: positions[2]
    };
    
    return gsap.to(animatedEnd, {
        x: endX,
        y: endY,
        z: endZ,
        duration: duration,
        ease: ease,
        onUpdate: function() {
            positions[3] = animatedEnd.x;
            positions[4] = animatedEnd.y;
            positions[5] = animatedEnd.z;
            lineObj.geometry.attributes.position.needsUpdate = true;
        },
        onComplete: onComplete
    });
}

/**
 * Animates a line (cylinder) by scaling from zero to full length
 * @param {THREE.Mesh} cylinder - The cylinder mesh created by line()
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateLine(cylinder, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",
        onComplete = null
    } = options;
    
    // Store original scale
    const originalScaleY = cylinder.scale.y;
    
    // Start with zero length
    cylinder.scale.y = 0.001; // Small value to avoid complete disappearance
    
    // Animate to full length
    return gsap.to(cylinder.scale, {
        y: originalScaleY,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates a dashedThickLine with drawing or dashing effects
 * @param {THREE.Line|THREE.Mesh|THREE.Group} lineObj - The line object created by dashedThickLine()
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween|gsap.core.Timeline} GSAP animation object
 */
export function animateDashedThickLine(lineObj, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        animateDash = true,
        onComplete = null
    } = options;
    
    // If it's a Group (from new dashedThickLine with cylinder segments), fade in
    if (lineObj.isGroup) {
        const timeline = gsap.timeline();
        
        // Fade in all children (cylinder segments)
        lineObj.children.forEach((child, index) => {
            if (child.material) {
                const originalOpacity = child.material.opacity || 1;
                child.material.transparent = true;
                child.material.opacity = 0;
                
                timeline.to(child.material, {
                    opacity: originalOpacity,
                    duration: duration * 0.5,
                    ease: ease
                }, index * 0.05); // Slight stagger for visual effect
            }
        });
        
        if (onComplete) {
            timeline.eventCallback("onComplete", onComplete);
        }
        
        return timeline;
    }
    
    // If it's a cylinder (thick line), use scale animation
    if (lineObj.isMesh && lineObj.geometry.type === 'CylinderGeometry') {
        return animateLine(lineObj, options);
    }
    
    // For dashed lines, animate the dash offset for moving effect
    if (lineObj.material && lineObj.material.isDashedLineMaterial && animateDash) {
        const timeline = gsap.timeline();
        
        // Get positions
        const positions = lineObj.geometry.attributes.position.array;
        
        // Store end position
        const endX = positions[3];
        const endY = positions[4];
        const endZ = positions[5];
        
        // Collapse to start
        positions[3] = positions[0];
        positions[4] = positions[1];
        positions[5] = positions[2];
        lineObj.geometry.attributes.position.needsUpdate = true;
        
        const animatedEnd = {
            x: positions[0],
            y: positions[1],
            z: positions[2]
        };
        
        // Draw the line
        timeline.to(animatedEnd, {
            x: endX,
            y: endY,
            z: endZ,
            duration: duration,
            ease: ease,
            onUpdate: function() {
                positions[3] = animatedEnd.x;
                positions[4] = animatedEnd.y;
                positions[5] = animatedEnd.z;
                lineObj.geometry.attributes.position.needsUpdate = true;
                lineObj.computeLineDistances();
            }
        });
        
        // Then animate the dashes
        timeline.to(lineObj.material, {
            dashOffset: -1,
            duration: duration * 0.5,
            ease: "none",
            repeat: -1
        });
        
        if (onComplete) {
            timeline.eventCallback("onComplete", onComplete);
        }
        
        return timeline;
    }
    
    // For regular lines, use thin line animation
    return animateThinLine(lineObj, options);
}

/**
 * Fade in animation for any line type (fallback animation)
 * @param {THREE.Line|THREE.Mesh} lineObj - Any line object
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInLine(lineObj, options = {}) {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    // Store original opacity
    const originalOpacity = lineObj.material.opacity || 1;
    
    // Ensure material is transparent
    lineObj.material.transparent = true;
    lineObj.material.opacity = 0;
    
    return gsap.to(lineObj.material, {
        opacity: originalOpacity,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}