/**
 * Geometry function metadata (2D basic shapes)
 */

export const GEOMETRY_FUNCTIONS = {
  point: {
    name: 'point',
    signature: '(g, x, y)',
    args: ['g: Graph', 'x: number', 'y: number'],
    description: 'Create a 2D point',
    altSignatures: [
      'A = point(G, 3, 4)',
      'B = point(G, -2, 1)',
      'C = point(G, A)'
    ],
    category: 'Geometry'
  },
  line: {
    name: 'line',
    signature: '(g, p1, p2)',
    args: ['g: Graph', 'p1: Point', 'p2: Point'],
    description: 'Create a line segment between two points',
    altSignatures: [
      'L = line(G, A, B)',
      'L = line(G, 0, 0, 4, 3)',
      'L = line(G, point(G, 1, 2), point(G, 5, 6))',
      'L = line(G, A, B, 1.5)',
      'L = line(G, A, B, 2)',
      'L = line(G, start(G, V), end(G, V))'
    ],
    category: 'Geometry'
  },
  vector: {
    name: 'vector',
    signature: '(g, p1, p2)',
    args: ['g: Graph', 'p1: Point', 'p2: Point'],
    description: 'Vector with arrowhead',
    altSignatures: [
      'V = vector(G, A, B)',
      'V = vector(G, 0, 0, 3, 4)',
      'V = vector(G, origin, point(G, 5, 0))'
    ],
    category: 'Geometry'
  },
  circle: {
    name: 'circle',
    signature: '(g, r)',
    args: ['g: Graph', 'r: number'],
    description: 'Circle (radius first, center at origin by default)',
    altSignatures: [
      'C = circle(G, 3)',
      'C = circle(G, 2, 1, 1)',
      'C = circle(G, 4, A)'
    ],
    category: 'Geometry'
  },
  arc: {
    name: 'arc',
    signature: '(g, cx, cy, r, start, sweep)',
    args: ['g: Graph', 'cx: number', 'cy: number', 'r: number', 'start°: number', 'sweep°: number'],
    description: 'Arc segment (angles in degrees)',
    altSignatures: [
      'arc(G, 0, 0, 3, 0, 90)',
      'arc(G, 2, 2, 2, 45, 180)',
      'arc(G, A, 3, 0, 270)'
    ],
    category: 'Geometry'
  },
  polygon: {
    name: 'polygon',
    signature: '(g, p1, p2, p3, ...)',
    args: ['g: Graph', 'p1: Point', 'p2: Point', 'p3: Point', '...'],
    description: 'Polygon from 3+ points',
    altSignatures: [
      'P = polygon(G, A, B, C)',
      'P = polygon(G, A, B, C, D)',
      'P = polygon(G, A, B, C, D, E)'
    ],
    category: 'Geometry'
  },
  sss: {
    name: 'sss',
    signature: '(g, a, b, c)',
    args: ['g: Graph', 'a: number', 'b: number', 'c: number'],
    description: 'Triangle from 3 side lengths (Side-Side-Side)',
    altSignatures: [
      'T = sss(G, 3, 4, 5)',
      'T = sss(G, distance(L1), distance(L2), distance(L3))',
      'T = sss(G, 3, 4, 5, basePoint)',
      'T = sss(G, 3, 4, 5, basePoint, rotation)'
    ],
    category: 'Geometry'
  },
  sas: {
    name: 'sas',
    signature: '(g, b, angleA, c)',
    args: ['g: Graph', 'b: number', 'angleA: degrees', 'c: number'],
    description: 'Triangle from Side-Angle-Side (included angle)',
    altSignatures: [
      'T = sas(G, 4, 90, 3)',
      'T = sas(G, 5, 60, 5)',
      'T = sas(G, distance(L1), 45, distance(L2))'
    ],
    category: 'Geometry'
  },
  asa: {
    name: 'asa',
    signature: '(g, angleA, c, angleB)',
    args: ['g: Graph', 'angleA: degrees', 'c: number', 'angleB: degrees'],
    description: 'Triangle from Angle-Side-Angle (included side)',
    altSignatures: [
      'T = asa(G, 60, 5, 60)',
      'T = asa(G, 90, 5, 45)',
      'T = asa(G, 30, distance(L), 60)'
    ],
    category: 'Geometry'
  },
  aas: {
    name: 'aas',
    signature: '(g, angleA, angleB, a)',
    args: ['g: Graph', 'angleA: degrees', 'angleB: degrees', 'a: number'],
    description: 'Triangle from Angle-Angle-Side (opposite side)',
    altSignatures: [
      'T = aas(G, 30, 60, 5)',
      'T = aas(G, 45, 45, 5)',
      'T = aas(G, 30, 60, distance(L))'
    ],
    category: 'Geometry'
  },
  measure: {
    name: 'measure',
    signature: '(g, p1, p2, label)',
    args: ['g: Graph', 'p1: Point', 'p2: Point', 'label: string'],
    description: 'Distance marker with perpendicular ticks and label',
    altSignatures: [
      'measure(G, A, B, "5 units")',
      'measure(G, 0, 0, 5, 0, "distance")',
      'measure(G, A, B, "d", textOffset, markerOffset)'
    ],
    category: 'Geometry'
  }
};

