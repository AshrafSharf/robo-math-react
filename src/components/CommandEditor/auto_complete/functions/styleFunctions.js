/**
 * Style function metadata (stroke, fill, etc.)
 */

export const STYLE_FUNCTIONS = {
  stroke: {
    name: 'stroke',
    signature: '(shape, color, opacity?)',
    args: ['shape: Shape', 'color: string', 'opacity?: number'],
    description: 'Animate stroke color change',
    altSignatures: [
      'stroke(shape, "red")',
      'stroke(shape, "#ff0000")',
      'stroke(shape, "blue", 0.5)',
      'stroke(A, B, C, "green")',
      'stroke(A, B, "red", 0.8)'
    ],
    category: 'Style'
  }
};
