// Next Sample Module
// Provides reusable sample/preset navigation for educational lessons
// Includes sample cycling, UI controls, and state management

/**
 * Creates a sample navigator for cycling through different examples
 * @param {Object} options - Configuration options
 * @returns {Object} Sample navigator with methods to control samples
 */
export function createSampleNavigator(options = {}) {
    // Validate required options
    if (!options.samples || !Array.isArray(options.samples) || options.samples.length === 0) {
        throw new Error('Samples array is required and must not be empty');
    }
    
    if (!options.onSampleChange || typeof options.onSampleChange !== 'function') {
        throw new Error('onSampleChange callback is required');
    }
    
    // Default configuration
    const config = {
        samples: [],
        onSampleChange: null,
        initialIndex: 0,
        labelFormat: 'Sample {current} of {total}',
        buttonText: 'Next Sample →',
        buttonStyle: {
            fontSize: '13px',
            padding: '6px 14px',
            backgroundColor: '#4a5568',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontWeight: '500'
        },
        buttonHoverStyle: {
            backgroundColor: '#2d3748',
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        },
        buttonDisabledStyle: {
            opacity: '0.5',
            cursor: 'not-allowed'
        },
        labelStyle: {
            fontSize: '14px',
            color: '#000000'
        },
        containerStyle: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            margin: '5px 0'
        },
        cyclic: true,  // Whether to loop back to first sample after last
        enableKeyboardShortcuts: true,  // Enable arrow keys for navigation
        disableOnCondition: null,  // Function that returns true when button should be disabled
        ...options
    };
    
    // State
    let currentIndex = config.initialIndex;
    let isDisabled = false;
    let container = null;
    let button = null;
    let label = null;
    
    // Navigator object
    const navigator = {
        /**
         * Create the UI controls
         * @param {HTMLElement} parentElement - Parent element to append controls to
         * @returns {HTMLElement} Container element with controls
         */
        createControls(parentElement) {
            if (container) {
                console.warn('Controls already created. Call destroy() first to recreate.');
                return container;
            }
            
            // Create container
            container = document.createElement('div');
            container.className = 'sample-navigator-container';
            Object.assign(container.style, config.containerStyle);
            
            // Create label
            label = document.createElement('span');
            label.className = 'sample-navigator-label';
            Object.assign(label.style, config.labelStyle);
            this.updateLabel();
            
            // Create button
            button = document.createElement('button');
            button.className = 'sample-navigator-button';
            button.textContent = config.buttonText;
            Object.assign(button.style, config.buttonStyle);
            
            // Button click handler
            button.addEventListener('click', () => {
                if (!isDisabled) {
                    this.next();
                }
            });
            
            // Hover effects
            button.addEventListener('mouseenter', () => {
                if (!isDisabled) {
                    Object.assign(button.style, config.buttonHoverStyle);
                }
            });
            
            button.addEventListener('mouseleave', () => {
                if (!isDisabled) {
                    Object.assign(button.style, config.buttonStyle);
                }
            });
            
            // Append to container
            container.appendChild(label);
            container.appendChild(button);
            
            // Append to parent if provided
            if (parentElement) {
                parentElement.appendChild(container);
            }
            
            // Setup keyboard shortcuts if enabled
            if (config.enableKeyboardShortcuts) {
                this.setupKeyboardShortcuts();
            }
            
            return container;
        },
        
        /**
         * Update the label text
         */
        updateLabel() {
            if (label) {
                const text = config.labelFormat
                    .replace('{current}', currentIndex + 1)
                    .replace('{total}', config.samples.length)
                    .replace('{index}', currentIndex);
                label.textContent = text;
            }
        },
        
        /**
         * Navigate to the next sample
         */
        next() {
            if (isDisabled) return;
            
            if (config.cyclic) {
                currentIndex = (currentIndex + 1) % config.samples.length;
            } else {
                currentIndex = Math.min(currentIndex + 1, config.samples.length - 1);
            }
            
            this.loadSample(currentIndex);
        },
        
        /**
         * Navigate to the previous sample
         */
        previous() {
            if (isDisabled) return;
            
            if (config.cyclic) {
                currentIndex = (currentIndex - 1 + config.samples.length) % config.samples.length;
            } else {
                currentIndex = Math.max(currentIndex - 1, 0);
            }
            
            this.loadSample(currentIndex);
        },
        
        /**
         * Jump to a specific sample
         * @param {number} index - Sample index
         */
        jumpTo(index) {
            if (isDisabled) return;
            
            if (index >= 0 && index < config.samples.length) {
                currentIndex = index;
                this.loadSample(currentIndex);
            }
        },
        
        /**
         * Load a sample by index
         * @param {number} index - Sample index
         */
        loadSample(index) {
            const sample = config.samples[index];
            if (sample) {
                // Call the callback with sample data and index
                config.onSampleChange(sample, index);
                
                // Update label
                this.updateLabel();
                
                // Check if button should be disabled
                if (config.disableOnCondition) {
                    const shouldDisable = config.disableOnCondition(sample, index);
                    if (shouldDisable) {
                        this.disable();
                    } else {
                        this.enable();
                    }
                }
            }
        },
        
        /**
         * Get the current sample
         * @returns {Object} Current sample data
         */
        getCurrentSample() {
            return config.samples[currentIndex];
        },
        
        /**
         * Get the current index
         * @returns {number} Current index
         */
        getCurrentIndex() {
            return currentIndex;
        },
        
        /**
         * Get total number of samples
         * @returns {number} Total samples
         */
        getTotalSamples() {
            return config.samples.length;
        },
        
        /**
         * Disable the navigation
         */
        disable() {
            isDisabled = true;
            if (button) {
                Object.assign(button.style, config.buttonDisabledStyle);
                button.style.cursor = 'not-allowed';
            }
        },
        
        /**
         * Enable the navigation
         */
        enable() {
            isDisabled = false;
            if (button) {
                Object.assign(button.style, config.buttonStyle);
                button.style.cursor = 'pointer';
            }
        },
        
        /**
         * Check if navigation is disabled
         * @returns {boolean} Disabled state
         */
        isDisabled() {
            return isDisabled;
        },
        
        /**
         * Reset to initial state
         */
        reset() {
            currentIndex = config.initialIndex;
            this.loadSample(currentIndex);
            this.enable();
        },
        
        /**
         * Setup keyboard shortcuts
         */
        setupKeyboardShortcuts() {
            const handler = (e) => {
                if (isDisabled) return;
                
                switch(e.key) {
                    case 'ArrowRight':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.next();
                        }
                        break;
                    case 'ArrowLeft':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.previous();
                        }
                        break;
                }
            };
            
            document.addEventListener('keydown', handler);
            
            // Store handler for cleanup
            this._keyboardHandler = handler;
        },
        
        /**
         * Update samples dynamically
         * @param {Array} newSamples - New samples array
         */
        updateSamples(newSamples) {
            if (!newSamples || !Array.isArray(newSamples) || newSamples.length === 0) {
                throw new Error('Invalid samples array');
            }
            
            config.samples = newSamples;
            currentIndex = Math.min(currentIndex, newSamples.length - 1);
            this.loadSample(currentIndex);
        },
        
        /**
         * Destroy the navigator and clean up
         */
        destroy() {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            
            if (this._keyboardHandler) {
                document.removeEventListener('keydown', this._keyboardHandler);
            }
            
            container = null;
            button = null;
            label = null;
        }
    };
    
    return navigator;
}

