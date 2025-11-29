/**
 * ReverseVectorEffect - Animates a vector flipping to its opposite direction
 * First draws the vector, then slides along reverse direction to align tails
 */

import { MathShapeEffect } from './shape-effects/math-shape-effect.js';
import { Point } from '../geom/Point.js';
import { TweenMax } from 'gsap/all';

export class ReverseVectorEffect extends MathShapeEffect {
  constructor(shape, originalStart, originalEnd, displacement) {
    super(shape);
    this.originalStart = originalStart; // The original vector's start point (where tails should align)
    this.originalEnd = originalEnd; // The original vector's end point (where reversed vector starts)
    this.displacement = displacement; // The original vector's displacement
    this.animationType = 'reverse';
    this.slideDuration = 0.8; // Duration for sliding animation in seconds
  }

  /**
   * Override toEndState to include sliding after vector is drawn
   */
  toEndState() {
    if (!this.mathScriptShape) return;
    
    // First show and render the vector normally
    this.mathScriptShape.show();
    this.mathScriptShape.enableStroke();
    this.mathScriptShape.renderEndState();
    
    // Then slide it to final position instantly
    this.slideToFinalPosition();
  }

  /**
   * Instantly move the vector to align tails with original vector
   */
  slideToFinalPosition() {
    // The vector needs to slide from its initial position (tail at originalEnd)
    // to final position (tail at originalStart)
    // This means sliding by -displacement
    for (let i = 0; i < this.mathScriptShape.modelCoordinates.length; i += 2) {
      this.mathScriptShape.modelCoordinates[i] -= this.displacement.x;
      this.mathScriptShape.modelCoordinates[i + 1] -= this.displacement.y;
    }
    
    // Regenerate path with new coordinates
    if (this.mathScriptShape.generatePath) {
      this.mathScriptShape.generatePath();
    }
  }

  /**
   * Animate sliding along reverse direction using path regeneration
   */
  animateSlide(onComplete) {
    // Store initial coordinates (vector starting at originalEnd, pointing to originalStart)
    const initialCoords = [...this.mathScriptShape.modelCoordinates];
    
    // Animation data - interpolate from 0 to 1
    const animData = { progress: 0 };
    
    // Use TweenMax for animation like rotateAbout does
    TweenMax.to(animData, this.slideDuration, {
      progress: 1,
      ease: 'Power2.easeInOut',
      onUpdate: () => {
        // Slide along the reverse direction (-displacement)
        // Both endpoints move together maintaining the vector shape
        for (let i = 0; i < initialCoords.length; i += 2) {
          this.mathScriptShape.modelCoordinates[i] = initialCoords[i] - (this.displacement.x * animData.progress);
          this.mathScriptShape.modelCoordinates[i + 1] = initialCoords[i + 1] - (this.displacement.y * animData.progress);
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
   * Override doPlay to show vector instantly then slide
   */
  doPlay(playContext) {
    try {
      // Show the vector instantly without pen animation
      this.mathScriptShape.show();
      // Don't call enableStroke() to preserve the dash pattern
      this.mathScriptShape.renderEndState();
      
      // Then animate sliding to position
      this.animateSlide(() => {
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
    if (this.shape && this.shape.remove) {
      this.shape.remove();
    }
  }

  /**
   * Get the shape being animated
   */
  getShape() {
    return this.shape;
  }
}