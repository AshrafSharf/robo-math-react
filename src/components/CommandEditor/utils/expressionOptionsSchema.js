/**
 * Expression Options Schema
 * Defines available options and defaults for each expression type
 */

export const EXPRESSION_OPTIONS_SCHEMA = {
  // Graph 2D expression options
  g2d: {
    showGrid: { type: 'checkbox', default: true, label: 'Grid' },
    // X-Axis settings
    xMin: { type: 'number', default: -5, label: 'X Min' },
    xMax: { type: 'number', default: 5, label: 'X Max' },
    xScaleType: { type: 'radio', options: ['linear', 'pi', 'log'], default: 'linear', label: 'X Scale' },
    xDivisions: { type: 'select', options: [4, 5, 8, 10, 20], default: 10, label: 'X Divisions' },
    xPiMultiplier: { type: 'select', options: ['2pi', 'pi', 'pi/2', 'pi/4', 'pi/6'], default: 'pi', label: 'X Pi Interval' },
    xLogBase: { type: 'select', options: ['10', 'e', '2'], default: '10', label: 'X Log Base' },
    // Y-Axis settings
    yMin: { type: 'number', default: -5, label: 'Y Min' },
    yMax: { type: 'number', default: 5, label: 'Y Max' },
    yScaleType: { type: 'radio', options: ['linear', 'pi', 'log'], default: 'linear', label: 'Y Scale' },
    yDivisions: { type: 'select', options: [4, 5, 8, 10, 20], default: 10, label: 'Y Divisions' },
    yPiMultiplier: { type: 'select', options: ['2pi', 'pi', 'pi/2', 'pi/4', 'pi/6'], default: 'pi', label: 'Y Pi Interval' },
    yLogBase: { type: 'select', options: ['10', 'e', '2'], default: '10', label: 'Y Log Base' },
  },

  // Polar 2D expression options
  p2d: {
    showGrid: { type: 'checkbox', default: true, label: 'Show Grid' },
    rMax: { type: 'number', min: 1, max: 100, default: 10, label: 'Max Radius' },
    radialLines: { type: 'number', min: 4, max: 24, default: 12, label: 'Radial Lines' },
    concentricCircles: { type: 'number', min: 2, max: 20, default: 5, label: 'Circles' },
    angleLabels: { type: 'checkbox', default: true, label: 'Show Angle Labels' },
  },

  // Line expression options
  line: {
    strokeWidth: { type: 'number', min: 1, max: 10, default: 2, label: 'Stroke Width' },
    dashPattern: { type: 'select', options: ['solid', 'dashed', 'dotted'], default: 'solid', label: 'Dash Pattern' },
  },

  // Circle expression options
  circle: {
    strokeWidth: { type: 'number', min: 1, max: 10, default: 2, label: 'Stroke Width' },
    fill: { type: 'color', default: 'none', label: 'Fill Color' },
    fillOpacity: { type: 'slider', min: 0, max: 1, step: 0.1, default: 0.3, label: 'Fill Opacity' },
  },

  // Point expression options
  point: {
    radius: { type: 'number', min: 2, max: 20, default: 4, label: 'Radius' },
    fill: { type: 'checkbox', default: true, label: 'Filled' },
  },

  // Vector expression options
  vec: {
    strokeWidth: { type: 'number', min: 1, max: 10, default: 2, label: 'Stroke Width' },
    arrowSize: { type: 'number', min: 5, max: 20, default: 10, label: 'Arrow Size' },
  },

  // Angle expression options
  angle: {
    radius: { type: 'number', min: 0.3, max: 3, step: 0.1, default: 0.8, label: 'Arc Radius' },
    strokeWidth: { type: 'number', min: 1, max: 10, default: 2, label: 'Stroke Width' },
    fill: { type: 'color', default: 'none', label: 'Fill Color' },
    fillOpacity: { type: 'slider', min: 0, max: 1, step: 0.1, default: 0.2, label: 'Fill Opacity' },
    showArc: { type: 'checkbox', default: true, label: 'Show Arc' },
  },

  // Label expression options
  label: {
    fontSize: { type: 'number', min: 10, max: 48, default: 16, label: 'Font Size' },
    fontColor: { type: 'color', default: '#000000', label: 'Font Color' },
  },

  // Polygon expression options
  polygon: {
    strokeWidth: { type: 'number', min: 1, max: 10, default: 2, label: 'Stroke Width' },
    fill: { type: 'color', default: 'none', label: 'Fill Color' },
    fillOpacity: { type: 'slider', min: 0, max: 1, step: 0.1, default: 0.3, label: 'Fill Opacity' },
  },

  // Arc expression options
  arc: {
    strokeWidth: { type: 'number', min: 1, max: 10, default: 2, label: 'Stroke Width' },
  },

  // Plot expression options
  plot: {
    strokeWidth: { type: 'number', min: 1, max: 5, default: 2, label: 'Line Width' },
    samples: { type: 'number', min: 50, max: 500, step: 50, default: 200, label: 'Sample Points' },
  },

  // Parametric plot expression options
  paraplot: {
    strokeWidth: { type: 'number', min: 1, max: 5, default: 2, label: 'Line Width' },
    samples: { type: 'number', min: 50, max: 500, step: 50, default: 200, label: 'Sample Points' },
  },

  // Segment expression options
  segment: {
    strokeWidth: { type: 'number', min: 1, max: 10, default: 2, label: 'Stroke Width' },
    dashPattern: { type: 'select', options: ['solid', 'dashed', 'dotted'], default: 'solid', label: 'Dash Pattern' },
  },

  // Ray expression options
  ray: {
    strokeWidth: { type: 'number', min: 1, max: 10, default: 2, label: 'Stroke Width' },
    dashPattern: { type: 'select', options: ['solid', 'dashed', 'dotted'], default: 'solid', label: 'Dash Pattern' },
  },

  // Ellipse expression options
  ellipse: {
    strokeWidth: { type: 'number', min: 1, max: 10, default: 2, label: 'Stroke Width' },
    fill: { type: 'color', default: 'none', label: 'Fill Color' },
    fillOpacity: { type: 'slider', min: 0, max: 1, step: 0.1, default: 0.3, label: 'Fill Opacity' },
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
 * List of expression types that have options panels
 */
export const EXPRESSION_TYPES_WITH_OPTIONS = Object.keys(EXPRESSION_OPTIONS_SCHEMA);
