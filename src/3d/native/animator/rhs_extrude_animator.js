/**
 * rhs_extrude_animator.js
 * GSAP animation methods for box product (scalar triple product) volumes using native Three.js coordinates
 * No coordinate transformation - works directly with Three.js objects
 */

import { TweenMax, TimelineMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates the box product volume by extruding from the base parallelogram
 * Shows how the volume is formed by extending the parallelogram along the third vector
 * @param {THREE.Group} volumeGroup - The volume group from box product creation
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1.5)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {Function} options.onUpdate - Callback for each animation frame
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateBoxProduct(volumeGroup, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.inOut",
        onUpdate = null,
        onComplete = null
    } = options;

    // Get the mesh from the group
    const mesh = volumeGroup.children.find(child => child instanceof THREE.Mesh);

    if (!mesh) {
        console.warn('No mesh found in volume group');
        return;
    }

    // Get stored metadata (vectors should already be in Three.js coordinates)
    const { vectorA, vectorB, vectorC } = volumeGroup.userData;

    if (!vectorA || !vectorB || !vectorC) {
        console.warn('Vector data not found in volume group userData');
        return;
    }

    // Store original geometry
    const geometry = mesh.geometry;
    const positionAttribute = geometry.attributes.position;
    const originalPositions = positionAttribute.array.slice();

    // Animation state
    const animationState = { progress: 0 };

    // Set initial state (collapsed to base parallelogram)
    // For scalar triple product, we animate from the B×C base
    collapseToBase(geometry, originalPositions, vectorA, vectorB, vectorC);

    return TweenMax.to(animationState, {
        progress: 1,
        duration: duration,
        ease: ease,
        onUpdate: () => {
            // Update vertex positions based on progress
            const positions = positionAttribute.array;

            // For scalar triple product: animate along vector A
            // Base parallelogram is formed by B and C at origin
            // Top face is the base translated by vector A

            // Bottom vertices stay at B×C base: 0(origin), 2(B), 4(C), 6(B+C)
            // Top vertices move along A: 1(A), 3(A+B), 5(A+C), 7(A+B+C)
            const movingVertices = [1, 3, 5, 7];
            const basePositions = [
                [0, 0, 0],  // Vertex 1 starts from origin
                [vectorB.x, vectorB.y, vectorB.z],  // Vertex 3 starts from B
                [vectorC.x, vectorC.y, vectorC.z],  // Vertex 5 starts from C
                [vectorB.x + vectorC.x, vectorB.y + vectorC.y, vectorB.z + vectorC.z]  // Vertex 7 starts from B+C
            ];

            for (let i = 0; i < movingVertices.length; i++) {
                const vertexIdx = movingVertices[i] * 3;
                const base = basePositions[i];

                // Interpolate along A vector from base position
                positions[vertexIdx] = base[0] + vectorA.x * animationState.progress;
                positions[vertexIdx + 1] = base[1] + vectorA.y * animationState.progress;
                positions[vertexIdx + 2] = base[2] + vectorA.z * animationState.progress;
            }

            positionAttribute.needsUpdate = true;
            geometry.computeVertexNormals();

            // Update edges if they exist
            const edges = volumeGroup.children.find(child => child instanceof THREE.LineSegments);
            if (edges) {
                edges.geometry.dispose();
                edges.geometry = new THREE.EdgesGeometry(geometry);
            }

            if (onUpdate) onUpdate(animationState.progress);
        },
        onComplete: () => {
            // Restore full geometry
            const positions = positionAttribute.array;
            for (let i = 0; i < positions.length; i++) {
                positions[i] = originalPositions[i];
            }
            positionAttribute.needsUpdate = true;
            geometry.computeVertexNormals();

            // Update edges one final time
            const edges = volumeGroup.children.find(child => child instanceof THREE.LineSegments);
            if (edges) {
                edges.geometry.dispose();
                edges.geometry = new THREE.EdgesGeometry(geometry);
            }

            if (onComplete) onComplete();
        }
    });
}

/**
 * Collapses the box geometry to its base parallelogram
 * @param {THREE.BufferGeometry} geometry - The geometry to collapse
 * @param {Float32Array} originalPositions - Original vertex positions
 * @param {Object} vectorA - The A vector (extrusion direction) {x, y, z}
 * @param {Object} vectorB - The B vector (base edge 1) {x, y, z}
 * @param {Object} vectorC - The C vector (base edge 2) {x, y, z}
 */
function collapseToBase(geometry, originalPositions, vectorA, vectorB, vectorC) {
    const positionAttribute = geometry.attributes.position;
    const positions = positionAttribute.array;

    // Copy original positions
    for (let i = 0; i < positions.length; i++) {
        positions[i] = originalPositions[i];
    }

    // For scalar triple product animation:
    // Base parallelogram is formed by B and C vectors
    // Vertices 0, 2, 4, 6 form the base (B×C parallelogram)
    // Vertices 1, 3, 5, 7 need to collapse to the base

    // Vertex mapping for scalar triple product:
    // 1 (A) -> collapses to 0 (origin)
    // 3 (A+B) -> collapses to 2 (B)
    // 5 (A+C) -> collapses to 4 (C)
    // 7 (A+B+C) -> collapses to 6 (B+C)

    // Set moving vertices to their base positions (no A component)
    positions[1*3] = 0;  // Vertex 1 to origin
    positions[1*3 + 1] = 0;
    positions[1*3 + 2] = 0;

    positions[3*3] = vectorB.x;  // Vertex 3 to B
    positions[3*3 + 1] = vectorB.y;
    positions[3*3 + 2] = vectorB.z;

    positions[5*3] = vectorC.x;  // Vertex 5 to C
    positions[5*3 + 1] = vectorC.y;
    positions[5*3 + 2] = vectorC.z;

    positions[7*3] = vectorB.x + vectorC.x;  // Vertex 7 to B+C
    positions[7*3 + 1] = vectorB.y + vectorC.y;
    positions[7*3 + 2] = vectorB.z + vectorC.z;

    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
}

/**
 * Fade in animation for box product volume
 * @param {THREE.Group} volumeGroup - The volume group
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP easing function (default: "power2.inOut")
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInBoxProduct(volumeGroup, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        onComplete = null
    } = options;

    // Get all meshes and line segments in the group
    const meshes = volumeGroup.children.filter(child =>
        child instanceof THREE.Mesh || child instanceof THREE.LineSegments
    );

    // Set initial opacity
    meshes.forEach(mesh => {
        if (mesh.material) {
            mesh.material.transparent = true;
            mesh.material.opacity = 0;
        }
    });

    // Animate opacity
    return TweenMax.to(meshes.map(m => m.material), {
        opacity: (index, target) => {
            // Restore original opacity or use default
            return target.userData?.originalOpacity || 0.6;
        },
        duration: duration,
        ease: ease,
        onStart: () => {
            // Store original opacity
            meshes.forEach(mesh => {
                if (mesh.material && !mesh.material.userData) {
                    mesh.material.userData = {};
                }
                if (mesh.material) {
                    mesh.material.userData.originalOpacity = mesh.material.opacity || 0.6;
                }
            });
        },
        onComplete: onComplete
    });
}
