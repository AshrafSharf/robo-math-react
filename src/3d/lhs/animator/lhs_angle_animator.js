/**
 * lhs_angle_animator.js
 * GSAP animation methods for angle arc objects from lhs_angle_arc.js
 */

import { TweenMax, TimelineMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates an angle arc by growing from zero radius to target radius
 * @param {THREE.Mesh} arcMesh - The arc mesh created by arc() or arcByThreePoints()
 * @param {number} targetRadius - The target radius for the arc
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateArcRadius(arcMesh, targetRadius = 1, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        fromRadius = 0,
        onComplete = null
    } = options;
    
    // Store original scale
    const originalScale = arcMesh.scale.x;
    
    // Start with zero or specified radius
    const startScale = fromRadius / targetRadius;
    arcMesh.scale.set(startScale, startScale, startScale);
    
    // Animate to target radius
    return TweenMax.to(arcMesh.scale, duration, {
        x: originalScale,
        y: originalScale,
        z: originalScale,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates an angle arc by sweeping from start to end angle
 * Creates a growing arc effect
 * @param {THREE.Mesh} arcMesh - The arc mesh created by arc()
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateArcSweep(arcMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    // Get the geometry
    const geometry = arcMesh.geometry;
    
    if (!geometry.isBufferGeometry) {
        console.warn('animateArcSweep: Geometry is not BufferGeometry');
        return null;
    }
    
    // Store original positions
    const positions = geometry.attributes.position.array;
    const originalPositions = Float32Array.from(positions);
    const vertexCount = positions.length / 3;
    
    // Collapse all vertices to the first vertex initially
    const firstX = positions[0];
    const firstY = positions[1];
    const firstZ = positions[2];
    
    for (let i = 0; i < vertexCount; i++) {
        positions[i * 3] = firstX;
        positions[i * 3 + 1] = firstY;
        positions[i * 3 + 2] = firstZ;
    }
    geometry.attributes.position.needsUpdate = true;
    
    // Animate the sweep
    const animationProgress = { value: 0 };
    
    return TweenMax.to(animationProgress, duration, {
        value: 1,
        ease: ease,
        onUpdate: function() {
            const progress = animationProgress.value;
            const visibleVertices = Math.floor(vertexCount * progress);
            
            // Restore positions up to the current progress
            for (let i = 0; i < visibleVertices; i++) {
                positions[i * 3] = originalPositions[i * 3];
                positions[i * 3 + 1] = originalPositions[i * 3 + 1];
                positions[i * 3 + 2] = originalPositions[i * 3 + 2];
            }
            
            // Interpolate the current vertex
            if (visibleVertices < vertexCount) {
                const t = (vertexCount * progress) - visibleVertices;
                const currentIndex = visibleVertices * 3;
                const prevIndex = Math.max(0, (visibleVertices - 1) * 3);
                
                positions[currentIndex] = originalPositions[prevIndex] + 
                    (originalPositions[currentIndex] - originalPositions[prevIndex]) * t;
                positions[currentIndex + 1] = originalPositions[prevIndex + 1] + 
                    (originalPositions[currentIndex + 1] - originalPositions[prevIndex + 1]) * t;
                positions[currentIndex + 2] = originalPositions[prevIndex + 2] + 
                    (originalPositions[currentIndex + 2] - originalPositions[prevIndex + 2]) * t;
            }
            
            geometry.attributes.position.needsUpdate = true;
        },
        onComplete: function() {
            // Ensure all positions are restored
            for (let i = 0; i < positions.length; i++) {
                positions[i] = originalPositions[i];
            }
            geometry.attributes.position.needsUpdate = true;
            if (onComplete) onComplete();
        }
    });
}

/**
 * Animates arc thickness (tube radius)
 * @param {THREE.Mesh} arcMesh - The arc mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateArcThickness(arcMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        fromThickness = 0,
        toThickness = 1,
        onComplete = null
    } = options;
    
    // This scales the entire arc uniformly
    const scaleValue = { value: fromThickness };
    
    return TweenMax.to(scaleValue, duration, {
        value: toThickness,
        ease: ease,
        onUpdate: function() {
            const scale = scaleValue.value;
            arcMesh.scale.set(scale, scale, scale);
        },
        onComplete: onComplete
    });
}

/**
 * Fade in animation for angle arcs (fallback animation)
 * @param {THREE.Mesh} arcMesh - The arc mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInArc(arcMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = 1,
        onComplete = null
    } = options;
    
    // Ensure material is transparent
    arcMesh.material.transparent = true;
    arcMesh.material.opacity = fromOpacity;
    
    return TweenMax.to(arcMesh.material, duration, {
        opacity: toOpacity,
        ease: ease,
        onComplete: onComplete
    });
}