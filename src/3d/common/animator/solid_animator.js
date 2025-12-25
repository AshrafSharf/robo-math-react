/**
 * solid_animator.js
 * Fade-in animation for 3D solid primitives (sphere, cylinder, cube, etc.)
 */

import { TweenMax, TimelineMax, Power2, Back } from 'gsap';

/**
 * Fade in a solid mesh from opacity 0 to target opacity
 * @param {THREE.Mesh} mesh - The mesh to animate
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration in seconds (default: 0.5)
 * @param {number} options.targetOpacity - Final opacity (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {Object} GSAP tween
 */
export function fadeInSolid(mesh, options = {}) {
    const {
        duration = 0.5,
        targetOpacity = 1,
        ease = Power2.easeInOut,
        onComplete
    } = options;

    if (!mesh) {
        if (onComplete) onComplete();
        return null;
    }

    // Handle Group objects (may have multiple meshes)
    if (mesh.type === 'Group') {
        return fadeInGroup(mesh, options);
    }

    // Handle single mesh
    if (mesh.material) {
        mesh.material.transparent = true;
        mesh.material.opacity = 0;
        mesh.visible = true;

        return TweenMax.to(mesh.material, duration, {
            opacity: targetOpacity,
            ease,
            onComplete
        });
    }

    if (onComplete) onComplete();
    return null;
}

/**
 * Fade in a group of meshes
 * @param {THREE.Group} group - The group to animate
 * @param {Object} options - Animation options
 * @returns {Object} GSAP timeline
 */
export function fadeInGroup(group, options = {}) {
    const {
        duration = 2,
        targetOpacity = 1,
        ease = Power2.easeInOut,
        onComplete
    } = options;

    if (!group) {
        if (onComplete) onComplete();
        return null;
    }

    group.visible = true;

    // Collect all materials from children
    const materials = [];
    group.traverse((child) => {
        if (child.material) {
            child.material.transparent = true;
            child.material.opacity = 0;
            materials.push(child.material);
        }
    });

    if (materials.length === 0) {
        if (onComplete) onComplete();
        return null;
    }

    // Animate all materials together
    const timeline = new TimelineMax({ onComplete });

    materials.forEach((material) => {
        timeline.to(material, duration, {
            opacity: targetOpacity,
            ease
        }, 0); // All start at the same time
    });

    return timeline;
}

/**
 * Scale in a solid mesh from 0 to full size
 * @param {THREE.Mesh} mesh - The mesh to animate
 * @param {Object} options - Animation options
 * @returns {Object} GSAP tween
 */
export function scaleInSolid(mesh, options = {}) {
    const {
        duration = 0.5,
        ease = Back.easeOut.config(1.7),
        onComplete
    } = options;

    if (!mesh) {
        if (onComplete) onComplete();
        return null;
    }

    // Store original scale
    const originalScale = {
        x: mesh.scale.x,
        y: mesh.scale.y,
        z: mesh.scale.z
    };

    // Start from zero
    mesh.scale.set(0.001, 0.001, 0.001);
    mesh.visible = true;

    return TweenMax.to(mesh.scale, duration, {
        x: originalScale.x,
        y: originalScale.y,
        z: originalScale.z,
        ease,
        onComplete
    });
}