/**
 * 3D Geometry function metadata
 */
export const GEOMETRY_3D_FUNCTIONS = {
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
  vector3d: {
    name: 'vector3d',
    signature: '(g, p1, p2)',
    args: ['g: Graph3D', 'p1: Point3D', 'p2: Point3D'],
    description: 'Create a 3D vector with arrowhead',
    altSignatures: ['vector3d(g, p1, p2)', 'vector3d(g, x1, y1, z1, x2, y2, z2)'],
    category: '3D Geometry'
  },
  plane3d: {
    name: 'plane3d',
    signature: '(g, point, normal)',
    args: ['g: Graph3D', 'point: Point3D', 'normal: Vector3D'],
    description: 'Create a 3D plane with sweep animation',
    altSignatures: [
      'plane3d(g, point, normal)',
      'plane3d(g, p1, p2, p3)',
      'plane3d(g, a, b, c, d)',
      'plane3d(g, v1, v2, point)',
      'plane3d(g, "x + 2y - z = 5")'
    ],
    category: '3D Geometry'
  },
  polygon3d: {
    name: 'polygon3d',
    signature: '(g, p1, p2, p3, ...)',
    args: ['g: Graph3D', 'p1: Point3D', 'p2: Point3D', 'p3: Point3D', '...'],
    description: 'Create a 3D polygon from 3+ vertices',
    altSignatures: [
      'polygon3d(g, p1, p2, p3)',
      'polygon3d(g, p1, p2, p3, p4)',
      'polygon3d(g, p1, p2, p3, p4, p5, ...)'
    ],
    category: '3D Geometry'
  },
  measure3d: {
    name: 'measure3d',
    signature: '(g, p1, p2, label)',
    args: ['g: Graph3D', 'p1: Point3D', 'p2: Point3D', 'label: string'],
    description: '3D distance marker with perpendicular ticks and label',
    altSignatures: [
      'measure3d(G, A, B, "5 units")',
      'measure3d(G, 0, 0, 0, 5, 0, 0, "distance")',
      'measure3d(G, point3d(G, 0, 0, 0), point3d(G, 1, 2, 3), "d")'
    ],
    category: '3D Geometry'
  }
};

/**
 * 3D Vector operation function metadata
 */
