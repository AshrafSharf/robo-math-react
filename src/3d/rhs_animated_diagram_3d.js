/**
 * RHSAnimatedDiagram - Right-Hand System 3D Animated Diagram
 * Extends RHS3DDiagram with GSAP-based animations for all shape creation methods
 * Provides animated creation and transformation of 3D geometry using RHS coordinates
 */

import { RHS3DDiagram } from './rhs_diagram3d.js';
import { TweenMax, TimelineMax } from 'gsap';
import { createEffectsManager } from './effects_manager3d.js';

// Import animators
import { fadeInPoint } from './common/animator/point_animator.js';
import { animateLine } from './common/animator/line_animator.js';
import { animateVectorGrowth } from './native/animator/rhs_vector_animator.js';
import { animateDashedLineSequential } from './native/animator/rhs_dashed_line_animator.js';
import { fadeInPolygon } from './native/animator/rhs_polygon_animator.js';
import { fadeInParallelogram } from './native/animator/rhs_parallelogram_animator.js';
import { animatePlaneParametricSweep } from './native/animator/rhs_plane_animator.js';
import { fadeInLabel } from './native/animator/rhs_label_animator.js';
import { animateVectorMovement, animateReverseVectorCreation, animateVectorSlide } from './native/animator/rhs_movement_animator.js';
import { animateBoxProduct } from './native/animator/rhs_extrude_animator.js';

export class RHSAnimatedDiagram extends RHS3DDiagram {
    constructor(scene, animationDuration = 1) {
        super(scene);
        this.animationDuration = animationDuration; // Default animation duration in seconds
        this.effectsManager = createEffectsManager(this); // Create effects manager for this animated diagram
    }

    /**
     * Get pen options for animators
     * Reads pen from scene.userData (set by grapher3d.setPen)
     * @returns {Object} { pen, camera, canvas } or empty object
     */
    _getPenOptions() {
        const pen = this.scene.userData.pen;
        const camera = this.scene.userData.camera;
        const renderer = this.scene.userData.renderer;
        if (pen && camera && renderer) {
            return { pen, camera, canvas: renderer.domElement };
        }
        return {};
    }

    /**
     * Animated creation of a 3D point
     * @param {Object} position - Position {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including animation settings
     * @returns {Object} Point mesh with label property
     */
    point3d(position, label = '', color = 0xff0000, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create point using parent method
        const pointMesh = super.point3d(position, label, color, options);

        // Hide label initially
        if (pointMesh.label) {
            pointMesh.label.visible = false;
        }

        // Fade in the point with pen tracking
        fadeInPoint(pointMesh, {
            duration: duration,
            ...this._getPenOptions(),
            onComplete: () => {
                // Fade in label after point
                if (pointMesh.label) {
                    pointMesh.label.visible = true;
                    fadeInLabel(pointMesh.label, { duration: duration * 0.3 });
                }
            }
        });

        return pointMesh;
    }

    /**
     * Animated creation of a segment between two points
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including animation settings
     * @returns {Object} Segment mesh with label property
     */
    segment3dByTwoPoints(start, end, label = '', color = 0x00ff00, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create segment using parent method
        const segmentMesh = super.segment3dByTwoPoints(start, end, label, color, options);

        // Hide label initially
        if (segmentMesh.label) {
            segmentMesh.label.visible = false;
        }

        // Animate line drawing from start to end with pen tracking
        animateLine(segmentMesh, {
            duration: duration,
            ease: "power2.out",
            ...this._getPenOptions(),
            onComplete: () => {
                // Fade in label after segment
                if (segmentMesh.label) {
                    segmentMesh.label.visible = true;
                    fadeInLabel(segmentMesh.label, { duration: duration * 0.3 });
                }
            }
        });

        return segmentMesh;
    }

    /**
     * Animated creation of a vector
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including animation settings
     * @returns {Object} Vector group with label property
     */
    vector(start, end, label = '', color = 0xff0000, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create vector using parent method
        const vectorGroup = super.vector(start, end, label, color, options);

        // Hide label initially
        if (vectorGroup.label) {
            vectorGroup.label.visible = false;
        }

        // Animate vector growing from start to end
        animateVectorGrowth(vectorGroup, {
            duration: duration,
            ease: "power2.out",
            onComplete: () => {
                // Fade in label after vector
                if (vectorGroup.label) {
                    vectorGroup.label.visible = true;
                    fadeInLabel(vectorGroup.label, { duration: duration * 0.3 });
                }
            }
        });

        return vectorGroup;
    }

