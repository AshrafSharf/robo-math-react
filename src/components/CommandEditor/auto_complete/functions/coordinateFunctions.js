/**
 * Coordinate function metadata
 */

export const COORDINATE_FUNCTIONS = {
  x: {
    name: 'x',
    signature: '(point)',
    args: ['point: Point'],
    description: 'Extract x coordinate',
    altSignatures: ['x(point: Point)'],
    category: 'Coordinates'
  },
  y: {
    name: 'y',
    signature: '(point)',
    args: ['point: Point'],
    description: 'Extract y coordinate',
    altSignatures: ['y(point: Point)'],
    category: 'Coordinates'
  },
  st: {
    name: 'st',
    signature: '(shape)',
    args: ['shape: Line|Arc|Vec'],
    description: 'Start point of shape',
    altSignatures: ['st(shape: Line|Arc|Vec)'],
    category: 'Coordinates'
  },
  ed: {
    name: 'ed',
    signature: '(shape)',
    args: ['shape: Line|Arc|Vec'],
    description: 'End point of shape',
    altSignatures: ['ed(shape: Line|Arc|Vec)'],
    category: 'Coordinates'
  },
  mid: {
    name: 'mid',
    signature: '(g, shape)',
    args: ['g: Graph', 'shape: Shape'],
    description: 'Midpoint/center (line→mid, circle→center, triangle→incenter)',
    altSignatures: ['mid(g, line)', 'mid(g, circle)', 'mid(g, polygon)', 'mid(g, p1, p2)'],
    category: 'Coordinates'
  },
  pointatratio: {
    name: 'pointatratio',
    signature: '(g, shape, ratio)',
    args: ['g: Graph', 'shape: Shape', 'ratio: number'],
    description: 'Point at ratio along any shape (0=start, 1=end)',
    altSignatures: [
      'pointatratio(g, line, 0.5)',
      'pointatratio(g, circle, 0.25)',
      'pointatratio(g, arc, 0.5)',
      'pointatratio(g, polygon, 0.75)',
      'pointatratio(g, p1, p2, 0.3)'
    ],
    category: 'Coordinates'
  },
  a2p: {
    name: 'a2p',
    signature: '(g, circle, angle)',
    args: ['g: Graph', 'circle: Circle', 'angle: number'],
    description: 'Point on circle at angle (degrees)',
    altSignatures: ['a2p(g, circle, angle)', 'a2p(g, cx, cy, r, angle)'],
    category: 'Coordinates'
  }
};
