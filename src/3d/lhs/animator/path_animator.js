import * as THREE from 'three';
import { TweenMax, TimelineMax } from 'gsap';

/**
 * PathAnimator class - Animates Three.js objects along various types of paths
 * Supports curved paths, straight lines, and custom parametric paths
 */
export class PathAnimator {
    constructor(animationDuration = 1) {
        this.animationDuration = animationDuration;
        this.activeAnimations = new Map();
    }
    
    /**
     * Animate an object along a curved path
     * @param {THREE.Object3D} object - The Three.js object/group to animate
     * @param {Array|THREE.Curve} path - Path definition (array of points or Three.js curve)
     * @param {Object} options - Animation options
     * @returns {gsap.core.Tween} The GSAP tween instance
     */
    animateAlongPath(object, path, options = {}) {
        const {
            duration = this.animationDuration,
            ease = "power2.inOut",
            autoRotate = false,
            startPosition = 0,
            endPosition = 1,
            repeat = 0,
            yoyo = false,
            lookAhead = 0.01,
            onUpdate,
            onComplete,
            onStart
        } = options;
        
        // Create curve from path
        let curve;
        if (path instanceof THREE.Curve) {
            curve = path;
        } else if (Array.isArray(path)) {
            // Convert array of points to CatmullRomCurve3
            const points = path.map(p => {
                if (p instanceof THREE.Vector3) {
                    return p;
                } else {
                    return new THREE.Vector3(p.x, p.y, p.z);
                }
            });
            curve = new THREE.CatmullRomCurve3(points);
        } else {
            throw new Error("Path must be a THREE.Curve or array of points");
        }
        
        // Store original position and rotation
        const originalPosition = object.position.clone();
        const originalRotation = object.rotation.clone();
        
        // Create animation object to track progress
        const animationState = {
            progress: startPosition
        };
        
        // Create the tween
        const tween = TweenMax.to(animationState, {
            progress: endPosition,
            duration: duration,
            ease: ease,
            repeat: repeat,
            yoyo: yoyo,
            onStart: () => {
                if (onStart) onStart();
            },
            onUpdate: () => {
                // Get current position on curve
                const point = curve.getPoint(animationState.progress);
                object.position.copy(point);
                
                // Handle auto-rotation if enabled
                if (autoRotate) {
                    // Get look-ahead point for smooth rotation
                    const lookAtProgress = Math.min(1, animationState.progress + lookAhead);
                    const lookAtPoint = curve.getPoint(lookAtProgress);
                    
                    // Create a temporary object to calculate rotation
                    const tempObject = new THREE.Object3D();
                    tempObject.position.copy(point);
                    tempObject.lookAt(lookAtPoint);
                    
                    // Apply rotation with optional offset
                    if (typeof autoRotate === 'number') {
                        // autoRotate is a degree offset
                        tempObject.rotateY(THREE.MathUtils.degToRad(autoRotate));
                    }
                    
                    object.rotation.copy(tempObject.rotation);
                }
                
                if (onUpdate) onUpdate(animationState.progress);
            },
            onComplete: () => {
                this.activeAnimations.delete(object.uuid);
                if (onComplete) onComplete();
            }
        });
        
        // Store animation reference
        this.activeAnimations.set(object.uuid, {
            tween: tween,
            curve: curve,
            originalPosition: originalPosition,
            originalRotation: originalRotation
        });
        
        return tween;
    }
    
