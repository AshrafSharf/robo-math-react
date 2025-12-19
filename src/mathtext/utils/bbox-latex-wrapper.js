/**
 * Utility for wrapping LaTeX string parts with \bbox[0px]{...}
 * Used for selective animation of math text portions.
 */

/**
 * Escapes special regex characters in a string
 * @param {string} str - String to escape
 * @returns {string} - Regex-safe string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Operators that can have flexible whitespace around them
const OPERATORS = '=+\\-*/^<>≤≥≠±×÷';

/**
 * Wraps all occurrences of a part within a LaTeX string with \bbox[0px]{...}
 * Allows flexible whitespace around operators (e.g., "=d" matches "= d").
 *
 * @param {string} full - The full LaTeX string
 * @param {string} part - The part to wrap (can be a LaTeX fragment like \theta)
 * @returns {string} - LaTeX string with all occurrences of part wrapped in \bbox[0px]{...}
 *
 * @example
 * wrapWithBBox('\\tan(\\theta)=\\frac{\\sin(\\theta)}{\\cos(\\theta)}', '\\theta')
 * // Returns: '\\tan(\\bbox[0px]{\\theta})=\\frac{\\sin(\\bbox[0px]{\\theta})}{\\cos(\\bbox[0px]{\\theta})}'
 *
 * @example
 * wrapWithBBox('a + b = c', '=c')
 * // Returns: 'a + b \\bbox[0px]{= c}' (matches despite space difference)
 */
export function wrapWithBBox(full, part) {
  if (!full || !part) {
    return full;
  }

  // Build a flexible pattern that allows optional whitespace around operators
  // Process char by char to build the regex pattern
  let flexiblePattern = '';
  for (let i = 0; i < part.length; i++) {
    const char = part[i];
    const escapedChar = escapeRegex(char);

    if (OPERATORS.includes(char)) {
      // Allow optional whitespace around operators
      flexiblePattern += `\\s*${escapedChar}\\s*`;
    } else {
      flexiblePattern += escapedChar;
    }
  }

  const regex = new RegExp(flexiblePattern, 'g');

  // Use captured match to preserve original whitespace
  return full.replace(regex, (match) => `\\bbox[0px]{${match}}`);
}

/**
 * Wraps multiple parts within a LaTeX string with \bbox[0px]{...}
 * Parts are processed in order, so later parts won't match text already wrapped.
 *
 * @param {string} full - The full LaTeX string
 * @param {string[]} parts - Array of parts to wrap
 * @returns {string} - LaTeX string with all parts wrapped
 *
 * @example
 * wrapMultipleWithBBox('\\sin(\\theta)+\\cos(\\theta)', ['\\sin(\\theta)', '\\cos(\\theta)'])
 * // Returns: '\\bbox[0px]{\\sin(\\theta)}+\\bbox[0px]{\\cos(\\theta)}'
 */
export function wrapMultipleWithBBox(full, parts) {
  if (!full || !parts || !Array.isArray(parts)) {
    return full;
  }

  let result = full;
  for (const part of parts) {
    result = wrapWithBBox(result, part);
  }
  return result;
}

/**
 * BBoxWrapper class for object-oriented usage
 */
export class BBoxWrapper {
  /**
   * Wraps all occurrences of a part with \bbox[0px]{...}
   * @param {string} full - Full LaTeX string
   * @param {string} part - Part to wrap
   * @returns {string} - Wrapped LaTeX string
   */
  static wrap(full, part) {
    return wrapWithBBox(full, part);
  }

  /**
   * Wraps multiple parts with \bbox[0px]{...}
   * @param {string} full - Full LaTeX string
   * @param {string[]} parts - Parts to wrap
   * @returns {string} - Wrapped LaTeX string
   */
  static wrapMultiple(full, parts) {
    return wrapMultipleWithBBox(full, parts);
  }
}

export default BBoxWrapper;
