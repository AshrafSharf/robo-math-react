/**
 * solid_of_revolution_animator.js
 * GSAP animation methods for native solid of revolution objects
 */

import { TweenMax, TimelineMax } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a solid of revolution by gradually increasing the rotation angle
 * Creates a "revolving" effect from 0 to full rotation
 * @param {THREE.Mesh} solidMesh - The solid of revolution mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateRevolution(solidMesh, options = {}) {
    // Get revolution data from mesh
    const revolutionData = solidMesh.userData.revolutionData;
    if (!revolutionData) {
        console.warn('Mesh does not have revolution data, using fallback fade-in');
        return fadeInSolid(solidMesh, options);
    }
    
    const { axis, curvePoints, segments } = revolutionData;
    
    const {
        duration = 5,  // Increased default duration for better observation
        ease = "power2.inOut",
        fromAngle = 0.01,  // Always start from small angle for animation
        toAngle = Math.PI * 2,  // Full revolution
        onUpdate = null,
        onComplete = null
    } = options;
    
    // Store original geometry if not already stored
    if (!solidMesh.userData.originalGeometry) {
        solidMesh.userData.originalGeometry = solidMesh.geometry.clone();
        console.log('Stored original geometry for restoration');
    }
    
    // Animation object to track progress
    const animData = { angle: fromAngle };
    
    // Make mesh visible and set initial state
    solidMesh.visible = true;
    
    console.log('animateRevolution starting with:', {
        axis, 
        fromAngle, 
        toAngle,
        curvePointsLength: curvePoints ? curvePoints.length : 0,
        segments,
        hasGSAP: typeof gsap !== 'undefined',
        meshType: solidMesh.type,
        meshGeometry: solidMesh.geometry ? solidMesh.geometry.type : 'none'
    });
    
    // Create initial geometry with small angle
    if (axis === 'y') {
        console.log('Creating initial geometry, curvePoints sample:', curvePoints.slice(0, 3));
        
        const lathePoints = curvePoints.map(p => {
            const point = new THREE.Vector2(Math.abs(p.x), p.y);
            return point;
        });
        
        console.log('LathePoints sample:', lathePoints.slice(0, 3));
        
        // Dispose old geometry first
        if (solidMesh.geometry) {
            console.log('Disposing old geometry:', solidMesh.geometry.type);
            solidMesh.geometry.dispose();
        }
        
        // Create initial geometry
        // Start from the xy-plane (where the shaded region is)
        // In Three.js, the default LatheGeometry starts at the positive x-axis and sweeps counterclockwise
        // We need to rotate 90 degrees (π/2) to align with the visible xy-plane
        const startAngleOffset = Math.PI / 2;  // 90 degrees offset
        const initialSegments = Math.max(8, Math.floor(segments * (fromAngle / (Math.PI * 2))));
        console.log('Creating LatheGeometry with:', {
            pointsCount: lathePoints.length,
            segments: initialSegments,
            startAngle: startAngleOffset,  // Start from 90 degrees (aligned with shaded region)
            angle: fromAngle
        });
        
        const initialGeometry = new THREE.LatheGeometry(
            lathePoints,
            initialSegments,
            startAngleOffset,  // Start angle with 90 degree offset
            fromAngle
        );
        initialGeometry.computeVertexNormals();
        solidMesh.geometry = initialGeometry;
        
        console.log('Initial geometry created:', initialGeometry.type, 'with angle:', fromAngle);
    } else {
        console.log('Axis is not y, skipping geometry creation. Axis:', axis);
    }
    
    return TweenMax.to(animData, {
        angle: toAngle,
        duration: duration,
        ease: ease,
        onUpdate: function() {
            if (axis === 'y') {
                // Create lathe points
                const lathePoints = curvePoints.map(p => 
                    new THREE.Vector2(Math.abs(p.x), p.y)
                );
                
                // Dispose old geometry to prevent memory leak
                if (solidMesh.geometry) {
                    solidMesh.geometry.dispose();
                }
                
                // Create new geometry with current sweep angle
                const startAngleOffset = Math.PI / 2;  // 90 degrees offset
                const currentSegments = Math.max(8, Math.floor(segments * (animData.angle / (Math.PI * 2))));
                const newGeometry = new THREE.LatheGeometry(
                    lathePoints,
                    currentSegments, // Scale segments with angle
                    startAngleOffset,  // Start angle with 90 degree offset
                    animData.angle  // Current sweep angle
                );
                
                // Update normals for proper lighting
                newGeometry.computeVertexNormals();
                
                // Apply the new geometry
                solidMesh.geometry = newGeometry;
                
                // Log progress (sample every 10th update to avoid spam)
                if (Math.random() < 0.1) {
                    console.log('Animation progress:', {
                        currentAngle: animData.angle,
                        targetAngle: toAngle,
                        progress: (animData.angle / toAngle * 100).toFixed(1) + '%'
                    });
                }
            }
            
            if (onUpdate) onUpdate(animData.angle);
        },
        onComplete: function() {
            // Create final full revolution geometry
            if (axis === 'y') {
                const lathePoints = curvePoints.map(p => 
                    new THREE.Vector2(Math.abs(p.x), p.y)
                );
                
                // Dispose current geometry
                if (solidMesh.geometry) {
                    solidMesh.geometry.dispose();
                }
                
                // Create final geometry with full revolution
                const startAngleOffset = Math.PI / 2;  // 90 degrees offset
                const finalGeometry = new THREE.LatheGeometry(
                    lathePoints,
                    segments,
                    startAngleOffset,  // Start angle with 90 degree offset
                    toAngle  // Full revolution angle
                );
                
                finalGeometry.computeVertexNormals();
                solidMesh.geometry = finalGeometry;
                
                // Update stored angle
                solidMesh.userData.revolutionData.fullAngle = toAngle;
            }
            
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
    
    return TweenMax.to(solidMesh.material, {
        opacity: targetOpacity,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Fade out animation for solid of revolution
 * @param {THREE.Mesh} solidMesh - The solid mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeOutSolid(solidMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        toOpacity = 0,
        hideOnComplete = true,
        onComplete = null
    } = options;
    
    // Store current opacity for potential restoration
    if (!solidMesh.userData.originalOpacity) {
        solidMesh.userData.originalOpacity = solidMesh.material.opacity;
    }
    
    // Ensure material is transparent
    solidMesh.material.transparent = true;
    
    return TweenMax.to(solidMesh.material, {
        opacity: toOpacity,
        duration: duration,
        ease: ease,
        onComplete: () => {
            if (hideOnComplete && toOpacity === 0) {
                solidMesh.visible = false;
            }
            if (onComplete) onComplete();
        }
    });
}

/**
 * Alternative revolution animation using scale
 * Scales the solid from flat to full 3D
 * @param {THREE.Mesh} solidMesh - The solid mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function scaleRevolution(solidMesh, options = {}) {
    const {
        duration = 2,
        ease = "power2.out",
        axis = 'y',
        onComplete = null
    } = options;
    
    // Make mesh visible
    solidMesh.visible = true;
    
    // Set initial scale based on axis
    if (axis === 'y') {
        // Flatten in X-Z plane
        solidMesh.scale.set(0.01, 1, 0.01);
    } else if (axis === 'x') {
        // Flatten in Y-Z plane
        solidMesh.scale.set(1, 0.01, 0.01);
    } else {
        // Flatten in X-Y plane
        solidMesh.scale.set(0.01, 0.01, 1);
    }
    
    return TweenMax.to(solidMesh.scale, {
        x: 1,
        y: 1,
        z: 1,
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
    
    // Check if it's a disk stack group
    if (discs.userData && discs.userData.animateDiskMeshes) {
        discs = discs.userData.animateDiskMeshes;
    }
    
    // Handle single disc
    if (!Array.isArray(discs)) {
        discs.scale.set(fromScale, 1, fromScale);  // Only scale X and Z for disc effect
        discs.material.transparent = true;
        discs.material.opacity = fromOpacity;
        discs.visible = true;
        
        const timeline = new TimelineMax({ onComplete });
        
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
    
    // Handle multiple discs with stagger
    const timeline = new TimelineMax({ onComplete });
    
    discs.forEach((disc, index) => {
        disc.scale.set(fromScale, 1, fromScale);
        disc.material.transparent = true;
        disc.material.opacity = fromOpacity;
        disc.visible = true;
        
        const discStart = index * stagger;
        
        timeline.to(disc.material, {
            opacity: toOpacity,
            duration: duration * 0.3,
            ease: "power2.in"
        }, discStart)
        .to(disc.scale, {
            x: toScale,
            z: toScale,
            duration: duration * 0.7,
            ease: ease
        }, discStart + 0.1);
    });
    
    return timeline;
}