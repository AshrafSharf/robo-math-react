/**
 * Geometry function metadata (2D basic shapes)
 */

export const GEOMETRY_FUNCTIONS = {
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
  }
};
