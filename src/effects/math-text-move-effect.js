/**
 * MathTextMoveEffect - Animates a bbox section from a MathTextComponent
 * moving from its original position to a target position.
 *
 * Creates a clone of the bbox content and animates it using GSAP.
 */

import { BaseEffect } from './base-effect.js';
import { TransformCopy } from '../mathtext/utils/transform-copy.js';
import { MathTextComponent } from '../mathtext/components/math-text-component.js';
import { TweenMax, Power2 } from 'gsap';

export class MathTextMoveEffect extends BaseEffect {
  /**
   * @param {MathTextComponent} sourceMathText - The source math text component
   * @param {number} bboxIndex - Index of the bbox section to animate
   * @param {number} targetX - Target x pixel coordinate
   * @param {number} targetY - Target y pixel coordinate
   * @param {HTMLElement} parentDOM - Parent DOM for the cloned component
   * @param {Object} options - Animation options
   * @param {number} options.duration - Animation duration in seconds (default: 0.8)
   * @param {*} options.ease - GSAP easing function (default: Power2.easeOut)
   */
  constructor(sourceMathText, bboxIndex, targetX, targetY, parentDOM, options = {}) {
    super();

    this.sourceMathText = sourceMathText;
    this.bboxIndex = bboxIndex;
    this.targetX = targetX;
    this.targetY = targetY;
    this.parentDOM = parentDOM || sourceMathText.parentDOM;

    this.duration = options.duration || 0.8;
    this.ease = options.ease || Power2.easeOut;

    // Will be set when clone is created
    this.clonedComponent = null;
    this.transformCopy = null;
    this.startX = null;
    this.startY = null;
    this.endX = null;
    this.endY = null;
    this.internalOffsetX = null;
    this.internalOffsetY = null;

    // Active tween for stopping
    this.activeTween = null;

    // Initialize transform copy and calculate positions
    this._init();
  }

  /**
   * Initialize TransformCopy and calculate start/end positions
   */
  _init() {
    this.transformCopy = new TransformCopy(this.sourceMathText, this.parentDOM);

    const sections = this.transformCopy.extractBBoxSections();
    if (this.bboxIndex < 0 || this.bboxIndex >= sections.length) {
      console.error(`MathTextMoveEffect: Invalid bbox index ${this.bboxIndex}`);
      return;
    }

    const section = sections[this.bboxIndex];
    const { bounds } = section;

    // Calculate internal offset
    const containerRect = this.sourceMathText.containerDOM.getBoundingClientRect();
    this.internalOffsetX = bounds.minX - containerRect.left;
    this.internalOffsetY = bounds.minY - containerRect.top;

    // Start position: same as source container (clone will overlap original)
    this.startX = this.sourceMathText.componentState.left;
    this.startY = this.sourceMathText.componentState.top;

    // End position: adjusted to place bbox content at target
    this.endX = this.targetX - this.internalOffsetX;
    this.endY = this.targetY - this.internalOffsetY;
  }

  /**
   * Create the cloned component (if not already created)
   */
  _createClone() {
    if (this.clonedComponent) return;

    const sections = this.transformCopy.extractBBoxSections();
    if (this.bboxIndex < 0 || this.bboxIndex >= sections.length) {
      return;
    }

    const section = sections[this.bboxIndex];
    const { paths } = section;

    if (!paths || paths.length === 0) {
      console.warn(`MathTextMoveEffect: No paths found in bbox section ${this.bboxIndex}`);
      return;
    }

    const sourceSvg = this.sourceMathText.getMathSVGRoot()[0];
    if (!sourceSvg) {
      console.error('MathTextMoveEffect: Source has no SVG');
      return;
    }

    const filteredSvg = this.transformCopy.createFilteredSVG(sourceSvg, paths, section.bounds);

    this.clonedComponent = MathTextComponent.fromSVGClone(
      filteredSvg,
      this.startX,
      this.startY,
      this.parentDOM,
      {
        fontSize: this.sourceMathText.fontSizeValue,
        stroke: this.sourceMathText.strokeColor,
        fill: this.sourceMathText.fillColor
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
      // Move back to start position
      this.clonedComponent.containerDOM.style.left = this.startX + 'px';
      this.clonedComponent.containerDOM.style.top = this.startY + 'px';
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
      this.clonedComponent.show();
      this.clonedComponent.containerDOM.style.left = this.endX + 'px';
      this.clonedComponent.containerDOM.style.top = this.endY + 'px';
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

      // Show at start position
      this.clonedComponent.show();

      // Animate to end position
      this.activeTween = TweenMax.to(this.clonedComponent.containerDOM, this.duration, {
        left: this.endX + 'px',
        top: this.endY + 'px',
        ease: this.ease,
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
