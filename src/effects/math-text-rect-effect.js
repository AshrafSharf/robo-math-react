/**
 * MathTextRectEffect - Effect for animating MathTextRectShape with pen animation
 */

import { BaseEffect } from './base-effect.js';
import { RoboEventManager } from '../events/robo-event-manager.js';

export class MathTextRectEffect extends BaseEffect {
  /**
   * @param {MathTextRectShape} rectShape - The rect shape to animate
   */
  constructor(rectShape) {
    super();
    this.rectShape = rectShape;
  }

  /**
   * Show the shape instantly
   */
  show() {
    this.rectShape.show();
  }

  /**
   * Hide the shape
   */
  hide() {
    this.rectShape.hide();
  }

  /**
   * Jump to end state instantly
   */
  toEndState() {
    this.rectShape.renderEndState();
  }

  /**
   * Perform the animation
   * @param {PlayContext} playContext - Play context with onComplete callback
   */
  doPlay(playContext) {
    try {
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
    this.rectShape.remove();
  }

  /**
   * Get the rect shape
   * @returns {MathTextRectShape}
   */
  getRectShape() {
    return this.rectShape;
  }
}
