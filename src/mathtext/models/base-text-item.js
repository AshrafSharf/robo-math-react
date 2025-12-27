import { Bounds2 } from '../../geom/Bounds2.js';

/**
 * BaseTextItem - Abstract base class for text item selections
 *
 * Defines the common interface for TextItem (MathJax/SVG) and KatexTextItem (KaTeX/DOM).
 * Subclasses must implement the abstract methods.
 */
export class BaseTextItem {
  /**
   * Get the parent component (MathTextComponent or KatexComponent)
   * @abstract
   * @returns {Object}
   */
  getMathComponent() {
    throw new Error('getMathComponent() must be implemented by subclass');
  }

  /**
   * Get bounds relative to the component container (client coordinates)
   * @abstract
   * @returns {{x: number, y: number, width: number, height: number}|null}
   */
  getClientBounds() {
    throw new Error('getClientBounds() must be implemented by subclass');
  }

  /**
   * Get bounds relative to canvas section
   * @param {HTMLElement} canvasSection - The canvas section element
   * @returns {Bounds2|null}
   */
  getCanvasBounds(canvasSection) {
    const clientBounds = this.getClientBounds();
    if (!clientBounds) {
      return null;
    }

    const component = this.getMathComponent();
    const containerLeft = component.componentState?.left || 0;
    const containerTop = component.componentState?.top || 0;

    const x = containerLeft + clientBounds.x;
    const y = containerTop + clientBounds.y;
    return new Bounds2(x, y, x + clientBounds.width, y + clientBounds.height);
  }

  /**
   * Get bounds (alias for getClientBounds for compatibility)
   * @returns {{x: number, y: number, width: number, height: number}|null}
   */
  getBounds() {
    return this.getClientBounds();
  }
}

export default BaseTextItem;
