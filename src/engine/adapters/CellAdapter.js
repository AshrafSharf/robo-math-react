/**
 * CellAdapter - Handles cell content rendering (math vs text)
 *
 * Part of the adapter pattern for table cells.
 * Future adapters: VisibilityAdapter, StrokeAdapter, FillAdapter
 *
 * Auto-detects LaTeX content by looking for LaTeX command patterns.
 * No $ delimiter needed - just use LaTeX commands like \frac, \sqrt, etc.
 */
import { MathJaxProcessor } from '../../mathtext/processor/math-jax-processor.js';
import { TextExUtil } from '../../utils/text-ex-util.js';

/**
 * LaTeX command patterns for auto-detection
 * Matches backslash followed by common LaTeX commands
 */
const LATEX_PATTERN = /\\(frac|sqrt|sum|int|prod|lim|sin|cos|tan|log|ln|exp|alpha|beta|gamma|delta|theta|phi|pi|omega|sigma|lambda|mu|nu|epsilon|zeta|eta|iota|kappa|rho|tau|upsilon|chi|psi|cdot|times|div|pm|mp|leq|geq|neq|approx|equiv|subset|supset|infty|partial|nabla|forall|exists|in|notin|cap|cup|vee|wedge|oplus|otimes|rightarrow|leftarrow|Rightarrow|Leftarrow|text|mathbf|mathrm|mathit|mathbb|mathcal|begin|end|binom|vec|hat|bar|dot|ddot|tilde|overline|underline|left|right)/;

export class CellAdapter {
    /**
     * Create adapter for a table cell
     * @param {TableCell} cell - The table cell object
     */
    constructor(cell) {
        this.cell = cell;
        this.content = cell?.getContent?.() || cell?.content || '';
        this.isMathContent = this._detectMath(this.content);
        this.renderedElement = null;
    }

    /**
     * Detect if content contains LaTeX commands
     * @param {string} content - Cell content
     * @returns {boolean}
     */
    _detectMath(content) {
        if (!content || typeof content !== 'string') return false;
        return LATEX_PATTERN.test(content);
    }

    /**
     * Check if cell content is math
     * @returns {boolean}
     */
    isMath() {
        return this.isMathContent;
    }

    /**
     * Render cell content into a DOM element
     * @param {HTMLElement} cellElement - The table cell DOM element
     * @param {Object} options - Rendering options
     * @param {number} options.fontSize - Font size in pixels
     * @param {string} options.color - Text/stroke color
     * @returns {Promise}
     */
    async render(cellElement, options = {}) {
        if (!cellElement) return;

        const fontSize = options.fontSize || 16;
        const color = options.color || '#000000';

        if (this.isMathContent) {
            return this._renderMath(cellElement, fontSize, color);
        }
        return this._renderText(cellElement, fontSize, color);
    }

    /**
     * Render LaTeX content as SVG
     * @param {HTMLElement} cellElement - The table cell DOM element
     * @param {number} fontSize - Font size in pixels
     * @param {string} color - Stroke color
     * @returns {Promise}
     */
    async _renderMath(cellElement, fontSize, color) {
        try {
            // Get text size in ex units for MathJax
            const textSizeInEx = TextExUtil.getTextSizeInEx(fontSize);

            // Render LaTeX to SVG string
            const svgString = MathJaxProcessor.renderToString(this.content, textSizeInEx);

            // Create a container for the SVG
            const mathContainer = document.createElement('div');
            mathContainer.className = 'table-cell-math';
            mathContainer.style.display = 'inline-block';
            mathContainer.style.verticalAlign = 'middle';
            mathContainer.innerHTML = svgString;

            // Apply color to SVG paths (stroke only, no fill)
            const paths = mathContainer.querySelectorAll('path');
            paths.forEach(path => {
                path.style.stroke = color;
                path.style.fill = 'none';
            });

            // Clear cell and append math content
            cellElement.innerHTML = '';
            cellElement.appendChild(mathContainer);

            this.renderedElement = mathContainer;
        } catch (error) {
            console.error('CellAdapter: Failed to render math content:', error);
            // Fallback to text rendering
            this._renderText(cellElement, fontSize, color);
        }
    }

    /**
     * Render plain text content
     * @param {HTMLElement} cellElement - The table cell DOM element
     * @param {number} fontSize - Font size in pixels
     * @param {string} color - Text color
     */
    _renderText(cellElement, fontSize, color) {
        cellElement.textContent = this.content;
        cellElement.style.fontSize = fontSize + 'px';
        cellElement.style.color = color;
        this.renderedElement = cellElement;
    }

    /**
     * Get the rendered element
     * @returns {HTMLElement|null}
     */
    getRenderedElement() {
        return this.renderedElement;
    }

    /**
     * Update content and re-detect math
     * @param {string} newContent
     */
    updateContent(newContent) {
        this.content = newContent;
        this.isMathContent = this._detectMath(newContent);
        if (this.cell) {
            this.cell.setContent(newContent);
        }
    }

    // ===== SVG PATH ACCESS =====

    /**
     * Get SVG paths from rendered math content
     * @returns {Element[]}
     */
    getSVGPaths() {
        if (!this.renderedElement) return [];
        if (this.isMathContent) {
            return Array.from(this.renderedElement.querySelectorAll('path'));
        }
        return [];
    }

    // ===== STROKE CONTROL =====

    /**
     * Disable strokes (for animation preparation)
     * Sets stroke-dasharray to hide paths
     */
    disableStrokes() {
        const paths = this.getSVGPaths();
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,10000');
            path.style.strokeDasharray = '0,10000';
        });
    }

    /**
     * Enable strokes (show paths)
     * Sets stroke-dasharray to show paths
     */
    enableStrokes() {
        const paths = this.getSVGPaths();
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
        });
    }

    /**
     * Set stroke color on all paths
     * @param {string} color - CSS color value
     */
    setStrokeColor(color) {
        const paths = this.getSVGPaths();
        paths.forEach(path => {
            path.setAttribute('stroke', color);
            path.style.stroke = color;
        });
    }
}

/**
 * Factory method to create adapter for a cell
 * @param {TableCell} cell
 * @returns {CellAdapter}
 */
CellAdapter.for = function(cell) {
    return new CellAdapter(cell);
};
