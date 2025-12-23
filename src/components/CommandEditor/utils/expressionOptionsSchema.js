/**
 * Expression Options Schema
 * Defines available options and defaults for each expression type
 *
 * _style: 'stroke' | 'fill' | 'strokeFill' | 'font' | null
 *   - stroke: color + strokeWidth + opacity (line, segment, ray, vec, arc, plot, etc.)
 *   - fill: color only, applies to both stroke and fill (point)
 *   - strokeFill: stroke color + fill color + opacities (circle, polygon, ellipse, angle)
 *   - font: fontSize + fontColor (label)
 *   - null/undefined: no style controls (g2d, p2d)
 */

export const EXPRESSION_OPTIONS_SCHEMA = {
  // Graph 2D - no style controls
  g2d: {
    _style: null,
    showGrid: { type: 'checkbox', default: true, label: 'Grid' },
    showGridLines: { type: 'checkbox', default: true, label: 'Grid Lines' },
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

  // Polar 2D - no style controls
  p2d: {
    _style: null,
    showGrid: { type: 'checkbox', default: true, label: 'Show Grid' },
    rMax: { type: 'number', min: 1, max: 100, default: 10, label: 'Max Radius' },
    radialLines: { type: 'number', min: 4, max: 24, default: 12, label: 'Radial Lines' },
    concentricCircles: { type: 'number', min: 2, max: 20, default: 5, label: 'Circles' },
    angleLabels: { type: 'checkbox', default: true, label: 'Show Angle Labels' },
  },

  // Line - stroke style
  line: {
    _style: 'stroke',
    dashPattern: { type: 'select', options: ['solid', 'dashed', 'dotted'], default: 'solid', label: 'Dash Pattern' },
  },

  // Circle - stroke + fill style
  circle: {
    _style: 'strokeFill',
  },

  // Point - fill style (single color for both stroke and fill)
  point: {
    _style: 'fill',
  },

  // Vector - stroke style
  vec: {
    _style: 'stroke',
    arrowSize: { type: 'number', min: 5, max: 20, default: 10, label: 'Arrow Size' },
  },

  // Angle - stroke + fill style
  angle: {
    _style: 'strokeFill',
    radius: { type: 'number', min: 0.3, max: 3, step: 0.1, default: 0.8, label: 'Arc Radius' },
    showArc: { type: 'checkbox', default: true, label: 'Show Arc' },
  },

  // Label - font style
  label: {
    _style: 'font',
    fontSize: { type: 'number', min: 10, max: 48, default: 16, label: 'Font Size' },
  },

  // MathText expressions (mathtext, write, writeonly, writewithout) - font style
  mathtext: {
    _style: 'font',
    fontSize: { type: 'number', min: 12, max: 72, default: 22, label: 'Font Size' },
  },

  // Polygon - stroke + fill style
  polygon: {
    _style: 'strokeFill',
  },

  // Arc - stroke style
  arc: {
    _style: 'stroke',
  },

  // Plot - stroke style
  plot: {
    _style: 'stroke',
    samples: { type: 'number', min: 50, max: 500, step: 50, default: 200, label: 'Sample Points' },
  },

  // Parametric plot - stroke style
  paraplot: {
    _style: 'stroke',
    samples: { type: 'number', min: 50, max: 500, step: 50, default: 200, label: 'Sample Points' },
  },

  // Segment - stroke style
  segment: {
    _style: 'stroke',
    dashPattern: { type: 'select', options: ['solid', 'dashed', 'dotted'], default: 'solid', label: 'Dash Pattern' },
  },

  // Ray - stroke style
  ray: {
    _style: 'stroke',
    dashPattern: { type: 'select', options: ['solid', 'dashed', 'dotted'], default: 'solid', label: 'Dash Pattern' },
  },

  // Ellipse - stroke + fill style
  ellipse: {
    _style: 'strokeFill',
  },

  // Ref - dynamic style based on inner expression
  ref: {
    _style: null, // Dynamic - determined by inner expression type
    content: { type: 'text', default: '', label: 'Expression' },
  },

  // Table - configurable table at logical coordinates
  table: {
    _style: null, // No standard style controls
    _tabs: ['expression'], // Only show Table options tab (no Style or Animation)
    rows: { type: 'number', default: 2, min: 1, max: 20, label: 'Rows' },
    cols: { type: 'number', default: 2, min: 1, max: 10, label: 'Columns' },
    cells: { type: 'grid', default: null, label: 'Cell Content' }, // 2D array of {content}
    borderStyle: { type: 'select', options: ['all', 'none', 'horizontal', 'vertical', 'outer'], default: 'all', label: 'Border Style' },
    cellPadding: { type: 'text', default: '8px 12px', label: 'Cell Padding' },
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
 * Graph containers (g2d, p2d) and table have dedicated panels
 */
export const EXPRESSION_TYPES_WITH_OPTIONS = ['g2d', 'p2d', 'table'];

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
