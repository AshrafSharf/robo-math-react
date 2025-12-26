import * as THREE from 'three';

/**
 * Animates folding of flaps from flat to 3D box shape
 * @param {Array<Object>} flaps - Array of flap objects from createFlaps
 * @param {number} duration - Animation duration in milliseconds (default: 2000)
 * @param {Object} options - Configuration options
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {Function} options.onProgress - Callback with progress (0-1)
 * @param {string} options.easing - Easing function: 'linear', 'easeInOut', 'easeIn', 'easeOut' (default: 'easeInOut')
 * @param {boolean} options.stagger - Stagger flap animations (default: true)
 * @param {number} options.staggerDelay - Delay between flaps in ms (default: 50)
 * @returns {Object} Animation controller with stop() method
 */
export function foldToBox(flaps, duration = 2000, options = {}) {
    const {
        onComplete = null,
        onProgress = null,
        easing = 'easeInOut',
        stagger = true,
        staggerDelay = 50
    } = options;
    
    if (!flaps || flaps.length === 0) {
        console.warn('No flaps provided for folding animation');
        return null;
    }
    
    let animationId = null;
    let stopped = false;
    const startTime = Date.now();
    
    // Store initial rotations
    const initialRotations = flaps.map(flap => ({
        x: flap.group.rotation.x,
        y: flap.group.rotation.y,
        z: flap.group.rotation.z
    }));
    
    // Easing functions
    const easingFunctions = {
        linear: t => t,
        easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeIn: t => t * t,
        easeOut: t => t * (2 - t)
    };
    
    const easingFunction = easingFunctions[easing] || easingFunctions.easeInOut;
    
    function animate() {
        if (stopped) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunction(progress);
        
        // Animate each flap
        flaps.forEach((flap, index) => {
            // Calculate stagger offset if enabled
            let flapProgress = easedProgress;
            if (stagger) {
                const delay = index * staggerDelay / duration;
                flapProgress = Math.max(0, Math.min((easedProgress - delay) / (1 - delay * flaps.length), 1));
            }
            
            // Apply rotation based on flap's rotation axis
            const targetAngle = flap.targetAngle || Math.PI / 2;
            const rotation = targetAngle * flapProgress * (flap.rotationSign || 1);
            
            if (flap.rotationAxis === 'x') {
                flap.group.rotation.x = initialRotations[index].x + rotation;
            } else if (flap.rotationAxis === 'y') {
                flap.group.rotation.y = initialRotations[index].y + rotation;
            } else if (flap.rotationAxis === 'z') {
                flap.group.rotation.z = initialRotations[index].z + rotation;
            }
        });
        
        // Call progress callback
        if (onProgress) {
            onProgress(easedProgress);
        }
        
        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        } else {
            // Animation complete
            if (onComplete) {
                onComplete();
            }
        }
    }
    
    // Start animation
    animate();
    
    // Return controller
    return {
        stop: () => {
            stopped = true;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        },
        reset: () => {
            flaps.forEach((flap, index) => {
                flap.group.rotation.x = initialRotations[index].x;
                flap.group.rotation.y = initialRotations[index].y;
                flap.group.rotation.z = initialRotations[index].z;
            });
        }
    };
}

/**
 * Animates unfolding of flaps from 3D box to flat sheet
 * @param {Array<Object>} flaps - Array of flap objects from createFlaps
 * @param {number} duration - Animation duration in milliseconds (default: 2000)
 * @param {Object} options - Same options as foldToBox
 * @returns {Object} Animation controller with stop() method
 */
export function unfoldFromBox(flaps, duration = 2000, options = {}) {
    const {
        onComplete = null,
        onProgress = null,
        easing = 'easeInOut',
        stagger = true,
        staggerDelay = 50
    } = options;
    
    if (!flaps || flaps.length === 0) {
        console.warn('No flaps provided for unfolding animation');
        return null;
    }
    
    let animationId = null;
    let stopped = false;
    const startTime = Date.now();
    
    // Store current rotations (folded state)
    const foldedRotations = flaps.map(flap => ({
        x: flap.group.rotation.x,
        y: flap.group.rotation.y,
        z: flap.group.rotation.z
    }));
    
    // Easing functions
    const easingFunctions = {
        linear: t => t,
        easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeIn: t => t * t,
        easeOut: t => t * (2 - t)
    };
    
    const easingFunction = easingFunctions[easing] || easingFunctions.easeInOut;
    
    function animate() {
        if (stopped) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunction(progress);
        
        // Animate each flap (reverse of folding)
        flaps.forEach((flap, index) => {
            // Calculate stagger offset if enabled
            let flapProgress = easedProgress;
            if (stagger) {
                const delay = index * staggerDelay / duration;
                flapProgress = Math.max(0, Math.min((easedProgress - delay) / (1 - delay * flaps.length), 1));
            }
            
            // Interpolate from folded to flat
            if (flap.rotationAxis === 'x') {
                flap.group.rotation.x = foldedRotations[index].x * (1 - flapProgress);
            } else if (flap.rotationAxis === 'y') {
                flap.group.rotation.y = foldedRotations[index].y * (1 - flapProgress);
            } else if (flap.rotationAxis === 'z') {
                flap.group.rotation.z = foldedRotations[index].z * (1 - flapProgress);
            }
        });
        
        // Call progress callback
        if (onProgress) {
            onProgress(easedProgress);
        }
        
        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        } else {
            // Animation complete
            if (onComplete) {
                onComplete();
            }
        }
    }
    
    // Start animation
    animate();
    
    // Return controller
    return {
        stop: () => {
            stopped = true;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    };
}

