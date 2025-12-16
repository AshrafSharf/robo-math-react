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
    altSignatures: ['point(g, x, y)', 'point(g, otherPoint)'],
    category: 'Geometry'
  },
  line: {
    name: 'line',
    signature: '(g, p1, p2)',
    args: ['g: Graph', 'p1: Point', 'p2: Point'],
    description: 'Create a line segment',
    altSignatures: ['line(g, p1, p2)', 'line(g, x1, y1, x2, y2)', 'line(g, p1, p2, ext)'],
    category: 'Geometry'
  },
  vector: {
    name: 'vector',
    signature: '(g, p1, p2)',
    args: ['g: Graph', 'p1: Point', 'p2: Point'],
    description: 'Vector with arrowhead',
    altSignatures: ['vector(g, p1, p2)', 'vector(g, x1, y1, x2, y2)'],
    category: 'Geometry'
  },
  circle: {
    name: 'circle',
    signature: '(g, r)',
    args: ['g: Graph', 'r: number'],
    description: 'Circle (radius first, center at origin by default)',
    altSignatures: ['circle(g, r)', 'circle(g, r, x, y)', 'circle(g, r, center)'],
    category: 'Geometry'
  },
  arc: {
    name: 'arc',
    signature: '(g, cx, cy, r, start, sweep)',
    args: ['g: Graph', 'cx: number', 'cy: number', 'r: number', 'start°: number', 'sweep°: number'],
    description: 'Arc segment (angles in degrees)',
    altSignatures: ['arc(g, cx, cy, r, start°, sweep°)'],
    category: 'Geometry'
  },
  polygon: {
    name: 'polygon',
    signature: '(g, p1, p2, p3, ...)',
    args: ['g: Graph', 'p1: Point', 'p2: Point', 'p3: Point', '...'],
    description: 'Polygon from 3+ points',
    altSignatures: ['polygon(g, p1, p2, p3, ...)'],
    category: 'Geometry'
  },

  // === ANGLES ===
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
  xl: {
    name: 'xl',
    signature: '(g, line, amount)',
    args: ['g: Graph', 'line: Line', 'amount: number'],
    description: 'Extend line by amount',
    altSignatures: ['xl(g, line, amount)', 'xl(g, line, startAmt, endAmt)'],
    category: 'Lines'
  },
  ral: {
    name: 'ral',
    signature: '(g, length, angle)',
    args: ['g: Graph', 'length: number', 'angle: number'],
    description: 'Line from polar (radius, angle in degrees)',
    altSignatures: ['ral(g, length, angle)', 'ral(g, length, angle, fromX, fromY)', 'ral(g, length, angle, fromPoint)'],
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
  rav: {
    name: 'rav',
    signature: '(g, length, angle)',
    args: ['g: Graph', 'length: number', 'angle: number'],
    description: 'Vector from polar (radius, angle in degrees)',
    altSignatures: ['rav(g, length, angle)', 'rav(g, length, angle, fromX, fromY)', 'rav(g, length, angle, fromPoint)'],
    category: 'Vectors'
  },
  uv: {
    name: 'uv',
    signature: '(g, shape)',
    args: ['g: Graph', 'shape: Line|Vec'],
    description: 'Unit vector (normalized direction)',
    altSignatures: ['uv(g, line)', 'uv(g, vec)', 'uv(g, p1, p2)'],
    category: 'Vectors'
  },
  fwv: {
    name: 'fwv',
    signature: '(g, vec, dist)',
    args: ['g: Graph', 'vec: Vec', 'dist: number'],
    description: 'Shift vector forward along its direction',
    altSignatures: ['fwv(g, vec, distance)', 'fwv(g, line, distance)'],
    category: 'Vectors'
  },
  bwv: {
    name: 'bwv',
    signature: '(g, vec, dist)',
    args: ['g: Graph', 'vec: Vec', 'dist: number'],
    description: 'Shift vector backward (opposite direction)',
    altSignatures: ['bwv(g, vec, distance)', 'bwv(g, line, distance)'],
    category: 'Vectors'
  },
  pmv: {
    name: 'pmv',
    signature: '(g, vec, dist)',
    args: ['g: Graph', 'vec: Vec', 'dist: number'],
    description: 'Shift vector perpendicular (+left, -right)',
    altSignatures: ['pmv(g, vec, distance)', 'pmv(g, line, distance)'],
    category: 'Vectors'
  },
  cpv: {
    name: 'cpv',
    signature: '(g, vec, point)',
    args: ['g: Graph', 'vec: Vec', 'point: Point'],
    description: 'Copy vector to new starting point',
    altSignatures: ['cpv(g, vec, point)', 'cpv(g, vec, x, y)'],
    category: 'Vectors'
  },
  rvv: {
    name: 'rvv',
    signature: '(g, vec, point)',
    args: ['g: Graph', 'vec: Vec', 'point: Point'],
    description: 'Reverse vector at new starting point',
    altSignatures: ['rvv(g, vec, point)', 'rvv(g, vec, x, y)'],
    category: 'Vectors'
  },
  ttv: {
    name: 'ttv',
    signature: '(g, vecA, vecB)',
    args: ['g: Graph', 'vecA: Vec', 'vecB: Vec'],
    description: 'Place vecB tail at vecA tip (tip-to-tail)',
    altSignatures: ['ttv(g, vecA, vecB)'],
    category: 'Vectors'
  },
  addv: {
    name: 'addv',
    signature: '(g, vecA, vecB)',
    args: ['g: Graph', 'vecA: Vec', 'vecB: Vec'],
    description: 'Vector addition (A + B)',
    altSignatures: ['addv(g, vecA, vecB)', 'addv(g, vecA, vecB, startPoint)'],
    category: 'Vectors'
  },
  subv: {
    name: 'subv',
    signature: '(g, vecA, vecB)',
    args: ['g: Graph', 'vecA: Vec', 'vecB: Vec'],
    description: 'Vector subtraction (A - B)',
    altSignatures: ['subv(g, vecA, vecB)', 'subv(g, vecA, vecB, startPoint)'],
    category: 'Vectors'
  },
  scalev: {
    name: 'scalev',
    signature: '(g, vec, scalar)',
    args: ['g: Graph', 'vec: Vec', 'scalar: number'],
    description: 'Scale vector by scalar',
    altSignatures: ['scalev(g, vec, scalar)', 'scalev(g, vec, scalar, startPoint)'],
    category: 'Vectors'
  },
  prov: {
    name: 'prov',
    signature: '(g, vec, target)',
    args: ['g: Graph', 'vec: Vec', 'target: Vec'],
    description: 'Project vector onto target vector',
    altSignatures: ['prov(g, vecToProject, vecTarget)'],
    category: 'Vectors'
  },
  dcv: {
    name: 'dcv',
    signature: '(g, vec, ref)',
    args: ['g: Graph', 'vec: Vec', 'ref: Vec'],
    description: 'Decompose vector (parallel/perpendicular)',
    altSignatures: ['dcv(g, vec, ref)', 'dcv(g, vec, ref, 1) for perpendicular'],
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
  mid: {
    name: 'mid',
    signature: '(g, shape)',
    args: ['g: Graph', 'shape: Shape'],
    description: 'Midpoint/center (line→mid, circle→center, triangle→incenter)',
    altSignatures: ['mid(g, line)', 'mid(g, circle)', 'mid(g, polygon)', 'mid(g, p1, p2)'],
    category: 'Coordinates'
  },
  r2p: {
    name: 'r2p',
    signature: '(g, line, ratio)',
    args: ['g: Graph', 'line: Line', 'ratio: number'],
    description: 'Point at ratio along line (0=start, 1=end)',
    altSignatures: ['r2p(g, line, ratio)', 'r2p(g, p1, p2, ratio)'],
    category: 'Coordinates'
  },
  a2p: {
    name: 'a2p',
    signature: '(g, circle, angle)',
    args: ['g: Graph', 'circle: Circle', 'angle: number'],
    description: 'Point on circle at angle (degrees)',
    altSignatures: ['a2p(g, circle, angle)', 'a2p(g, cx, cy, r, angle)'],
    category: 'Coordinates'
  },

  // === GRAPH ===
  g2d: {
    name: 'g2d',
    signature: '(row1, col1, row2, col2)',
    args: ['row1: number', 'col1: number', 'row2: number', 'col2: number'],
    description: 'Create 2D graph container',
    altSignatures: ['g2d(row1, col1, row2, col2)', 'g2d(row1, col1, row2, col2, xMin, xMax)', 'g2d(row1, col1, row2, col2, xMin, xMax, yMin, yMax)', 'g2d(row1, col1, row2, col2, xMin, xMax, yMin, yMax, showGrid)'],
    category: 'Graph'
  },
  g3d: {
    name: 'g3d',
    signature: '(row1, col1, row2, col2)',
    args: ['row1: number', 'col1: number', 'row2: number', 'col2: number'],
    description: 'Create 3D graph container',
    altSignatures: ['g3d(row1, col1, row2, col2)', 'g3d(row1, col1, row2, col2, xMin, xMax, yMin, yMax, zMin, zMax)', 'g3d(row1, col1, row2, col2, xMin, xMax, yMin, yMax, zMin, zMax, showGrid)', 'g3d(..., "lhs"|"rhs")'],
    category: 'Graph'
  },
  p2d: {
    name: 'p2d',
    signature: '(row1, col1, row2, col2)',
    args: ['row1: number', 'col1: number', 'row2: number', 'col2: number'],
    description: 'Create 2D polar graph container',
    altSignatures: ['p2d(row1, col1, row2, col2)', 'p2d(row1, col1, row2, col2, rMax)', 'p2d(row1, col1, row2, col2, rMax, showGrid)'],
    category: 'Graph'
  },
  plot: {
    name: 'plot',
    signature: '(g, "equation")',
    args: ['g: Graph', 'equation: string'],
    description: 'Plot a function equation',
    altSignatures: ['plot(g, "y = x^2")', 'plot(g, "equation", domainMin, domainMax)'],
    category: 'Graph'
  },
  paraplot: {
    name: 'paraplot',
    signature: '(g, "xExpr", "yExpr")',
    args: ['g: Graph', 'xExpr: string', 'yExpr: string'],
    description: 'Parametric plot with x(t) and y(t)',
    altSignatures: ['paraplot(g, "cos(t)", "sin(t)")', 'paraplot(g, "xExpr", "yExpr", tMin, tMax)', 'paraplot(g, xFuncDef, yFuncDef)'],
    category: 'Graph'
  },
  label: {
    name: 'label',
    signature: '(g, "text", x, y)',
    args: ['g: Graph', 'text: string', 'x: number', 'y: number'],
    description: 'MathText label with pen animation on graph',
    altSignatures: ['label(g, "latex", x, y)', 'label(g, "latex", point)'],
    category: 'Graph'
  },

  // === 3D GEOMETRY ===
  point3d: {
    name: 'point3d',
    signature: '(g, x, y, z)',
    args: ['g: Graph3D', 'x: number', 'y: number', 'z: number'],
    description: 'Create a 3D point',
    altSignatures: ['point3d(g, x, y, z)', 'point3d(g, point2d, z)'],
    category: '3D Geometry'
  },
  line3d: {
    name: 'line3d',
    signature: '(g, p1, p2)',
    args: ['g: Graph3D', 'p1: Point3D', 'p2: Point3D'],
    description: 'Create a 3D line segment',
    altSignatures: ['line3d(g, p1, p2)', 'line3d(g, x1, y1, z1, x2, y2, z2)'],
    category: '3D Geometry'
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
  },

  // === UTILITIES ===
  mag: {
    name: 'mag',
    signature: '(shape)',
    args: ['shape: Line|Vector|Point'],
    description: 'Magnitude/length of shape or distance from origin',
    altSignatures: ['mag(line)', 'mag(vector)', 'mag(point)', 'mag(p1, p2)'],
    category: 'Utilities'
  },
  map: {
    name: 'map',
    signature: '(t, a, b)',
    args: ['t: number (0-1)', 'a: number|Point', 'b: number|Point'],
    description: 'Linear interpolation: a + t*(b-a)',
    altSignatures: ['map(0.5, 0, 100) → 50', 'map(0.25, P1, P2) → point 25% from P1 to P2'],
    category: 'Utilities'
  },

  // === VISIBILITY ===
  hide: {
    name: 'hide',
    signature: '(shape1, shape2, ...)',
    args: ['shapes: Shape...'],
    description: 'Hide shapes instantly',
    altSignatures: ['hide(A)', 'hide(A, B, C)'],
    category: 'Visibility'
  },
  show: {
    name: 'show',
    signature: '(shape1, shape2, ...)',
    args: ['shapes: Shape...'],
    description: 'Show shapes instantly',
    altSignatures: ['show(A)', 'show(A, B, C)'],
    category: 'Visibility'
  },
  fadein: {
    name: 'fadein',
    signature: '(shape1, shape2, ...)',
    args: ['shapes: Shape...'],
    description: 'Fade in shapes with animation',
    altSignatures: ['fadein(A)', 'fadein(A, B, C)'],
    category: 'Visibility'
  },
  fadeout: {
    name: 'fadeout',
    signature: '(shape1, shape2, ...)',
    args: ['shapes: Shape...'],
    description: 'Fade out shapes with animation',
    altSignatures: ['fadeout(A)', 'fadeout(A, B, C)'],
    category: 'Visibility'
  },

  // === FUNCTIONS ===
  def: {
    name: 'def',
    signature: '(name, params, body)',
    args: ['name: string', 'params: list', 'body: expression'],
    description: 'Define a custom function',
    altSignatures: ['def(name, (a, b), a + b)'],
    category: 'Functions'
  },
  fun: {
    name: 'fun',
    signature: '(name, args...)',
    args: ['name: string', 'args: values'],
    description: 'Call a custom function',
    altSignatures: ['fun(myFunc, 1, 2)'],
    category: 'Functions'
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
  '3D Geometry',
  'Angles',
  'Lines',
  'Vectors',
  'Coordinates',
  'Graph',
  'Math',
  'Transforms',
  'Visibility',
  'Utilities',
  'Functions'
];
