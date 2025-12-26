// Animate Elements Module
// Provides reusable animation effects for HTML elements using animate.css
// Includes highlighting, pulsing, and custom animation sequences for educational emphasis

/**
 * Creates an element animator for applying visual emphasis to HTML elements
 * @param {Object} options - Configuration options
 * @returns {Object} Animator with methods to control animations
 */
export function createElementAnimator(options = {}) {
    // Default configuration
    const defaultOptions = {
        animateClass: 'animate__animated',
        defaultDuration: '0.8s',
        defaultIterations: '5',
        defaultBackgroundColor: '#fffacd',
        removeDelay: 100,
        ...options
    };
    
    // Track active animations for cleanup
    const activeAnimations = new Map();
    
    // Animator object
    const animator = {
        /**
         * Apply a pulse animation to highlight correct/positive elements
         * @param {HTMLElement|string} element - Element or element ID
         * @param {Object} config - Animation configuration
         */
        pulse(element, config = {}) {
            const el = typeof element === 'string' ? document.getElementById(element) : element;
            if (!el) return null;
            
            const settings = {
                duration: '0.8s',
                iterations: 5,
                backgroundColor: '#90EE90',  // Light green for positive
                alternateColor: '#fffacd',   // Light yellow
                scale: 1.05,
                animationClass: 'animate__pulse',
                ...config
            };
            
            return this.animate(el, settings);
        },
        
        /**
         * Apply a flash animation to highlight incorrect/warning elements
         * @param {HTMLElement|string} element - Element or element ID
         * @param {Object} config - Animation configuration
         */
        flash(element, config = {}) {
            const el = typeof element === 'string' ? document.getElementById(element) : element;
            if (!el) return null;
            
            const settings = {
                duration: '0.8s',
                iterations: 8,
                backgroundColor: '#ffb3b3',  // Light red for negative
                alternateColor: '#fffacd',   // Light yellow
                scale: 1.05,
                animationClass: 'animate__flash',
                ...config
            };
            
            return this.animate(el, settings);
        },
        
        /**
         * Apply a bounce animation for attention
         * @param {HTMLElement|string} element - Element or element ID
         * @param {Object} config - Animation configuration
         */
        bounce(element, config = {}) {
            const el = typeof element === 'string' ? document.getElementById(element) : element;
            if (!el) return null;
            
            const settings = {
                duration: '1s',
                iterations: 3,
                animationClass: 'animate__bounce',
                ...config
            };
            
            return this.animate(el, settings);
        },
        
        /**
         * Apply a shake animation for error emphasis
         * @param {HTMLElement|string} element - Element or element ID
         * @param {Object} config - Animation configuration
         */
        shake(element, config = {}) {
            const el = typeof element === 'string' ? document.getElementById(element) : element;
            if (!el) return null;
            
            const settings = {
                duration: '0.5s',
                iterations: 2,
                backgroundColor: '#ffcccc',  // Light red
                animationClass: 'animate__headShake',
                ...config
            };
            
            return this.animate(el, settings);
        },
        
        /**
         * Apply a custom animation to an element
         * @param {HTMLElement} element - The element to animate
         * @param {Object} settings - Animation settings
         * @returns {Object} Controller with stop method
         */
        animate(element, settings) {
            if (!element) return null;
            
            // Stop any existing animation on this element
            this.stop(element);
            
            // Store original styles for restoration
            const originalStyles = {
                backgroundColor: element.style.backgroundColor,
                transform: element.style.transform,
                animationDuration: element.style.animationDuration,
                animationIterationCount: element.style.animationIterationCount
            };
            
            // Apply animate.css classes
            element.classList.add(defaultOptions.animateClass);
            if (settings.animationClass) {
                element.classList.add(settings.animationClass);
            }
            
            // Apply animation styles
            element.style.animationDuration = settings.duration || defaultOptions.defaultDuration;
            element.style.animationIterationCount = String(settings.iterations || defaultOptions.defaultIterations);
            
            let colorInterval = null;
            let pulseCount = 0;
            
            // If background color animation is requested
            if (settings.backgroundColor && settings.alternateColor) {
                const totalPulses = parseInt(settings.iterations) * 2;
                
                // Parse duration properly (e.g., "0.8s" -> 800)
                const durationMs = parseFloat(settings.duration || defaultOptions.defaultDuration) * 1000;
                const intervalMs = durationMs / 2;
                
                colorInterval = setInterval(() => {
                    if (pulseCount % 2 === 0) {
                        element.style.backgroundColor = settings.backgroundColor;
                        if (settings.scale) {
                            element.style.transform = `scale(${settings.scale})`;
                        }
                    } else {
                        element.style.backgroundColor = settings.alternateColor;
                        element.style.transform = 'scale(1)';
                    }
                    pulseCount++;
                    
                    if (pulseCount >= totalPulses) {
                        clearInterval(colorInterval);
                        element.style.backgroundColor = settings.alternateColor;
                        element.style.transform = 'scale(1)';
                    }
                }, intervalMs);
            }
            
            // Create controller
            const controller = {
                element,
                settings,
                originalStyles,
                colorInterval,
                
                /**
                 * Stop the animation and restore original styles
                 */
                stop() {
                    if (colorInterval) {
                        clearInterval(colorInterval);
                    }
                    
                    // Remove animation classes
                    element.classList.remove(defaultOptions.animateClass);
                    if (settings.animationClass) {
                        element.classList.remove(settings.animationClass);
                    }
                    
                    // Restore original styles
                    Object.assign(element.style, originalStyles);
                    
                    // Remove from active animations
                    activeAnimations.delete(element);
                }
            };
            
            // Store in active animations
            activeAnimations.set(element, controller);
            
            // Auto-cleanup after animation completes
            const durationMs = parseFloat(settings.duration || defaultOptions.defaultDuration) * 1000;
            const totalDuration = durationMs * parseInt(settings.iterations || defaultOptions.defaultIterations);
            setTimeout(() => {
                controller.stop();
            }, totalDuration + defaultOptions.removeDelay);
            
            return controller;
        },
        
        /**
         * Stop animation on an element
         * @param {HTMLElement|string} element - Element or element ID
         */
        stop(element) {
            const el = typeof element === 'string' ? document.getElementById(element) : element;
            if (!el) return;
            
            const controller = activeAnimations.get(el);
            if (controller) {
                controller.stop();
            }
        },
        
        /**
         * Stop all active animations
         */
        stopAll() {
            activeAnimations.forEach(controller => controller.stop());
            activeAnimations.clear();
        },
        
        /**
         * Check if an element is currently animating
         * @param {HTMLElement|string} element - Element or element ID
         * @returns {boolean} True if animating
         */
        isAnimating(element) {
            const el = typeof element === 'string' ? document.getElementById(element) : element;
            return el ? activeAnimations.has(el) : false;
        },
        
        /**
         * Get all currently animating elements
         * @returns {Array} Array of elements
         */
        getAnimatingElements() {
            return Array.from(activeAnimations.keys());
        }
    };
    
    return animator;
}

