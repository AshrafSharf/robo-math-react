/**
 * MathTextRectEffect - Effect for animating a rectangle around a TextItem
 *
 * Usage:
 * ```javascript
 * const mathText = diagram.mathText('x + \\bbox[0px]{y} = z', 0, 0);
 * const items = mathText.getTextItems();
 * const effect = new MathTextRectEffect(items.get(0), annotationSvg, { stroke: 'red' });
 * await effect.play();
 * ```
 */

import { BaseEffect } from './base-effect.js';
import { MathTextRectShape } from '../script-shapes/math-text-rect-shape.js';
import { RoboEventManager } from '../events/robo-event-manager.js';

export class MathTextRectEffect extends BaseEffect {
  /**
   * @param {TextItem} textItem - The TextItem to annotate
   * @param {SVGSVGElement} targetSvg - SVG element to render the rect into
   * @param {Object} options - Styling options
   * @param {string} options.stroke - Stroke color (default: '#333')
   * @param {number} options.strokeWidth - Stroke width (default: 2)
   * @param {string} options.fill - Fill color (default: 'transparent')
   * @param {number} options.padding - Padding around bounds (default: 2)
   */
  constructor(textItem, targetSvg, options = {}) {
    super();
    this.textItem = textItem;
    this.targetSvg = targetSvg;
    this.options = options;
    this.rectShape = null;
  }

  /**
   * Create the rect shape (if not already created)
   */
  _createShape() {
    if (this.rectShape) return;

    // Use canvas-relative bounds (includes mathText container position)
    const canvasBounds = this.textItem.getCanvasBounds();
    if (!canvasBounds) {
      console.warn('MathTextRectEffect: Could not get TextItem bounds');
      return;
    }

    // Bounds2 has x, y, width, height getters - pass directly
    this.rectShape = new MathTextRectShape(this.targetSvg, canvasBounds, {
      stroke: this.options.stroke || '#333',
      strokeWidth: this.options.strokeWidth || 2,
      fill: this.options.fill || 'transparent',
      fillOpacity: this.options.fillOpacity || 0,
      padding: this.options.padding !== undefined ? this.options.padding : 5
    });
    this.rectShape.create();
  }

  /**
   * Show the shape instantly
   */
  show() {
    this._createShape();
    if (this.rectShape) {
      this.rectShape.show();
    }
  }

  /**
   * Hide the shape
   */
  hide() {
    if (this.rectShape) {
      this.rectShape.hide();
    }
  }

  /**
   * Jump to end state instantly
   */
  toEndState() {
    this._createShape();
    if (this.rectShape) {
      this.rectShape.renderEndState();
    }
  }

  /**
   * Perform the animation
   * @param {PlayContext} playContext - Play context with onComplete callback
   */
  doPlay(playContext) {
    try {
      this._createShape();

      if (!this.rectShape) {
        this.scheduleComplete();
        playContext.onComplete();
        return;
      }

      const startPoint = RoboEventManager.getLastVisitedPenPoint();
      this.rectShape.renderWithAnimation(startPoint, () => {
        this.scheduleComplete();
        playContext.onComplete();
      });
    } catch (e) {
      console.error('MathTextRectEffect: Error during play', e);
      this.scheduleComplete();
      playContext.onComplete(e);
    }
  }

  /**
   * Remove the shape from DOM
   */
  remove() {
    if (this.rectShape) {
      this.rectShape.remove();
      this.rectShape = null;
    }
  }

  /**
   * Get the rect shape
   * @returns {MathTextRectShape}
   */
  getRectShape() {
    return this.rectShape;
  }
}
