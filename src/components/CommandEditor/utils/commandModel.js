/**
 * Default command model
 */
export const DEFAULT_COLOR = '#DC3912';
export const DEFAULT_FILL_COLOR = 'none';
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_STROKE_OPACITY = 1;
export const DEFAULT_FILL_OPACITY = 0.3;
export const DEFAULT_SPEED = 5;

/**
 * Creates a new command with default values
 * @param {number} id - Command ID
 * @returns {Object} Command object
 */
export const createCommand = (id) => ({
  id,
  expression: '',
  color: DEFAULT_COLOR,           // stroke color (kept as 'color' for backward compatibility)
  fillColor: DEFAULT_FILL_COLOR,  // fill color
  strokeWidth: DEFAULT_STROKE_WIDTH,
  strokeOpacity: DEFAULT_STROKE_OPACITY,
  fillOpacity: DEFAULT_FILL_OPACITY,
  speed: DEFAULT_SPEED,
  label: true,
  text: '',
  offsetX: 0,
  offsetY: 0,
  // Expression-specific options organized by expression type
  // Structure: { g2d: {...}, line: {...}, circle: {...} }
  // Options persist when expression type changes
  expressionOptions: {},
});

/**
 * Get next available ID from commands array
 * @param {Array} commands - Array of command objects
 * @returns {number} Next available ID
 */
export const getNextId = (commands) => {
  if (!commands || commands.length === 0) return 1;
  return Math.max(...commands.map(c => c.id)) + 1;
};

/**
 * Validates command expression
 * @param {string} expression - Command expression
 * @returns {boolean} Is valid
 */
export const isValidExpression = (expression) => {
  return typeof expression === 'string' && expression.trim().length > 0;
};
