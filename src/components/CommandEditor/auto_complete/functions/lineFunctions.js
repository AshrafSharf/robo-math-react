/**
 * Line function metadata
 */

export const LINE_FUNCTIONS = {
  vline: {
    name: 'vline',
    signature: '(g, x)',
    args: ['g: Graph', 'x: number'],
    description: 'Vertical line at x coordinate',
    altSignatures: [
      'L = vline(G, 3)',
      'L = vline(G, -2)',
      'L = vline(G, 0)',
      'L = vline(G, 5, -3, 3)'
    ],
    category: 'Lines'
  },
  hline: {
    name: 'hline',
    signature: '(g, y)',
    args: ['g: Graph', 'y: number'],
    description: 'Horizontal line at y coordinate',
    altSignatures: [
      'L = hline(G, 2)',
      'L = hline(G, -1)',
      'L = hline(G, 0)',
      'L = hline(G, 3, -5, 5)'
    ],
    category: 'Lines'
  },
  perp: {
    name: 'perp',
    signature: '(g, ref, point)',
    args: ['g: Graph', 'ref: Line|Vector', 'point: Point'],
    description: 'Perpendicular line/vector through point',
    altSignatures: [
      'P = perp(G, L, A)',
      'P = perp(G, L, point(G, 2, 3))',
      'P = perp(G, V, A)',
      'P = perp(G, L, A, 5)'
    ],
    category: 'Lines'
  },
  pll: {
    name: 'pll',
    signature: '(g, ref, point)',
    args: ['g: Graph', 'ref: Line|Vector', 'point: Point'],
    description: 'Parallel line/vector through point',
    altSignatures: [
      'P = pll(G, L, A)',
      'P = pll(G, L, point(G, 0, 3))',
      'P = pll(G, V, A)',
      'P = pll(G, L, A, 8)'
    ],
    category: 'Lines'
  },
  extendline: {
    name: 'extendline',
    signature: '(g, line, ratio)',
    args: ['g: Graph', 'line: Line', 'ratio: number'],
    description: 'Extend line (1.5 = 50% longer, 2 = double)',
    altSignatures: [
      'E = extendline(G, L, 1.5)',
      'E = extendline(G, L, 2)',
      'E = extendline(G, L, -0.5, 1.5)',
      'E = extendline(G, A, B, 2)'
    ],
    category: 'Lines'
  },
  polarline: {
    name: 'polarline',
    signature: '(g, length, angle)',
    args: ['g: Graph', 'length: number', 'angle°: number'],
    description: 'Line from length and angle (degrees)',
    altSignatures: [
      'L = polarline(G, 5, 45)',
      'L = polarline(G, 3, 90)',
      'L = polarline(G, 4, 30, 2, 1)',
      'L = polarline(G, 5, 60, A)'
    ],
    category: 'Lines'
  }
};
