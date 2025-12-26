/**
 * mesh_type_animation_map.js
 * Maps LHS method names to their corresponding animation types and parameters
 */

import { animateThinLine, animateLine, animateDashedThickLine, fadeInLine } from './lhs_line_animator.js';
import { animatePlaneParametricSweep, animatePlaneScale, fadeInPlane } from './lhs_plane_animator.js';
import { animateVectorGrowth, animateVectorComponents, fadeInVector } from './lhs_vector_animator.js';
import { animateArcRadius, animateArcSweep, fadeInArc } from './lhs_angle_animator.js';
import { animatePointScale, animatePointBounce, fadeInPoint } from './lhs_point_animator.js';
import { fadeInLabel, animateLabelSlide } from './lhs_label_animator.js';
import { fadeInPolygon } from './lhs_polygon_animator.js';
import { animateSurfacePointCloud, animateSurfaceGrowth, fadeInSurface } from './lhs_surface_animator.js';
import { animateRevolution, fadeInSolid, fadeOutSolid, animateDiscs } from './solid_of_revolution_animator.js';
import { animateDiskExtraction, moveDiskOut } from './disk_extraction_animator.js';
import { fadeInMesh, growLine, traceTube } from './native_animators.js';
import { animateShellRevolutionY } from './shell_revolution_animator.js';

/**
 * Animation configuration for each LHS method
 * Each entry contains:
 * - animator: The animation function to use
 * - animationType: Type of animation (for reference)
 * - defaultOptions: Default animation options
 * - requiresParams: Additional parameters required for animation
 */
