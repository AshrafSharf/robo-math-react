/**
 * Math function metadata
 */

export const MATH_FUNCTIONS = {
  sin: {
    name: 'sin',
    signature: '(value)',
    args: ['value: number'],
    description: 'Sine (radians)',
    category: 'Math'
  },
  cos: {
    name: 'cos',
    signature: '(value)',
    args: ['value: number'],
    description: 'Cosine (radians)',
    category: 'Math'
  },
  tan: {
    name: 'tan',
    signature: '(value)',
    args: ['value: number'],
    description: 'Tangent (radians)',
    category: 'Math'
  },
  asin: {
    name: 'asin',
    signature: '(value)',
    args: ['value: number'],
    description: 'Arcsine',
    category: 'Math'
  },
  acos: {
    name: 'acos',
    signature: '(value)',
    args: ['value: number'],
    description: 'Arccosine',
    category: 'Math'
  },
  atan: {
    name: 'atan',
    signature: '(value)',
    args: ['value: number'],
    description: 'Arctangent',
    category: 'Math'
  },
  sqrt: {
    name: 'sqrt',
    signature: '(value)',
    args: ['value: number'],
    description: 'Square root',
    category: 'Math'
  },
  abs: {
    name: 'abs',
    signature: '(value)',
    args: ['value: number'],
    description: 'Absolute value',
    category: 'Math'
  },
  floor: {
    name: 'floor',
    signature: '(value)',
    args: ['value: number'],
    description: 'Round down',
    category: 'Math'
  },
  ceil: {
    name: 'ceil',
    signature: '(value)',
    args: ['value: number'],
    description: 'Round up',
    category: 'Math'
  },
  round: {
    name: 'round',
    signature: '(value)',
    args: ['value: number'],
    description: 'Round to nearest integer',
    category: 'Math'
  },
  min: {
    name: 'min',
    signature: '(a, b, ...)',
    args: ['values: number...'],
    description: 'Minimum of values',
    category: 'Math'
  },
  max: {
    name: 'max',
    signature: '(a, b, ...)',
    args: ['values: number...'],
    description: 'Maximum of values',
    category: 'Math'
  },
  exp: {
    name: 'exp',
    signature: '(value)',
    args: ['value: number'],
    description: 'e raised to the power',
    category: 'Math'
  },
  log: {
    name: 'log',
    signature: '(value)',
    args: ['value: number'],
    description: 'Natural logarithm',
    category: 'Math'
  }
};
