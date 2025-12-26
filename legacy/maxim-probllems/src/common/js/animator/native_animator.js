/**
 * native_animator.js
 * Master animator that provides unified animation interface for all native objects
 * Ported from LHS animator system to work directly with Three.js coordinates
 */

import { 
    fadeInMesh,
    animateLineGrowth,
    animateThinLineDrawing,
    animateDashedLine,
    animatePointScale,
    animatePointBounce,
    animatePointPulse,
    animatePointGlow,
    animateVectorGrowth,
    animateVectorComponents,
    animatePlaneParametricSweep,
    animatePlaneScale,
    animateArcRadius,
    animateArcSweep,
    animateLabelScale,
    animateLabelSlide,
    animatePolygonScale,
    animatePolygonWipeIn,
    animateSurfaceSweep,
    animateSurfaceWave
} from './native_animators.js';

/**
 * Animates any native object with appropriate animation
 * Falls back to fade-in if specific animation not available
 * @param {Object} meshObject - The mesh/group object to animate
 * @param {string} objectType - Type of object ('line', 'plane', 'vector', 'arc', 'point', 'label', etc.)
 * @param {Object} options - Animation options
 * @returns {Object} GSAP animation object (Tween or Timeline)
 */
export function animateNativeObject(meshObject, objectType, options = {}) {
    const {
        animationType = 'default',
        fallbackToFade = true,
        ...animationOptions
    } = options;
    
    switch (objectType) {
        case 'line':
        case 'thinLine':
            if (animationType === 'draw') {
                return animateThinLineDrawing(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInMesh(meshObject, animationOptions) : null;
            
        case 'thickLine':
        case 'cylinder':
            if (animationType === 'grow') {
                return animateLineGrowth(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInMesh(meshObject, animationOptions) : null;
            
        case 'dashedLine':
            if (animationType === 'draw') {
                return animateDashedLine(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInMesh(meshObject, animationOptions) : null;
            
        case 'plane':
            if (animationType === 'sweep') {
                return animatePlaneParametricSweep(meshObject, animationOptions);
            } else if (animationType === 'scale') {
                return animatePlaneScale(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInMesh(meshObject, animationOptions) : null;
            
        case 'vector':
            if (animationType === 'grow') {
                return animateVectorGrowth(meshObject, animationOptions);
            } else if (animationType === 'components') {
                return animateVectorComponents(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInMesh(meshObject, animationOptions) : null;
            
        case 'arc':
        case 'angle':
            if (animationType === 'radius') {
                const { targetRadius } = animationOptions;
                return animateArcRadius(meshObject, targetRadius, animationOptions);
            } else if (animationType === 'sweep') {
                return animateArcSweep(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInMesh(meshObject, animationOptions) : null;
            
        case 'point':
            if (animationType === 'scale') {
                return animatePointScale(meshObject, animationOptions);
            } else if (animationType === 'bounce') {
                return animatePointBounce(meshObject, animationOptions);
            } else if (animationType === 'pulse') {
                return animatePointPulse(meshObject, animationOptions);
            } else if (animationType === 'glow') {
                return animatePointGlow(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInMesh(meshObject, animationOptions) : null;
            
        case 'label':
            if (animationType === 'scale') {
                return animateLabelScale(meshObject, animationOptions);
            } else if (animationType === 'slide') {
                return animateLabelSlide(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInMesh(meshObject, animationOptions) : null;
            
        case 'polygon':
            if (animationType === 'scale') {
                return animatePolygonScale(meshObject, animationOptions);
            } else if (animationType === 'wipe') {
                return animatePolygonWipeIn(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInMesh(meshObject, animationOptions) : null;
            
        case 'surface':
            if (animationType === 'sweep') {
                return animateSurfaceSweep(meshObject, animationOptions);
            } else if (animationType === 'wave') {
                return animateSurfaceWave(meshObject, animationOptions);
            }
            return fallbackToFade ? fadeInMesh(meshObject, animationOptions) : null;
            
        default:
            // Generic fade-in for unknown types
            if (fallbackToFade) {
                return fadeInMesh(meshObject, animationOptions);
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
    // Check userData for explicit type
    if (meshObject.userData && meshObject.userData.objectType) {
        return meshObject.userData.objectType;
    }
    
    // Check if it's a group (likely a vector or complex object)
    if (meshObject.type === 'Group') {
        // Check for vector components
        const hasCone = meshObject.children.some(child => 
            child.geometry && child.geometry.type === 'ConeGeometry'
        );
        if (hasCone) {
            return 'vector';
        }
        
        // Check for solid of revolution
        if (meshObject.userData && meshObject.userData.isSolidOfRevolution) {
            return 'solidOfRevolution';
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
            // Could be various types
            if (meshObject.type === 'Line') {
                return meshObject.material.dashed ? 'dashedLine' : 'thinLine';
            } else if (meshObject.userData && meshObject.userData.isPolygon) {
                return 'polygon';
            } else if (meshObject.userData && meshObject.userData.isSurface) {
                return 'surface';
            }
        } else if (geoType === 'ShapeGeometry') {
            return 'polygon';
        } else if (geoType === 'ParametricGeometry') {
            return 'surface';
        }
    }
    
    // Check if it's a sprite (label)
    if (meshObject.type === 'Sprite') {
        return 'label';
    }
    
    // Check for text mesh
    if (meshObject.userData && meshObject.userData.isTextLabel) {
        return 'label';
    }
    
    return 'unknown';
}

/**
 * Auto-animates a native object by detecting its type
 * @param {Object} meshObject - The mesh/group object to animate
 * @param {Object} options - Animation options
 * @returns {Object} GSAP animation object
 */
export function autoAnimate(meshObject, options = {}) {
    const objectType = detectObjectType(meshObject);
    return animateNativeObject(meshObject, objectType, options);
}