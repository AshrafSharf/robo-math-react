// Convenience module that re-exports all interactive functionality
// This allows lessons to import all interactive features from a single module

// Keyboard navigation
export { enableKeyboardNavigation } from './interactions/keyboard-navigation.js';

// Board updates
export { updateBoard, updateBoardWithMathJax } from './interactions/board-updates.js';

// MathJax integration
export { initializeMathJax, createMathText } from './interactions/mathjax-integration.js';

// Container sizing utilities
export { 
    getDeviceType2D, 
    resetContainerSize2D 
} from './utilities/container-sizing.js';