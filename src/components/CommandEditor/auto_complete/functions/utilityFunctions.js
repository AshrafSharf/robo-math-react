/**
 * Utility function metadata
 */

export const UTILITY_FUNCTIONS = {
  mag: {
    name: 'mag',
    signature: '(shape)',
    args: ['shape: Line|Vector|Point'],
    description: 'Magnitude/length of shape or distance from origin',
    altSignatures: ['mag(line)', 'mag(vector)', 'mag(point)', 'mag(p1, p2)'],
    category: 'Utilities'
  },
  map: {
    name: 'map',
    signature: '(t, a, b)',
    args: ['t: number (0-1)', 'a: number|Point', 'b: number|Point'],
    description: 'Linear interpolation: a + t*(b-a)',
    altSignatures: ['map(0.5, 0, 100) → 50', 'map(0.25, P1, P2) → point 25% from P1 to P2'],
    category: 'Utilities'
  },
  item: {
    name: 'item',
    signature: '(collection, index)',
    args: ['collection: Collection', 'index: number'],
    description: 'Get item from collection by index',
    altSignatures: ['item(S, 0) // Get first item', 'T = item(shapes, 1) // Get second shape'],
    category: 'Utilities'
  }
};

/**
 * Visibility function metadata
 */
export const VISIBILITY_FUNCTIONS = {
  hide: {
    name: 'hide',
    signature: '(shape1, shape2, ...)',
    args: ['shapes: Shape...'],
    description: 'Hide shapes instantly',
    altSignatures: ['hide(A)', 'hide(A, B, C)'],
    category: 'Visibility'
  },
  show: {
    name: 'show',
    signature: '(shape1, shape2, ...)',
    args: ['shapes: Shape...'],
    description: 'Show shapes instantly',
    altSignatures: ['show(A)', 'show(A, B, C)'],
    category: 'Visibility'
  },
  fadein: {
    name: 'fadein',
    signature: '(shape1, shape2, ...)',
    args: ['shapes: Shape...'],
    description: 'Fade in shapes with animation',
    altSignatures: ['fadein(A)', 'fadein(A, B, C)'],
    category: 'Visibility'
  },
  fadeout: {
    name: 'fadeout',
    signature: '(shape1, shape2, ...)',
    args: ['shapes: Shape...'],
    description: 'Fade out shapes with animation',
    altSignatures: ['fadeout(A)', 'fadeout(A, B, C)'],
    category: 'Visibility'
  }
};

/**
 * Page/container manipulation functions
 */
export const PAGE_FUNCTIONS = {
  copy: {
    name: 'copy',
    signature: '(page, indices...)',
    args: ['page: string|number', 'indices: number|slice...'],
    description: 'Copy expressions from another page',
    altSignatures: [
      'copy("Page 1", 1, 2, 3)',
      'copy("Page 1", "1:6")',
      'copy("Page 1", 3, "7:10", 5)',
      'copy(1, "ALL")'
    ],
    category: 'Page'
  },
  pos: {
    name: 'pos',
    signature: '(containers..., dRow, dCol)',
    args: ['containers: g2d|mathtext|g3d...', 'dRow: number', 'dCol: number'],
    description: 'Shift containers by delta row/col in logical coordinates',
    altSignatures: [
      'pos(G, 2, 3)',
      'pos(G, T, 2, 3)',
      'pos(G, T, M, 1, -2)'
    ],
    category: 'Page'
  },
  size: {
    name: 'size',
    signature: '(containers..., widthRatio, heightRatio)',
    args: ['containers: g2d|mathtext|g3d...', 'widthRatio: number', 'heightRatio: number'],
    description: 'Scale containers by width/height ratio (0.5=half, 2=double)',
    altSignatures: [
      'size(G, 0.5, 0.5)',
      'size(G, T, 2, 2)',
      'size(G, 1.5, 0.75)'
    ],
    category: 'Page'
  }
};

/**
 * Animation control metadata
 */
export const ANIMATION_CONTROL_FUNCTIONS = {
  seq: {
    name: 'seq',
    signature: '(arg1, arg2, ...)',
    args: ['args: Shape|Expression...'],
    description: 'Execute commands sequentially (one after another)',
    altSignatures: [
      'seq(A, B, C)',
      'seq(fadeout(A), fadein(B))',
      'seq(l1, l2, circle(G, 3))'
    ],
    category: 'Animation'
  },
  para: {
    name: 'para',
    signature: '(arg1, arg2, ...)',
    args: ['args: Shape|Expression...'],
    description: 'Execute commands in parallel (simultaneously)',
    altSignatures: [
      'para(A, B, C)',
      'para(l1, l2)',
      'para(line(G, A, B), circle(G, C, 3))'
    ],
    category: 'Animation'
  }
};

/**
 * Function definition metadata
 */
export const FUNCTION_DEFINITION_FUNCTIONS = {
  def: {
    name: 'def',
    signature: '(name, params, body)',
    args: ['name: string', 'params: list', 'body: expression'],
    description: 'Define a custom function',
    altSignatures: ['def(name, (a, b), a + b)'],
    category: 'Functions'
  },
  fun: {
    name: 'fun',
    signature: '(name, args...)',
    args: ['name: string', 'args: values'],
    description: 'Call a custom function',
    altSignatures: ['fun(myFunc, 1, 2)'],
    category: 'Functions'
  }
};
