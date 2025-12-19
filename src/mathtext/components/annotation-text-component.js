/**
 * AnnotationTextComponent - MathTextComponent positioned using pixel coordinates
 *
 * Extends MathTextComponent to allow direct pixel positioning instead of
 * logical (row, col) coordinates. Used for annotations that need to be
 * positioned relative to existing elements (like TextItems).
 */
import { MathTextComponent } from './math-text-component.js';

export class AnnotationTextComponent extends MathTextComponent {
    /**
     * Create an annotation text component at pixel coordinates
     * @param {string} text - LaTeX string to render
     * @param {number} pixelX - X position in pixels
     * @param {number} pixelY - Y position in pixels
     * @param {HTMLElement} parentDOM - Parent DOM element
     * @param {Object} options - Style options {fontSize, stroke, fill}
     */
    constructor(text, pixelX, pixelY, parentDOM, options = {}) {
        // Create a dummy coordinateMapper that returns the pixel coords directly
        const pixelCoordinateMapper = {
            toPixel: () => ({ x: pixelX, y: pixelY })
        };

        // Call parent with row=0, col=0 (ignored due to our mapper)
        super(text, 0, 0, pixelCoordinateMapper, parentDOM, options);
    }

    getComponentClass() {
        return 'annotation-text-item';
    }
}
