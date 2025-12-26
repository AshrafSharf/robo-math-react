// Step Commenter Module
// Provides reusable animation status comments for JSXGraph lessons
// Displays styled text comments during step-by-step animations

/**
 * Creates a step comment manager for displaying animation status messages
 * @param {Object} board - JSXGraph board instance
 * @param {Object} options - Configuration options
 * @returns {Object} Comment manager with methods to control comments
 */
export function createStepCommenter(board, options = {}) {
    // Default configuration
    const defaultOptions = {
        x: 0,                    // X position (default: center)
        y: 3.8,                  // Y position 
        fontSize: 16,
        color: '#2c3e50',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#3498db',
        borderWidth: 2,
        borderRadius: 8,
        padding: '8px 16px',
        fontWeight: 500,
        useMathJax: true,
        anchorX: 'middle',
        anchorY: 'middle',
        shadow: true,
        fadeIn: false,           // Whether to fade in the comment
        autoHide: 0,             // Auto-hide after milliseconds (0 = no auto-hide)
        ...options               // Override with user options
    };
    
    let statusText = null;
    let hideTimeout = null;
    
    // Build CSS style string
    const buildStyle = (opts = {}) => {
        const config = { ...defaultOptions, ...opts };
        let style = `
            font-weight: ${config.fontWeight};
            background: ${config.backgroundColor};
            padding: ${config.padding};
            border: ${config.borderWidth}px solid ${config.borderColor};
            border-radius: ${config.borderRadius}px;
        `;
        
        if (config.shadow) {
            style += `box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);`;
        }
        
        if (config.fadeIn) {
            style += `
                animation: fadeIn 0.3s ease-in;
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
        }
        
        return style.trim();
    };
    
    // Manager object
    const manager = {
        /**
         * Show a comment with the given text
         * @param {string} text - Text to display (can include LaTeX with $...$ notation)
         * @param {Object} customOptions - Optional custom styling for this specific comment
         */
        show(text, customOptions = {}) {
            const config = { ...defaultOptions, ...customOptions };
            
            // Clear any pending hide timeout
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            
            // Create or update the text element
            if (!statusText) {
                statusText = board.create('text', [config.x, config.y, text], {
                    fontSize: config.fontSize,
                    color: config.color,
                    fixed: true,
                    useMathJax: config.useMathJax,
                    anchorX: config.anchorX,
                    anchorY: config.anchorY,
                    cssStyle: buildStyle(config)
                });
            } else {
                // Update existing text
                statusText.setText(text);
                
                // Update position if provided
                if ('x' in customOptions || 'y' in customOptions) {
                    const newX = customOptions.x !== undefined ? customOptions.x : statusText.X();
                    const newY = customOptions.y !== undefined ? customOptions.y : statusText.Y();
                    statusText.setPosition(JXG.COORDS_BY_USER, [newX, newY]);
                }
                
                // Update style if custom options provided
                if (Object.keys(customOptions).some(key => 
                    ['backgroundColor', 'borderColor', 'borderWidth', 'padding', 'shadow'].includes(key))) {
                    statusText.setAttribute({ cssStyle: buildStyle(config) });
                }
            }
            
            // Auto-hide if configured
            if (config.autoHide > 0) {
                hideTimeout = setTimeout(() => this.hide(), config.autoHide);
            }
            
            board.update();
        },
        
        /**
         * Hide the comment
         * @param {boolean} immediate - If true, hide immediately without fade
         */
        hide(immediate = true) {
            if (statusText) {
                if (immediate) {
                    statusText.setText('');
                } else {
                    // Could implement fade-out animation here if needed
                    statusText.setText('');
                }
                board.update();
            }
            
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
        },
        
        /**
         * Update only the text content without changing position or style
         * @param {string} text - New text to display
         */
        update(text) {
            if (statusText) {
                statusText.setText(text);
                board.update();
            } else {
                this.show(text);
            }
        },
        
        /**
         * Move the comment to a new position
         * @param {number} x - New X coordinate
         * @param {number} y - New Y coordinate
         */
        move(x, y) {
            if (statusText) {
                statusText.setPosition(JXG.COORDS_BY_USER, [x, y]);
                board.update();
            }
        },
        
        /**
         * Check if a comment is currently visible
         * @returns {boolean} True if comment is visible
         */
        isVisible() {
            return statusText && statusText.plaintext !== '';
        },
        
        /**
         * Destroy the comment and clean up
         */
        destroy() {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            
            if (statusText) {
                board.removeObject(statusText);
                statusText = null;
                board.update();
            }
        },
        
        /**
         * Get the current text element (for advanced customization)
         * @returns {Object|null} JSXGraph text element or null
         */
        getElement() {
            return statusText;
        }
    };
    
    return manager;
}

/**
 * Preset styles for common comment types
 */
export const CommentStyles = {
    // Default info style (blue border)
    INFO: {
        borderColor: '#3498db',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
    },
    
    // Success style (green border)
    SUCCESS: {
        borderColor: '#27ae60',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        color: '#27ae60'
    },
    
    // Warning style (yellow/orange border)
    WARNING: {
        borderColor: '#f39c12',
        backgroundColor: 'rgba(255, 251, 235, 0.95)',
        color: '#8b6914'
    },
    
    // Error style (red border)
    ERROR: {
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(255, 245, 245, 0.95)',
        color: '#c0392b'
    },
    
    // Highlight style (purple border with gradient)
    HIGHLIGHT: {
        borderColor: '#9b59b6',
        backgroundColor: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 238, 255, 0.95))',
        color: '#8e44ad'
    },
    
    // Math focus style (darker, more prominent)
    MATH_FOCUS: {
        borderColor: '#2c3e50',
        borderWidth: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        color: '#2c3e50',
        fontSize: 18,
        fontWeight: 600,
        padding: '10px 20px'
    },
    
    // Animation step style (compact, less prominent)
    STEP: {
        borderColor: '#95a5a6',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: '#5a6c7d',
        fontSize: 14,
        padding: '6px 12px'
    }
};

/**
 * Helper function to create a sequence of timed comments
 * @param {Object} board - JSXGraph board
 * @param {Array} sequence - Array of comment objects [{text, duration, style, position}]
 * @param {Object} options - Base options for all comments
 * @returns {Object} Controller for the sequence
 */
export function createCommentSequence(board, sequence, options = {}) {
    const commenter = createStepCommenter(board, options);
    let currentIndex = 0;
    let sequenceTimeout = null;
    let isPlaying = false;
    
    const controller = {
        /**
         * Start playing the sequence
         * @param {Function} onComplete - Callback when sequence completes
         */
        play(onComplete) {
            if (isPlaying) return;
            isPlaying = true;
            currentIndex = 0;
            
            const showNext = () => {
                if (currentIndex >= sequence.length) {
                    isPlaying = false;
                    commenter.hide();
                    if (onComplete) onComplete();
                    return;
                }
                
                const item = sequence[currentIndex];
                const style = item.style ? CommentStyles[item.style] || item.style : {};
                const position = item.position || {};
                
                commenter.show(item.text, { ...style, ...position });
                currentIndex++;
                
                const duration = item.duration || 2000;
                sequenceTimeout = setTimeout(showNext, duration);
            };
            
            showNext();
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
            commenter.hide();
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
            const item = sequence[currentIndex];
            if (item) {
                const style = item.style ? CommentStyles[item.style] || item.style : {};
                const position = item.position || {};
                commenter.show(item.text, { ...style, ...position });
            }
        },
        
        /**
         * Get the underlying commenter
         */
        getCommenter() {
            return commenter;
        },
        
        /**
         * Destroy the sequence and clean up
         */
        destroy() {
            this.stop();
            commenter.destroy();
        }
    };
    
    return controller;
}