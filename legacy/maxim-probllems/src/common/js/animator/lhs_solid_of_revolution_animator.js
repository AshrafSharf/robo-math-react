/**
 * lhs_solid_of_revolution_animator.js
 * GSAP animation methods for solid of revolution objects
 */

import { gsap } from 'gsap';
import * as THREE from 'three';
import { solidOfRevolution } from '../lhs/lhs_solid_of_revolution.js';

/**
 * Animates a solid of revolution by gradually increasing the rotation angle
 * Creates a "revolving" effect from 0 to full rotation
 * @param {THREE.Mesh} solidMesh - The solid of revolution mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateRevolution(solidMesh, options = {}) {
    const {
        duration = 2,
        ease = "power2.inOut",
        fromAngle = 0.01,  // Start from almost 0 to avoid degenerate geometry
        toAngle = Math.PI * 2,
        onUpdate = null,
        onComplete = null
    } = options;
    
    // Get revolution data from mesh
    const revolutionData = solidMesh.userData.revolutionData;
    if (!revolutionData) {
        console.warn('Mesh does not have revolution data, using fallback fade-in');
        return fadeInSolid(solidMesh, options);
    }
    
    const { axis, curvePoints, segments } = revolutionData;
    
    // Store original geometry and material
    const originalGeometry = solidMesh.geometry;
    const materialProps = {
        color: solidMesh.material.color.getHex(),
        opacity: solidMesh.material.opacity,
        transparent: solidMesh.material.transparent,
        wireframe: solidMesh.material.wireframe || false,
        shininess: solidMesh.material.shininess || 100,
        side: solidMesh.material.side
    };
    
    // Animation object to track progress
    const animData = { angle: fromAngle };
    
    // Make mesh visible
    solidMesh.visible = true;
    
    return gsap.to(animData, {
        angle: toAngle,
        duration: duration,
        ease: ease,
        onUpdate: function() {
            // Create LatheGeometry with current angle
            if (axis === 'y') {
                // Use Three.js LatheGeometry directly for better performance
                const lathePoints = curvePoints.map(p => 
                    new THREE.Vector2(Math.abs(p.x), p.y)
                );
                
                // Dispose old geometry
                solidMesh.geometry.dispose();
                
                // Create new geometry with current sweep angle
                solidMesh.geometry = new THREE.LatheGeometry(
                    lathePoints,
                    segments,
                    0,  // Start angle
                    animData.angle  // Current sweep angle
                );
                
                // Update normals for proper lighting
                solidMesh.geometry.computeVertexNormals();
            }
            
            if (onUpdate) onUpdate(animData.angle);
        },
        onComplete: function() {
            // Set to full geometry
            solidMesh.geometry.dispose();
            solidMesh.geometry = originalGeometry;
            
            if (onComplete) onComplete();
        }
    });
}

/**
 * Fade in animation for solid of revolution
 * @param {THREE.Mesh} solidMesh - The solid mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInSolid(solidMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = null,
        onComplete = null
    } = options;
    
    // Store original opacity if not provided
    const targetOpacity = toOpacity !== null ? toOpacity : 
        (solidMesh.userData.originalOpacity || solidMesh.material.opacity || 0.8);
    
    // Ensure material is transparent
    solidMesh.material.transparent = true;
    solidMesh.material.opacity = fromOpacity;
    solidMesh.visible = true;
    
    return gsap.to(solidMesh.material, {
        opacity: targetOpacity,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Scale animation for solid of revolution
 * Grows from center point
 * @param {THREE.Mesh} solidMesh - The solid mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function scaleSolid(solidMesh, options = {}) {
    const {
        duration = 1,
        ease = "back.out(1.7)",
        fromScale = 0.01,
        toScale = 1,
        onComplete = null
    } = options;
    
    // Set initial scale
    solidMesh.scale.set(fromScale, fromScale, fromScale);
    solidMesh.visible = true;
    
    return gsap.to(solidMesh.scale, {
        x: toScale,
        y: toScale,
        z: toScale,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates disc/washer elements for teaching the disc method
 * @param {Array<THREE.Mesh>|THREE.Mesh} discs - Array of disc meshes or single disc
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline|gsap.core.Tween} GSAP timeline or tween
 */