/**
 * Preset animation configurations for common use cases
 */
export const AnimationPresets = {
    // Correct answer highlight (green pulse)
    CORRECT: {
        duration: '0.8s',
        iterations: 5,
        backgroundColor: '#90EE90',
        alternateColor: '#fffacd',
        scale: 1.05,
        animationClass: 'animate__pulse'
    },
    
    // Incorrect answer highlight (red flash)
    INCORRECT: {
        duration: '0.8s',
        iterations: 8,
        backgroundColor: '#ffb3b3',
        alternateColor: '#fffacd',
        scale: 1.05,
        animationClass: 'animate__flash'
    },
    
    // Warning highlight (orange pulse)
    WARNING: {
        duration: '1s',
        iterations: 4,
        backgroundColor: '#ffcc99',
        alternateColor: '#fffacd',
        scale: 1.03,
        animationClass: 'animate__pulse'
    },
    
    // Information highlight (blue pulse)
    INFO: {
        duration: '1s',
        iterations: 3,
        backgroundColor: '#b3d9ff',
        alternateColor: '#ffffff',
        scale: 1.02,
        animationClass: 'animate__pulse'
    },
    
    // Success celebration (green bounce)
    SUCCESS: {
        duration: '1s',
        iterations: 2,
        backgroundColor: '#90EE90',
        animationClass: 'animate__bounce'
    },
    
    // Error shake (red shake)
    ERROR: {
        duration: '0.5s',
        iterations: 2,
        backgroundColor: '#ffcccc',
        animationClass: 'animate__headShake'
    },
    
    // Subtle emphasis (no color change)
    EMPHASIS: {
        duration: '0.6s',
        iterations: 2,
        scale: 1.08,
        animationClass: 'animate__pulse'
    }
};

