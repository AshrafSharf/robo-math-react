/**
 * shell_revolution_animator.js
 * Animation functions for shell method revolution around y-axis
 */

import * as THREE from 'three';

/**
 * Animates a shell solid revolution around the y-axis
 * Creates a sweeping revolution effect by gradually building the LatheGeometry
 * @param {THREE.Group} group - The group containing the shell solid meshes
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration in seconds (default: 2)
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {Array} options.profilePoints - The profile points for the LatheGeometry
 * @param {number} options.totalSegments - Total segments for complete revolution (default: 64)
 */
export function animateShellRevolutionY(group, options = {}) {
    const {
        duration = 2,
        onComplete = () => {},
        profilePoints = [],
        totalSegments = 64
    } = options;
    
    console.log('animateShellRevolutionY called with:', {
        group,
        profilePoints: profilePoints.length,
        totalSegments
    });
    
    // Find the solid mesh and wireframe mesh in the group
    let solidMesh = null;
    let wireframeMesh = null;
    
    group.children.forEach(child => {
        if (child.isMesh) {
            if (child.material.wireframe) {
                wireframeMesh = child;
            } else {
                solidMesh = child;
            }
        }
    });
    
    console.log('Found meshes:', { solidMesh, wireframeMesh });
    
    if (!solidMesh || profilePoints.length === 0) {
        console.warn('Shell revolution animation requires solid mesh and profile points');
        console.warn('solidMesh:', solidMesh, 'profilePoints:', profilePoints.length);
        if (onComplete) onComplete();
        return;
    }
    
    // Store original geometry and profile points
    const originalGeometry = solidMesh.geometry.clone();
    
    // Don't hide the meshes - start with minimal geometry instead
    // Create initial minimal geometry (just 2 segments)
    const initialGeometry = new THREE.LatheGeometry(profilePoints, 2, 0, 0.1);
    initialGeometry.computeVertexNormals();
    
    if (solidMesh) {
        solidMesh.geometry.dispose();
        solidMesh.geometry = initialGeometry;
        solidMesh.visible = true;
    }
    if (wireframeMesh) {
        wireframeMesh.geometry = initialGeometry.clone();
        wireframeMesh.visible = true;
    }
    
    // Animation variables
    let startTime = null;
    let animationFrame = null;
    
    const animate = (timestamp) => {
        if (!startTime) {
            startTime = timestamp;
        }
        
        const elapsed = (timestamp - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        
        // Calculate number of segments and angle based on progress
        // Use easing for smoother animation
        const easedProgress = easeOutCubic(progress);
        const segments = Math.max(3, Math.floor(totalSegments * easedProgress));
        const angle = Math.PI * 2 * easedProgress;  // Sweep from 0 to 2π
        
        // Create partial geometry - sweep around y-axis
        const partialGeometry = new THREE.LatheGeometry(profilePoints, segments, 0, angle);
        partialGeometry.computeVertexNormals();
        partialGeometry.computeBoundingBox();
        partialGeometry.computeBoundingSphere();
        
        // Update mesh geometries
        if (solidMesh) {
            solidMesh.geometry.dispose();
            solidMesh.geometry = partialGeometry;
        }
        
        if (wireframeMesh) {
            // Share the same geometry for wireframe
            wireframeMesh.geometry = partialGeometry;
        }
        
        if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            // Ensure final geometry is complete
            if (solidMesh) {
                solidMesh.geometry.dispose();
                solidMesh.geometry = originalGeometry;
            }
            if (wireframeMesh) {
                wireframeMesh.geometry = originalGeometry;
            }
            
            if (onComplete) onComplete();
        }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    // Return control object for potential cancellation
    return {
        cancel: () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            // Restore original geometry
            if (solidMesh) {
                solidMesh.geometry = originalGeometry;
                solidMesh.visible = true;
            }
            if (wireframeMesh) {
                wireframeMesh.geometry = originalGeometry;
                wireframeMesh.visible = true;
            }
        }
    };
}

/**
 * Easing function for smooth animation
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Animates shell extraction - shows a single shell being pulled out
 * @param {THREE.Mesh} shellMesh - The shell mesh to animate
 * @param {Object} options - Animation options
 */
export function animateShellExtraction(shellMesh, options = {}) {
    const {
        duration = 1,
        distance = 2,
        direction = new THREE.Vector3(1, 0.5, 0),
        onComplete = () => {}
    } = options;
    
    const startPosition = shellMesh.position.clone();
    const targetPosition = startPosition.clone().add(direction.normalize().multiplyScalar(distance));
    
    let startTime = null;
    
    const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out animation
        const easedProgress = easeOutCubic(progress);
        
        // Interpolate position
        shellMesh.position.lerpVectors(startPosition, targetPosition, easedProgress);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (onComplete) onComplete();
        }
    };
    
    requestAnimationFrame(animate);
}

/**
 * Fades in a shell group
 * @param {THREE.Group} group - The shell group to fade in
 * @param {Object} options - Animation options
 */
export function fadeInShell(group, options = {}) {
    const {
        duration = 0.5,
        onComplete = () => {}
    } = options;
    
    // Set initial opacity to 0 for all materials
    group.traverse(child => {
        if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = 0;
        }
    });
    
    let startTime = null;
    
    const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        
        // Update opacity for all materials
        group.traverse(child => {
            if (child.isMesh && child.material) {
                // Store target opacity if not stored
                if (child.material.userData.targetOpacity === undefined) {
                    child.material.userData.targetOpacity = child.material.opacity || 0.9;
                }
                child.material.opacity = child.material.userData.targetOpacity * progress;
            }
        });
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (onComplete) onComplete();
        }
    };
    
    requestAnimationFrame(animate);
}

// Export all animation functions
export default {
    animateShellRevolutionY,
    animateShellExtraction,
    fadeInShell
};