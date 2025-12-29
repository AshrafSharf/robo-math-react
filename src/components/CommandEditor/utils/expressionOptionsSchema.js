/**
 * Expression Options Schema
 * Defines available options and defaults for each expression type
 *
 * All shapes use expression-based styling (c, s, f, so, fo, fc) and only show Animation tab.
 * Graph containers (g2d, p2d) have dedicated options panels.
 *
 * _tabs: Array of allowed tab ids (e.g., ['animation'] or ['expression'])
 */

export const EXPRESSION_OPTIONS_SCHEMA = {
  // Graph 2D - options now handled via expression syntax (axes(), range(), "gridlines", "nogrid")
  g2d: {
    _tabs: ['animation'],
  },

  // Polar 2D - no style controls
  p2d: {
    _style: null,
    showGrid: { type: 'checkbox', default: true, label: 'Show Grid' },
    rMax: { type: 'number', min: 1, max: 100, default: 10, label: 'Max Radius' },
    radialLines: { type: 'number', min: 4, max: 24, default: 12, label: 'Radial Lines' },
    concentricCircles: { type: 'number', min: 2, max: 20, default: 5, label: 'Circles' },
    angleLabels: { type: 'checkbox', default: true, label: 'Show Angle Labels' },
  },

  // Line - animation only (styling via expressions)
  line: {
    _tabs: ['animation'],
  },

  // Circle - animation only (styling via expressions)
  circle: {
    _tabs: ['animation'],
  },

  // Point - animation only (styling via expressions)
  point: {
    _tabs: ['animation'],
  },

  // Vector - animation only (styling via expressions)
  vec: {
    _tabs: ['animation'],
  },

  // Angle - animation only (styling via expressions)
  angle: {
    _tabs: ['animation'],
  },

  // Label - animation only (styling via expressions)
  label: {
    _tabs: ['animation'],
  },

  // MathText expressions (mathtext, write, writeonly, writewithout) - animation only (styling via expressions)
  mathtext: {
    _tabs: ['animation'],
  },

  // Polygon - animation only (styling via expressions)
  polygon: {
    _tabs: ['animation'],
  },

  // Arc - animation only (styling via expressions)
  arc: {
    _tabs: ['animation'],
  },

  // Plot - animation only (styling via expressions)
  plot: {
    _tabs: ['animation'],
  },

  // Parametric plot - animation only (styling via expressions)
  paraplot: {
    _tabs: ['animation'],
  },

  // Segment - animation only (styling via expressions)
  segment: {
    _tabs: ['animation'],
  },

  // Ray - animation only (styling via expressions)
  ray: {
    _tabs: ['animation'],
  },

  // Ellipse - animation only (styling via expressions)
  ellipse: {
    _tabs: ['animation'],
  },

  // Ref - dynamic style based on inner expression
  ref: {
    _style: null, // Dynamic - determined by inner expression type
    content: { type: 'text', default: '', label: 'Expression' },
  },
};

// Animation options (for Animation tab)
export const ANIMATION_OPTIONS_SCHEMA = {
  speed: { type: 'slider', min: 1, max: 10, default: 5, label: 'Animation Speed' },
};

/**
 * Get default options for an expression type
 * @param {string} expressionType - The expression type
 * @returns {Object} Default options for the expression type
 */
export function getDefaultOptions(expressionType) {
  const schema = EXPRESSION_OPTIONS_SCHEMA[expressionType];
  if (!schema) return {};

  const defaults = {};
  Object.entries(schema).forEach(([key, config]) => {
    // Skip internal keys (like _style) and null configs
    if (key.startsWith('_') || !config) return;
    defaults[key] = config.default;
  });
  return defaults;
}

/**
 * Get schema for an expression type
 * @param {string} expressionType - The expression type
 * @returns {Object|null} Schema for the expression type
 */
export function getExpressionSchema(expressionType) {
  return EXPRESSION_OPTIONS_SCHEMA[expressionType] || null;
}

/**
 * List of expression types that have dedicated options panels
 * p2d has a dedicated panel (g2d uses expression syntax for options)
 */
export const EXPRESSION_TYPES_WITH_OPTIONS = ['p2d'];

/**
 * Get style type for expression
 * @param {string} expressionType - The expression type
 * @returns {'stroke' | 'fill' | 'strokeFill' | 'font' | null}
 */
export function getStyleType(expressionType) {
  const schema = EXPRESSION_OPTIONS_SCHEMA[expressionType];
  return schema?._style || null;
}

/**
 * Get allowed tabs for expression type
 * @param {string} expressionType - The expression type
 * @returns {string[]|null} - Array of tab ids, or null for default tabs
 */
export function getAllowedTabs(expressionType) {
  const schema = EXPRESSION_OPTIONS_SCHEMA[expressionType];
  return schema?._tabs || null;
}