    /**
     * Animated creation of a dashed vector (useful for unit vectors)
     * @param {Object} start - Start position {x, y, z}
     * @param {Object} end - End position {x, y, z}
     * @param {string} label - Optional label for the vector
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional animation options
     * @returns {Object} Vector group
     */
    dashedVector(start, end, label = '', color = 0x00ff00, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create the dashed vector using parent method
        const vectorGroup = super.dashedVector(start, end, label, color, options);

        // Hide label initially
        if (vectorGroup.label) {
            vectorGroup.label.visible = false;
        }

        // Animate the dashed vector with scale animation
        if (vectorGroup && options.animate !== false) {
            // Start with zero scale
            vectorGroup.scale.set(0.01, 0.01, 0.01);
            vectorGroup.visible = true;

            // Animate scale
            TweenMax.to(vectorGroup.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: duration,
                ease: options.ease || "power2.out",
                onComplete: () => {
                    // Fade in label after dashed vector
                    if (vectorGroup.label) {
                        vectorGroup.label.visible = true;
                        fadeInLabel(vectorGroup.label, { duration: duration * 0.3 });
                    }
                    if (options.onComplete) {
                        options.onComplete(vectorGroup);
                    }
                }
            });
        }

        return vectorGroup;
    }

    /**
     * Animated creation of a dashed line
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Dashed line group with label property
     */
    dashedLine3d(start, end, label = '', color = 0xff1493, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create dashed line using parent method
        const dashedLineGroup = super.dashedLine3d(start, end, label, color, options);

        // Hide label initially
        if (dashedLineGroup.label) {
            dashedLineGroup.label.visible = false;
        }

        // Animate dashed line with sequential ray effect
        animateDashedLineSequential(dashedLineGroup, {
            duration: duration * 2,  // Longer duration for visibility
            ease: "power2.inOut",
            stagger: 0.12,  // Stagger for dramatic effect
            direction: 'forward',
            onComplete: () => {
                // Fade in label after dashed line
                if (dashedLineGroup.label) {
                    dashedLineGroup.label.visible = true;
                    fadeInLabel(dashedLineGroup.label, { duration: duration * 0.3 });
                }
            }
        });

        return dashedLineGroup;
    }

    /**
     * Animated creation of an infinite line through two points
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including animation settings
     * @returns {Object} Line group with label property
     */
    lineByTwoPoints(point1, point2, label = '', color = 0x0000ff, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create line using parent method
        const lineGroup = super.lineByTwoPoints(point1, point2, label, color, options);

        // Hide label initially
        if (lineGroup.label) {
            lineGroup.label.visible = false;
        }

        // Animate line extending from center outward
        lineGroup.scale.z = 0;

        const tl = this.timeline || new TimelineMax();
        tl.to(lineGroup.scale, {
            z: 1,
            duration: duration,
            ease: "power2.inOut",
            onComplete: () => {
                // Show label after line animation
                if (lineGroup.label) {
                    lineGroup.label.visible = true;
                    TweenMax.from(lineGroup.label.scale, {
                        x: 0,
                        y: 0,
                        z: 0,
                        duration: duration * 0.3,
                        ease: "power2.out"
                    });
                }
            }
        });

        return lineGroup;
    }

    /**
     * Animated creation of a plane from a point and normal vector
     * @param {Object} point - Point on plane {x, y, z}
     * @param {Object} normal - Normal vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including animation settings
     * @returns {Object} Plane mesh with label property
     */
    planeByPointAndNormal(point, normal, label = '', color = 0x00ffff, options = {}) {
        const duration = options.animationDuration || this.animationDuration;
        const sweepDirection = options.sweepDirection || 'diagonal'; // Default to diagonal sweep

        // Create plane using parent method
        const planeMesh = super.planeByPointAndNormal(point, normal, label, color, options);

        // Hide label initially
        if (planeMesh.label) {
            planeMesh.label.visible = false;
        }

        // Use parametric sweep animation as the default
        animatePlaneParametricSweep(planeMesh, {
            duration: duration,
            sweepDirection: sweepDirection,
            ease: "power2.inOut",
            onComplete: () => {
                // Show label after plane animation
                if (planeMesh.label) {
                    planeMesh.label.visible = true;
                    fadeInLabel(planeMesh.label, { duration: duration * 0.3 });
                }
            }
        });

        return planeMesh;
    }

    /**
     * Animated creation of a plane from three points
     * @param {Object} p1 - First point {x, y, z}
     * @param {Object} p2 - Second point {x, y, z}
     * @param {Object} p3 - Third point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including animation settings
     * @returns {Object} Plane mesh with label property
     */
    planeByThreePoints(p1, _p2, _p3, label = '', color = 0x00ffff, options = {}) {
        // Delegate to planeByPointAndNormal - parent will calculate the normal
        return this.planeByPointAndNormal(p1, { x: 0, y: 1, z: 0 }, label, color, options);
    }

    /**
     * Animated creation of a parallelogram from origin and two vector endpoints
     * @param {Object} origin - Common starting point {x, y, z}
     * @param {Object} vector1End - End point of first vector {x, y, z}
     * @param {Object} vector2End - End point of second vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including animation settings
     * @returns {Object} Parallelogram mesh with label property
     */
    parallelogram(origin, vector1End, vector2End, label = '', color = 0x4444ff, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create parallelogram using parent method
        const parallelogramMesh = super.parallelogram(origin, vector1End, vector2End, label, color, options);

        // Hide label initially
        if (parallelogramMesh.label) {
            parallelogramMesh.label.visible = false;
        }

        // Fade in the parallelogram
        fadeInParallelogram(parallelogramMesh, {
            duration: duration,
            ease: options.ease || "power2.inOut",
            onComplete: () => {
                // Fade in label after parallelogram
                if (parallelogramMesh.label) {
                    parallelogramMesh.label.visible = true;
                    fadeInLabel(parallelogramMesh.label, { duration: duration * 0.3 });
                }
            }
        });

        return parallelogramMesh;
    }

    /**
     * Animated creation of box product (scalar triple product) volume
     * Volume = |a · (b × c)|
     * Shows the volume forming by extruding the base parallelogram
     * @param {Object} vectorA - First vector {x, y, z}
     * @param {Object} vectorB - Second vector {x, y, z}
     * @param {Object} vectorC - Third vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Volume group with label property
     */
    boxProduct(vectorA, vectorB, vectorC, label = '', color = 0x4444ff, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create volume using parent method
        const volumeGroup = super.boxProduct(vectorA, vectorB, vectorC, label, color, options);

        // Hide label initially
        if (volumeGroup.label) {
            volumeGroup.label.visible = false;
        }

        // Animate the extrusion from base parallelogram
        animateBoxProduct(volumeGroup, {
            duration: duration,
            ease: options.ease || "power2.inOut",
            onComplete: () => {
                // Fade in label after volume animation
                if (volumeGroup.label) {
                    volumeGroup.label.visible = true;
                    fadeInLabel(volumeGroup.label, { duration: duration * 0.3 });
                }
                if (options.onComplete) options.onComplete();
            }
        });

        return volumeGroup;
    }

    /**
     * Animated creation of an arc by three points
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} vertex - Vertex where angle is formed {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @param {string} label - Optional label for the angle
     * @param {number|string} color - Color of the arc
     * @param {Object} options - Additional options including animation settings
     * @returns {Object} Arc group with label property
     */
    arcByThreePoints(point1, vertex, point2, label = '', color = 0x00ff00, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create arc using parent method
        const arcGroup = super.arcByThreePoints(point1, vertex, point2, label, color, options);

        if (arcGroup) {
            // Hide label initially
            if (arcGroup.label) {
                arcGroup.label.visible = false;
            }

            // Use scale animation for the arc group
            // Start with very small scale
            arcGroup.scale.set(0.01, 0.01, 0.01);

            // Animate to full scale with smooth easing
            TweenMax.to(arcGroup.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: duration,
                ease: "power2.out",  // Smooth deceleration, no bounce
                onComplete: () => {
                    // Fade in label after arc
                    if (arcGroup.label) {
                        arcGroup.label.visible = true;
                        fadeInLabel(arcGroup.label, { duration: duration * 0.3 });
                    }
                }
            });
        }

        return arcGroup;
    }

    /**
     * Animated creation of a right angle marker
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} vertex - Vertex where the right angle is located {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @param {string} label - Optional label (typically empty or '90°')
     * @param {number|string} color - Color of the marker
     * @param {Object} options - Additional options
     * @returns {Object} Right angle marker group with label property
     */
    rightAngleMarker(point1, vertex, point2, label = '', color = 0xff6600, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create right angle marker using parent method
        const markerGroup = super.rightAngleMarker(point1, vertex, point2, label, color, options);

        // Hide label initially
        if (markerGroup.label) {
            markerGroup.label.visible = false;
        }

        // Fade in the marker group properly
        fadeInPolygon(markerGroup, {
            duration: duration * 0.8,
            fromOpacity: 0,
            toOpacity: 1,  // Full opacity for the outline
            ease: "power2.out",
            onComplete: () => {
                // Fade in label after marker
                if (markerGroup.label) {
                    markerGroup.label.visible = true;
                    fadeInLabel(markerGroup.label, { duration: duration * 0.3 });
                }
            }
        });

        return markerGroup;
    }

    /**
     * Animated creation of a parallel vector indicator
     * @param {Object} from - Start point of the vector {x, y, z}
     * @param {Object} to - End point of the vector {x, y, z}
     * @param {Object} offset - Offset vector to position the indicator parallel to original {x, y, z}
     * @param {string} label - Optional label for the indicator
     * @param {number|string} color - Color of the indicator
     * @param {Object} options - Additional options including animation settings
     * @returns {Object} Parallel indicator vector group with label property
     */
    parallelVectorIndicator(from, to, offset, label = '', color = 0x808080, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Use parent's parallelVectorIndicator which handles labels correctly
        const indicatorGroup = super.parallelVectorIndicator(from, to, offset, label, color, options);

        // Hide label initially for animation
        if (indicatorGroup.label) {
            indicatorGroup.label.visible = false;
        }

        // Animate vector growing
        animateVectorGrowth(indicatorGroup, {
            duration: duration,
            ease: "power2.out",
            onComplete: () => {
                // Fade in label after vector animation
                if (indicatorGroup.label) {
                    indicatorGroup.label.visible = true;
                    fadeInLabel(indicatorGroup.label, { duration: duration * 0.3 });
                }
            }
        });

        return indicatorGroup;
    }

    /**
     * Creates a vector at original position and animates it moving to target position
     * @param {Object} originalVector - Original vector definition {start: {x,y,z}, end: {x,y,z}}
     * @param {Object} targetPosition - Target position {x, y, z} or target vector {start: {x,y,z}, end: {x,y,z}}
     * @param {Object} options - Options including label, color, and animation settings
     * @returns {Object} The animated vector group
     */
    moveVector(originalVector, targetPosition, options = {}) {
        const duration = options.animationDuration || this.animationDuration;
        const targetStart = targetPosition.start || targetPosition;
        const label = String(options.label || '');
        const color = options.color || 0xff0000;

        // Create the vector at its ORIGINAL position
        const vectorGroup = super.vector(originalVector.start, originalVector.end, label, color, options);

        // Hide label initially during movement
        if (vectorGroup.label) {
            vectorGroup.label.visible = false;
        }

        // Animate the vector movement using the movement animator
        animateVectorMovement(vectorGroup, originalVector.start, targetStart, {
            duration: duration,
            ease: options.ease || "power2.inOut",
            onComplete: () => {
                // Show label after movement
                if (vectorGroup.label) {
                    vectorGroup.label.visible = true;
                    fadeInLabel(vectorGroup.label, { duration: duration * 0.3 });
                }
                if (options.onComplete) {
                    options.onComplete();
                }
            }
        });

        return vectorGroup;
    }

    /**
     * Animated creation of a reversed vector (flipped direction)
     * @param {Object} vector - Object with {start: {x,y,z}, end: {x,y,z}}
     * @param {Object} options - Additional options for the reversed vector
     * @returns {Object} Reversed vector group with label property
     */
    reverseVector(vector, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create reversed vector using parent method
        const reversedVector = super.reverseVector(vector, options);

        // Hide label initially for animation
        if (reversedVector.label) {
            reversedVector.label.visible = false;
        }

        // Animate the reversed vector creation
        animateReverseVectorCreation(reversedVector, {
            duration: duration,
            ease: "power2.out",
            onComplete: () => {
                // Fade in label after reversed vector
                if (reversedVector.label) {
                    reversedVector.label.visible = true;
                    fadeInLabel(reversedVector.label, { duration: duration * 0.3 });
                }
                if (options.onComplete) options.onComplete();
            }
        });

        return reversedVector;
    }

    /**
     * Animate a vector moving forward along its direction
     * @param {Object} vectorObj - The vector object to move forward
     * @param {number} scalar - The scalar amount to move forward (default 1 = one vector length)
     * @param {Object} options - Additional options for the animation
     * @returns {Object} The vector object
     */
    forwardVector(vectorObj, scalar = 1, options = {}) {
        const duration = options.animationDuration || this.animationDuration;
        const returnToOriginal = options.returnToOriginal !== false; // Default true
        const pauseDuration = options.pauseDuration || 0.5;

        // Get vector start and end from userData (should be in math coordinates)
        const vectorStart = vectorObj.userData?.start || { x: 0, y: 0, z: 0 };
        const vectorEnd = vectorObj.userData?.end || { x: 1, y: 0, z: 0 };

        // Animate sliding forward along direction with proper coordinate transformation
        animateVectorSlide(vectorObj, vectorStart, vectorEnd, Math.abs(scalar), {
            duration: duration,
            ease: options.ease || "power2.inOut",
            returnToOriginal: returnToOriginal,
            pauseDuration: pauseDuration,
            onComplete: options.onComplete
        });

        return vectorObj;
    }

    /**
     * Animate a vector moving backward along its direction
     * @param {Object} vectorObj - The vector object to move backward
     * @param {number} scalar - The scalar amount to move backward (default 1 = one vector length)
     * @param {Object} options - Additional options for the animation
     * @returns {Object} The vector object
     */
    backwardVector(vectorObj, scalar = 1, options = {}) {
        const duration = options.animationDuration || this.animationDuration;
        const returnToOriginal = options.returnToOriginal !== false; // Default true
        const pauseDuration = options.pauseDuration || 0.5;

        // Get vector start and end from userData (should be in math coordinates)
        const vectorStart = vectorObj.userData?.start || { x: 0, y: 0, z: 0 };
        const vectorEnd = vectorObj.userData?.end || { x: 1, y: 0, z: 0 };

        // Animate sliding backward along direction (negative scalar) with proper coordinate transformation
        animateVectorSlide(vectorObj, vectorStart, vectorEnd, -Math.abs(scalar), {
            duration: duration,
            ease: options.ease || "power2.inOut",
            returnToOriginal: returnToOriginal,
            pauseDuration: pauseDuration,
            onComplete: options.onComplete
        });

        return vectorObj;
    }

    /**
     * Animated creation of a dot projection visualization
     * @param {Object} vector - The vector to project {start: {x,y,z}, end: {x,y,z}}
     * @param {Object} projectedOntoVector - The vector to project onto {start: {x,y,z}, end: {x,y,z}}
     * @param {string} label - Optional label for the projection distance
     * @param {number|string} color - Color for the projection indicator
     * @param {Object} options - Additional animation options
     * @returns {Object} Group containing the projection visualization
     */
    dotProjection(vector, projectedOntoVector, label = '', color = 0xff0000, options = {}) {
        const duration = options.animationDuration || this.animationDuration;

        // Create the projection indicator using parent method
        const indicator = super.dotProjection(vector, projectedOntoVector, label, color, options);

        // Animate the measurement indicator appearance
        if (indicator) {
            // Start with hidden indicator
            indicator.visible = false;

            // Animate indicator growth from start to projection point
            new TimelineMax()
                .set(indicator, { visible: true })
                .fromTo(indicator.scale,
                    { x: 0.01, y: 0.01, z: 0.01 },
                    {
                        x: 1,
                        y: 1,
                        z: 1,
                        duration: duration,
                        ease: options.ease || "power2.out",
                        onComplete: () => {
                            // Optionally animate the label after indicator appears
                            if (indicator.label && options.animateLabel !== false) {
                                fadeInLabel(indicator.label, {
                                    duration: 0.3,
                                    ease: "power2.out"
                                });
                            }

                            if (options.onComplete) {
                                options.onComplete(indicator);
                            }
                        }
                    }
                );
        }

        return indicator;
    }

    /**
     * Animate object movement
     * @param {Object} object - Three.js object to move
     * @param {Object} target - Target position {x, y, z}
     * @param {Object} options - Animation options
     * @returns {Object} GSAP tween
     */
    animateMove(object, target, options = {}) {
        const duration = options.duration || this.animationDuration;

        return TweenMax.to(object.position, {
            x: target.x,
            y: target.y,
            z: target.z,
            duration: duration,
            ease: options.ease || "power2.inOut",
            ...options
        });
    }

    /**
     * Animate object rotation
     * @param {Object} object - Three.js object to rotate
     * @param {Object} rotation - Target rotation {x, y, z} in radians
     * @param {Object} options - Animation options
     * @returns {Object} GSAP tween
     */
    animateRotate(object, rotation, options = {}) {
        const duration = options.duration || this.animationDuration;

        return TweenMax.to(object.rotation, {
            x: rotation.x,
            y: rotation.y,
            z: rotation.z,
            duration: duration,
            ease: options.ease || "power2.inOut",
            ...options
        });
    }

    /**
     * Animate object scale
     * @param {Object} object - Three.js object to scale
     * @param {Object|number} scale - Target scale {x, y, z} or uniform scale
     * @param {Object} options - Animation options
     * @returns {Object} GSAP tween
     */
    animateScale(object, scale, options = {}) {
        const duration = options.duration || this.animationDuration;

        const targetScale = typeof scale === 'number'
            ? { x: scale, y: scale, z: scale }
            : scale;

        return TweenMax.to(object.scale, {
            ...targetScale,
            duration: duration,
            ease: options.ease || "power2.inOut",
            ...options
        });
    }

    /**
     * Fade in an object
     * @param {Object} object - Three.js object to fade in
     * @param {Object} options - Animation options
     * @returns {Object} GSAP tween
     */
    fadeIn(object, options = {}) {
        const duration = options.duration || this.animationDuration;

        // Set initial opacity
        if (object.material) {
            object.material.transparent = true;
            object.material.opacity = 0;
        }

        // Make visible and fade in
        object.visible = true;

        if (object.material) {
            return TweenMax.to(object.material, {
                opacity: options.targetOpacity || 1,
                duration: duration,
                ease: options.ease || "power2.in",
                ...options
            });
        }
    }

    /**
     * Fade out an object
     * @param {Object} object - Three.js object to fade out
     * @param {Object} options - Animation options
     * @returns {Object} GSAP tween
     */
    fadeOut(object, options = {}) {
        const duration = options.duration || this.animationDuration;

        if (object.material) {
            object.material.transparent = true;

            return TweenMax.to(object.material, {
                opacity: 0,
                duration: duration,
                ease: options.ease || "power2.out",
                onComplete: () => {
                    if (options.hide !== false) {
                        object.visible = false;
                    }
                },
                ...options
            });
        }
    }

    /**
     * Pulse animation for emphasis
     * @param {Object} object - Three.js object to pulse
     * @param {Object} options - Animation options
     * @returns {Object} GSAP tween
     */
    pulse(object, options = {}) {
        const duration = options.duration || 0.5;
        const scale = options.scale || 1.2;

        return TweenMax.to(object.scale, {
            x: scale,
            y: scale,
            z: scale,
            duration: duration,
            ease: "power2.inOut",
            yoyo: true,
            repeat: options.repeat || 1,
            ...options
        });
    }

    /**
     * Highlight an object by changing its emissive properties
     * @param {Object} object - Three.js object to highlight
     * @param {Object} options - Animation options
     * @returns {Object} GSAP tween
     */
    highlight(object, options = {}) {
        const duration = options.duration || this.animationDuration;

        if (object.material && object.material.emissive !== undefined) {
            const originalEmissive = object.material.emissive.getHex();
            const highlightColor = options.color || 0xffff00;

            return TweenMax.to(object.material.emissive, {
                r: ((highlightColor >> 16) & 255) / 255,
                g: ((highlightColor >> 8) & 255) / 255,
                b: (highlightColor & 255) / 255,
                duration: duration,
                ease: "power2.inOut",
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    object.material.emissive.setHex(originalEmissive);
                },
                ...options
            });
        }
    }

    /**
     * Focus on specific objects, reducing opacity of all other visible objects
     * @param {Array} objectsToFocus - Array of objects to focus on
     * @param {number} unfocusedOpacity - Opacity for unfocused objects (default 0.2)
     * @param {number} duration - Animation duration in seconds (default 0.3)
     */
    focus(objectsToFocus, unfocusedOpacity = 0.2, duration = 0.3) {
        if (this.effectsManager) {
            this.effectsManager.focus(objectsToFocus, unfocusedOpacity, duration);
        }
    }

    /**
     * Restore all objects from any active effects
     */
    restore() {
        if (this.effectsManager) {
            this.effectsManager.restore();
        }
    }

    /**
     * Override clear method to also clean up effects
     */
    clear() {
        // Clean up effects first
        if (this.effectsManager) {
            this.effectsManager.dispose();
        }

        // Call parent clear method
        super.clear();
    }
}