/**
 * Creates a foldable group structure for complex folding patterns
 * @param {Array<THREE.Object3D>} elements - Elements to make foldable
 * @param {Array<Object>} pivotPoints - Pivot points for each element {x, y, z}
 * @param {Object} options - Configuration options
 * @returns {Array<THREE.Group>} Array of foldable groups
 */
export function createFoldableGroup(elements, pivotPoints, options = {}) {
    const foldableGroups = [];
    
    elements.forEach((element, index) => {
        const pivotPoint = pivotPoints[index] || { x: 0, y: 0, z: 0 };
        
        // Create a group with pivot at specified point
        const group = new THREE.Group();
        group.position.set(pivotPoint.x, pivotPoint.y, pivotPoint.z);
        
        // Adjust element position relative to pivot
        element.position.sub(new THREE.Vector3(pivotPoint.x, pivotPoint.y, pivotPoint.z));
        
        // Add element to group
        group.add(element);
        
        // Store metadata
        group.userData = {
            pivotPoint: pivotPoint,
            originalPosition: element.position.clone(),
            element: element
        };
        
        foldableGroups.push(group);
    });
    
    return foldableGroups;
}

/**
 * Animates a single fold on an element
 * @param {THREE.Object3D} element - Element to fold
 * @param {string} axis - Rotation axis: 'x', 'y', or 'z'
 * @param {number} targetAngle - Target angle in radians
 * @param {number} duration - Animation duration in milliseconds
 * @param {Object} options - Animation options
 * @returns {Object} Animation controller
 */
export function animateFold(element, axis, targetAngle, duration = 1000, options = {}) {
    const {
        onComplete = null,
        onProgress = null,
        easing = 'easeInOut'
    } = options;
    
    let animationId = null;
    let stopped = false;
    const startTime = Date.now();
    const startAngle = element.rotation[axis];
    
    // Easing functions
    const easingFunctions = {
        linear: t => t,
        easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeIn: t => t * t,
        easeOut: t => t * (2 - t)
    };
    
    const easingFunction = easingFunctions[easing] || easingFunctions.easeInOut;
    
    function animate() {
        if (stopped) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunction(progress);
        
        // Update rotation
        element.rotation[axis] = startAngle + (targetAngle - startAngle) * easedProgress;
        
        // Call progress callback
        if (onProgress) {
            onProgress(easedProgress);
        }
        
        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        } else {
            // Animation complete
            if (onComplete) {
                onComplete();
            }
        }
    }
    
    // Start animation
    animate();
    
    // Return controller
    return {
        stop: () => {
            stopped = true;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        },
        reset: () => {
            element.rotation[axis] = startAngle;
        }
    };
}

/**
 * Creates a toggle folding animation that switches between folded and unfolded states
 * @param {Array<Object>} flaps - Array of flap objects
 * @param {number} duration - Animation duration in milliseconds
 * @param {Object} options - Animation options
 * @returns {Object} Toggle controller with fold(), unfold(), and toggle() methods
 */
export function createFoldingToggle(flaps, duration = 2000, options = {}) {
    let isFolded = false;
    let currentAnimation = null;
    
    const controller = {
        fold: (callback) => {
            if (currentAnimation) {
                currentAnimation.stop();
            }
            
            currentAnimation = foldToBox(flaps, duration, {
                ...options,
                onComplete: () => {
                    isFolded = true;
                    if (callback) callback();
                    if (options.onComplete) options.onComplete();
                }
            });
            
            return currentAnimation;
        },
        
        unfold: (callback) => {
            if (currentAnimation) {
                currentAnimation.stop();
            }
            
            currentAnimation = unfoldFromBox(flaps, duration, {
                ...options,
                onComplete: () => {
                    isFolded = false;
                    if (callback) callback();
                    if (options.onComplete) options.onComplete();
                }
            });
            
            return currentAnimation;
        },
        
        toggle: (callback) => {
            if (isFolded) {
                return controller.unfold(callback);
            } else {
                return controller.fold(callback);
            }
        },
        
        getState: () => isFolded,
        
        stop: () => {
            if (currentAnimation) {
                currentAnimation.stop();
            }
        }
    };
    
    return controller;
}