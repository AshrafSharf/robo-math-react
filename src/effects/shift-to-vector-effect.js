/**
 * ShiftToVectorEffect - Animates a vector shifting from one position to another
 * The vector's tail is repositioned while preserving direction and magnitude.
 * Vector appears instantly then slides to the target position.
 */

import { TexToSVGShapeEffect } from './shape-effects/tex-to-svg-shape-effect.js';
import { TweenMax } from 'gsap';

export class ShiftToVectorEffect extends TexToSVGShapeEffect {
  /**
   * @param {Object} shape - The vector shape to animate
   * @param {Object} originalStart - Original vector's start position {x, y}
   * @param {Object} targetStart - Target position for the vector's tail {x, y}
   */
  constructor(shape, originalStart, targetStart) {
    super(shape);
    this.originalStart = originalStart; // Original vector's start position
    this.targetStart = targetStart; // Target position to shift to
    this.animationType = 'shiftTo';
    this.shiftDuration = 0.8; // Duration for sliding animation in seconds
  }

  /**
   * Override toEndState to include shifting to final position
   */
  toEndState() {
    if (!this.mathScriptShape) return;

    // First show and render the vector normally
    this.mathScriptShape.show();
    // Don't call enableStroke() to preserve any dash patterns
    this.mathScriptShape.renderEndState();

    // Then shift it to final position instantly
    this.shiftToFinalPosition();
  }

  /**
   * Instantly shift the vector to the target position
   */
  shiftToFinalPosition() {
    // Calculate displacement needed
    const displacement = {
      x: this.targetStart.x - this.originalStart.x,
      y: this.targetStart.y - this.originalStart.y
    };

    // Update model coordinates to final position
    for (let i = 0; i < this.mathScriptShape.modelCoordinates.length; i += 2) {
      this.mathScriptShape.modelCoordinates[i] += displacement.x;
      this.mathScriptShape.modelCoordinates[i + 1] += displacement.y;
    }

    // Regenerate path with new coordinates
    if (this.mathScriptShape.generatePath) {
      this.mathScriptShape.generatePath();
    }
  }

  /**
   * Animate sliding from original to target position using path regeneration
   */
  animateShift(onComplete) {
    // Store initial coordinates (at original position)
    const initialCoords = [...this.mathScriptShape.modelCoordinates];

    // Calculate displacement
    const displacement = {
      x: this.targetStart.x - this.originalStart.x,
      y: this.targetStart.y - this.originalStart.y
    };

    // Animation data - interpolate from 0 to 1
    const animData = { progress: 0 };

    // Use TweenMax for animation like rotateAbout does
    TweenMax.to(animData, this.shiftDuration, {
      progress: 1,
      ease: 'Power2.easeInOut',
      onUpdate: () => {
        // Move both endpoints together maintaining the vector shape
        for (let i = 0; i < initialCoords.length; i += 2) {
          this.mathScriptShape.modelCoordinates[i] = initialCoords[i] + (displacement.x * animData.progress);
          this.mathScriptShape.modelCoordinates[i + 1] = initialCoords[i + 1] + (displacement.y * animData.progress);
        }

        // Regenerate path with interpolated coordinates
        if (this.mathScriptShape.generatePath) {
          this.mathScriptShape.generatePath();
        }
      },
      onComplete: onComplete
    });
  }

  /**
   * Override doPlay to show vector instantly then animate shifting
   */
  doPlay(playContext) {
    try {
      // Show the vector instantly without pen animation
      this.mathScriptShape.show();
      // Don't call enableStroke() to preserve any dash patterns
      this.mathScriptShape.renderEndState();

      // Then animate shifting to target position
      this.animateShift(() => {
        this.scheduleComplete();
        playContext.onComplete();
      });

    } catch (e) {
      this.scheduleComplete();
      playContext.onComplete(e);
    }
  }

  /**
   * Reset to start state (hide the shape)
   */
  toStartState() {
    this.hide();
  }

  /**
   * Remove the shape from the DOM
   */
  remove() {
    if (this.mathScriptShape && this.mathScriptShape.remove) {
      this.mathScriptShape.remove();
    }
  }

  /**
   * Get the shape being animated
   */
  getShape() {
    return this.mathScriptShape;
  }
}
