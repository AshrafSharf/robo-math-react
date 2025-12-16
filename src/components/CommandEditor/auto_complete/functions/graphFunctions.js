/**
 * Graph function metadata
 */

export const GRAPH_FUNCTIONS = {
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
  }
};
