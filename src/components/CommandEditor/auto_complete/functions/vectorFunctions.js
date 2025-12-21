/**
 * Vector function metadata
 */

export const VECTOR_FUNCTIONS = {
  polar: {
    name: 'polar',
    signature: '(g, length, angle)',
    args: ['g: Graph', 'length: number', 'angle: number'],
    description: 'Vector from polar (radius, angle in degrees)',
    altSignatures: ['polar(g, length, angle)', 'polar(g, length, angle, fromX, fromY)', 'polar(g, length, angle, fromPoint)'],
    category: 'Vectors'
  },
  norm: {
    name: 'norm',
    signature: '(shape)',
    args: ['shape: Line|Vector'],
    description: 'Normalized direction (unit vector)',
    altSignatures: ['norm(line)', 'norm(vector)', 'norm(p1, p2)', 'norm(x, y)'],
    category: 'Vectors'
  },
  forward: {
    name: 'forward',
    signature: '(g, vector, dist)',
    args: ['g: Graph', 'vector: Vector', 'dist: number'],
    description: 'Shift vector forward along its direction',
    altSignatures: ['forward(g, vector, distance)', 'forward(g, line, distance)'],
    category: 'Vectors'
  },
  backward: {
    name: 'backward',
    signature: '(g, vector, dist)',
    args: ['g: Graph', 'vector: Vector', 'dist: number'],
    description: 'Shift vector backward (opposite direction)',
    altSignatures: ['backward(g, vector, distance)', 'backward(g, line, distance)'],
    category: 'Vectors'
  },
  perpshift: {
    name: 'perpshift',
    signature: '(g, vector, dist)',
    args: ['g: Graph', 'vector: Vector', 'dist: number'],
    description: 'Shift vector perpendicular (+left, -right)',
    altSignatures: ['perpshift(g, vector, distance)', 'perpshift(g, line, distance)'],
    category: 'Vectors'
  },
  placeat: {
    name: 'placeat',
    signature: '(g, vector, point)',
    args: ['g: Graph', 'vector: Vector', 'point: Point'],
    description: 'Copy vector to new starting point',
    altSignatures: ['placeat(g, vector, point)', 'placeat(g, vector, x, y)'],
    category: 'Vectors'
  },
  reverse: {
    name: 'reverse',
    signature: '(g, vector, point)',
    args: ['g: Graph', 'vector: Vector', 'point: Point'],
    description: 'Reverse vector at new starting point',
    altSignatures: ['reverse(g, vector, point)', 'reverse(g, vector, x, y)'],
    category: 'Vectors'
  },
  chain: {
    name: 'chain',
    signature: '(g, vectorA, vectorB)',
    args: ['g: Graph', 'vectorA: Vector', 'vectorB: Vector'],
    description: 'Place vectorB tail at vectorA tip (tip-to-tail)',
    altSignatures: ['chain(g, vectorA, vectorB)'],
    category: 'Vectors'
  },
  vecsum: {
    name: 'vecsum',
    signature: '(g, vectorA, vectorB)',
    args: ['g: Graph', 'vectorA: Vector', 'vectorB: Vector'],
    description: 'Vector addition (A + B)',
    altSignatures: ['vecsum(g, vectorA, vectorB)', 'vecsum(g, vectorA, vectorB, startPoint)'],
    category: 'Vectors'
  },
  vecdiff: {
    name: 'vecdiff',
    signature: '(g, vectorA, vectorB)',
    args: ['g: Graph', 'vectorA: Vector', 'vectorB: Vector'],
    description: 'Vector subtraction (A - B)',
    altSignatures: ['vecdiff(g, vectorA, vectorB)', 'vecdiff(g, vectorA, vectorB, startPoint)'],
    category: 'Vectors'
  },
  vecproject: {
    name: 'vecproject',
    signature: '(g, vector, target)',
    args: ['g: Graph', 'vector: Vector', 'target: Vector'],
    description: 'Project vector onto target vector',
    altSignatures: ['vecproject(g, vectorToProject, vectorTarget)'],
    category: 'Vectors'
  },
  decompose: {
    name: 'decompose',
    signature: '(g, vector, ref)',
    args: ['g: Graph', 'vector: Vector', 'ref: Vector'],
    description: 'Decompose vector (parallel/perpendicular)',
    altSignatures: ['decompose(g, vector, ref)', 'decompose(g, vector, ref, "perp") for perpendicular'],
    category: 'Vectors'
  }
};
