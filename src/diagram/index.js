/**
 * Public API for the clean Diagram library
 * Only exports the essential classes, hiding all implementation details
 */

// Main diagram classes
export { StaticDiagram } from './diagram.js';
export { AnimatedDiagram } from './animated-diagram.js';
export { BaseDiagram } from './base-diagram.js';

// Note: Effect classes are intentionally NOT exported
// They are internal implementation details