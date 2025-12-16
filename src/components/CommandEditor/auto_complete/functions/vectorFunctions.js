/**
 * Vector function metadata
 */

export const VECTOR_FUNCTIONS = {
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
  }
};
