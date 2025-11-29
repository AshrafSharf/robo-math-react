import { BaseEffect } from './base-effect.js';

/**
 * ZoomEffect handles zoom animations on a diagram
 */
export class ZoomEffect extends BaseEffect {
  constructor(diagram, point, options = {}) {
    super();
    this.diagram = diagram;
    this.point = point;
    this.options = options;
  }

  doPlay(playContext) {
    try {
      console.log('ZoomEffect playing with point:', this.point, 'options:', this.options);
      
      // Perform the zoom using direct methods (not queued)
      // Force animate=true since this is called from an effect that should animate
      if (this.point === null) {
        // Zoom out
        this.diagram.zoomOutDirect({
          duration: this.options.duration || 1,
          animate: true  // Force animation for effects
        });
      } else {
        // Zoom in to point
        this.diagram.zoomDirect(this.point, {
          scale: this.options.scale || 0.5,
          duration: this.options.duration || 1,
          animate: true  // Force animation for effects
        });
      }
      
      // Schedule completion after animation duration
      const timeoutId = setTimeout(() => {
        this.activeTimeouts.delete(timeoutId);
        this.scheduleComplete();
        playContext.onComplete();
      }, (this.options.duration || 1) * 1000);
      this.addTimeout(timeoutId);
      
    } catch (e) {
      this.scheduleComplete();
      playContext.onComplete(e);
    }
  }

  toEndState() {
    // Instantly apply the zoom without animation
    if (this.point === null) {
      this.diagram.zoomOutDirect({ 
        duration: 0,
        animate: false  // Force no animation for instant state
      });
    } else {
      this.diagram.zoomDirect(this.point, {
        scale: this.options.scale || 0.5,
        duration: 0,
        animate: false  // Force no animation for instant state
      });
    }
  }

  show() {
    // No-op for zoom
  }

  hide() {
    // Could reset zoom here if needed
  }
}