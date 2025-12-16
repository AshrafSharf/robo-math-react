/**
 * Line function metadata
 */

export const LINE_FUNCTIONS = {
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
  }
};
