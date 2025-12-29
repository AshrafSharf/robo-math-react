/**
 * KatexProcessor - Renders LaTeX to HTML using KaTeX
 *
 * Unlike MathJaxProcessor which outputs SVG paths for pen animation,
 * KatexProcessor outputs HTML/CSS-styled elements. This means:
 * - No pen animation support (instant rendering only)
 * - Uses DOM elements instead of SVG paths
 * - getBoundingClientRect() for bounds extraction
 */
import katex from 'katex';

export class KatexProcessor {
  /**
   * Render LaTeX string to HTML string
   * @param {string} latex - LaTeX string
   * @param {number} fontSize - Font size in pixels
   * @returns {string} HTML string rendered by KaTeX
   */
  static renderToString(latex, fontSize) {
    return this.renderLatex(latex, fontSize);
  }

  /**
   * Render LaTeX to HTML using KaTeX
   * @param {string} latex - LaTeX string
   * @param {number} fontSize - Font size in pixels
   * @param {Object} options - Optional settings
   * @param {boolean} options.inline - Use inline mode (no extra vertical spacing)
   * @returns {string} HTML string
   */
  static renderLatex(latex, fontSize, options = {}) {
    try {
      const isInline = options.inline === true;
      // Wrap in displaystyle for consistency with MathJax behavior (unless inline)
      const displayLatex = isInline ? latex : `\\displaystyle{${latex}}`;

      return katex.renderToString(displayLatex, {
        throwOnError: true,
        displayMode: !isInline,
        output: 'html',
        trust: true,
        strict: false
      });
    } catch (error) {
      console.error('KatexProcessor:', error.message);
      return `<span class="katex-error" style="color: #cc0000;">⚠️ Invalid LaTeX</span>`;
    }
  }

  /**
   * Render LaTeX in inline mode (compact, no extra vertical spacing)
   * @param {string} latex - LaTeX string
   * @param {number} fontSize - Font size in pixels
   * @returns {string} HTML string
   */
  static renderInline(latex, fontSize) {
    return this.renderLatex(latex, fontSize, { inline: true });
  }
}
