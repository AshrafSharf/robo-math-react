/**
 * MathTextMoveEffect - Animates a TextItem from a MathTextComponent
 * moving from its original position to a target position.
 *
 * Creates a clone of the TextItem content and animates it using GSAP.
 *
 * Usage:
 * ```javascript
 * const mathText = diagram.mathText('x + \\bbox[0px]{y} = z', 0, 0);
 * const items = mathText.getTextItems();
 * const effect = new MathTextMoveEffect(items.get(0), 200, 300, parentDOM);
 * await effect.play();
 * ```
 */

import { BaseEffect } from './base-effect.js';
import { MathTextComponent } from '../mathtext/components/math-text-component.js';
import { TweenMax, Power2 } from 'gsap';
import { RoboEventManager } from '../events/robo-event-manager.js';
import { PenEvent } from '../events/pen-event.js';
import { PenCoordinateUtil } from '../utils/pen-coordinate-util.js';

export class MathTextMoveEffect extends BaseEffect {
  /**
   * @param {TextItem} textItem - The TextItem to animate
   * @param {number} targetX - Target x pixel coordinate
   * @param {number} targetY - Target y pixel coordinate
   * @param {HTMLElement} parentDOM - Parent DOM for the cloned component (optional, defaults to mathComponent's parent)
   * @param {Object} options - Animation options
   * @param {number} options.duration - Animation duration in seconds (default: 0.8)
   * @param {*} options.ease - GSAP easing function (default: Power2.easeOut)
   */
  constructor(textItem, targetX, targetY, parentDOM, options = {}) {
    super();

    this.textItem = textItem;
    this.mathComponent = textItem.getMathComponent();
    this.targetX = targetX;
    this.targetY = targetY;
    this.parentDOM = parentDOM || this.mathComponent.parentDOM;

    this.duration = options.duration || 0.8;
    this.ease = options.ease || Power2.easeOut;

    // Will be set when clone is created
    this.clonedComponent = null;
    this.startX = null;
    this.startY = null;
    this.endX = null;
    this.endY = null;
    this.internalOffsetX = null;
    this.internalOffsetY = null;

    // Active tween for stopping
    this.activeTween = null;

    // Initialize and calculate positions
    this._init();
  }

  /**
   * Calculate start/end positions based on TextItem bounds
   */
  _init() {
    const clientBounds = this.textItem.getClientBounds();
    if (!clientBounds) {
      console.error('MathTextMoveEffect: Could not get TextItem bounds');
      return;
    }

    // Internal offset is the position of the TextItem content within the container
    this.internalOffsetX = clientBounds.x;
    this.internalOffsetY = clientBounds.y;

    // Start position: same as source container (clone will overlap original)
    this.startX = this.mathComponent.componentState.left;
    this.startY = this.mathComponent.componentState.top;

    // End position: adjusted to place TextItem content at target
    this.endX = this.targetX - this.internalOffsetX;
    this.endY = this.targetY - this.internalOffsetY;
  }

  /**
   * Create the cloned component (if not already created)
   */
  _createClone() {
    if (this.clonedComponent) return;

    const filteredSvg = this.textItem.getFilteredSVG();
    if (!filteredSvg) {
      console.warn('MathTextMoveEffect: No filtered SVG from TextItem');
      return;
    }

    this.clonedComponent = MathTextComponent.fromSVGClone(
      filteredSvg,
      this.startX,
      this.startY,
      this.parentDOM,
      {
        fontSize: this.mathComponent.fontSizeValue,
        stroke: this.mathComponent.strokeColor,
        fill: this.mathComponent.fillColor
      }
    );
  }

  /**
   * Show the cloned component
   */
  show() {
    this._createClone();
    if (this.clonedComponent) {
      this.clonedComponent.show();
    }
  }

  /**
   * Hide the cloned component
   */
  hide() {
    if (this.clonedComponent) {
      this.clonedComponent.hide();
    }
  }

  /**
   * Reset to start state
   */
  reset() {
    if (this.clonedComponent) {
      this.clonedComponent.setCanvasPosition(this.startX, this.startY);
    }
  }

  /**
   * Stop the animation
   */
  stop() {
    super.stop();
    if (this.activeTween) {
      this.activeTween.kill();
      this.activeTween = null;
    }
  }

  /**
   * Jump to end state instantly (no animation)
   */
  toEndState() {
    this._createClone();
    if (this.clonedComponent) {
      this.clonedComponent.setCanvasPosition(this.endX, this.endY);
      this.clonedComponent.show();
    }
  }

  /**
   * Perform the animation
   * @param {PlayContext} playContext - Play context with duration and callbacks
   */
  doPlay(playContext) {
    try {
      this._createClone();

      if (!this.clonedComponent) {
        this.scheduleComplete();
        playContext.onComplete();
        return;
      }

      // Reset to start position before animating
      this.clonedComponent.setCanvasPosition(this.startX, this.startY);
      this.clonedComponent.show();

      // Store start/end for interpolation
      const startX = this.startX;
      const startY = this.startY;
      const endX = this.endX;
      const endY = this.endY;

      // Animate to end position
      const tweener = { progress: 0 };
      this.activeTween = TweenMax.to(tweener, this.duration, {
        progress: 1,
        ease: this.ease,
        onUpdate: () => {
          // Interpolate position
          const currentX = startX + (endX - startX) * tweener.progress;
          const currentY = startY + (endY - startY) * tweener.progress;

          // Update clone position
          this.clonedComponent.setCanvasPosition(currentX, currentY);

          // Emit pen position in screen coordinates
          // Add internal offset to get actual content position
          const penX = currentX + this.internalOffsetX;
          const penY = currentY + this.internalOffsetY;
          const screenPos = PenCoordinateUtil.canvasToScreen(this.parentDOM, penX, penY);
          RoboEventManager.firePenPosition(new PenEvent(screenPos));
        },
        onComplete: () => {
          this.activeTween = null;
          this.scheduleComplete();
          playContext.onComplete();
        }
      });

    } catch (e) {
      console.error('MathTextMoveEffect: Error during play', e);
      this.scheduleComplete();
      playContext.onComplete(e);
    }
  }

  /**
   * Remove the cloned component from DOM
   */
  remove() {
    if (this.clonedComponent && this.clonedComponent.containerDOM) {
      if (this.clonedComponent.containerDOM.parentNode) {
        this.clonedComponent.containerDOM.parentNode.removeChild(this.clonedComponent.containerDOM);
      }
      this.clonedComponent = null;
    }
  }

  /**
   * Get the cloned component
   * @returns {MathTextComponent|null}
   */
  getClonedComponent() {
    return this.clonedComponent;
  }

  /**
   * Get the target position
   * @returns {{x: number, y: number}}
   */
  getTargetPosition() {
    return { x: this.targetX, y: this.targetY };
  }
}
