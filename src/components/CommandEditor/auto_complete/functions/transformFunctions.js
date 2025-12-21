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
    signature: '(g, shape, angle)',
    args: ['g: Graph', 'shape: Point|Line|Vec|Circle|Polygon', 'angle: number'],
    description: 'Rotate shape around center (default: origin)',
    altSignatures: ['rotate(g, shape, angle)', 'rotate(g, shape, angle, cx, cy)', 'rotate(g, shape, angle, centerPoint)'],
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
    signature: '(g, shape, dx, dy)',
    args: ['g: Graph', 'shape: Point|Line|Vec|Circle|Polygon|Plot', 'dx: number', 'dy: number'],
    description: 'Translate shape by offset',
    altSignatures: ['translate(g, shape, dx, dy)'],
    category: 'Transforms'
  },
  scale: {
    name: 'scale',
    signature: '(g, shape, factor)',
    args: ['g: Graph', 'shape: Point|Line|Vec|Circle|Polygon', 'factor: number'],
    description: 'Scale shape around center (default: origin)',
    altSignatures: ['scale(g, shape, factor)', 'scale(g, shape, factor, cx, cy)', 'scale(g, shape, factor, centerPoint)'],
    category: 'Transforms'
  }
};
