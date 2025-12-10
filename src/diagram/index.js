/**
 * Public API for the 2D Diagram library
 * Only exports the essential classes, hiding all implementation details
 */

// Main 2D diagram classes
export { StaticDiagram2d } from './static-diagram-2d.js';
export { AnimatedDiagram2d } from './animated-diagram-2d.js';
export { BaseDiagram2d } from './base-diagram-2d.js';

// Legacy aliases for backward compatibility
export { StaticDiagram2d as StaticDiagram } from './static-diagram-2d.js';
export { AnimatedDiagram2d as AnimatedDiagram } from './animated-diagram-2d.js';
export { BaseDiagram2d as BaseDiagram } from './base-diagram-2d.js';

// Note: Effect classes are intentionally NOT exported
// They are internal implementation details