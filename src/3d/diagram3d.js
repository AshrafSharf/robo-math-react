/**
 * Diagram3D - Exports for 3D diagram classes
 */

import { LHS3DDiagram } from './lhs_diagram3d.js';
import { RHS3DDiagram } from './rhs_diagram3d.js';
import { LHSAnimatedDiagram } from './lhs_animated_diagram_3d.js';
import { RHSAnimatedDiagram } from './rhs_animated_diagram_3d.js';

// Default export for backward compatibility
export const Diagram3D = LHS3DDiagram;

// Named exports
export { LHS3DDiagram, RHS3DDiagram };
export { LHSAnimatedDiagram, RHSAnimatedDiagram };
