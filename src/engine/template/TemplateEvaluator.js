import { evaluate } from 'mathjs';

/**
 * TemplateEvaluator - Evaluates LaTeX templates with dynamic placeholders
 *
 * Placeholder syntax:
 * - Simple variable: :varName (e.g., :x, :radius)
 * - Expression in braces: :{expr} (e.g., :{a+b}, :{sqrt(x)})
 * - With formatting: :varName:.Nf or :{expr}:.Nf (e.g., :x:.2f, :{a/b}:.3f)
 *
 * Examples:
 *   "x = :x"                    → "x = 5" (with scope {x: 5})
 *   "\frac{:a}{:b}"            → "\frac{3}{4}" (with scope {a: 3, b: 4})
 *   "sum = :{a+b}"             → "sum = 7" (with scope {a: 3, b: 4})
 *   "r = :radius:.2f"          → "r = 3.14" (with scope {radius: 3.14159})
 *   "ratio = :{a/b}:.3f"       → "ratio = 0.750" (with scope {a: 3, b: 4})
 */
export class TemplateEvaluator {
  /**
   * Regex to match placeholders:
   * Group 1: Simple variable name (letters, digits, underscore, starting with letter)
   * Group 2: Expression in braces {expr}
   * Group 3: Format decimals (optional, e.g., .2 from :.2f)
   *
   * Matches:
   *   :varName        → captures varName in group 1
   *   :{expr}         → captures expr in group 2
   *   :varName:.2f    → captures varName in group 1, 2 in group 3
   *   :{expr}:.3f     → captures expr in group 2, 3 in group 3
   */
  static PLACEHOLDER_REGEX = /:(?:([a-zA-Z_][a-zA-Z0-9_]*)|\{([^}]+)\})(?::\.(\d+)f)?/g;

  /**
   * Extract all placeholders from a template string
   * @param {string} template - LaTeX template with placeholders
   * @returns {Array<{match: string, expr: string, decimals: number|null}>}
   */
  static extractPlaceholders(template) {
    const placeholders = [];
    let match;
    const regex = new RegExp(this.PLACEHOLDER_REGEX.source, 'g');

    while ((match = regex.exec(template)) !== null) {
      placeholders.push({
        match: match[0],                          // Full match like ":x:.2f" or ":{a+b}"
        expr: (match[1] || match[2]).trim(),      // Variable name or expression
        decimals: match[3] ? parseInt(match[3]) : null  // Format decimals or null
      });
    }

    return placeholders;
  }

  /**
   * Check if a string contains any placeholders
   * @param {string} template
   * @returns {boolean}
   */
  static hasPlaceholders(template) {
    const regex = new RegExp(this.PLACEHOLDER_REGEX.source);
    return regex.test(template);
  }

  /**
   * Evaluate template with given variable scope
   * @param {string} template - LaTeX template
   * @param {Object} scope - Variable values {a: 5, b: 10}
   * @returns {string} - Interpolated LaTeX string
   */
  static evaluate(template, scope) {
    console.log('TemplateEvaluator.evaluate input:', JSON.stringify(template));
    const placeholders = this.extractPlaceholders(template);
    console.log('Placeholders found:', placeholders);
    let result = template;

    for (const { match, expr, decimals } of placeholders) {
      try {
        // Use mathjs to evaluate expression with scope
        let value = evaluate(expr, scope);

        // Apply formatting
        if (decimals !== null) {
          // Explicit format specified
          value = Number(value).toFixed(decimals);
        } else if (typeof value === 'number') {
          // Default: 1 decimal, but strip .0 for whole numbers
          const rounded = Number(value).toFixed(1);
          value = rounded.endsWith('.0') ? rounded.slice(0, -2) : rounded;
        }

        result = result.replace(match, String(value));
      } catch (e) {
        // Keep original placeholder if evaluation fails
        console.warn(`TemplateEvaluator: Failed to evaluate "${expr}"`, e);
      }
    }

    // Normalize double backslashes to single (parser doubles them)
    result = result.replace(/\\\\/g, '\\');

    // Wrap plain text words in \text{} for proper rendering
    result = this.wrapPlainText(result);

    console.log('TemplateEvaluator.evaluate output:', JSON.stringify(result));
    return result;
  }

  /**
   * Wrap plain text words (not LaTeX commands) in \text{}
   * @param {string} latex
   * @returns {string}
   */
  static wrapPlainText(latex) {
    // Split by spaces and process each token
    const tokens = latex.split(/(\s+)/);

    return tokens.map(token => {
      // Skip whitespace
      if (/^\s*$/.test(token)) return token;

      // Skip if it's a LaTeX command (starts with \)
      if (token.startsWith('\\')) return token;

      // Skip if it's a number (possibly with decimals)
      if (/^-?\d+\.?\d*$/.test(token)) return token;

      // Skip if it contains LaTeX braces or special chars
      if (/[{}\\^_]/.test(token)) return token;

      // Skip common math symbols and operators
      if (/^[=+\-*/<>()|\[\].,;:]+$/.test(token)) return token;

      // Skip single letters (likely math variables)
      if (/^[a-zA-Z]$/.test(token)) return token;

      // It's a plain text word - wrap in \text{}
      if (/^[a-zA-Z]{2,}$/.test(token)) {
        return `\\text{${token}}`;
      }

      return token;
    }).join('');
  }

  /**
   * Get list of variable names used in template
   * @param {string} template
   * @returns {string[]} - Variable names
   */
  static getVariables(template) {
    const placeholders = this.extractPlaceholders(template);
    const vars = new Set();

    // Common mathjs function names to filter out
    const mathFunctions = new Set([
      'sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
      'abs', 'round', 'floor', 'ceil', 'sign',
      'exp', 'log', 'log10', 'log2',
      'pow', 'mod', 'min', 'max',
      'pi', 'e', 'phi', 'tau'
    ]);

    for (const { expr } of placeholders) {
      // Extract variable names from expression using regex
      const varMatches = expr.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

      for (const v of varMatches) {
        if (!mathFunctions.has(v.toLowerCase())) {
          vars.add(v);
        }
      }
    }

    return Array.from(vars);
  }
}