    /**
     * Animate an object along a straight line
     * @param {THREE.Object3D} object - The Three.js object/group to animate
     * @param {Object} from - Starting position {x, y, z}
     * @param {Object} to - Ending position {x, y, z}
     * @param {Object} options - Animation options
     * @returns {gsap.core.Tween} The GSAP tween instance
     */
    animateStraightLine(object, from, to, options = {}) {
        const {
            duration = this.animationDuration,
            ease = "power2.inOut",
            autoRotate = false,
            repeat = 0,
            yoyo = false,
            onUpdate,
            onComplete,
            onStart
        } = options;
        
        // Set initial position if 'from' is provided
        if (from) {
            object.position.set(from.x, from.y, from.z);
        }
        
        // Ensure object has a position
        if (!object.position) {
            console.error("Object does not have a position property");
            return null;
        }
        
        // Store original rotation if autoRotate is enabled
        const originalRotation = object.rotation.clone();
        
        // Calculate direction for auto-rotation
        if (autoRotate) {
            const currentPos = object.position;
            const direction = new THREE.Vector3(
                to.x - currentPos.x,
                to.y - currentPos.y,
                to.z - currentPos.z
            ).normalize();
            
            // Create temp object to calculate rotation
            const tempObject = new THREE.Object3D();
            tempObject.position.copy(currentPos);
            tempObject.lookAt(
                currentPos.x + direction.x,
                currentPos.y + direction.y,
                currentPos.z + direction.z
            );
            
            // Apply rotation offset if provided as number
            if (typeof autoRotate === 'number') {
                tempObject.rotateY(THREE.MathUtils.degToRad(autoRotate));
            }
            
            // Animate rotation along with position
            TweenMax.to(object.rotation, {
                x: tempObject.rotation.x,
                y: tempObject.rotation.y,
                z: tempObject.rotation.z,
                duration: duration * 0.3,
                ease: "power2.out"
            });
        }
        
        // Create position tween
        const tween = TweenMax.to(object.position, {
            x: to.x,
            y: to.y,
            z: to.z,
            duration: duration,
            ease: ease,
            repeat: repeat,
            yoyo: yoyo,
            onStart: onStart,
            onUpdate: () => {
                if (onUpdate) {
                    // Calculate progress (0-1)
                    const progress = tween.progress();
                    onUpdate(progress);
                }
            },
            onComplete: () => {
                this.activeAnimations.delete(object.uuid);
                if (onComplete) onComplete();
            }
        });
        
        // Store animation reference
        this.activeAnimations.set(object.uuid, {
            tween: tween,
            originalRotation: originalRotation
        });
        
        return tween;
    }
    
    /**
     * Animate object translation by a vector offset
     * @param {THREE.Object3D} object - The Three.js object/group to animate
     * @param {Object} offset - Translation offset {x, y, z}
     * @param {Object} options - Animation options
     * @returns {gsap.core.Tween} The GSAP tween instance
     */
    animateTranslate(object, offset, options = {}) {
        const from = object.position.clone();
        const to = {
            x: from.x + offset.x,
            y: from.y + offset.y,
            z: from.z + offset.z
        };
        
        return this.animateStraightLine(object, null, to, options);
    }
    
    /**
     * Animate an object along a parametric path
     * @param {THREE.Object3D} object - The Three.js object/group to animate
     * @param {Function} pathFunction - Function that takes t (0-1) and returns {x, y, z}
     * @param {Object} options - Animation options
     * @returns {gsap.core.Tween} The GSAP tween instance
     */
    animateParametric(object, pathFunction, options = {}) {
        const {
            duration = this.animationDuration,
            ease = "power2.inOut",
            autoRotate = false,
            tMin = 0,
            tMax = 1,
            samples = 100,
            repeat = 0,
            yoyo = false,
            onUpdate,
            onComplete,
            onStart
        } = options;
        
        // Sample the parametric function to create a curve
        const points = [];
        for (let i = 0; i <= samples; i++) {
            const t = tMin + (i / samples) * (tMax - tMin);
            const point = pathFunction(t);
            if (point && isFinite(point.x) && isFinite(point.y) && isFinite(point.z)) {
                points.push(new THREE.Vector3(point.x, point.y, point.z));
            }
        }
        
        // Create curve from sampled points
        if (points.length < 2) {
            console.error("Parametric function did not generate enough valid points");
            return null;
        }
        
        const curve = new THREE.CatmullRomCurve3(points);
        
        // Use the curve animation method
        return this.animateAlongPath(object, curve, {
            duration,
            ease,
            autoRotate,
            repeat,
            yoyo,
            onUpdate,
            onComplete,
            onStart
        });
    }
    
    /**
     * Animate object along a circular path
     * @param {THREE.Object3D} object - The Three.js object/group to animate
     * @param {Object} center - Center of the circle {x, y, z}
     * @param {number} radius - Radius of the circle
     * @param {Object} options - Animation options including axis of rotation
     * @returns {gsap.core.Tween} The GSAP tween instance
     */
    animateCircular(object, center, radius, options = {}) {
        const {
            duration = this.animationDuration,
            ease = "none", // Linear for smooth circular motion
            axis = 'y', // 'x', 'y', or 'z'
            startAngle = 0,
            endAngle = Math.PI * 2,
            autoRotate = false,
            repeat = 0,
            yoyo = false,
            onUpdate,
            onComplete,
            onStart
        } = options;
        
        // Define the circular path function based on axis
        let pathFunction;
        switch(axis.toLowerCase()) {
            case 'x':
                pathFunction = (t) => ({
                    x: center.x,
                    y: center.y + radius * Math.cos(startAngle + t * (endAngle - startAngle)),
                    z: center.z + radius * Math.sin(startAngle + t * (endAngle - startAngle))
                });
                break;
            case 'y':
                pathFunction = (t) => ({
                    x: center.x + radius * Math.cos(startAngle + t * (endAngle - startAngle)),
                    y: center.y,
                    z: center.z + radius * Math.sin(startAngle + t * (endAngle - startAngle))
                });
                break;
            case 'z':
                pathFunction = (t) => ({
                    x: center.x + radius * Math.cos(startAngle + t * (endAngle - startAngle)),
                    y: center.y + radius * Math.sin(startAngle + t * (endAngle - startAngle)),
                    z: center.z
                });
                break;
            default:
                throw new Error("Axis must be 'x', 'y', or 'z'");
        }
        
        return this.animateParametric(object, pathFunction, {
            duration,
            ease,
            autoRotate,
            repeat,
            yoyo,
            onUpdate,
            onComplete,
            onStart,
            samples: 64 // Good resolution for circles
        });
    }
    
