/**
 * Angle function metadata
 */

export const ANGLE_FUNCTIONS = {
  angle: {
    name: 'angle',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Interior angle marker',
    altSignatures: ['angle(g, vertex, p1, p2)', 'angle(g, vertex, p1, p2, radius)', 'angle(g, line1, line2)'],
    category: 'Angles'
  },
  anglex: {
    name: 'anglex',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Exterior angle (first side)',
    altSignatures: ['anglex(g, vertex, p1, p2)', 'anglex(g, line1, line2)'],
    category: 'Angles'
  },
  anglex2: {
    name: 'anglex2',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Exterior angle (second side)',
    altSignatures: ['anglex2(g, vertex, p1, p2)', 'anglex2(g, line1, line2)'],
    category: 'Angles'
  },
  angler: {
    name: 'angler',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Reflex angle (> 180°)',
    altSignatures: ['angler(g, vertex, p1, p2)', 'angler(g, line1, line2)'],
    category: 'Angles'
  },
  anglert: {
    name: 'anglert',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Right angle marker (90°)',
    altSignatures: ['anglert(g, vertex, p1, p2)', 'anglert(g, line1, line2)'],
    category: 'Angles'
  },
  angleo: {
    name: 'angleo',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Vertically opposite angle',
    altSignatures: ['angleo(g, vertex, p1, p2)', 'angleo(g, line1, line2)'],
    category: 'Angles'
  }
};
