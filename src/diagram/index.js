/**
 * Public API for the clean Diagram library
 * Only exports the essential classes, hiding all implementation details
 */

// Main diagram classes
export { Diagram } from './diagram.js';
export { AnimatedDiagram } from './animated-diagram.js';

// Note: Effect classes are intentionally NOT exported
// They are internal implementation details