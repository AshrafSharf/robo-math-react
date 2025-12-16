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
  }
};