export function animateDiscs(discs, options = {}) {
    const {
        duration = 1,
        stagger = 0.2,
        ease = "back.out(1.7)",
        fromScale = 0.01,
        toScale = 1,
        fromOpacity = 0,
        toOpacity = 0.6,
        onComplete = null
    } = options;
    
    // Handle single disc
    if (!Array.isArray(discs)) {
        discs.scale.set(fromScale, 1, fromScale);  // Only scale X and Z for disc effect
        discs.material.transparent = true;
        discs.material.opacity = fromOpacity;
        discs.visible = true;
        
        const timeline = gsap.timeline({ onComplete });
        
        // First fade in
        timeline.to(discs.material, {
            opacity: toOpacity,
            duration: duration * 0.3,
            ease: "power2.in"
        })
        // Then scale up disc
        .to(discs.scale, {
            x: toScale,
            z: toScale,
            duration: duration * 0.7,
            ease: ease
        }, "-=0.2");
        
        return timeline;
    }
    
    // Handle multiple discs
    const timeline = gsap.timeline({ onComplete });
    
    discs.forEach((disc, index) => {
        // Ensure disc is set up for animation
        disc.scale.set(fromScale, 1, fromScale);
        disc.material.transparent = true;
        disc.material.opacity = fromOpacity;
        disc.visible = true;
        
        // Add disc animation to timeline with stagger
        const discStart = index * stagger;
        
        // First fade in
        timeline.to(disc.material, {
            opacity: toOpacity,
            duration: duration * 0.3,
            ease: "power2.in"
        }, discStart)
        // Then scale up disc
        .to(disc.scale, {
            x: toScale,
            z: toScale,
            duration: duration * 0.7,
            ease: ease
        }, discStart + 0.1);
    });
    
    return timeline;
}

/**
 * Sweep animation - reveals solid by moving along the axis
 * @param {THREE.Mesh} solidMesh - The solid mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function sweepSolid(solidMesh, options = {}) {
    const {
        duration = 2,
        axis = 'y',
        direction = 1,  // 1 for positive, -1 for negative
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    // Use clipping planes to reveal the solid progressively
    const material = solidMesh.material;
    material.clippingPlanes = [];
    
    // Get bounding box
    solidMesh.geometry.computeBoundingBox();
    const box = solidMesh.geometry.boundingBox;
    
    let planeNormal, startPos, endPos;
    
    if (axis === 'y') {
        planeNormal = new THREE.Vector3(0, -direction, 0);
        startPos = direction > 0 ? box.min.y : box.max.y;
        endPos = direction > 0 ? box.max.y : box.min.y;
    } else if (axis === 'x') {
        planeNormal = new THREE.Vector3(-direction, 0, 0);
        startPos = direction > 0 ? box.min.x : box.max.x;
        endPos = direction > 0 ? box.max.x : box.min.x;
    } else {
        planeNormal = new THREE.Vector3(0, 0, -direction);
        startPos = direction > 0 ? box.min.z : box.max.z;
        endPos = direction > 0 ? box.max.z : box.min.z;
    }
    
    const clippingPlane = new THREE.Plane(planeNormal, startPos);
    material.clippingPlanes = [clippingPlane];
    
    // Animate the clipping plane position
    return gsap.to(clippingPlane, {
        constant: endPos,
        duration: duration,
        ease: ease,
        onUpdate: () => {
            material.needsUpdate = true;
        },
        onComplete: () => {
            // Remove clipping planes when done
            material.clippingPlanes = [];
            if (onComplete) onComplete();
        }
    });
}