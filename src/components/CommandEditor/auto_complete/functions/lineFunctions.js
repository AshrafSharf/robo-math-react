/**
 * Line function metadata
 */

export const LINE_FUNCTIONS = {
  vline: {
    name: 'vline',
    signature: '(g, x)',
    args: ['g: Graph', 'x: number'],
    description: 'Vertical line at x',
    altSignatures: ['vline(g: Graph, x: number)', 'vline(g: Graph, x: number, y1: number, y2: number)'],
    category: 'Lines'
  },
  hline: {
    name: 'hline',
    signature: '(g, y)',
    args: ['g: Graph', 'y: number'],
    description: 'Horizontal line at y',
    altSignatures: ['hline(g: Graph, y: number)', 'hline(g: Graph, y: number, x1: number, x2: number)'],
    category: 'Lines'
  },
  perp: {
    name: 'perp',
    signature: '(g, ref, point)',
    args: ['g: Graph', 'ref: Line|Vector', 'point: Point'],
    description: 'Perpendicular through point (line or vector based on input)',
    altSignatures: ['perp(g, line, point)', 'perp(g, vector, point)', 'perp(g, ref, point, length)'],
    category: 'Lines'
  },
  pll: {
    name: 'pll',
    signature: '(g, ref, point)',
    args: ['g: Graph', 'ref: Line|Vector', 'point: Point'],
    description: 'Parallel through point (line or vector based on input)',
    altSignatures: ['pll(g, line, point)', 'pll(g, vector, point)', 'pll(g, ref, point, length)'],
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
  }
};
