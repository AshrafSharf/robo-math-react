/**
 * Animation utilities for vector-based lessons
 * Provides reusable animation button creation and lifecycle management
 */

// Use IIFE with conditional module support
(function(global) {
    'use strict';
    
    /**
     * Creates an animation button with hover effects and state management
     * @param {Object} controlPanel - The control panel instance
     * @param {Function} animateCallback - The animation function to call when button is clicked
     * @param {Object} options - Optional configuration
     * @returns {Object} Animation controller with methods to update state
     */
    function createAnimationButton(controlPanel, animateCallback, options = {}) {
        const defaults = {
            buttonText: 'Animate Vector Construction',
            runningText: 'Animation Running...',
            sectionId: 'animation',
            buttonStyle: 'width: 100%; font-size: 15px; padding: 6px 12px; margin-top: 8px;',
            normalColor: '#4dabf7',
            normalHoverColor: '#339af0',
            runningColor: '#fa5252',
            runningHoverColor: '#e03131'
        };
        
        const config = { ...defaults, ...options };
        let isAnimating = false;
        
        // Create animation section if it doesn't exist
        if (!document.getElementById(config.sectionId)) {
            controlPanel.createSection(config.sectionId);
        }
        
        // Add animation button
        controlPanel.addButton(config.sectionId, config.buttonText, () => {
            if (!isAnimating) {
                isAnimating = true;
                updateButtonState();
                
                // Call the animation callback with a done callback
                animateCallback(() => {
                    isAnimating = false;
                    updateButtonState();
                });
            }
        }, { 
            style: config.buttonStyle,
            id: 'animation-button'
        });
        
        // Get button element and add hover effects
        const animButton = document.getElementById('animation-button');
        
        if (animButton) {
            // Add hover event listeners
            animButton.addEventListener('mouseenter', function() {
                if (!isAnimating) {
                    this.style.backgroundColor = config.normalHoverColor;
                } else {
                    this.style.backgroundColor = config.runningHoverColor;
                }
            });
            
            animButton.addEventListener('mouseleave', function() {
                if (!isAnimating) {
                    this.style.backgroundColor = config.normalColor;
                } else {
                    this.style.backgroundColor = config.runningColor;
                }
            });
        }
        
        // Function to update button state
        function updateButtonState() {
            if (animButton) {
                if (isAnimating) {
                    animButton.textContent = config.runningText;
                    animButton.style.backgroundColor = config.runningColor;
                    animButton.style.cursor = 'not-allowed';
                } else {
                    animButton.textContent = config.buttonText;
                    animButton.style.backgroundColor = config.normalColor;
                    animButton.style.cursor = 'pointer';
                }
            }
        }
        
        // Initial state
        updateButtonState();
        
        // Return controller object
        return {
            setAnimating: function(state) {
                isAnimating = state;
                updateButtonState();
            },
            isAnimating: function() {
                return isAnimating;
            },
            updateButton: updateButtonState
        };
    }
    
    /**
     * Helper function to create animated vector sequences
     * @param {Object} board - JSXGraph board instance
     * @param {Array} vectorSequence - Array of vector definitions
     * @param {Object} options - Animation options
     * @returns {Array} Array of created animated elements for cleanup
     */
    function createVectorAnimation(board, vectorSequence, options = {}) {
        const defaults = {
            duration: 1000,
            strokeWidth: 4,
            delay: 100
        };
        
        const config = { ...defaults, ...options };
        const animatedElements = [];
        
        vectorSequence.forEach((vectorDef, index) => {
            const startPoint = board.create('point', vectorDef.start, {
                visible: false,
                fixed: true
            });
            
            const endPoint = board.create('point', vectorDef.start, {
                visible: false,
                fixed: true
            });
            
            const arrow = board.create('arrow', [startPoint, endPoint], {
                strokeColor: vectorDef.color,
                strokeWidth: config.strokeWidth,
                fixed: true,
                ...vectorDef.arrowOptions
            });
            
            animatedElements.push({
                start: startPoint,
                end: endPoint,
                arrow: arrow,
                targetEnd: vectorDef.end,
                delay: index * (config.duration + config.delay)
            });
        });
        
        return animatedElements;
    }
    
    /**
     * Animates a sequence of vectors with proper timing
     * @param {Array} animatedElements - Array from createVectorAnimation
     * @param {Function} onComplete - Callback when animation completes
     */
    function runVectorAnimation(animatedElements, onComplete) {
        let completed = 0;
        const total = animatedElements.length;
        
        animatedElements.forEach((element) => {
            setTimeout(() => {
                element.end.moveTo(element.targetEnd, 1000, {
                    callback: function() {
                        completed++;
                        if (completed === total && onComplete) {
                            onComplete();
                        }
                    }
                });
            }, element.delay);
        });
    }
    
    /**
     * Cleans up animated elements from the board
     * @param {Object} board - JSXGraph board instance
     * @param {Array} animatedElements - Array of animated elements to remove
     */
    function cleanupAnimation(board, animatedElements) {
        animatedElements.forEach(element => {
            board.removeObject(element.arrow);
            board.removeObject(element.end);
            board.removeObject(element.start);
        });
    }
    
    // Export functions
    const AnimationUtils = {
        createAnimationButton,
        createVectorAnimation,
        runVectorAnimation,
        cleanupAnimation
    };
    
    // Make available globally
    global.AnimationUtils = AnimationUtils;
    
    // Support module exports if available
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AnimationUtils;
    }
})(typeof window !== 'undefined' ? window : this);