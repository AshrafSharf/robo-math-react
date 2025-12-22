/**
 * polygon_animator.js
 * GSAP animation methods for 3D polygon objects
 * Animates polygon by scaling from center with optional edge drawing
 */

import { TweenMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a polygon by scaling from center with pen tracking at vertices
 * @param {THREE.Mesh} polygonMesh - The polygon mesh
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1.5)
 * @param {string} options.ease - GSAP easing function
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {PenTracer} options.pen - Optional pen tracer for pen following
 * @param {THREE.Camera} options.camera - Camera for 3D projection
 * @param {HTMLElement} options.canvas - Renderer canvas element
 * @returns {Object} GSAP tween object
 */
export function animatePolygon(polygonMesh, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.out",
        onComplete = null,
        pen = null,
        camera = null,
        canvas = null
    } = options;

    // Ensure material is visible
    if (polygonMesh.material) {
        if (polygonMesh.userData.originalOpacity === undefined) {
            polygonMesh.userData.originalOpacity = polygonMesh.material.opacity || 0.7;
        }
        polygonMesh.material.transparent = true;
        polygonMesh.material.opacity = polygonMesh.userData.originalOpacity;
        polygonMesh.material.visible = true;
        polygonMesh.material.needsUpdate = true;
    }

    polygonMesh.visible = true;

    // Get vertices from geometry for pen tracking
    const vertices = [];
    if (polygonMesh.geometry && polygonMesh.geometry.attributes.position) {
        const positions = polygonMesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            vertices.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
        }
    }

    // Calculate centroid for pen starting position
    const centroid = new THREE.Vector3();
    if (vertices.length > 0) {
        vertices.forEach(v => centroid.add(v));
        centroid.divideScalar(vertices.length);
    }

    // Start from zero scale
    polygonMesh.scale.set(0.01, 0.01, 0.01);

    const startAnimation = () => {
        const animData = { t: 0 };

        TweenMax.to(animData, duration, {
            t: 1,
            ease: ease,
            onUpdate: () => {
                const scale = 0.01 + 0.99 * animData.t;
                polygonMesh.scale.set(scale, scale, scale);

                // Track pen along the perimeter as polygon expands
                if (pen && camera && canvas && vertices.length > 0) {
                    // Calculate which vertex to track based on animation progress
                    const vertexIndex = Math.floor(animData.t * vertices.length) % vertices.length;
                    const vertex = vertices[vertexIndex].clone();

                    // Apply current scale to vertex position relative to centroid
                    vertex.sub(centroid).multiplyScalar(scale).add(centroid);

                    // Apply mesh world transform
                    vertex.applyMatrix4(polygonMesh.matrixWorld);

                    pen.emitFromWorld3D(vertex, camera, canvas);
                }
            },
            onComplete: () => {
                polygonMesh.scale.set(1, 1, 1);
                if (onComplete) onComplete();
            }
        });
    };

    // Move pen to centroid first, then animate
    if (pen && camera && canvas) {
        const worldCentroid = centroid.clone().applyMatrix4(polygonMesh.matrixWorld);
        pen.moveToWorld3D(worldCentroid, camera, canvas, startAnimation);
    } else {
        startAnimation();
    }
}

/**
 * Fade in animation for polygon
 * @param {THREE.Mesh} polygonMesh - The polygon mesh
 * @param {Object} options - Animation options
 * @returns {Object} GSAP tween object
 */
export function fadeInPolygon(polygonMesh, options = {}) {
    const {
        duration = 0.8,
        ease = "power2.inOut",
        onComplete = null
    } = options;

    const originalOpacity = polygonMesh.material?.opacity || 0.7;

    if (polygonMesh.material) {
        polygonMesh.material.transparent = true;
        polygonMesh.material.opacity = 0;
    }

    polygonMesh.visible = true;

    return TweenMax.to(polygonMesh.material, duration, {
        opacity: originalOpacity,
        ease: ease,
        onComplete: onComplete
    });
}
