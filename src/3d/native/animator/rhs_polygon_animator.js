/**
 * rhs_polygon_animator.js
 * GSAP animation methods for polygon objects using native Three.js coordinates
 * No coordinate transformation - works directly with Three.js objects
 */

import { TweenMax, TimelineMax } from 'gsap';

/**
 * Fade in animation for polygons
 * @param {THREE.Mesh|THREE.Group} polygonMesh - The polygon mesh or group created by polygon()
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 0.5)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {number} options.fromOpacity - Initial opacity (default: 0)
 * @param {number} options.toOpacity - Final opacity (default: 0.7)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInPolygon(polygonMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = 0.7,  // Default to semi-transparent
        onComplete = null
    } = options;

    // Make sure the mesh is visible
    polygonMesh.visible = true;

    // Handle both single mesh and group
    const meshes = [];
    if (polygonMesh.type === 'Group') {
        polygonMesh.traverse((child) => {
            // Include both Mesh and LineSegments (for edges)
            if ((child.isMesh || child.isLineSegments) && child.material) {
                meshes.push(child);
            }
        });
    } else if (polygonMesh.isMesh && polygonMesh.material) {
        meshes.push(polygonMesh);
    }

    // Store original opacity and set initial state
    meshes.forEach(mesh => {
        if (mesh.userData.originalOpacity === undefined) {
            mesh.userData.originalOpacity = mesh.material.opacity || toOpacity;
        }
        mesh.material.transparent = true;
        mesh.material.opacity = fromOpacity;
        mesh.material.needsUpdate = true;
    });

    // Create timeline for all meshes
    const tl = new TimelineMax({ onComplete });

    meshes.forEach(mesh => {
        tl.to(mesh.material, {
            opacity: mesh.userData.originalOpacity,
            duration: duration,
            ease: ease
        }, 0); // All at the same time
    });

    return tl;
}

/**
 * Scale animation for polygons
 * @param {THREE.Mesh|THREE.Group} polygonMesh - The polygon mesh or group
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 0.8)
 * @param {string} options.ease - GSAP easing function (default: "back.out(1.4)")
 * @param {number} options.fromScale - Initial scale (default: 0)
 * @param {number} options.toScale - Final scale (default: 1)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePolygonScale(polygonMesh, options = {}) {
    const {
        duration = 0.8,
        ease = "back.out(1.4)",
        fromScale = 0,
        toScale = 1,
        onComplete = null
    } = options;

    // Store original scale
    const originalScale = {
        x: polygonMesh.scale.x,
        y: polygonMesh.scale.y,
        z: polygonMesh.scale.z
    };

    // Set initial scale
    polygonMesh.scale.set(
        originalScale.x * fromScale,
        originalScale.y * fromScale,
        originalScale.z * fromScale
    );

    // Make visible
    polygonMesh.visible = true;

    return TweenMax.to(polygonMesh.scale, {
        x: originalScale.x * toScale,
        y: originalScale.y * toScale,
        z: originalScale.z * toScale,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}
