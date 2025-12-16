/**
 * Transform function metadata
 */

export const TRANSFORM_FUNCTIONS = {
  intersect: {
    name: 'intersect',
    signature: '(g, shape1, shape2)',
    args: ['g: Graph', 'shape1: Line|Circle', 'shape2: Line|Circle'],
    description: 'Find intersection point(s)',
    altSignatures: ['intersect(g, line, line)', 'intersect(g, line, circle)', 'intersect(g, circle, circle)', 'intersect(g, shape1, shape2, index)'],
    category: 'Transforms'
  },
  reflect: {
    name: 'reflect',
    signature: '(g, line, point)',
    args: ['g: Graph', 'line: Line|Vec', 'point: Point'],
    description: 'Reflect point across line',
    altSignatures: ['reflect(g, line, point)', 'reflect(g, vec, point)'],
    category: 'Transforms'
  },
  rotate: {
    name: 'rotate',
    signature: '(g, point, center, angle)',
    args: ['g: Graph', 'point: Point', 'center: Point', 'angle: number'],
    description: 'Rotate point around center',
    altSignatures: ['rotate(g, point, center, angle)'],
    category: 'Transforms'
  },
  project: {
    name: 'project',
    signature: '(g, line, point)',
    args: ['g: Graph', 'line: Line|Vec', 'point: Point'],
    description: 'Project point onto line (foot of perpendicular)',
    altSignatures: ['project(g, line, point)', 'project(g, vec, point)'],
    category: 'Transforms'
  },
  translate: {
    name: 'translate',
    signature: '(g, point, dx, dy)',
    args: ['g: Graph', 'point: Point', 'dx: number', 'dy: number'],
    description: 'Translate point by offset',
    altSignatures: ['translate(g, point, dx, dy)'],
    category: 'Transforms'
  }
};
