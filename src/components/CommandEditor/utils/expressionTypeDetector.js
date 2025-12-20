/**
 * Expression Type Detector
 * Detects the expression type from an expression string without fully resolving it
 */

import { parse } from '../../../engine/expression-parser/parser/index.js';
import { EXPRESSION_TYPES_WITH_OPTIONS } from './expressionOptionsSchema.js';

/**
 * Detect the expression type from an expression string
 * @param {string} expressionStr - The expression string to analyze
 * @returns {{ type: string|null, label: string|null, error: string|null }}
 */
export function detectExpressionType(expressionStr) {
  if (!expressionStr || expressionStr.trim() === '') {
    return { type: null, label: null, error: null };
  }

  try {
    // Parse the expression to get the AST
    const ast = parse(expressionStr);
    if (!ast || ast.length === 0) {
      return { type: null, label: null, error: 'Empty parse result' };
    }

    const rootNode = ast[0];
    return extractTypeFromAST(rootNode);
  } catch (error) {
    return { type: null, label: null, error: error.message };
  }
}

/**
 * Extract expression type from AST node
 * @param {Object} astNode - AST node to analyze
 * @returns {{ type: string|null, label: string|null, error: string|null }}
 */
function extractTypeFromAST(astNode) {
  if (!astNode || !astNode.name) {
    return { type: null, label: null, error: 'Invalid AST node' };
  }

  const nodeName = astNode.name.toLowerCase();

  // Handle assignment expressions (e.g., "P = point(g, 1, 2)")
  if (nodeName === 'assignment') {
    // Get the label from LHS
    const label = astNode.args?.[0]?.value || null;

    // Get the type from RHS
    const rhsNode = astNode.args?.[1];
    if (rhsNode) {
      const rhsResult = extractTypeFromAST(rhsNode);
      return { type: rhsResult.type, label, error: rhsResult.error };
    }
    return { type: null, label, error: null };
  }

  // Direct expression (e.g., "point(g, 1, 2)")
  // Normalize the name to match our schema keys
  const normalizedType = normalizeTypeName(nodeName);

  return {
    type: normalizedType,
    label: null,
    error: null
  };
}

/**
 * Normalize expression type name to match schema keys
 * @param {string} name - The expression name from AST
 * @returns {string|null} - Normalized type name or null if not recognized
 */
function normalizeTypeName(name) {
  // Map of AST names to our schema keys
  const typeMap = {
    'g2d': 'g2d',
    'p2d': 'p2d',
    'g3d': 'g3d',
    'point': 'point',
    'line': 'line',
    'segment': 'segment',
    'ray': 'ray',
    'circle': 'circle',
    'ellipse': 'ellipse',
    'arc': 'arc',
    'vector': 'vector',
    'angle': 'angle',
    'anglex': 'angle',
    'anglex2': 'angle',
    'angler': 'angle',
    'anglert': 'angle',
    'angleo': 'angle',
    'label': 'label',
    'polygon': 'polygon',
    'plot': 'plot',
    'paraplot': 'paraplot',
    // Line utility expressions (short aliases)
    'vl': 'line',
    'hl': 'line',
    'xl': 'line',
    'ral': 'line',
    'perpl': 'line',
    'pll': 'line',
    // Vector utility expressions (short aliases)
    'perpv': 'vector',
    'plv': 'vector',
    'rav': 'vector',
    'fwv': 'vector',
    'bwv': 'vector',
    'pmv': 'vector',
    'cpv': 'vector',
    'rvv': 'vector',
    'ttv': 'vector',
    'addv': 'vector',
    'subv': 'vector',
    'scalev': 'vector',
    'prov': 'vector',
    'dcv': 'vector',
    // Math text expressions
    'mathtext': 'mathtext',
    'write': 'mathtext',
    'writeonly': 'mathtext',
    'writewithout': 'mathtext',
    'text': 'label',
    // Ref expression
    'ref': 'ref',
  };

  const normalizedName = name.toLowerCase();
  return typeMap[normalizedName] || null;
}

/**
 * Check if an expression type has a dedicated options panel
 * @param {string} expressionType - The expression type
 * @returns {boolean}
 */
export function hasOptionsPanel(expressionType) {
  return expressionType && EXPRESSION_TYPES_WITH_OPTIONS.includes(expressionType);
}

/**
 * Get a display name for an expression type
 * @param {string} expressionType - The expression type
 * @returns {string}
 */
export function getExpressionDisplayName(expressionType) {
  const displayNames = {
    'g2d': '2D Graph',
    'p2d': 'Polar Graph',
    'g3d': '3D Graph',
    'point': 'Point',
    'line': 'Line',
    'segment': 'Segment',
    'ray': 'Ray',
    'circle': 'Circle',
    'ellipse': 'Ellipse',
    'arc': 'Arc',
    'vector': 'Vector',
    'angle': 'Angle',
    'label': 'Label',
    'mathtext': 'Math Text',
    'polygon': 'Polygon',
    'plot': 'Plot',
    'paraplot': 'Parametric Plot',
    'ref': 'Reference',
  };
  return displayNames[expressionType] || expressionType || 'Unknown';
}

/**
 * Check if expression type needs the Ref tab
 * @param {string} expressionType - The expression type
 * @returns {boolean}
 */
export function hasRefTab(expressionType) {
  return expressionType === 'ref';
}

/**
 * Detect the inner expression type from ref content
 * Used for dynamic Style tab configuration
 * @param {string} refContent - The ref tab content string
 * @returns {string|null} - The inner expression type or null
 */
export function detectRefInnerType(refContent) {
  if (!refContent || refContent.trim() === '') return null;

  try {
    const ast = parse(refContent);
    if (!ast || ast.length === 0) return null;

    const result = extractTypeFromAST(ast[0]);
    return result.type;
  } catch {
    return null;
  }
}
