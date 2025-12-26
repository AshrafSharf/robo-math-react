// Container sizing utilities for responsive layout
// Extracted from common.js to handle DOM manipulation and responsive behavior

import { SIZES } from '../sizes.js';

// Legacy format for backward compatibility
const SIZE_PRESETS_2D_LEGACY = {
    'diagram-panel': {
        desktop: { width: SIZES.LAYOUT.TOTAL_WIDTH, height: SIZES.LAYOUT.HEIGHT, fontSize: 16 },
        tablet: { width: SIZES.LAYOUT.TOTAL_WIDTH, height: SIZES.LAYOUT.HEIGHT, fontSize: 16 },
        mobile: { width: SIZES.LAYOUT.TOTAL_WIDTH, height: SIZES.LAYOUT.HEIGHT, fontSize: 14 }
    },
    
    // Legacy formats for backward compatibility
    'medium-rect': {
        desktop: { width: SIZES.LAYOUT.TOTAL_WIDTH, height: SIZES.LAYOUT.HEIGHT, fontSize: 16 },
        tablet: { width: SIZES.LAYOUT.TOTAL_WIDTH, height: SIZES.LAYOUT.HEIGHT, fontSize: 16 },
        mobile: { width: SIZES.LAYOUT.TOTAL_WIDTH, height: SIZES.LAYOUT.HEIGHT, fontSize: 14 }
    }
};

/**
 * Helper function to determine device type for 2D lessons
 * @returns {string} 'mobile', 'tablet', or 'desktop'
 */
export function getDeviceType2D() {
    if (window.innerWidth <= 480) {
        return 'mobile';
    } else if (window.innerWidth <= 768) {
        return 'tablet';
    }
    return 'desktop';
}

/**
 * Function to reset container size to default diagram-panel configuration
 * @param {string} containerId - ID of the container element (default: 'boards-container')
 */
export function resetContainerSize2D(containerId = 'boards-container') {
    const container = document.getElementById(containerId);
    const deviceType = getDeviceType2D();
    const defaultSize = SIZE_PRESETS_2D_LEGACY['diagram-panel'][deviceType];
    
    container.style.width = `${defaultSize.width}px`;
    container.style.height = `${defaultSize.height}px`;
    container.setAttribute('data-font-size', defaultSize.fontSize);
}