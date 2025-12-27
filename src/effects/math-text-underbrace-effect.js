/**
 * MathTextUnderbraceEffect - Effect for animating an underbrace below a TextItem
 */

import { BaseEffect } from './base-effect.js';
import { MathTextUnderbraceShape } from '../script-shapes/math-text-underbrace-shape.js';
import { RoboEventManager } from '../events/robo-event-manager.js';

export class MathTextUnderbraceEffect extends BaseEffect {
  /**
   * @param {TextItem} textItem - The TextItem to annotate
   * @param {SVGSVGElement} targetSvg - SVG element to render the underbrace into
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
    this.underbraceShape = null;
  }

  /**
   * Create the underbrace shape (if not already created)
   */
  _createShape() {
    if (this.underbraceShape) return;

    // Use canvas-relative bounds from TextItem
    const canvasBounds = this.textItem.getCanvasBounds();
    if (!canvasBounds) {
      console.warn('MathTextUnderbraceEffect: Could not get TextItem bounds');
      return;
    }

    this.underbraceShape = new MathTextUnderbraceShape(this.targetSvg, canvasBounds, {
      stroke: this.options.stroke || '#333',
      strokeWidth: this.options.strokeWidth || 2,
      buffer: this.options.buffer ?? 5,
      curveHeight: this.options.curveHeight ?? 8
    });
    this.underbraceShape.create();
  }

  /**
   * Show the shape instantly
   */
  show() {
    this._createShape();
    if (this.underbraceShape) {
      this.underbraceShape.show();
    }
  }

  /**
   * Hide the shape
   */
  hide() {
    if (this.underbraceShape) {
      this.underbraceShape.hide();
    }
  }

  /**
   * Jump to end state instantly
   */
  toEndState() {
    this._createShape();
    if (this.underbraceShape) {
      this.underbraceShape.renderEndState();
    }
  }

  /**
   * Perform the animation
   * @param {PlayContext} playContext - Play context with onComplete callback
   */
  doPlay(playContext) {
    try {
      this._createShape();

      if (!this.underbraceShape) {
        this.scheduleComplete();
        playContext.onComplete();
        return;
      }

      const startPoint = RoboEventManager.getLastVisitedPenPoint();
      this.underbraceShape.renderWithAnimation(startPoint, () => {
        this.scheduleComplete();
        playContext.onComplete();
      });
    } catch (e) {
      console.error('MathTextUnderbraceEffect: Error during play', e);
      this.scheduleComplete();
      playContext.onComplete(e);
    }
  }

  /**
   * Remove the shape from DOM
   */
  remove() {
    if (this.underbraceShape) {
      this.underbraceShape.remove();
      this.underbraceShape = null;
    }
  }

  /**
   * Get the underbrace shape
   * @returns {MathTextUnderbraceShape}
   */
  getUnderbraceShape() {
    return this.underbraceShape;
  }
}
