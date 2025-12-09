/**
 * Function metadata registry for robo-canvas language autocomplete.
 * Contains all available functions with their signatures, arguments, and descriptions.
 */

export const FUNCTION_METADATA = {
  // === GEOMETRY ===
  point: {
    name: 'point',
    signature: '(g, x, y)',
    args: ['g: Graph', 'x: number', 'y: number'],
    description: 'Create a 2D point',
    altSignatures: ['point(g: Graph, x: number, y: number)', 'point(g: Graph, st(Line))', 'point(g: Graph, ed(Line))'],
    category: 'Geometry'
  },
  line: {
    name: 'line',
    signature: '(g, p1, p2)',
    args: ['g: Graph', 'p1: Point', 'p2: Point'],
    description: 'Create a line segment',
    altSignatures: ['line(g: Graph, p1: Point, p2: Point)', 'line(g: Graph, x1: number, y1: number, x2: number, y2: number)', 'line(g: Graph, p1: Point, p2: Point, ext: number)'],
    category: 'Geometry'
  },
  vec: {
    name: 'vec',
    signature: '(g, p1, p2)',
    args: ['g: Graph', 'p1: Point', 'p2: Point'],
    description: 'Vector with arrowhead',
    altSignatures: ['vec(g: Graph, p1: Point, p2: Point)', 'vec(g: Graph, x1: number, y1: number, x2: number, y2: number)'],
    category: 'Geometry'
  },
  circle: {
    name: 'circle',
    signature: '(g, center, r)',
    args: ['g: Graph', 'center: Point', 'r: number'],
    description: 'Create a circle',
    altSignatures: ['circle(g: Graph, center: Point, r: number)', 'circle(g: Graph, cx: number, cy: number, r: number)'],
    category: 'Geometry'
  },
  arc: {
    name: 'arc',
    signature: '(g, cx, cy, r, start, sweep)',
    args: ['g: Graph', 'cx: number', 'cy: number', 'r: number', 'start°: number', 'sweep°: number'],
    description: 'Arc segment (angles in degrees)',
    altSignatures: ['arc(g: Graph, cx: number, cy: number, r: number, start°: number, sweep°: number)', 'arc(g: Graph, sx: number, sy: number, ex: number, ey: number, rx: number, ry: number)'],
    category: 'Geometry'
  },
  polygon: {
    name: 'polygon',
    signature: '(g, p1, p2, p3, ...)',
    args: ['g: Graph', 'p1: Point', 'p2: Point', 'p3: Point', '...'],
    description: 'Polygon from 3+ points',
    altSignatures: ['polygon(g: Graph, p1: Point, p2: Point, p3: Point, ...)', 'polygon(g: Graph, line1: Line, line2: Line, ...)'],
    category: 'Geometry'
  },

  // === ANGLES ===
  angle: {
    name: 'angle',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Interior angle marker',
    altSignatures: ['angle(g: Graph, vertex: Point, p1: Point, p2: Point)', 'angle(g: Graph, vertex: Point, p1: Point, p2: Point, radius: number)', 'angle(g: Graph, line1: Line, line2: Line)'],
    category: 'Angles'
  },
  anglex: {
    name: 'anglex',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Exterior angle (first side)',
    altSignatures: ['anglex(g: Graph, vertex: Point, p1: Point, p2: Point)', 'anglex(g: Graph, line1: Line, line2: Line)'],
    category: 'Angles'
  },
  anglex2: {
    name: 'anglex2',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Exterior angle (second side)',
    altSignatures: ['anglex2(g: Graph, vertex: Point, p1: Point, p2: Point)', 'anglex2(g: Graph, line1: Line, line2: Line)'],
    category: 'Angles'
  },
  angler: {
    name: 'angler',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Reflex angle (> 180°)',
    altSignatures: ['angler(g: Graph, vertex: Point, p1: Point, p2: Point)', 'angler(g: Graph, line1: Line, line2: Line)'],
    category: 'Angles'
  },
  anglert: {
    name: 'anglert',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Right angle marker (90°)',
    altSignatures: ['anglert(g: Graph, vertex: Point, p1: Point, p2: Point)', 'anglert(g: Graph, line1: Line, line2: Line)'],
    category: 'Angles'
  },
  angleo: {
    name: 'angleo',
    signature: '(g, vertex, p1, p2)',
    args: ['g: Graph', 'vertex: Point', 'p1: Point', 'p2: Point'],
    description: 'Vertically opposite angle',
    altSignatures: ['angleo(g: Graph, vertex: Point, p1: Point, p2: Point)', 'angleo(g: Graph, line1: Line, line2: Line)'],
    category: 'Angles'
  },

  // === LINES ===
  vl: {
    name: 'vl',
    signature: '(g, x)',
    args: ['g: Graph', 'x: number'],
    description: 'Vertical line at x',
    altSignatures: ['vl(g: Graph, x: number)', 'vl(g: Graph, x: number, y1: number, y2: number)'],
    category: 'Lines'
  },
  hl: {
    name: 'hl',
    signature: '(g, y)',
    args: ['g: Graph', 'y: number'],
    description: 'Horizontal line at y',
    altSignatures: ['hl(g: Graph, y: number)', 'hl(g: Graph, y: number, x1: number, x2: number)'],
    category: 'Lines'
  },
  perpl: {
    name: 'perpl',
    signature: '(g, line, point)',
    args: ['g: Graph', 'line: Line', 'point: Point'],
    description: 'Perpendicular line through point',
    altSignatures: ['perpl(g: Graph, line: Line, point: Point)', 'perpl(g: Graph, line: Line, point: Point, length: number)'],
    category: 'Lines'
  },
  pll: {
    name: 'pll',
    signature: '(g, line, point)',
    args: ['g: Graph', 'line: Line', 'point: Point'],
    description: 'Parallel line through point',
    altSignatures: ['pll(g: Graph, line: Line, point: Point)', 'pll(g: Graph, line: Line, point: Point, length: number)'],
    category: 'Lines'
  },

  // === VECTORS ===
  perpv: {
    name: 'perpv',
    signature: '(g, line, point)',
    args: ['g: Graph', 'line: Line', 'point: Point'],
    description: 'Perpendicular vector through point',
    altSignatures: ['perpv(g: Graph, line: Line, point: Point)', 'perpv(g: Graph, line: Line, point: Point, length: number)'],
    category: 'Vectors'
  },
  plv: {
    name: 'plv',
    signature: '(g, line, point)',
    args: ['g: Graph', 'line: Line', 'point: Point'],
    description: 'Parallel vector through point',
    altSignatures: ['plv(g: Graph, line: Line, point: Point)', 'plv(g: Graph, line: Line, point: Point, length: number)'],
    category: 'Vectors'
  },

  // === COORDINATES ===
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

  // === GRAPH ===
  g2d: {
    name: 'g2d',
    signature: '(row, col, w, h)',
    args: ['row: number', 'col: number', 'width: number', 'height: number'],
    description: 'Create 2D graph container',
    altSignatures: ['g2d(row: number, col: number, w: number, h: number)', 'g2d(row: number, col: number, w: number, h: number, xMin: number, xMax: number)', 'g2d(row: number, col: number, w: number, h: number, xMin: number, xMax: number, yMin: number, yMax: number)'],
    category: 'Graph'
  },
  plot: {
    name: 'plot',
    signature: '(g, equation)',
    args: ['g: Graph', 'equation: string'],
    description: 'Plot a function equation',
    altSignatures: ['plot(g: Graph, equation: string)', 'plot(g: Graph, equation: string, domainMin: number, domainMax: number)'],
    category: 'Graph'
  },

  // === MATH FUNCTIONS ===
  sin: {
    name: 'sin',
    signature: '(value)',
    args: ['value: number'],
    description: 'Sine (radians)',
    category: 'Math'
  },
  cos: {
    name: 'cos',
    signature: '(value)',
    args: ['value: number'],
    description: 'Cosine (radians)',
    category: 'Math'
  },
  tan: {
    name: 'tan',
    signature: '(value)',
    args: ['value: number'],
    description: 'Tangent (radians)',
    category: 'Math'
  },
  asin: {
    name: 'asin',
    signature: '(value)',
    args: ['value: number'],
    description: 'Arcsine',
    category: 'Math'
  },
  acos: {
    name: 'acos',
    signature: '(value)',
    args: ['value: number'],
    description: 'Arccosine',
    category: 'Math'
  },
  atan: {
    name: 'atan',
    signature: '(value)',
    args: ['value: number'],
    description: 'Arctangent',
    category: 'Math'
  },
  sqrt: {
    name: 'sqrt',
    signature: '(value)',
    args: ['value: number'],
    description: 'Square root',
    category: 'Math'
  },
  abs: {
    name: 'abs',
    signature: '(value)',
    args: ['value: number'],
    description: 'Absolute value',
    category: 'Math'
  },
  floor: {
    name: 'floor',
    signature: '(value)',
    args: ['value: number'],
    description: 'Round down',
    category: 'Math'
  },
  ceil: {
    name: 'ceil',
    signature: '(value)',
    args: ['value: number'],
    description: 'Round up',
    category: 'Math'
  },
  round: {
    name: 'round',
    signature: '(value)',
    args: ['value: number'],
    description: 'Round to nearest integer',
    category: 'Math'
  },
  min: {
    name: 'min',
    signature: '(a, b, ...)',
    args: ['values: number...'],
    description: 'Minimum of values',
    category: 'Math'
  },
  max: {
    name: 'max',
    signature: '(a, b, ...)',
    args: ['values: number...'],
    description: 'Maximum of values',
    category: 'Math'
  },
  exp: {
    name: 'exp',
    signature: '(value)',
    args: ['value: number'],
    description: 'e raised to the power',
    category: 'Math'
  },
  log: {
    name: 'log',
    signature: '(value)',
    args: ['value: number'],
    description: 'Natural logarithm',
    category: 'Math'
  },

  // === TRANSFORMATIONS ===
  intersect: {
    name: 'intersect',
    signature: '(shape1, shape2)',
    args: ['shape1: Line|Circle', 'shape2: Line|Circle'],
    description: 'Find intersection point(s)',
    category: 'Transforms'
  },
  reflect: {
    name: 'reflect',
    signature: '(point, line)',
    args: ['point: Point', 'line: Line'],
    description: 'Reflect point across line',
    category: 'Transforms'
  },
  rotate: {
    name: 'rotate',
    signature: '(point, center, angle)',
    args: ['point: Point', 'center: Point', 'angle: number'],
    description: 'Rotate point around center',
    category: 'Transforms'
  },
  project: {
    name: 'project',
    signature: '(point, line)',
    args: ['point: Point', 'line: Line'],
    description: 'Project point onto line',
    category: 'Transforms'
  },
  interpolate: {
    name: 'interpolate',
    signature: '(p1, p2, t)',
    args: ['p1: Point', 'p2: Point', 't: number'],
    description: 'Interpolate between two points',
    category: 'Transforms'
  },
  dilate: {
    name: 'dilate',
    signature: '(point, center, scale)',
    args: ['point: Point', 'center: Point', 'scale: number'],
    description: 'Scale point from center',
    category: 'Transforms'
  },
  translate: {
    name: 'translate',
    signature: '(point, dx, dy)',
    args: ['point: Point', 'dx: number', 'dy: number'],
    description: 'Translate point by offset',
    category: 'Transforms'
  },

  // === STYLING ===
  fill: {
    name: 'fill',
    signature: '(shape, color)',
    args: ['shape: Shape', 'color: string'],
    description: 'Fill shape with color',
    category: 'Styling'
  },
  stroke: {
    name: 'stroke',
    signature: '(shape, color)',
    args: ['shape: Shape', 'color: string'],
    description: 'Set stroke color',
    category: 'Styling'
  },
  dash: {
    name: 'dash',
    signature: '(shape, pattern)',
    args: ['shape: Shape', 'pattern: string'],
    description: 'Set dash pattern',
    category: 'Styling'
  },
  pointtype: {
    name: 'pointtype',
    signature: '(point, type)',
    args: ['point: Point', 'type: string'],
    description: 'Set point marker type',
    category: 'Styling'
  },
  marker: {
    name: 'marker',
    signature: '(shape, type)',
    args: ['shape: Shape', 'type: string'],
    description: 'Add markers to shape',
    category: 'Styling'
  },

  // === UTILITIES ===
  dist: {
    name: 'dist',
    signature: '(p1, p2)',
    args: ['p1: Point', 'p2: Point'],
    description: 'Distance between two points',
    category: 'Utilities'
  },
  pos: {
    name: 'pos',
    signature: '(shape)',
    args: ['shape: Shape'],
    description: 'Get position of shape',
    category: 'Utilities'
  },
  findangle: {
    name: 'findangle',
    signature: '(p1, vertex, p2)',
    args: ['p1: Point', 'vertex: Point', 'p2: Point'],
    description: 'Calculate angle in degrees',
    category: 'Utilities'
  },
  hide: {
    name: 'hide',
    signature: '(shape)',
    args: ['shape: Shape'],
    description: 'Hide a shape',
    category: 'Utilities'
  },
  trace: {
    name: 'trace',
    signature: '(shape)',
    args: ['shape: Shape'],
    description: 'Trace shape movement',
    category: 'Utilities'
  },
  text: {
    name: 'text',
    signature: '(content, x, y)',
    args: ['content: string', 'x: number', 'y: number'],
    description: 'Add text at position',
    category: 'Utilities'
  },
  group: {
    name: 'group',
    signature: '(shapes...)',
    args: ['shapes: Shape...'],
    description: 'Group shapes together',
    category: 'Utilities'
  },
  part: {
    name: 'part',
    signature: '(shape, index)',
    args: ['shape: Shape', 'index: number'],
    description: 'Get part of composite shape',
    category: 'Utilities'
  },
  fade: {
    name: 'fade',
    signature: '(shape, opacity)',
    args: ['shape: Shape', 'opacity: number'],
    description: 'Set shape opacity',
    category: 'Utilities'
  },
  reverse: {
    name: 'reverse',
    signature: '(vector)',
    args: ['vector: Vector'],
    description: 'Reverse vector direction',
    category: 'Utilities'
  },

  // === SET OPERATIONS ===
  and: {
    name: 'and',
    signature: '(shape1, shape2)',
    args: ['shape1: Shape', 'shape2: Shape'],
    description: 'Intersection of two shapes',
    category: 'Sets'
  },
  or: {
    name: 'or',
    signature: '(shape1, shape2)',
    args: ['shape1: Shape', 'shape2: Shape'],
    description: 'Union of two shapes',
    category: 'Sets'
  },
  diff: {
    name: 'diff',
    signature: '(shape1, shape2)',
    args: ['shape1: Shape', 'shape2: Shape'],
    description: 'Difference of two shapes',
    category: 'Sets'
  },
  subtract: {
    name: 'subtract',
    signature: '(shape1, shape2)',
    args: ['shape1: Shape', 'shape2: Shape'],
    description: 'Subtract shape2 from shape1',
    category: 'Sets'
  },

  // === SPECIAL ===
  para: {
    name: 'para',
    signature: '(line1, line2)',
    args: ['line1: Line', 'line2: Line'],
    description: 'Check if lines are parallel',
    category: 'Special'
  },
  perp: {
    name: 'perp',
    signature: '(line1, line2)',
    args: ['line1: Line', 'line2: Line'],
    description: 'Check if lines are perpendicular',
    category: 'Special'
  },
  parallel: {
    name: 'parallel',
    signature: '(line, point)',
    args: ['line: Line', 'point: Point'],
    description: 'Create parallel line through point',
    category: 'Special'
  }
};

/**
 * Get all function names as an array
 */
export function getAllFunctionNames() {
  return Object.keys(FUNCTION_METADATA);
}

/**
 * Get functions by category
 */
export function getFunctionsByCategory(category) {
  return Object.values(FUNCTION_METADATA).filter(f => f.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories() {
  const categories = new Set(Object.values(FUNCTION_METADATA).map(f => f.category));
  return Array.from(categories);
}

/**
 * Category display order for autocomplete grouping
 */
export const CATEGORY_ORDER = [
  'Geometry',
  'Angles',
  'Lines',
  'Vectors',
  'Coordinates',
  'Graph',
  'Math',
  'Transforms',
  'Styling',
  'Utilities',
  'Sets',
  'Special'
];
