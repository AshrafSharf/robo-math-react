/**
 * index.js
 * Main export file for the modularized common-3d system
 * Provides a single entry point for all 3D utilities
 */

// Core functionality and constants
export * from './core-3d.js';

// Basic geometry and axes
export * from './basic-geometry-3d.js';

// Primitive shapes (lines, arrows, curves)
export * from './primitives-3d.js';

// Vector-related visualizations
export * from './vectors-3d.js';

// Angle visualizations
export * from './angles-3d.js';

// Surface creation and visualization
export * from './surfaces-3d.js';

// 2D shapes and cross-sections in 3D
export * from './shapes-2d-3d.js';

// Labels and text
export * from './labels-3d.js';

// Interactive features
export * from './interactive-3d.js';

// Control panel utilities
export * from './control-panel-3d.js';

// Colormap functions
export * from './colormaps-3d.js';

// For convenience, also export THREE.js (so lessons don't need to import it separately)
export * as THREE from 'three';