/**
 * KatexLatexWrapper - Wraps LaTeX patterns with \htmlClass{robo-select}{...}
 *
 * Used for selective display/animation of KaTeX-rendered math portions.
 * Similar to bbox-latex-wrapper.js but uses KaTeX's \htmlClass command.
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
 * Wraps all occurrences of a pattern within a LaTeX string with \htmlClass{robo-select}{...}
 * Allows flexible whitespace around operators.
 *
 * @param {string} full - The full LaTeX string
 * @param {string} pattern - The pattern to wrap
 * @returns {string} - LaTeX string with pattern wrapped in \htmlClass{robo-select}{...}
 *
 * @example
 * wrapWithHtmlClass('x^2 + 2x + 1 = 0', 'x^2')
 * // Returns: '\\htmlClass{robo-select}{x^2} + 2x + 1 = 0'
 */
export function wrapWithHtmlClass(full, pattern) {
  if (!full || !pattern) {
    return full;
  }

  // Build a flexible regex pattern that allows optional whitespace around operators
  let flexiblePattern = '';
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
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
  return full.replace(regex, (match) => `\\htmlClass{robo-select}{${match}}`);
}

/**
 * Wraps multiple patterns within a LaTeX string with \htmlClass{robo-select}{...}
 * Patterns are processed in order.
 *
 * @param {string} full - The full LaTeX string
 * @param {string[]} patterns - Array of patterns to wrap
 * @returns {string} - LaTeX string with all patterns wrapped
 */
export function wrapMultipleWithHtmlClass(full, patterns) {
  if (!full || !patterns || !Array.isArray(patterns)) {
    return full;
  }

  let result = full;
  for (const pattern of patterns) {
    result = wrapWithHtmlClass(result, pattern);
  }
  return result;
}

/**
 * KatexLatexWrapper class for object-oriented usage
 */
export class KatexLatexWrapper {
  static MARKER_CLASS = 'robo-select';

  /**
   * Wraps all occurrences of a pattern with \htmlClass{robo-select}{...}
   * @param {string} full - Full LaTeX string
   * @param {string} pattern - Pattern to wrap
   * @returns {string} - Wrapped LaTeX string
   */
  static wrap(full, pattern) {
    return wrapWithHtmlClass(full, pattern);
  }

  /**
   * Wraps multiple patterns with \htmlClass{robo-select}{...}
   * @param {string} full - Full LaTeX string
   * @param {string[]} patterns - Patterns to wrap
   * @returns {string} - Wrapped LaTeX string
   */
  static wrapMultiple(full, patterns) {
    return wrapMultipleWithHtmlClass(full, patterns);
  }

  /**
   * Get the CSS class used for marking
   * @returns {string}
   */
  static getMarkerClass() {
    return this.MARKER_CLASS;
  }
}

export default KatexLatexWrapper;
