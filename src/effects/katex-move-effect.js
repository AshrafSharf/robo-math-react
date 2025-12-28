/**
 * KatexMoveEffect - Animates a KatexTextItem from its original position
 * to a target position by cloning the DOM element.
 *
 * Uses GSAP for smooth position animation.
 */

import { BaseEffect } from './base-effect.js';
import { TweenMax, Power2 } from 'gsap';
import $ from '../mathtext/utils/dom-query.js';

export class KatexMoveEffect extends BaseEffect {
  /**
   * @param {KatexTextItem} katexTextItem - The KatexTextItem to animate
   * @param {number} targetX - Target x pixel coordinate
   * @param {number} targetY - Target y pixel coordinate
   * @param {HTMLElement} parentDOM - Parent DOM for the cloned element
   * @param {Object} options - Animation options
   * @param {number} options.duration - Animation duration in seconds (default: 0.8)
   * @param {*} options.ease - GSAP easing function (default: Power2.easeOut)
   */
  constructor(katexTextItem, targetX, targetY, parentDOM, options = {}) {
    super();

    this.katexTextItem = katexTextItem;
    this.katexComponent = katexTextItem.getMathComponent();
    this.targetX = targetX;
    this.targetY = targetY;
    this.parentDOM = parentDOM || this.katexComponent.parentDOM;

    this.duration = options.duration || 0.8;
    this.ease = options.ease || Power2.easeOut;

    // Will be set when clone is created
    this.clonedContainer = null;
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
   * Calculate start/end positions based on KatexTextItem bounds
   */
  _init() {
    const clientBounds = this.katexTextItem.getClientBounds();
    if (!clientBounds) {
      console.error('KatexMoveEffect: Could not get KatexTextItem bounds');
      return;
    }

    // Internal offset is the position of the element within the container
    this.internalOffsetX = clientBounds.x;
    this.internalOffsetY = clientBounds.y;

    // Start position: actual position of selected element (container + offset)
    this.startX = this.katexComponent.componentState.left + this.internalOffsetX;
    this.startY = this.katexComponent.componentState.top + this.internalOffsetY;

    // End position: target position directly
    this.endX = this.targetX;
    this.endY = this.targetY;
  }

  /**
   * Create the cloned container with the element (if not already created)
   */
  _createClone() {
    if (this.clonedContainer) return;

    const sourceElement = this.katexTextItem.getElement();
    if (!sourceElement) {
      console.warn('KatexMoveEffect: No source element from KatexTextItem');
      return;
    }

    // Clone the element
    const clonedElement = sourceElement.cloneNode(true);

    // Create wrapper container with katex class for proper CSS styling
    this.clonedContainer = $('<div>').attr({
      'class': 'katex-move-clone'
    }).css({
      'position': 'absolute',
      'left': this.startX + 'px',
      'top': this.startY + 'px',
      'font-size': this.katexComponent.fontSizeValue + 'px',
      'color': this.katexComponent.color,
      'display': 'none',
      'pointer-events': 'none'
    })[0];

    // Wrap in katex structure so CSS rules apply
    const katexWrapper = $('<span>').attr('class', 'katex')[0];
    const katexHtml = $('<span>').attr('class', 'katex-html')[0];
    katexHtml.appendChild(clonedElement);
    katexWrapper.appendChild(katexHtml);
    this.clonedContainer.appendChild(katexWrapper);

    $(this.parentDOM).append(this.clonedContainer);
  }

  /**
   * Show the cloned element
   */
  show() {
    this._createClone();
    if (this.clonedContainer) {
      $(this.clonedContainer).css('display', 'block');
    }
  }

  /**
   * Hide the cloned element
   */
  hide() {
    if (this.clonedContainer) {
      $(this.clonedContainer).css('display', 'none');
    }
  }

  /**
   * Reset to start state
   */
  reset() {
    if (this.clonedContainer) {
      this.clonedContainer.style.left = this.startX + 'px';
      this.clonedContainer.style.top = this.startY + 'px';
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
    if (this.clonedContainer) {
      this.clonedContainer.style.left = this.endX + 'px';
      this.clonedContainer.style.top = this.endY + 'px';
      $(this.clonedContainer).css('display', 'block');
    }
  }

  /**
   * Perform the animation
   * @param {PlayContext} playContext - Play context with duration and callbacks
   */
  doPlay(playContext) {
    try {
      this._createClone();

      if (!this.clonedContainer) {
        this.scheduleComplete();
        playContext.onComplete();
        return;
      }

      // Reset to start position before animating
      this.clonedContainer.style.left = this.startX + 'px';
      this.clonedContainer.style.top = this.startY + 'px';
      $(this.clonedContainer).css('display', 'block');

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
          this.clonedContainer.style.left = currentX + 'px';
          this.clonedContainer.style.top = currentY + 'px';
        },
        onComplete: () => {
          this.activeTween = null;
          this.scheduleComplete();
          playContext.onComplete();
        }
      });

    } catch (e) {
      console.error('KatexMoveEffect: Error during play', e);
      this.scheduleComplete();
      playContext.onComplete(e);
    }
  }

  /**
   * Remove the cloned element from DOM
   */
  remove() {
    if (this.clonedContainer && this.clonedContainer.parentNode) {
      this.clonedContainer.parentNode.removeChild(this.clonedContainer);
      this.clonedContainer = null;
    }
  }

  /**
   * Get the cloned container
   * @returns {HTMLElement|null}
   */
  getClonedContainer() {
    return this.clonedContainer;
  }

  /**
   * Get the target position
   * @returns {{x: number, y: number}}
   */
  getTargetPosition() {
    return { x: this.targetX, y: this.targetY };
  }
}