export const METHOD_ANIMATION_MAP = {
    // Line methods from lhs_line.js
    'thinLine': {
        animator: animateThinLine,
        animationType: 'draw',
        defaultOptions: {
            duration: 1,
            ease: 'power2.inOut'
        }
    },
    
    'line': {
        animator: animateLine,
        animationType: 'grow',
        defaultOptions: {
            duration: 1,
            ease: 'power2.out'
        }
    },
    
    'dashedThickLine': {
        animator: animateDashedThickLine,
        animationType: 'draw',
        defaultOptions: {
            duration: 1.5,
            ease: 'power2.inOut',
            animateDash: true
        }
    },
    
    // Plane methods from lhs_plane.js
    'plane': {
        animator: animatePlaneScale,
        animationType: 'scale',
        defaultOptions: {
            duration: 1,
            ease: 'back.out(1.7)',
            fromScale: 0.01,
            toScale: 1
        },
    },
    
    'planeFromEquation': {
        animator: animatePlaneScale,
        animationType: 'scale',
        defaultOptions: {
            duration: 1,
            ease: 'back.out(1.7)',
            fromScale: 0,
            toScale: 1
        },
    },
    
    'planeFromThreePoints': {
        animator: animatePlaneParametricSweep,
        animationType: 'sweep',
        defaultOptions: {
            duration: 1.5,
            ease: 'power2.inOut',
            sweepDirection: 'diagonal'
        },
    },
    
    // Vector methods from lhs_vector.js
    'vector': {
        animator: animateVectorGrowth,
        animationType: 'grow',
        defaultOptions: {
            duration: 1,
            ease: 'power2.out'
        },
        requiresParams: ['from', 'to']
    },
    
    'positionVector': {
        animator: animateVectorComponents,
        animationType: 'components',
        defaultOptions: {
            duration: 1.2,
            ease: 'power2.inOut',
            stagger: 0.2
        },
    },
    
    'dashedVector': {
        animator: fadeInVector,
        animationType: 'fade',
        defaultOptions: {
            duration: 0.8,
            ease: 'power2.inOut',
            fromOpacity: 0,
            toOpacity: 1
        },
    },
    
    // Angle arc methods from lhs_angle_arc.js
    'arc': {
        animator: animateArcSweep,
        animationType: 'sweep',
        defaultOptions: {
            duration: 1,
            ease: 'power2.inOut'
        },
    },
    
    'arcByThreePoints': {
        animator: animateArcRadius,
        animationType: 'radius',
        defaultOptions: {
            duration: 0.8,
            ease: 'power2.inOut',
            fromRadius: 0
        },
        requiresParams: ['targetRadius']
    },
    
    // Point methods from lhs_point.js
    'point': {
        animator: animatePointScale,
        animationType: 'scale',
        defaultOptions: {
            duration: 0.5,
            ease: 'back.out(1.7)',
            fromScale: 0,
            toScale: 1
        },
    },
    
    // Label methods from lhs_label.js
    'label': {
        animator: fadeInLabel,
        animationType: 'fade',
        defaultOptions: {
            duration: 0.5,
            ease: 'power2.inOut',
            fromOpacity: 0,
            toOpacity: 1
        },
    },
    
    'createTextLabel': {
        animator: animateLabelSlide,
        animationType: 'slide',
        defaultOptions: {
            duration: 0.8,
            ease: 'power2.out',
            direction: 'left',
            distance: 2
        },
    },
    
    // Polygon method from lhs_polygon.js
    'polygon': {
        animator: fadeInPolygon,
        animationType: 'fade',
        defaultOptions: {
            duration: 0.5,
            ease: 'power2.inOut',
            fromOpacity: 0,
            toOpacity: 0.7
        },
    },
    
    // Right angle marker from lhs_right_angle.js
    'rightAngle': {
        animator: fadeInPolygon,  // Reuse polygon animator as it handles groups well
        animationType: 'fade',
        defaultOptions: {
            duration: 0.5,
            ease: 'power2.inOut',
            fromOpacity: 0,
            toOpacity: 1  // Full opacity for right angle markers
        },
    },
    
    // Surface methods from lhs_surface.js
    'surface': {
        animator: fadeInSurface,
        animationType: 'fade',
        defaultOptions: {
            duration: 1,
            ease: 'power2.inOut',
            fromOpacity: 0,
            toOpacity: null  // Will use mesh's stored original opacity
        }
    },
    
    'parametricSurface': {
        animator: animateSurfaceGrowth,
        animationType: 'growth',
        defaultOptions: {
            duration: 1.5,
            ease: 'power2.out',
            fromScale: 0.01,
            toScale: 1
        }
    },
    
    // Tangent plane from lhs_tangent_plane.js
    'tangentPlane': {
        animator: animatePlaneScale,  // Use plane animator for tangent planes
        animationType: 'scale',
        defaultOptions: {
            duration: 1,
            ease: 'back.out(1.7)',
            fromScale: 0.01,
            toScale: 1
        }
    },
    
    // Point projection from lhs_point_projection.js
    'pointProjection': {
        animator: fadeInPolygon,  // Projection lines are a group of dashed lines, fade them in
        animationType: 'fade',
        defaultOptions: {
            duration: 0.8,
            ease: 'power2.inOut',
            fromOpacity: 0,
            toOpacity: 0.9  // High opacity for projection lines
        }
    },
    
    // Cuboid from lhs_cuboid.js  
    'cuboid': {
        animator: fadeInPolygon,  // Cuboid is a group with face and edges, fade them in
        animationType: 'fade',
        defaultOptions: {
            duration: 1,
            ease: 'power2.inOut',
            fromOpacity: 0,
            toOpacity: null  // Will use each mesh's original opacity
        }
    },
    
    // Solid of revolution from lhs_solid_of_revolution.js
    'solidOfRevolution': {
        animator: animateRevolution,
        animationType: 'revolve',
        defaultOptions: {
            duration: 5,  // Increased from 2.5 to 5 seconds for better observation
            ease: 'power2.inOut',
            fromAngle: 0.01,  // Start from almost 0
            toAngle: Math.PI * 2
        }
    },
    
    'solidFadeOut': {
        animator: fadeOutSolid,
        animationType: 'fadeOut',
        defaultOptions: {
            duration: 0.5,
            ease: 'power2.inOut',
            toOpacity: 0,
            hideOnComplete: true
        }
    },
    
    'revolutionDisc': {
        animator: animateDiscs,  // Special disc animation
        animationType: 'disc',
        defaultOptions: {
            duration: 0.8,
            ease: 'back.out(1.7)',
            fromScale: 0.01,
            toScale: 1,
            fromOpacity: 0,
            toOpacity: 0.6
        }
    },
    
    'revolutionCurve': {
        animator: traceTube,  // Use trace animation for progressive drawing
        animationType: 'trace',
        defaultOptions: {
            duration: 1.5,
            ease: 'none'  // Linear for smooth drawing
        }
    },
    
    // Shaded region from shaded_region.js
    'shadedRegion': {
        animator: fadeInMesh,  // Use mesh fade-in for shaded regions
        animationType: 'fade',
        defaultOptions: {
            duration: 1,
            ease: 'power2.inOut',
            fromOpacity: 0,
            toOpacity: 0.6  // Final opacity for shaded region
        }
    },
    
    // Disk extraction animation for teaching disk method
    'diskExtraction': {
        animator: animateDiskExtraction,
        animationType: 'extraction',
        defaultOptions: {
            slideOutDuration: 1.5,
            radiusDuration: 1,
            heightDuration: 1,
            staggerDelay: 0.3,
            ease: 'power2.out'
        }
    },
    
    'moveDiskOut': {
        animator: moveDiskOut,
        animationType: 'move',
        defaultOptions: {
            offsetX: 3,
            offsetY: 1,
            duration: 1.5,
            ease: 'power2.out'
        }
    },
    
    // Custom fade out for disk method - fades all except one disk
    'customFadeOut': {
        animator: (mesh, options) => {
            // Check if mesh has custom animation function
            if (mesh.userData && mesh.userData.animateFadeAllExceptOne) {
                return mesh.userData.animateFadeAllExceptOne(options);
            }
            // Fallback to regular fade
            return fadeOutSolid(mesh, options);
        },
        animationType: 'fadeOut',
        defaultOptions: {
            duration: 1,
            ease: 'power2.inOut'
        }
    },
    
    // Shell revolution around y-axis
    'shell-revolution-y': {
        animator: (mesh, options) => {
            console.log('shell-revolution-y animator called with mesh:', mesh.name, 'options:', options);
            // Call the custom animation function stored in userData
            if (mesh.userData && mesh.userData.animateShellRevolution) {
                console.log('Using userData.animateShellRevolution function');
                return mesh.userData.animateShellRevolution(options);
            }
            // Fallback to animateShellRevolutionY directly
            console.log('Using fallback animateShellRevolutionY');
            return animateShellRevolutionY(mesh, {
                ...options,
                profilePoints: mesh.userData.profilePoints || [],
                totalSegments: mesh.userData.totalSegments || 64
            });
        },
        animationType: 'revolve',
        defaultOptions: {
            duration: 5,  // Match the duration in volume-shell-y-axis.js
            ease: 'power2.inOut'
        }
    }
};

