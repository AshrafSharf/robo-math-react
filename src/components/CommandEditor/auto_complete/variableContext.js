/**
 * Variable context extraction for autocomplete.
 * Parses command strings to identify user-defined variables and their types.
 */

import { FUNCTION_METADATA } from './functionMetadata';

/**
 * Extract variables from a list of command models.
 * @param {Array} commandModels - Array of command objects with expression property
 * @param {number} currentLineIndex - Index of the current command (to only show variables defined before)
 * @returns {Array} Array of { name, type, line } objects
 */
export function extractVariables(commandModels, currentLineIndex = Infinity) {
  const variables = [];
  const assignmentPattern = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/;

  if (!commandModels || !Array.isArray(commandModels)) {
    return variables;
  }

  for (let i = 0; i < commandModels.length && i < currentLineIndex; i++) {
    const model = commandModels[i];
    const expression = model?.expression || '';

    const match = expression.match(assignmentPattern);
    if (match) {
      const [, varName, rhs] = match;
      const inferredType = inferTypeFromExpression(rhs);

      variables.push({
        name: varName,
        type: inferredType,
        line: i
      });
    }
  }

  return variables;
}

/**
 * Infer the type of a variable from its right-hand side expression.
 * @param {string} rhs - The right-hand side of the assignment
 * @returns {string} The inferred type
 */
function inferTypeFromExpression(rhs) {
  const trimmed = rhs.trim();

  // Match function call pattern
  const funcMatch = trimmed.match(/^([a-z_][a-z0-9_]*)\s*\(/i);
  if (funcMatch) {
    const funcName = funcMatch[1].toLowerCase();
    return getTypeForFunction(funcName);
  }

  // Check if it's a numeric expression
  if (/^[\d\s+\-*/().]+$/.test(trimmed)) {
    return 'number';
  }

  // Check if it references another variable (could be any type)
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
    return 'any';
  }

  return 'any';
}

/**
 * Get the return type for a function name.
 * @param {string} funcName - The function name
 * @returns {string} The return type
 */
function getTypeForFunction(funcName) {
  const typeMapping = {
    // Geometry
    point: 'Point',
    line: 'Line',
    vec: 'Vector',
    circle: 'Circle',
    arc: 'Arc',
    polygon: 'Polygon',

    // Angles
    angle: 'Angle',
    anglex: 'Angle',
    anglex2: 'Angle',
    angler: 'Angle',
    anglert: 'Angle',
    angleo: 'Angle',

    // Lines
    vl: 'Line',
    hl: 'Line',
    perpl: 'Line',
    pll: 'Line',

    // Vectors
    perpv: 'Vector',
    plv: 'Vector',

    // Coordinates - return numbers or points
    x: 'number',
    y: 'number',
    st: 'Point',
    ed: 'Point',

    // Graph
    g2d: 'Graph',
    plot: 'Plot',

    // Math - return numbers
    sin: 'number',
    cos: 'number',
    tan: 'number',
    asin: 'number',
    acos: 'number',
    atan: 'number',
    sqrt: 'number',
    abs: 'number',
    floor: 'number',
    ceil: 'number',
    round: 'number',
    min: 'number',
    max: 'number',
    exp: 'number',
    log: 'number',

    // Transforms
    intersect: 'Point',
    reflect: 'Point',
    rotate: 'Point',
    project: 'Point',
    interpolate: 'Point',
    dilate: 'Point',
    translate: 'Point',

    // Utilities
    dist: 'number',
    pos: 'Point',
    findangle: 'number',
    text: 'Text',
    group: 'Group',
    part: 'Shape'
  };

  return typeMapping[funcName] || 'any';
}

/**
 * Create a variable provider function that can be called to get current variables.
 * This is useful for integration with CodeMirror completion.
 * @param {Function} getCommandModels - Function that returns current command models
 * @returns {Function} Provider function
 */
export function createVariableProvider(getCommandModels) {
  return (currentLineIndex) => {
    const models = getCommandModels();
    return extractVariables(models, currentLineIndex);
  };
}
