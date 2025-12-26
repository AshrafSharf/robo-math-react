/**
 * Graph function metadata
 */

export const GRAPH_FUNCTIONS = {
  g2d: {
    name: 'g2d',
    signature: '(row1, col1, row2, col2)',
    args: ['row1: number', 'col1: number', 'row2: number', 'col2: number'],
    description: 'Create 2D graph container',
    altSignatures: [
      'G = g2d(0, 0, 16, 8)',
      'G = g2d(0, 0, 16, 8, -10, 10)',
      'G = g2d(0, 0, 16, 8, -10, 10, -5, 5)',
      'G = g2d(0, 0, 16, 8, -10, 10, -5, 5, 1)'
    ],
    category: 'Graph'
  },
  g3d: {
    name: 'g3d',
    signature: '(row1, col1, row2, col2)',
    args: ['row1: number', 'col1: number', 'row2: number', 'col2: number'],
    description: 'Create 3D graph container',
    altSignatures: [
      'G = g3d(0, 0, 16, 8)',
      'G = g3d(0, 0, 16, 8, -5, 5, -5, 5, -5, 5)',
      'G = g3d(0, 0, 16, 8, -5, 5, -5, 5, -5, 5, 1)',
      'G = g3d(0, 0, 16, 4, ..., "lhs")',
      'G = g3d(0, 4, 16, 8, ..., "rhs")'
    ],
    category: 'Graph'
  },
  p2d: {
    name: 'p2d',
    signature: '(row1, col1, row2, col2)',
    args: ['row1: number', 'col1: number', 'row2: number', 'col2: number'],
    description: 'Create 2D polar graph container',
    altSignatures: [
      'P = p2d(0, 0, 16, 8)',
      'P = p2d(0, 0, 16, 8, 5)',
      'P = p2d(0, 0, 16, 8, 5, 1)'
    ],
    category: 'Graph'
  },
  plot: {
    name: 'plot',
    signature: '(g, "equation")',
    args: ['g: Graph', 'equation: string'],
    description: 'Plot a function equation',
    altSignatures: [
      'plot(G, "x^2")',
      'plot(G, "sin(x)")',
      'plot(G, "x^2 + 2*x - 3")',
      'plot(G, "x^2", -5, 5)',
      'f = def(f, (x), x^2)',
      'plot(G, f)',
      'plot(G, f, -10, 10)'
    ],
    category: 'Graph'
  },
  paraplot: {
    name: 'paraplot',
    signature: '(g, "xExpr", "yExpr")',
    args: ['g: Graph', 'xExpr: string', 'yExpr: string'],
    description: 'Parametric plot with x(t) and y(t)',
    altSignatures: [
      'paraplot(G, "cos(t)", "sin(t)")',
      'paraplot(G, "2*cos(t)", "sin(t)")',
      'paraplot(G, "cos(t)", "sin(t)", 0, 2*pi)',
      'paraplot(G, "t*cos(t)", "t*sin(t)", 0, 6*pi)',
      'fx = def(fx, (t), cos(t))',
      'fy = def(fy, (t), sin(t))',
      'paraplot(G, fx, fy)'
    ],
    category: 'Graph'
  },
  label: {
    name: 'label',
    signature: '(g, "text", x, y)',
    args: ['g: Graph', 'text: string', 'x: number', 'y: number'],
    description: 'MathText label with pen animation on graph',
    altSignatures: [
      'label(G, "f(x)", 2, 3)',
      'label(G, "\\\\frac{1}{2}", 0, 0)',
      'label(G, "x^2 + y^2 = r^2", A)',
      'label(G, "\\\\sqrt{2}", point(G, 1, 1))'
    ],
    category: 'Graph'
  },
  mtext: {
    name: 'mtext',
    signature: '(row, col, "latex")',
    args: ['row: number', 'col: number', 'latex: string'],
    description: 'Create math text at logical position',
    altSignatures: [
      'M = mtext(0, 0, "x^2 + y^2")',
      'M = mtext(2, 3, "\\\\frac{a}{b}")',
      'M = mtext(0, 0, "\\\\int_0^1 x^2 dx")'
    ],
    category: 'Graph'
  },
  write: {
    name: 'write',
    signature: '(target)',
    args: ['target: MathText|TextItem|Collection'],
    description: 'Animate writing math text',
    altSignatures: [
      'write(M)',
      'write(row, col, "latex")',
      'write(row, col, item(S, i))',
      'write(collection)',
      'write(item(S, i))'
    ],
    category: 'Graph'
  },
  select: {
    name: 'select',
    signature: '(M, "pattern")',
    args: ['M: MathText', 'pattern: string'],
    description: 'Get text items matching pattern',
    altSignatures: [
      'S = select(M, "x")',
      'S = select(M, "\\\\frac")',
      'S = select(M, "\\\\cos")',
      'write(select(M, "x"))'
    ],
    category: 'Graph'
  },
  selectexcept: {
    name: 'selectexcept',
    signature: '(M, "pattern")',
    args: ['M: MathText', 'pattern: string'],
    description: 'Get text items excluding pattern',
    altSignatures: [
      'S = selectexcept(M, "x")',
      'S = selectexcept(M, "=")',
      'write(selectexcept(M, "\\\\sin"))'
    ],
    category: 'Graph'
  },
  replace: {
    name: 'replace',
    signature: '("latex", textItem)',
    args: ['latex: string', 'textItem: TextItem'],
    description: 'Replace text item with new latex',
    altSignatures: [
      'replace("y", item(S, 0))',
      'replace("2x", select(M, "x"))',
      'replace("\\\\theta", select(M, "x"))'
    ],
    category: 'Graph'
  },
  overbrace: {
    name: 'overbrace',
    signature: '(textItem, "annotation")',
    args: ['textItem: TextItem', 'annotation: string'],
    description: 'Add annotation with overbrace above text',
    altSignatures: [
      'overbrace(select(M, "x"), "variable")',
      'overbrace(S, "numerator")',
      'overbrace(S, "first term", 5)'
    ],
    category: 'Graph'
  },
  underbrace: {
    name: 'underbrace',
    signature: '(textItem, "annotation")',
    args: ['textItem: TextItem', 'annotation: string'],
    description: 'Add annotation with underbrace below text',
    altSignatures: [
      'underbrace(select(M, "x"), "variable")',
      'underbrace(S, "denominator")',
      'underbrace(S, "last term", 5)'
    ],
    category: 'Graph'
  },
  mstep: {
    name: 'mstep',
    signature: '(above, below, result)',
    args: ['above: string', 'below: string', 'result: string'],
    description: 'Define a step for mflow (above arrow, below arrow, result)',
    altSignatures: [
      'mstep("f(x)", "step 1", "y")',
      'mstep("\\\\times 2", "double", "2x")',
      'mstep("g", "apply g", "g(x)")'
    ],
    category: 'Graph'
  },
  mflow: {
    name: 'mflow',
    signature: '(row, col, start, mstep(...), ...)',
    args: ['row: number', 'col: number', 'start: string', 'steps: mstep...'],
    description: 'Create math flow with annotated arrows between expressions',
    altSignatures: [
      'mflow(4, 4, "x", mstep("f(x)", "step 1", "y"))',
      'mflow(4, 4, "x", mstep("f", "step 1", "y"), mstep("g", "step 2", "z"))',
      'mflow(0, 0, "a", mstep("+b", "add", "a+b"), mstep("\\\\times 2", "double", "2(a+b)"))'
    ],
    category: 'Graph'
  },
  mline: {
    name: 'mline',
    signature: '(equation, reason?, number?)',
    args: ['equation: string', 'reason: string (optional)', 'number: number (optional)'],
    description: 'Define a line for meq (equation, optional reason, optional explicit number)',
    altSignatures: [
      'mline("x^2 = 4", "given")',
      'mline("x = \\\\pm 2")',
      'mline("E = mc^2", "Einstein", 42)'
    ],
    category: 'Graph'
  },
  meq: {
    name: 'meq',
    signature: '(row, col, mline(...), ...)',
    args: ['row: number', 'col: number', 'lines: mline...'],
    description: 'Create aligned equation steps with circled numbers (①②③...)',
    altSignatures: [
      'meq(4, 4, mline("x^2 = 4", "given"), mline("x = \\\\pm 2", "solved"))',
      'meq(4, 4, mline("a^2 + b^2 = c^2", "Pythagorean"), mline("c = 5"))',
      'm1 = mline("x = 1")\nmeq(4, 4, m1)'
    ],
    category: 'Graph'
  },
  mref: {
    name: 'mref',
    signature: '(number)',
    args: ['number: number'],
    description: 'Get circled equation reference number (①②③...) for use in text',
    altSignatures: [
      'mref(1)',
      '"From " + mref(1) + " we get..."',
      'write(8, 4, "Using " + mref(1) + " and " + mref(2))'
    ],
    category: 'Graph'
  },
  mcancel: {
    name: 'mcancel',
    signature: '(textItem, "text", "direction")',
    args: ['textItem: TextItem', 'text: string', 'direction: string'],
    description: 'Cancel (strikethrough) selected math text',
    altSignatures: [
      'mcancel(S, "0", "u")',
      'mcancel(S, "", "d")',
      'mcancel(S, "", "x")',
      'mcancel(select(M, "x"), "1", "u", "red")'
    ],
    category: 'Graph'
  },
  marrow: {
    name: 'marrow',
    signature: '(textItem, "anchor", "dir", length, "text")',
    args: ['textItem: TextItem', 'anchor: string', 'direction: string', 'length: number', 'text: string'],
    description: 'Draw curved arrow annotation pointing to math text',
    altSignatures: [
      'marrow(S, "rm", "E", 60, "note")',
      'marrow(S, "bl", "S", 50, "label", 70)',
      'marrow(select(M, "x"), "tm", "N", 40, "variable", 50, 5)'
    ],
    category: 'Graph'
  },
  table: {
    name: 'table',
    signature: '(row, col)',
    args: ['row: number', 'col: number'],
    description: 'Create table at logical position (configure via Settings panel)',
    altSignatures: [
      'table(row, col)',
      'table(row, col, rows, cols, "v1", "v2", ...)',
      'T = table(0, 0)',
      'T = table(4, 5, 2, 2, "a", "b", "c", "d")'
    ],
    category: 'Graph'
  },
  ref: {
    name: 'ref',
    signature: '()',
    args: [],
    description: 'Reference expression - content from Settings panel Ref tab',
    altSignatures: [
      'G = ref()  // then add g2d(...) in Ref tab',
      'T = ref()  // then add table(...) in Ref tab'
    ],
    category: 'Graph'
  }
};
