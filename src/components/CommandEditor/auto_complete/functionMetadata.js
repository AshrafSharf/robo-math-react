/**
 * Function metadata registry for robo-canvas language autocomplete.
 * Contains all available functions with their signatures, arguments, and descriptions.
 *
 * Functions are organized by category in separate files under ./functions/
 */

import { GEOMETRY_FUNCTIONS, GEOMETRY_3D_FUNCTIONS } from './functions/geometryFunctions.js';
import { ANGLE_FUNCTIONS } from './functions/angleFunctions.js';
import { LINE_FUNCTIONS } from './functions/lineFunctions.js';
import { VECTOR_FUNCTIONS } from './functions/vectorFunctions.js';
import { COORDINATE_FUNCTIONS } from './functions/coordinateFunctions.js';
import { GRAPH_FUNCTIONS } from './functions/graphFunctions.js';
import { MATH_FUNCTIONS } from './functions/mathFunctions.js';
import { TRANSFORM_FUNCTIONS } from './functions/transformFunctions.js';
import { UTILITY_FUNCTIONS, VISIBILITY_FUNCTIONS, FUNCTION_DEFINITION_FUNCTIONS } from './functions/utilityFunctions.js';

/**
 * Combined function metadata from all categories
 */
export const FUNCTION_METADATA = {
  ...GEOMETRY_FUNCTIONS,
  ...GEOMETRY_3D_FUNCTIONS,
  ...ANGLE_FUNCTIONS,
  ...LINE_FUNCTIONS,
  ...VECTOR_FUNCTIONS,
  ...COORDINATE_FUNCTIONS,
  ...GRAPH_FUNCTIONS,
  ...MATH_FUNCTIONS,
  ...TRANSFORM_FUNCTIONS,
  ...UTILITY_FUNCTIONS,
  ...VISIBILITY_FUNCTIONS,
  ...FUNCTION_DEFINITION_FUNCTIONS
};

/**
 * Get all function names as an array
 */
export function getAllFunctionNames() {
  return Object.keys(FUNCTION_METADATA);
}

/**
 * Get functions by category
 */
export function getFunctionsByCategory(category) {
  return Object.values(FUNCTION_METADATA).filter(f => f.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories() {
  const categories = new Set(Object.values(FUNCTION_METADATA).map(f => f.category));
  return Array.from(categories);
}

/**
 * Category display order for autocomplete grouping
 */
export const CATEGORY_ORDER = [
  'Geometry',
  '3D Geometry',
  'Angles',
  'Lines',
  'Vectors',
  'Coordinates',
  'Graph',
  'Math',
  'Transforms',
  'Visibility',
  'Utilities',
  'Functions'
];
