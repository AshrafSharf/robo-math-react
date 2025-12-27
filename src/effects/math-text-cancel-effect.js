/**
 * MathTextCancelEffect - Effect for animating a cancel strikethrough over a TextItem
 *
 * Usage:
 * ```javascript
 * const mathText = diagram.mathText('x + \\bbox[0px]{y} = z', 0, 0);
 * const items = mathText.getTextItems();
 * const effect = new MathTextCancelEffect(items.get(0), annotationSvg, { direction: 'u' });
 * await effect.play();
 * ```
 */

import { BaseEffect } from './base-effect.js';
import { MathTextCancelShape } from '../script-shapes/math-text-cancel-shape.js';
import { RoboEventManager } from '../events/robo-event-manager.js';

export class MathTextCancelEffect extends BaseEffect {
  /**
   * @param {TextItem} textItem - The TextItem to cancel
   * @param {SVGSVGElement} targetSvg - SVG element to render the cancel into
   * @param {Object} options - Styling options
   * @param {string} options.direction - 'u' (cancel), 'd' (bcancel), 'x' (xcancel)
   * @param {string} options.stroke - Stroke color (default: 'red')
   * @param {number} options.strokeWidth - Stroke width (default: 2)
   */
  constructor(textItem, targetSvg, options = {}) {
    super();
    this.textItem = textItem;
    this.targetSvg = targetSvg;
    this.options = options;
    this.cancelShape = null;
  }

  /**
   * Create the cancel shape (if not already created)
   */
  _createShape() {
    if (this.cancelShape) return;

    // Use canvas-relative bounds from TextItem
    const canvasBounds = this.textItem.getCanvasBounds();
    if (!canvasBounds) {
      console.warn('MathTextCancelEffect: Could not get TextItem bounds');
      return;
    }

    this.cancelShape = new MathTextCancelShape(this.targetSvg, canvasBounds, {
      direction: this.options.direction || 'u',
      stroke: this.options.stroke || 'red',
      strokeWidth: this.options.strokeWidth || 2
    });
    this.cancelShape.create();
  }

  /**
   * Show the shape instantly
   */
  show() {
    this._createShape();
    if (this.cancelShape) {
      this.cancelShape.show();
    }
  }

  /**
   * Hide the shape
   */
  hide() {
    if (this.cancelShape) {
      this.cancelShape.hide();
    }
  }

  /**
   * Jump to end state instantly
   */
  toEndState() {
    this._createShape();
    if (this.cancelShape) {
      this.cancelShape.renderEndState();
    }
  }

  /**
   * Perform the animation
   * @param {PlayContext} playContext - Play context with onComplete callback
   */
  doPlay(playContext) {
    try {
      this._createShape();

      if (!this.cancelShape) {
        this.scheduleComplete();
        playContext.onComplete();
        return;
      }

      const startPoint = RoboEventManager.getLastVisitedPenPoint();
      this.cancelShape.renderWithAnimation(startPoint, () => {
        this.scheduleComplete();
        playContext.onComplete();
      });
    } catch (e) {
      console.error('MathTextCancelEffect: Error during play', e);
      this.scheduleComplete();
      playContext.onComplete(e);
    }
  }

  /**
   * Remove the shape from DOM
   */
  remove() {
    if (this.cancelShape) {
      this.cancelShape.remove();
      this.cancelShape = null;
    }
  }

  /**
   * Get the cancel shape
   * @returns {MathTextCancelShape}
   */
  getCancelShape() {
    return this.cancelShape;
  }
}
