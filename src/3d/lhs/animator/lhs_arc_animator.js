/**
 * lhs_arc_animator.js
 * GSAP animation methods for arc objects from lhs_angle_arc.js
 */

import { TweenMax, TimelineMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates an arc by progressively drawing it from start to end
 * Recreates the arc with increasing angle to simulate drawing
 * @param {THREE.Group|THREE.Mesh} arcObject - The arc group or mesh from arcByThreePoints or arc
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateArcDraw(arcObject, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.inOut",
        onComplete = null,
        onUpdate = null
    } = options;
    
    // Import arc function dynamically
    let createArcFunction = null;
    
    // Find the actual arc mesh within the group
    let arcMesh = null;
    let arcParent = null;
    let arcIndex = 0;
    
    if (arcObject.isGroup) {
        arcParent = arcObject;
        // For arcByThreePoints, find the mesh child
        arcObject.traverse((child) => {
            if (child.isMesh && child.geometry && child.geometry.isBufferGeometry) {
                arcMesh = child;
                arcIndex = arcParent.children.indexOf(child);
            }
        });
    } else if (arcObject.isMesh) {
        // Direct mesh from arc function
        arcMesh = arcObject;
        arcParent = arcMesh.parent;
    }
    
    if (!arcMesh || !arcMesh.geometry) {
        console.warn('animateArcDraw: No valid arc mesh found');
        return fadeInArc(arcObject, options);
    }
    
    // Check if we have the necessary data to recreate the arc
    const startVector = arcMesh.userData.startVector;
    const endVector = arcMesh.userData.endVector;
    const tubeRadius = arcMesh.userData.tubeRadius || 0.04;
    const radius = arcMesh.userData.radius || 1.0;
    
    if (!startVector || !endVector) {
        console.warn('animateArcDraw: No vector data found. Using fallback fade-in animation.');
        return fadeInArc(arcObject, options);
    }
    
    // Animation progress object
    const animProgress = { value: 0 };
    
    // Store original material settings
    const originalMaterial = arcMesh.material;
    
    return TweenMax.to(animProgress, duration, {
        value: 1,
        ease: ease,
        onUpdate: function() {
            const progress = animProgress.value;
            
            if (progress <= 0.01) {
                // Hide at very start
                arcMesh.visible = false;
                return;
            }
            
            arcMesh.visible = true;
            
            // Create a new curve with partial length based on progress
            const numPoints = Math.max(2, Math.floor(50 * progress)); // 50 is typical number of points
            const points = [];
            
            for (let i = 0; i <= numPoints; i++) {
                const t = (i / numPoints) * progress;
                const point = curve.getPoint(t);
                points.push(point);
            }
            
            // Create new curve from partial points
            const partialCurve = new THREE.CatmullRomCurve3(points);
            
            // Create new tube geometry
            const tubeRadius = arcMesh.userData.tubeRadius || 0.04;
            const radialSegments = 8;
            const tubularSegments = Math.max(8, numPoints);
            
            const newGeometry = new THREE.TubeGeometry(
                partialCurve,
                tubularSegments,
                tubeRadius,
                radialSegments,
                false // Not closed
            );
            
            // Dispose old geometry if it's not the original
            if (arcMesh.geometry !== originalGeometry) {
                arcMesh.geometry.dispose();
            }
            
            // Apply new geometry
            arcMesh.geometry = newGeometry;
            
            if (onUpdate) {
                onUpdate(progress);
            }
        },
        onComplete: function() {
            // Restore original geometry
            if (arcMesh.geometry !== originalGeometry) {
                arcMesh.geometry.dispose();
            }
            arcMesh.geometry = originalGeometry;
            arcMesh.visible = true;
            
            if (onComplete) {
                onComplete();
            }
        }
    });
}

/**
 * Fade in animation for arcs (fallback when progressive draw isn't possible)
 * @param {THREE.Group|THREE.Mesh} arcObject - The arc object
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInArc(arcObject, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = 1,
        onComplete = null
    } = options;
    
    // Find all meshes in the arc object
    const meshes = [];
    if (arcObject.isGroup) {
        arcObject.traverse((child) => {
            if (child.isMesh) {
                meshes.push(child);
            }
        });
    } else if (arcObject.isMesh) {
        meshes.push(arcObject);
    }
    
    // Set initial opacity
    meshes.forEach(mesh => {
        if (mesh.material) {
            mesh.material.transparent = true;
            mesh.material.opacity = fromOpacity;
        }
    });
    
    // Animate opacity
    const tl = new TimelineMax({ onComplete: onComplete });
    
    meshes.forEach(mesh => {
        if (mesh.material) {
            tl.to(mesh.material, duration, {
                opacity: toOpacity,
                ease: ease
            }, 0); // All at the same time
        }
    });
    
    return tl;
}

/**
 * Animates arc with a scale effect from center
 * @param {THREE.Group|THREE.Mesh} arcObject - The arc object
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateArcScale(arcObject, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",  // Smooth deceleration, no bounce
        fromScale = 0,
        toScale = 1,
        onComplete = null
    } = options;
    
    // Set initial scale
    arcObject.scale.set(fromScale, fromScale, fromScale);
    
    // Animate to final scale
    return TweenMax.to(arcObject.scale, duration, {
        x: toScale,
        y: toScale,
        z: toScale,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates arc with a rotation effect
 * @param {THREE.Group|THREE.Mesh} arcObject - The arc object
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateArcRotation(arcObject, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.inOut",
        rotationAxis = 'z',
        rotationAngle = Math.PI * 2,
        onComplete = null
    } = options;
    
    // Store target rotation
    const targetRotation = {
        x: arcObject.rotation.x,
        y: arcObject.rotation.y,
        z: arcObject.rotation.z
    };
    
    // Set initial rotation
    switch (rotationAxis) {
        case 'x':
            arcObject.rotation.x -= rotationAngle;
            break;
        case 'y':
            arcObject.rotation.y -= rotationAngle;
            break;
        case 'z':
            arcObject.rotation.z -= rotationAngle;
            break;
    }
    
    return TweenMax.to(arcObject.rotation, duration, {
        x: targetRotation.x,
        y: targetRotation.y,
        z: targetRotation.z,
        ease: ease,
        onComplete: onComplete
    });
}