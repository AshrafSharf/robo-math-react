/**
 * native_animators.js
 * Comprehensive animation functions for native geometry objects
 * Ported from LHS animator system to work directly with Three.js coordinates
 */

import { gsap } from 'gsap';
import * as THREE from 'three';

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
    
    return gsap.to(mesh.material, {
        opacity: targetOpacity,
        duration: duration,
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
    
    return gsap.to(lineMesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: duration,
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
    const timeline = gsap.timeline({ onComplete });
    
    // First, set initial scale to almost nothing along one axis
    // This creates a "drawing" effect when we scale it back
    tubeMesh.scale.set(0.001, 1, 1);
    tubeMesh.material.transparent = true;
    tubeMesh.material.opacity = 0;
    
    // Fade in quickly
    timeline.to(tubeMesh.material, {
        opacity: 1,
        duration: duration * 0.2,
        ease: "power2.in"
    })
    // Then scale along x-axis to create drawing effect
    .to(tubeMesh.scale, {
        x: 1,
        duration: duration * 0.8,
        ease: ease
    }, "-=0.1");  // Slight overlap with fade
    
    return timeline;
}

// ============= LINE ANIMATIONS =============

/**
 * Animates line growth from start to end (cylinder geometry)
 * @param {THREE.Mesh} lineMesh - The line mesh to animate
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateLineGrowth(lineMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",
        onComplete = null
    } = options;
    
    // Store original scale
    const originalScaleY = lineMesh.scale.y;
    
    // Start with zero length
    lineMesh.scale.y = 0.001;
    lineMesh.visible = true;
    
    return gsap.to(lineMesh.scale, {
        y: originalScaleY,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates thin line drawing effect
 * @param {THREE.Line} lineObj - The thin line object
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateThinLineDrawing(lineObj, options = {}) {
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
    lineObj.visible = true;
    
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
 * Animates dashed line with drawing effect
 * @param {THREE.Line|THREE.Group} lineObj - The dashed line object
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP animation object
 */
export function animateDashedLine(lineObj, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    // If it's a Group (cylinder segments), fade in sequentially
    if (lineObj.isGroup) {
        const timeline = gsap.timeline({ onComplete });
        
        lineObj.children.forEach((child, index) => {
            if (child.material) {
                const originalOpacity = child.material.opacity || 1;
                child.material.transparent = true;
                child.material.opacity = 0;
                
                timeline.to(child.material, {
                    opacity: originalOpacity,
                    duration: duration * 0.5,
                    ease: ease
                }, index * 0.05);
            }
        });
        
        return timeline;
    }
    
    // For dashed lines, animate the dash offset
    if (lineObj.material && lineObj.material.dashed) {
        return gsap.to(lineObj.material, {
            dashOffset: -1,
            duration: duration,
            ease: "none",
            repeat: -1,
            onComplete: onComplete
        });
    }
    
    // Fall back to thin line animation
    return animateThinLineDrawing(lineObj, options);
}

// ============= POINT ANIMATIONS =============

/**
 * Animates point appearing with scale effect
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePointScale(pointMesh, options = {}) {
    const {
        duration = 0.5,
        ease = "back.out(1.7)",
        fromScale = 0,
        toScale = 1,
        onComplete = null
    } = options;
    
    pointMesh.scale.set(fromScale, fromScale, fromScale);
    pointMesh.visible = true;
    
    return gsap.to(pointMesh.scale, {
        x: toScale,
        y: toScale,
        z: toScale,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates point with bounce effect
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function animatePointBounce(pointMesh, options = {}) {
    const {
        duration = 1,
        bounceHeight = 1,
        ease = "bounce.out",
        onComplete = null
    } = options;
    
    const timeline = gsap.timeline({ onComplete });
    const originalY = pointMesh.position.y;
    
    pointMesh.position.y = originalY + bounceHeight;
    pointMesh.visible = true;
    
    timeline.to(pointMesh.position, {
        y: originalY,
        duration: duration,
        ease: ease
    });
    
    return timeline;
}

/**
 * Animates point pulsing effect
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePointPulse(pointMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        scaleMin = 0.8,
        scaleMax = 1.2,
        repeat = -1,
        yoyo = true,
        onComplete = null
    } = options;
    
    return gsap.to(pointMesh.scale, {
        x: scaleMax,
        y: scaleMax,
        z: scaleMax,
        duration: duration,
        ease: ease,
        repeat: repeat,
        yoyo: yoyo,
        onComplete: onComplete
    });
}

/**
 * Animates point glow effect
 * @param {THREE.Mesh} pointMesh - The point sphere
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePointGlow(pointMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        glowColor = 0xffffff,
        glowIntensity = 1,
        repeat = -1,
        yoyo = true,
        onComplete = null
    } = options;
    
    pointMesh.material.emissive = new THREE.Color(glowColor);
    pointMesh.material.emissiveIntensity = 0;
    
    return gsap.to(pointMesh.material, {
        emissiveIntensity: glowIntensity,
        duration: duration,
        ease: ease,
        repeat: repeat,
        yoyo: yoyo,
        onComplete: onComplete
    });
}

// ============= VECTOR ANIMATIONS =============

/**
 * Animates vector arrow growing from origin to target
 * @param {THREE.Group} vectorGroup - The vector group
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateVectorGrowth(vectorGroup, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",
        onComplete = null
    } = options;
    
    // Get shaft and cone from the group
    const shaft = vectorGroup.children.find(child => 
        child.geometry && child.geometry.type === 'CylinderGeometry'
    );
    const cone = vectorGroup.children.find(child => 
        child.geometry && child.geometry.type === 'ConeGeometry'
    );
    
    if (!shaft && !cone) {
        return fadeInMesh(vectorGroup, options);
    }
    
    const progress = { value: 0 };
    
    // Store original scales and positions
    if (shaft && shaft.userData.originalScale === undefined) {
        shaft.userData.originalScale = shaft.scale.y;
    }
    if (cone && !cone.userData.originalPosition) {
        cone.userData.originalPosition = cone.position.clone();
    }
    
    const originalShaftScale = shaft ? (shaft.userData.originalScale || shaft.scale.y) : 1;
    const originalConePosition = cone ? (cone.userData.originalPosition || cone.position).clone() : new THREE.Vector3();
    const shaftPosition = shaft ? shaft.position.clone() : new THREE.Vector3();
    
    // Start with zero length
    if (shaft) {
        shaft.scale.y = 0.001;
        shaft.visible = true;
    }
    if (cone) {
        cone.position.copy(shaftPosition);
        cone.scale.set(0, 0, 0);
        cone.visible = true;
    }
    
    return gsap.to(progress, {
        value: 1,
        duration: duration,
        ease: ease,
        onUpdate: function() {
            if (shaft) {
                shaft.scale.y = progress.value * originalShaftScale;
            }
            if (cone) {
                cone.position.lerpVectors(shaftPosition, originalConePosition, progress.value);
                const coneScale = Math.min(1, progress.value * 2);
                cone.scale.set(coneScale, coneScale, coneScale);
            }
        },
        onComplete: function() {
            if (shaft) shaft.scale.y = originalShaftScale;
            if (cone) {
                cone.position.copy(originalConePosition);
                cone.scale.set(1, 1, 1);
            }
            if (onComplete) onComplete();
        }
    });
}

/**
 * Animates vector components (shaft then head)
 * @param {THREE.Group} vectorGroup - The vector group
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function animateVectorComponents(vectorGroup, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    const timeline = gsap.timeline({ onComplete });
    
    // Get shaft and cone
    const shaft = vectorGroup.children.find(child => 
        child.geometry && child.geometry.type === 'CylinderGeometry'
    );
    const cone = vectorGroup.children.find(child => 
        child.geometry && child.geometry.type === 'ConeGeometry'
    );
    
    // Animate shaft first
    if (shaft) {
        shaft.scale.y = 0.001;
        shaft.visible = true;
        timeline.to(shaft.scale, {
            y: 1,
            duration: duration * 0.7,
            ease: ease
        });
    }
    
    // Then animate cone
    if (cone) {
        cone.scale.set(0, 0, 0);
        cone.visible = true;
        timeline.to(cone.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: duration * 0.3,
            ease: "back.out(1.7)"
        }, "-=0.1");
    }
    
    return timeline;
}

// ============= PLANE ANIMATIONS =============

/**
 * Animates plane with parametric sweep effect
 * @param {THREE.Mesh} planeMesh - The plane mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePlaneParametricSweep(planeMesh, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.inOut",
        sweepDirection = 'horizontal',
        onComplete = null
    } = options;
    
    // Ensure material is properly configured
    if (planeMesh.material) {
        if (planeMesh.userData.originalOpacity === undefined) {
            planeMesh.userData.originalOpacity = planeMesh.material.opacity || 0.7;
        }
        planeMesh.material.transparent = true;
        planeMesh.material.opacity = planeMesh.userData.originalOpacity;
    }
    
    planeMesh.visible = true;
    
    const geometry = planeMesh.geometry;
    const positions = geometry.attributes.position.array;
    
    // Store original positions
    if (!geometry.userData.originalPositions) {
        geometry.userData.originalPositions = Float32Array.from(positions);
    }
    const originalPositions = geometry.userData.originalPositions;
    
    // Reset positions to collapsed state
    for (let i = 0; i < positions.length; i += 3) {
        switch (sweepDirection) {
            case 'horizontal':
                positions[i] = 0;
                positions[i + 1] = originalPositions[i + 1];
                positions[i + 2] = originalPositions[i + 2];
                break;
            case 'vertical':
                positions[i] = originalPositions[i];
                positions[i + 1] = 0;
                positions[i + 2] = originalPositions[i + 2];
                break;
            case 'radial':
            case 'diagonal':
                positions[i] = 0;
                positions[i + 1] = 0;
                positions[i + 2] = 0;
                break;
        }
    }
    geometry.attributes.position.needsUpdate = true;
    
    const animationProgress = { value: 0 };
    
    return gsap.to(animationProgress, {
        value: 1,
        duration: duration,
        ease: ease,
        onUpdate: function() {
            const progress = animationProgress.value;
            
            for (let i = 0; i < positions.length; i += 3) {
                const x = originalPositions[i];
                const y = originalPositions[i + 1];
                const z = originalPositions[i + 2];
                
                switch (sweepDirection) {
                    case 'horizontal':
                        positions[i] = x * progress;
                        break;
                    case 'vertical':
                        positions[i + 1] = y * progress;
                        break;
                    case 'diagonal':
                        positions[i] = x * progress;
                        positions[i + 1] = y * progress;
                        break;
                    case 'radial':
                        const dist = Math.sqrt(x * x + y * y + z * z);
                        const factor = dist > 0 ? progress : 1;
                        positions[i] = x * factor;
                        positions[i + 1] = y * factor;
                        positions[i + 2] = z * factor;
                        break;
                }
            }
            geometry.attributes.position.needsUpdate = true;
        },
        onComplete: onComplete
    });
}

/**
 * Animates plane scaling from center
 * @param {THREE.Mesh} planeMesh - The plane mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePlaneScale(planeMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",
        fromScale = 0,
        toScale = 1,
        onComplete = null
    } = options;
    
    planeMesh.scale.set(fromScale, fromScale, fromScale);
    planeMesh.visible = true;
    
    return gsap.to(planeMesh.scale, {
        x: toScale,
        y: toScale,
        z: toScale,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

// ============= ARC/ANGLE ANIMATIONS =============

/**
 * Animates arc growing from zero to target radius
 * @param {THREE.Mesh} arcMesh - The arc mesh
 * @param {number} targetRadius - Target radius
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
    
    const originalScale = arcMesh.scale.x;
    const startScale = fromRadius / targetRadius;
    arcMesh.scale.set(startScale, startScale, startScale);
    arcMesh.visible = true;
    
    return gsap.to(arcMesh.scale, {
        x: originalScale,
        y: originalScale,
        z: originalScale,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates arc sweeping from start to end angle
 * @param {THREE.Mesh} arcMesh - The arc mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateArcSweep(arcMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    // For tube geometry arcs, use scale animation
    arcMesh.scale.set(0.01, 0.01, 0.01);
    arcMesh.visible = true;
    
    return gsap.to(arcMesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

// ============= LABEL ANIMATIONS =============

/**
 * Animates label appearing with scale effect
 * @param {THREE.Sprite|THREE.Mesh} labelObj - The label object
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateLabelScale(labelObj, options = {}) {
    const {
        duration = 0.5,
        ease = "back.out(1.7)",
        fromScale = 0,
        toScale = 1,
        onComplete = null
    } = options;
    
    const originalScale = {
        x: labelObj.scale.x,
        y: labelObj.scale.y,
        z: labelObj.scale.z
    };
    
    labelObj.scale.multiplyScalar(fromScale);
    labelObj.visible = true;
    
    return gsap.to(labelObj.scale, {
        x: originalScale.x * toScale,
        y: originalScale.y * toScale,
        z: originalScale.z * toScale,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates label sliding into position
 * @param {THREE.Sprite|THREE.Mesh} labelObj - The label object
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateLabelSlide(labelObj, options = {}) {
    const {
        duration = 0.8,
        ease = "power2.out",
        fromOffset = { x: 0, y: -1, z: 0 },
        onComplete = null
    } = options;
    
    const originalPosition = labelObj.position.clone();
    
    labelObj.position.x += fromOffset.x;
    labelObj.position.y += fromOffset.y;
    labelObj.position.z += fromOffset.z;
    labelObj.visible = true;
    
    return gsap.to(labelObj.position, {
        x: originalPosition.x,
        y: originalPosition.y,
        z: originalPosition.z,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

// ============= POLYGON ANIMATIONS =============

/**
 * Animates polygon scaling from center
 * @param {THREE.Mesh} polygonMesh - The polygon mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePolygonScale(polygonMesh, options = {}) {
    const {
        duration = 0.8,
        ease = "power2.out",
        fromScale = 0,
        toScale = 1,
        onComplete = null
    } = options;
    
    polygonMesh.scale.set(fromScale, fromScale, fromScale);
    polygonMesh.visible = true;
    
    return gsap.to(polygonMesh.scale, {
        x: toScale,
        y: toScale,
        z: toScale,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates polygon with wipe-in effect
 * @param {THREE.Mesh} polygonMesh - The polygon mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animatePolygonWipeIn(polygonMesh, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        direction = 'left',
        onComplete = null
    } = options;
    
    // Use clipping plane for wipe effect
    const material = polygonMesh.material;
    material.clippingPlanes = material.clippingPlanes || [];
    
    const clippingPlane = new THREE.Plane();
    const bounds = new THREE.Box3().setFromObject(polygonMesh);
    
    switch (direction) {
        case 'left':
            clippingPlane.normal.set(1, 0, 0);
            clippingPlane.constant = -bounds.min.x;
            break;
        case 'right':
            clippingPlane.normal.set(-1, 0, 0);
            clippingPlane.constant = bounds.max.x;
            break;
        case 'up':
            clippingPlane.normal.set(0, -1, 0);
            clippingPlane.constant = bounds.max.y;
            break;
        case 'down':
            clippingPlane.normal.set(0, 1, 0);
            clippingPlane.constant = -bounds.min.y;
            break;
    }
    
    material.clippingPlanes = [clippingPlane];
    polygonMesh.visible = true;
    
    const clipProgress = { value: 0 };
    
    return gsap.to(clipProgress, {
        value: 1,
        duration: duration,
        ease: ease,
        onUpdate: function() {
            const range = bounds.max.x - bounds.min.x;
            clippingPlane.constant = -bounds.min.x - range * (1 - clipProgress.value);
        },
        onComplete: function() {
            material.clippingPlanes = [];
            if (onComplete) onComplete();
        }
    });
}

// ============= SURFACE ANIMATIONS =============

/**
 * Animates surface with parametric sweep
 * @param {THREE.Mesh} surfaceMesh - The surface mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateSurfaceSweep(surfaceMesh, options = {}) {
    const {
        duration = 2,
        ease = "power2.inOut",
        sweepAxis = 'u',
        onComplete = null
    } = options;
    
    // Similar to plane sweep but for parametric surfaces
    const geometry = surfaceMesh.geometry;
    const positions = geometry.attributes.position.array;
    
    if (!geometry.userData.originalPositions) {
        geometry.userData.originalPositions = Float32Array.from(positions);
    }
    const originalPositions = geometry.userData.originalPositions;
    
    // Collapse along sweep axis
    for (let i = 0; i < positions.length; i += 3) {
        if (sweepAxis === 'u') {
            positions[i] = 0;
        } else if (sweepAxis === 'v') {
            positions[i + 1] = 0;
        }
    }
    geometry.attributes.position.needsUpdate = true;
    surfaceMesh.visible = true;
    
    const progress = { value: 0 };
    
    return gsap.to(progress, {
        value: 1,
        duration: duration,
        ease: ease,
        onUpdate: function() {
            for (let i = 0; i < positions.length; i += 3) {
                if (sweepAxis === 'u') {
                    positions[i] = originalPositions[i] * progress.value;
                } else if (sweepAxis === 'v') {
                    positions[i + 1] = originalPositions[i + 1] * progress.value;
                }
            }
            geometry.attributes.position.needsUpdate = true;
        },
        onComplete: onComplete
    });
}

/**
 * Animates surface with wave effect
 * @param {THREE.Mesh} surfaceMesh - The surface mesh
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function animateSurfaceWave(surfaceMesh, options = {}) {
    const {
        duration = 2,
        waveAmplitude = 0.5,
        waveFrequency = 2,
        ease = "power2.inOut",
        onComplete = null
    } = options;
    
    const timeline = gsap.timeline({ onComplete });
    const geometry = surfaceMesh.geometry;
    const positions = geometry.attributes.position.array;
    
    if (!geometry.userData.originalPositions) {
        geometry.userData.originalPositions = Float32Array.from(positions);
    }
    const originalPositions = geometry.userData.originalPositions;
    
    surfaceMesh.visible = true;
    
    const waveProgress = { value: 0 };
    
    timeline.to(waveProgress, {
        value: Math.PI * 2,
        duration: duration,
        ease: ease,
        onUpdate: function() {
            for (let i = 0; i < positions.length; i += 3) {
                const x = originalPositions[i];
                const y = originalPositions[i + 1];
                const z = originalPositions[i + 2];
                
                const distance = Math.sqrt(x * x + z * z);
                const waveOffset = Math.sin(distance * waveFrequency - waveProgress.value) * waveAmplitude;
                
                positions[i + 1] = y + waveOffset;
            }
            geometry.attributes.position.needsUpdate = true;
        }
    });
    
    return timeline;
}