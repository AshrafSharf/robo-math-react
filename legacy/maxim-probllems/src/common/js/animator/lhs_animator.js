/**
 * lhs_animator.js
 * Master animator that provides unified animation interface for all LHS objects
 */

import { fadeInLine, animateThinLine, animateLine, animateDashedThickLine } from './lhs_line_animator.js';
import { fadeInPlane, animatePlaneScale, animatePlaneParametricSweep } from './lhs_plane_animator.js';
import { fadeInVector, animateVectorGrowth, animateVectorComponents } from './lhs_vector_animator.js';
import { fadeInArc, animateArcRadius, animateArcSweep } from './lhs_angle_animator.js';
import { fadeInPoint, animatePointScale, animatePointBounce } from './lhs_point_animator.js';
import { fadeInLabel, animateLabelScale, animateLabelSlide } from './lhs_label_animator.js';

/**
 * Animates any LHS object with appropriate animation
 * Falls back to fade-in if specific animation not available
 * @param {Object} meshObject - The mesh/group object to animate
 * @param {string} objectType - Type of object ('line', 'plane', 'vector', 'arc', 'point', 'label')
 * @param {Object} options - Animation options
 * @returns {Object} GSAP animation object (Tween or Timeline)
 */
export function animateLHSObject(meshObject, objectType, options = {}) {
    const {
        animationType = 'default',
        fallbackToFade = true,
        ...animationOptions
    } = options;
    
    switch (objectType) {
        case 'line':
        case 'thinLine':
            if (animationType === 'draw') {
                // Need start and end positions for draw animation
                const { start, end } = animationOptions;
                if (start && end) {
                    return animateThinLine(meshObject, start, end, animationOptions);
                }
            }
            return fallbackToFade ? fadeInLine(meshObject, animationOptions) : null;
            
        case 'thickLine':
        case 'cylinder':
            if (animationType === 'grow') {
                const { start, end } = animationOptions;
                if (start && end) {
                    return animateLine(meshObject, start, end, animationOptions);
                }
            }
            return fallbackToFade ? fadeInLine(meshObject, animationOptions) : null;
            
        case 'dashedLine':
            if (animationType === 'draw') {
                const { start, end } = animationOptions;
                if (start && end) {
                    return animateDashedThickLine(meshObject, start, end, animationOptions);
                }
            }
            return fallbackToFade ? fadeInLine(meshObject, animationOptions) : null;
            
        case 'plane':
            if (animationType === 'sweep') {
                return animatePlaneParametricSweep(meshObject, animationOptions);
            } else if (animationType === 'scale') {
                return animatePlaneScale(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInPlane(meshObject, animationOptions) : null;
            
        case 'vector':
            if (animationType === 'grow') {
                const { from, to } = animationOptions;
                if (from && to) {
                    return animateVectorGrowth(meshObject, from, to, animationOptions);
                }
            } else if (animationType === 'components') {
                return animateVectorComponents(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInVector(meshObject, animationOptions) : null;
            
        case 'arc':
        case 'angle':
            if (animationType === 'radius') {
                const { targetRadius } = animationOptions;
                return animateArcRadius(meshObject, targetRadius, animationOptions);
            } else if (animationType === 'sweep') {
                return animateArcSweep(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInArc(meshObject, animationOptions) : null;
            
        case 'point':
            if (animationType === 'scale') {
                return animatePointScale(meshObject, animationOptions);
            } else if (animationType === 'bounce') {
                return animatePointBounce(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInPoint(meshObject, animationOptions) : null;
            
        case 'label':
            if (animationType === 'scale') {
                return animateLabelScale(meshObject, animationOptions);
            } else if (animationType === 'slide') {
                return animateLabelSlide(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInLabel(meshObject, animationOptions) : null;
            
        default:
            // Generic fade-in for unknown types
            if (fallbackToFade && meshObject.material) {
                meshObject.material.transparent = true;
                meshObject.material.opacity = 0;
                
                return gsap.to(meshObject.material, {
                    opacity: animationOptions.toOpacity || 1,
                    duration: animationOptions.duration || 0.5,
                    ease: animationOptions.ease || "power2.inOut",
                    onComplete: animationOptions.onComplete
                });
            }
            return null;
    }
}

/**
 * Determines the object type from the mesh/group
 * @param {Object} meshObject - The mesh/group object
 * @returns {string} The detected object type
 */
export function detectObjectType(meshObject) {
    // Check if it's a group (likely a vector)
    if (meshObject.type === 'Group') {
        // Check for vector components
        const hasCone = meshObject.children.some(child => 
            child.geometry && child.geometry.type === 'ConeGeometry'
        );
        if (hasCone) {
            return 'vector';
        }
    }
    
    // Check geometry type
    if (meshObject.geometry) {
        const geoType = meshObject.geometry.type;
        
        if (geoType === 'PlaneGeometry') {
            return 'plane';
        } else if (geoType === 'SphereGeometry') {
            return 'point';
        } else if (geoType === 'CylinderGeometry') {
            return 'thickLine';
        } else if (geoType === 'TubeGeometry') {
            return 'arc';
        } else if (geoType === 'BufferGeometry') {
            // Could be a line or other custom geometry
            if (meshObject.type === 'Line') {
                return 'line';
            }
        }
    }
    
    // Check if it's a sprite (label)
    if (meshObject.type === 'Sprite') {
        return 'label';
    }
    
    return 'unknown';
}

/**
 * Auto-animates an LHS object by detecting its type
 * @param {Object} meshObject - The mesh/group object to animate
 * @param {Object} options - Animation options
 * @returns {Object} GSAP animation object
 */
export function autoAnimate(meshObject, options = {}) {
    const objectType = detectObjectType(meshObject);
    return animateLHSObject(meshObject, objectType, options);
}