export const VECTOR_3D_FUNCTIONS = {
  forward3d: {
    name: 'forward3d',
    signature: '(vec, scalar?)',
    args: ['vec: Vector3D|Line3D', 'scalar?: number'],
    description: 'Slide vector/line forward along its direction (animated)',
    altSignatures: ['forward3d(vec)', 'forward3d(vec, scalar)'],
    category: '3D Geometry'
  },
  backward3d: {
    name: 'backward3d',
    signature: '(vec, scalar?)',
    args: ['vec: Vector3D|Line3D', 'scalar?: number'],
    description: 'Slide vector/line backward along its direction (animated)',
    altSignatures: ['backward3d(vec)', 'backward3d(vec, scalar)'],
    category: '3D Geometry'
  },
  shiftTo3d: {
    name: 'shiftTo3d',
    signature: '(vec, point)',
    args: ['vec: Vector3D|Line3D', 'point: Point3D'],
    description: 'Shift vector/line to new position, preserving direction and magnitude (animated)',
    altSignatures: ['shiftTo3d(vec, point)', 'shiftTo3d(vec, x, y, z)'],
    category: '3D Geometry'
  },
  reverse3d: {
    name: 'reverse3d',
    signature: '(vec)',
    args: ['vec: Vector3D|Line3D'],
    description: 'Create reversed vector/line (opposite direction, animated)',
    altSignatures: ['reverse3d(vec)'],
    category: '3D Geometry'
  },
  pll3d: {
    name: 'pll3d',
    signature: '(vec, point, length?)',
    args: ['vec: Vector3D|Line3D', 'point: Point3D', 'length?: number'],
    description: 'Create parallel line/vector through point',
    altSignatures: ['pll3d(vec, point)', 'pll3d(vec, point, length)'],
    category: '3D Geometry'
  },
  perp3d: {
    name: 'perp3d',
    signature: '(vec, point, axis, length?)',
    args: ['vec: Vector3D|Line3D', 'point: Point3D', 'axis: Vector3D', 'length?: number'],
    description: 'Create perpendicular through point using axis for direction',
    altSignatures: ['perp3d(vec, point, axis)', 'perp3d(vec, point, axis, length)', 'perp3d(vec, point, ax, ay, az)'],
    category: '3D Geometry'
  },
  perpshift3d: {
    name: 'perpshift3d',
    signature: '(vec, distance, axis)',
    args: ['vec: Vector3D|Line3D', 'distance: number', 'axis: Vector3D'],
    description: 'Shift vector perpendicular using axis for direction (animated)',
    altSignatures: ['perpshift3d(vec, distance, axis)', 'perpshift3d(vec, distance, ax, ay, az)'],
    category: '3D Geometry'
  },
  placeat3d: {
    name: 'placeat3d',
    signature: '(vec, point)',
    args: ['vec: Vector3D|Line3D', 'point: Point3D'],
    description: 'Copy vector/line to new starting position',
    altSignatures: ['placeat3d(vec, point)', 'placeat3d(vec, x, y, z)'],
    category: '3D Geometry'
  },
  chain3d: {
    name: 'chain3d',
    signature: '(vecA, vecB)',
    args: ['vecA: Vector3D|Line3D', 'vecB: Vector3D|Line3D'],
    description: 'Position vecB tail at vecA tip (tail-to-tip, animated)',
    altSignatures: ['chain3d(vecA, vecB)'],
    category: '3D Geometry'
  },
  vecsum3d: {
    name: 'vecsum3d',
    signature: '(vecA, vecB, point?)',
    args: ['vecA: Vector3D|Line3D', 'vecB: Vector3D|Line3D', 'point?: Point3D'],
    description: 'Vector addition (A + B)',
    altSignatures: ['vecsum3d(vecA, vecB)', 'vecsum3d(vecA, vecB, point)', 'vecsum3d(vecA, vecB, x, y, z)'],
    category: '3D Geometry'
  },
  vecdiff3d: {
    name: 'vecdiff3d',
    signature: '(vecA, vecB, point?)',
    args: ['vecA: Vector3D|Line3D', 'vecB: Vector3D|Line3D', 'point?: Point3D'],
    description: 'Vector subtraction (A - B)',
    altSignatures: ['vecdiff3d(vecA, vecB)', 'vecdiff3d(vecA, vecB, point)', 'vecdiff3d(vecA, vecB, x, y, z)'],
    category: '3D Geometry'
  },
  vecproject3d: {
    name: 'vecproject3d',
    signature: '(vec, target, point?)',
    args: ['vec: Vector3D|Line3D', 'target: Vector3D|Line3D', 'point?: Point3D'],
    description: 'Project vector onto target vector',
    altSignatures: ['vecproject3d(vec, target)', 'vecproject3d(vec, target, point)', 'vecproject3d(vec, target, x, y, z)'],
    category: '3D Geometry'
  },
  decompose3d: {
    name: 'decompose3d',
    signature: '(vec, axis?)',
    args: ['vec: Vector3D|Line3D', 'axis?: "x"|"y"|"z"|Vector3D'],
    description: 'Decompose vector into axis component',
    altSignatures: ['decompose3d(vec)', 'decompose3d(vec, "x")', 'decompose3d(vec, "y")', 'decompose3d(vec, "z")', 'decompose3d(vec, refVec)', 'decompose3d(vec, refVec, "perp")'],
    category: '3D Geometry'
  },
  project3d: {
    name: 'project3d',
    signature: '(plane, point)',
    args: ['plane: Plane3D', 'point: Point3D'],
    description: 'Project point onto plane (foot of perpendicular)',
    altSignatures: ['project3d(plane, point)'],
    category: '3D Geometry'
  },
  reflect3d: {
    name: 'reflect3d',
    signature: '(plane, shape)',
    args: ['plane: Plane3D', 'shape: Point3D|Line3D|Vector3D|Polygon3D'],
    description: 'Reflect shape across plane',
    altSignatures: ['reflect3d(plane, point)', 'reflect3d(plane, line)', 'reflect3d(plane, vector)', 'reflect3d(plane, polygon)'],
    category: '3D Geometry'
  },
  intersect3d: {
    name: 'intersect3d',
    signature: '(obj1, obj2)',
    args: ['obj1: Line3D|Plane3D', 'obj2: Line3D|Plane3D'],
    description: 'Find intersection of 3D objects',
    altSignatures: ['intersect3d(line, line)', 'intersect3d(line, plane)', 'intersect3d(plane, plane)'],
    category: '3D Geometry'
  }
};

