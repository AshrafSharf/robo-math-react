/**
 * Public API for the 2D Diagram library
 * Only exports the essential classes, hiding all implementation details
 */

// Main 2D diagram class
export { Diagram2d } from './diagram-2d.js';
export { BaseDiagram2d } from './base-diagram-2d.js';

// Legacy exports (kept for any remaining references)
export { StaticDiagram2d } from './static-diagram-2d.js';
export { AnimatedDiagram2d } from './animated-diagram-2d.js';

// Note: Effect classes are intentionally NOT exported
// They are internal implementation details