/**
 * Preset configurations for common sample navigation patterns
 */
export const SampleNavigatorPresets = {
    // Basic numbered samples
    BASIC: {
        labelFormat: 'Sample {current} of {total}',
        buttonText: 'Next Sample →'
    },
    
    // Example/exercise pattern
    EXAMPLE: {
        labelFormat: 'Example {current}/{total}',
        buttonText: 'Next Example →'
    },
    
    // Problem sets
    PROBLEM: {
        labelFormat: 'Problem {current} of {total}',
        buttonText: 'Next Problem →'
    },
    
    // Step-by-step tutorials
    STEP: {
        labelFormat: 'Step {current}/{total}',
        buttonText: 'Next Step →',
        cyclic: false  // Don't loop for steps
    },
    
    // Quiz questions
    QUIZ: {
        labelFormat: 'Question {current} of {total}',
        buttonText: 'Next Question →',
        cyclic: false
    },
    
    // Demonstration mode
    DEMO: {
        labelFormat: 'Demo {current}/{total}',
        buttonText: 'Next Demo →'
    }
};

/**
 * Helper function to create a simple sample navigator with minimal configuration
 * @param {Array} samples - Array of sample data
 * @param {Function} onSampleChange - Callback when sample changes
 * @param {HTMLElement} parentElement - Parent element for controls
 * @param {Object} preset - Optional preset configuration
 * @returns {Object} Sample navigator instance
 */
export function quickSampleNavigator(samples, onSampleChange, parentElement, preset = {}) {
    const navigator = createSampleNavigator({
        samples,
        onSampleChange,
        ...preset
    });
    
    navigator.createControls(parentElement);
    return navigator;
}

/**
 * Create a sample navigator that integrates with lesson state
 * @param {Object} options - Configuration with lesson-specific options
 * @returns {Object} Enhanced sample navigator
 */
export function createLessonSampleNavigator(options) {
    const {
        samples,
        onSampleChange,
        animationCheck,  // Function to check if animation is running
        resetAnimation,   // Function to reset any running animation
        parentElement,
        ...otherOptions
    } = options;
    
    // Wrap the onSampleChange to handle animation reset
    const wrappedOnChange = (sample, index) => {
        // Reset animation if it's running
        if (animationCheck && animationCheck()) {
            if (resetAnimation) {
                resetAnimation();
            }
        }
        
        // Call original handler
        onSampleChange(sample, index);
    };
    
    // Create navigator with disable condition
    const navigator = createSampleNavigator({
        samples,
        onSampleChange: wrappedOnChange,
        disableOnCondition: animationCheck,
        ...otherOptions
    });
    
    // Create controls if parent provided
    if (parentElement) {
        navigator.createControls(parentElement);
    }
    
    // Add method to sync with animation state
    navigator.syncWithAnimation = function(isAnimating) {
        if (isAnimating) {
            this.disable();
        } else {
            this.enable();
        }
    };
    
    return navigator;
}