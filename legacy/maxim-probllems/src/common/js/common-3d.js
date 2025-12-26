/**
 * common-3d.js
 * Legacy compatibility wrapper for the modularized 3D system
 * This file maintains backward compatibility by re-exporting all functions
 * from the new modular structure in src/common/js/3d/
 */

// Re-export everything from the modular 3D system
export * from './3d/index.js';

// Maintain backward compatibility with a console message
if (typeof window !== 'undefined' && window.console) {
    console.log('common-3d.js: Using modularized 3D system from src/common/js/3d/');
}