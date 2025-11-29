import { BaseEffect } from './base-effect.js';

/**
 * PanEffect handles pan animations on a diagram
 */
export class PanEffect extends BaseEffect {
  constructor(diagram, point, options = {}) {
    super();
    this.diagram = diagram;
    this.point = point;
    this.options = options;
  }

  doPlay(playContext) {
    try {
      console.log('PanEffect playing to point:', this.point, 'options:', this.options);
      
      // Perform the pan using grapher method
      this.diagram.graphContainer.panTo({
        point: this.point,
        duration: this.options.duration || 0.5,
        animate: true
      });
      
      // Schedule completion after animation duration
      const timeoutId = setTimeout(() => {
        this.activeTimeouts.delete(timeoutId);
        this.scheduleComplete();
        playContext.onComplete();
      }, (this.options.duration || 0.5) * 1000);
      this.addTimeout(timeoutId);
      
    } catch (e) {
      this.scheduleComplete();
      playContext.onComplete(e);
    }
  }

  toEndState() {
    // Instantly apply the pan without animation
    this.diagram.graphContainer.panTo({
      point: this.point,
      duration: 0,
      animate: false
    });
  }

  show() {
    // No-op for pan
  }

  hide() {
    // No-op for pan
  }
}