/**
 * Create an animation sequence that highlights elements in order
 * @param {Array} sequence - Array of animation objects [{element, preset, delay, duration}]
 * @param {Object} options - Sequence options
 * @returns {Object} Sequence controller
 */
export function createAnimationSequence(sequence, options = {}) {
    const defaultOptions = {
        autoStart: false,
        loop: false,
        ...options
    };
    
    let currentIndex = 0;
    let isPlaying = false;
    let sequenceTimeout = null;
    const animator = createElementAnimator();
    const activeControllers = [];
    
    const controller = {
        /**
         * Start the animation sequence
         * @param {Function} onComplete - Callback when sequence completes
         */
        play(onComplete) {
            if (isPlaying) return;
            isPlaying = true;
            currentIndex = 0;
            
            const playNext = () => {
                if (currentIndex >= sequence.length) {
                    isPlaying = false;
                    if (defaultOptions.loop) {
                        currentIndex = 0;
                        playNext();
                    } else if (onComplete) {
                        onComplete();
                    }
                    return;
                }
                
                const item = sequence[currentIndex];
                const preset = item.preset ? AnimationPresets[item.preset] : {};
                const config = { ...preset, ...item };
                
                // Apply animation
                const animController = animator.animate(
                    item.element,
                    config
                );
                
                if (animController) {
                    activeControllers.push(animController);
                }
                
                currentIndex++;
                
                // Schedule next animation
                const delay = item.delay || 0;
                const duration = parseInt(config.duration || '1s') * parseInt(config.iterations || 1) * 1000;
                sequenceTimeout = setTimeout(playNext, delay + duration);
            };
            
            playNext();
        },
        
        /**
         * Stop the sequence
         */
        stop() {
            if (sequenceTimeout) {
                clearTimeout(sequenceTimeout);
                sequenceTimeout = null;
            }
            isPlaying = false;
            animator.stopAll();
            activeControllers.length = 0;
            currentIndex = 0;
        },
        
        /**
         * Pause the sequence
         */
        pause() {
            if (sequenceTimeout) {
                clearTimeout(sequenceTimeout);
                sequenceTimeout = null;
            }
            isPlaying = false;
        },
        
        /**
         * Resume from current position
         */
        resume() {
            if (!isPlaying && currentIndex < sequence.length) {
                this.play();
            }
        },
        
        /**
         * Jump to a specific step
         * @param {number} index - Step index
         */
        jumpTo(index) {
            this.stop();
            currentIndex = Math.max(0, Math.min(index, sequence.length - 1));
            // Play just that step
            const item = sequence[currentIndex];
            if (item) {
                const preset = item.preset ? AnimationPresets[item.preset] : {};
                const config = { ...preset, ...item };
                animator.animate(item.element, config);
            }
        },
        
        /**
         * Get the current animator instance
         */
        getAnimator() {
            return animator;
        }
    };
    
    if (defaultOptions.autoStart) {
        controller.play();
    }
    
    return controller;
}

/**
 * Utility function to highlight a table row with animation
 * @param {string} rowId - The ID of the table row
 * @param {string} type - Type of highlight ('correct', 'incorrect', 'warning', 'info')
 * @param {Object} customConfig - Optional custom configuration
 * @returns {Object} Animation controller
 */
export function highlightTableRow(rowId, type = 'info', customConfig = {}) {
    const animator = createElementAnimator();
    const presetMap = {
        'correct': AnimationPresets.CORRECT,
        'incorrect': AnimationPresets.INCORRECT,
        'warning': AnimationPresets.WARNING,
        'info': AnimationPresets.INFO,
        'success': AnimationPresets.SUCCESS,
        'error': AnimationPresets.ERROR
    };
    
    const preset = presetMap[type.toLowerCase()] || AnimationPresets.INFO;
    const config = { ...preset, ...customConfig };
    
    return animator.animate(rowId, config);
}

/**
 * Utility function to create a synchronized highlight effect
 * Highlights multiple elements simultaneously
 * @param {Array} elements - Array of element IDs or HTMLElements
 * @param {Object} config - Animation configuration
 * @returns {Array} Array of animation controllers
 */
export function highlightMultiple(elements, config = {}) {
    const animator = createElementAnimator();
    const controllers = [];
    
    elements.forEach(element => {
        const controller = animator.animate(element, config);
        if (controller) {
            controllers.push(controller);
        }
    });
    
    return controllers;
}