/**
 * Fallback animators for each object type
 */
export const FALLBACK_ANIMATORS = {
    'line': fadeInLine,
    'plane': fadeInPlane,
    'vector': fadeInVector,
    'arc': fadeInArc,
    'point': fadeInPoint,
    'label': fadeInLabel,
    'surface': fadeInSurface,
    'solid': fadeInSolid
};

/**
 * Get the animation configuration for a given method
 * @param {string} methodName - The LHS method name
 * @returns {Object|null} Animation configuration or null if not found
 */
export function getAnimationConfig(methodName) {
    return METHOD_ANIMATION_MAP[methodName] || null;
}

/**
 * Get the appropriate animator function for a method
 * @param {string} methodName - The LHS method name
 * @param {boolean} useFallback - Whether to return fallback animator if method not found
 * @returns {Function|null} Animator function or null
 */
export function getAnimator(methodName, useFallback = true) {
    const config = METHOD_ANIMATION_MAP[methodName];
    
    if (config) {
        return config.animator;
    }
    
    if (useFallback) {
        // Try to determine object type from method name
        if (methodName.includes('line') || methodName.includes('Line')) {
            return FALLBACK_ANIMATORS.line;
        } else if (methodName.includes('plane') || methodName.includes('Plane')) {
            return FALLBACK_ANIMATORS.plane;
        } else if (methodName.includes('vector') || methodName.includes('Vector')) {
            return FALLBACK_ANIMATORS.vector;
        } else if (methodName.includes('arc') || methodName.includes('Arc') || methodName.includes('angle')) {
            return FALLBACK_ANIMATORS.arc;
        } else if (methodName.includes('point') || methodName.includes('Point')) {
            return FALLBACK_ANIMATORS.point;
        } else if (methodName.includes('label') || methodName.includes('Label')) {
            return FALLBACK_ANIMATORS.label;
        } else if (methodName.includes('surface') || methodName.includes('Surface')) {
            return FALLBACK_ANIMATORS.surface;
        } else if (methodName.includes('solid') || methodName.includes('Solid') || methodName.includes('revolution')) {
            return FALLBACK_ANIMATORS.solid;
        }
    }
    
    return null;
}

/**
 * Animate an object based on its method name
 * @param {THREE.Object3D} mesh - The mesh/group to animate
 * @param {string} methodName - The LHS method that created this mesh
 * @param {Object} customOptions - Custom animation options to override defaults
 * @returns {Object|null} GSAP animation object or null
 */
export function animateByMethod(mesh, methodName, customOptions = {}) {
    console.log('animateByMethod called with:', methodName, mesh);
    console.log('Mesh userData:', mesh.userData);
    
    const config = getAnimationConfig(methodName);
    
    if (!config) {
        console.warn(`No animation config found for method: ${methodName}`);
        // Try fallback
        const fallbackAnimator = getAnimator(methodName, true);
        if (fallbackAnimator) {
            console.log('Using fallback animator for:', methodName);
            return fallbackAnimator(mesh, customOptions);
        }
        return null;
    }
    
    console.log('Found config for method:', methodName, config);
    
    // Merge default options with custom options
    const options = {
        ...config.defaultOptions,
        ...customOptions
    };
    
    console.log('Calling animator with options:', options);
    console.log('Animator function:', config.animator.name);
    
    // Call the animator - it will infer everything from the mesh
    try {
        const result = config.animator(mesh, options);
        console.log('Animation started successfully, result:', result);
        return result;
    } catch (error) {
        console.error('Error starting animation:', error);
        return null;
    }
}