    /**
     * Animate object along a helical (spiral) path
     * @param {THREE.Object3D} object - The Three.js object/group to animate
     * @param {Object} center - Center of the helix {x, y, z}
     * @param {number} radius - Radius of the helix
     * @param {number} pitch - Vertical distance per revolution
     * @param {Object} options - Animation options
     * @returns {gsap.core.Tween} The GSAP tween instance
     */
    animateHelical(object, center, radius, pitch, options = {}) {
        const {
            duration = this.animationDuration,
            ease = "power2.inOut",
            revolutions = 1,
            axis = 'y',
            autoRotate = false,
            repeat = 0,
            yoyo = false,
            onUpdate,
            onComplete,
            onStart
        } = options;
        
        // Define the helical path function based on axis
        let pathFunction;
        const totalAngle = revolutions * Math.PI * 2;
        
        switch(axis.toLowerCase()) {
            case 'y':
                pathFunction = (t) => ({
                    x: center.x + radius * Math.cos(t * totalAngle),
                    y: center.y + t * pitch * revolutions,
                    z: center.z + radius * Math.sin(t * totalAngle)
                });
                break;
            case 'x':
                pathFunction = (t) => ({
                    x: center.x + t * pitch * revolutions,
                    y: center.y + radius * Math.cos(t * totalAngle),
                    z: center.z + radius * Math.sin(t * totalAngle)
                });
                break;
            case 'z':
                pathFunction = (t) => ({
                    x: center.x + radius * Math.cos(t * totalAngle),
                    y: center.y + radius * Math.sin(t * totalAngle),
                    z: center.z + t * pitch * revolutions
                });
                break;
            default:
                throw new Error("Axis must be 'x', 'y', or 'z'");
        }
        
        return this.animateParametric(object, pathFunction, {
            duration,
            ease,
            autoRotate,
            repeat,
            yoyo,
            onUpdate,
            onComplete,
            onStart,
            samples: revolutions * 32 // More samples for smoother helix
        });
    }
    
    /**
     * Pause animation for a specific object
     * @param {THREE.Object3D} object - The object whose animation to pause
     */
    pause(object) {
        const animation = this.activeAnimations.get(object.uuid);
        if (animation && animation.tween) {
            animation.tween.pause();
        }
    }
    
    /**
     * Resume animation for a specific object
     * @param {THREE.Object3D} object - The object whose animation to resume
     */
    resume(object) {
        const animation = this.activeAnimations.get(object.uuid);
        if (animation && animation.tween) {
            animation.tween.resume();
        }
    }
    
    /**
     * Stop and kill animation for a specific object
     * @param {THREE.Object3D} object - The object whose animation to stop
     * @param {boolean} jumpToEnd - Whether to jump to the end position
     */
    stop(object, jumpToEnd = false) {
        const animation = this.activeAnimations.get(object.uuid);
        if (animation && animation.tween) {
            if (jumpToEnd) {
                animation.tween.progress(1);
            }
            animation.tween.kill();
            this.activeAnimations.delete(object.uuid);
        }
    }
    
    /**
     * Stop all active animations
     * @param {boolean} jumpToEnd - Whether to jump to the end position
     */
    stopAll(jumpToEnd = false) {
        this.activeAnimations.forEach((animation) => {
            if (animation.tween) {
                if (jumpToEnd) {
                    animation.tween.progress(1);
                }
                animation.tween.kill();
            }
        });
        this.activeAnimations.clear();
    }
    
    /**
     * Clean up and dispose of resources
     */
    dispose() {
        this.stopAll();
        this.activeAnimations.clear();
    }
}