/**
 * 3D Plotting function metadata
 */
export const PLOTTING_3D_FUNCTIONS = {
  plot3d: {
    name: 'plot3d',
    signature: '(g, "equation")',
    args: ['g: Graph3D', 'equation: string'],
    description: 'Surface plot z = f(x, y) with mathjs variable binding',
    altSignatures: [
      'plot3d(g, "x^2 + y^2")',
      'plot3d(g, "equation", xMin, xMax, yMin, yMax)',
      'plot3d(g, funcDef)',
      'plot3d(g, "sin(x) * cos(y)")'
    ],
    category: '3D Plotting'
  },
  para3d: {
    name: 'para3d',
    signature: '(g, "xExpr", "yExpr", "zExpr", uMin, uMax, vMin, vMax)',
    args: ['g: Graph3D', 'xExpr: string', 'yExpr: string', 'zExpr: string', 'uMin: number', 'uMax: number', 'vMin: number', 'vMax: number'],
    description: 'Parametric surface (u, v) → (x, y, z)',
    altSignatures: [
      'para3d(g, "cos(u)*sin(v)", "sin(u)*sin(v)", "cos(v)", 0, 2*pi, 0, pi)',
      'para3d(g, xDef, yDef, zDef, uMin, uMax, vMin, vMax)'
    ],
    category: '3D Plotting'
  },
  curve3d: {
    name: 'curve3d',
    signature: '(g, "xExpr", "yExpr", "zExpr", tMin, tMax)',
    args: ['g: Graph3D', 'xExpr: string', 'yExpr: string', 'zExpr: string', 'tMin: number', 'tMax: number'],
    description: 'Parametric curve t → (x, y, z) in 3D space',
    altSignatures: [
      'curve3d(g, "cos(t)", "sin(t)", "t/5", 0, 4*pi)',
      'curve3d(g, xDef, yDef, zDef, tMin, tMax)'
    ],
    category: '3D Plotting'
  }
};
