/**
 * Expression Options Schema
 * Defines available options and defaults for each expression type
 *
 * All shapes use expression-based styling (c, s, f, so, fo, fc) and only show Animation tab.
 * Graph containers (g2d, p2d) and table have dedicated options panels.
 *
 * _tabs: Array of allowed tab ids (e.g., ['animation'] or ['expression'])
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

  // Table - configurable table at logical coordinates
  table: {
    _style: null, // No standard style controls
    _tabs: ['expression'], // Only show Table options tab (no Style or Animation)
    rows: { type: 'number', default: 2, min: 1, max: 20, label: 'Rows' },
    cols: { type: 'number', default: 2, min: 1, max: 10, label: 'Columns' },
    headers: { type: 'array', default: null, label: 'Header Row' }, // 1D array of {content}
    headerBgColor: { type: 'color', default: '#e8f0fe', label: 'Header Background' },
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
