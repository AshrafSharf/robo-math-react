/**
 * native_animators.js
 * Simple animation functions for native geometry objects
 */

import { TweenMax, TimelineMax } from 'gsap';

/**
 * Fade in animation for any mesh with material
 * @param {THREE.Mesh} mesh - The mesh to fade in
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInMesh(mesh, options = {}) {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = null,
        onComplete = null
    } = options;
    
    // Get target opacity
    const targetOpacity = toOpacity !== null ? toOpacity : 
        (mesh.userData.originalOpacity || mesh.material.opacity || 1);
    
    // Ensure material is transparent
    if (mesh.material) {
        mesh.material.transparent = true;
        mesh.material.opacity = fromOpacity;
    }
    mesh.visible = true;
    
    return TweenMax.to(mesh.material, duration, {
        opacity: targetOpacity,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Grow animation for lines (tube geometry)
 * @param {THREE.Mesh} lineMesh - The line mesh to animate
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function growLine(lineMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",
        onComplete = null
    } = options;
    
    // Scale from 0 to 1 along the line direction
    lineMesh.scale.set(0.01, 0.01, 0.01);
    lineMesh.visible = true;
    
    return TweenMax.to(lineMesh.scale, duration, {
        x: 1,
        y: 1,
        z: 1,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Trace animation for tube geometries (progressive drawing using scale)
 * @param {THREE.Mesh} tubeMesh - The tube mesh to animate
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP timeline object
 */
export function traceTube(tubeMesh, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    // Make mesh visible
    tubeMesh.visible = true;
    
    // Create a timeline for sequential animations
    const timeline = new TimelineMax({ onComplete });
    
    // First, set initial scale to almost nothing along one axis
    // This creates a "drawing" effect when we scale it back
    tubeMesh.scale.set(0.001, 1, 1);
    tubeMesh.material.transparent = true;
    tubeMesh.material.opacity = 0;
    
    // Fade in quickly
    timeline.to(tubeMesh.material, duration * 0.2, {
        opacity: 1,
        ease: "power2.in"
    })
    // Then scale along x-axis to create drawing effect
    .to(tubeMesh.scale, duration * 0.8, {
        x: 1,
        ease: ease
    }, "-=0.1");  // Slight overlap with fade
    
    return timeline;
}