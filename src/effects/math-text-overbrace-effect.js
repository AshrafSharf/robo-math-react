/**
 * MathTextOverbraceEffect - Effect for animating an overbrace over a TextItem
 *
 * Usage:
 * ```javascript
 * const mathText = diagram.mathText('x + \\bbox[0px]{y} = z', 0, 0);
 * const items = mathText.getTextItems();
 * const effect = new MathTextOverbraceEffect(items.get(0), annotationSvg, { stroke: 'blue' });
 * await effect.play();
 * ```
 */

import { BaseEffect } from './base-effect.js';
import { MathTextOverbraceShape } from '../script-shapes/math-text-overbrace-shape.js';
import { RoboEventManager } from '../events/robo-event-manager.js';

export class MathTextOverbraceEffect extends BaseEffect {
  /**
   * @param {TextItem} textItem - The TextItem to annotate
   * @param {SVGSVGElement} targetSvg - SVG element to render the overbrace into
   * @param {Object} options - Styling options
   * @param {string} options.stroke - Stroke color (default: '#333')
   * @param {number} options.strokeWidth - Stroke width (default: 2)
   * @param {number} options.buffer - Space between text and brace (default: 5)
   * @param {number} options.curveHeight - Height of brace curves (default: 8)
   */
  constructor(textItem, targetSvg, options = {}) {
    super();
    this.textItem = textItem;
    this.targetSvg = targetSvg;
    this.options = options;
    this.overbraceShape = null;
  }

  /**
   * Create the overbrace shape (if not already created)
   */
  _createShape() {
    if (this.overbraceShape) return;

    // Use canvas-relative bounds from TextItem
    const canvasBounds = this.textItem.getCanvasBounds();
    if (!canvasBounds) {
      console.warn('MathTextOverbraceEffect: Could not get TextItem bounds');
      return;
    }

    this.overbraceShape = new MathTextOverbraceShape(this.targetSvg, canvasBounds, {
      stroke: this.options.stroke || '#333',
      strokeWidth: this.options.strokeWidth || 2,
      buffer: this.options.buffer ?? 5,
      curveHeight: this.options.curveHeight ?? 8
    });
    this.overbraceShape.create();
  }

  /**
   * Show the shape instantly
   */
  show() {
    this._createShape();
    if (this.overbraceShape) {
      this.overbraceShape.show();
    }
  }

  /**
   * Hide the shape
   */
  hide() {
    if (this.overbraceShape) {
      this.overbraceShape.hide();
    }
  }

  /**
   * Jump to end state instantly
   */
  toEndState() {
    this._createShape();
    if (this.overbraceShape) {
      this.overbraceShape.renderEndState();
    }
  }

  /**
   * Perform the animation
   * @param {PlayContext} playContext - Play context with onComplete callback
   */
  doPlay(playContext) {
    try {
      this._createShape();

      if (!this.overbraceShape) {
        this.scheduleComplete();
        playContext.onComplete();
        return;
      }

      const startPoint = RoboEventManager.getLastVisitedPenPoint();
      this.overbraceShape.renderWithAnimation(startPoint, () => {
        this.scheduleComplete();
        playContext.onComplete();
      });
    } catch (e) {
      console.error('MathTextOverbraceEffect: Error during play', e);
      this.scheduleComplete();
      playContext.onComplete(e);
    }
  }

  /**
   * Remove the shape from DOM
   */
  remove() {
    if (this.overbraceShape) {
      this.overbraceShape.remove();
      this.overbraceShape = null;
    }
  }

  /**
   * Get the overbrace shape
   * @returns {MathTextOverbraceShape}
   */
  getOverbraceShape() {
    return this.overbraceShape;
  }
}
