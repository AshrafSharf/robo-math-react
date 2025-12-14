/**
 * Pen3DTracker - Helper class for 3D animation pen tracking
 * Lightweight wrapper that animators can use to emit pen position events.
 * Tracks last position to enable smooth pen movement between shapes.
 */

import * as THREE from 'three';
import { TweenMax, Power2 } from 'gsap';
import { Point } from '../geom/Point.js';
import { GeomUtil } from '../geom/GeomUtil.js';
import { PenPositionEmitter } from './pen-position-emitter.js';

export class Pen3DTracker {
  /**
   * @param {THREE.Camera} camera - The scene camera
   * @param {HTMLElement} canvasElement - The renderer's canvas element
   */
  constructor(camera, canvasElement) {
    this.camera = camera;
    this.canvas = canvasElement;
    this.lastScreenPosition = null;
  }

  /**
   * Animate pen from its last position to a target world position
   * @param {THREE.Vector3} targetWorldPosition - Target position in world coordinates
   * @param {Function} onComplete - Callback when movement completes
   * @returns {Object} GSAP tween object
   */
  moveTo(targetWorldPosition, onComplete) {
    const targetScreen = PenPositionEmitter.worldPosToViewport(
      targetWorldPosition,
      this.camera,
      this.canvas
    );

    // If no last position, just emit target and complete
    if (!this.lastScreenPosition) {
      this.lastScreenPosition = targetScreen;
      PenPositionEmitter.emit(targetScreen);
      if (onComplete) onComplete();
      return null;
    }

    const startX = this.lastScreenPosition.x;
    const startY = this.lastScreenPosition.y;
    const endX = targetScreen.x;
    const endY = targetScreen.y;

    const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const duration = this.durationByDistance(distance);

    const animData = { x: startX, y: startY };

    return TweenMax.to(animData, duration, {
      x: endX,
      y: endY,
      ease: Power2.easeInOut,
      onUpdate: () => {
        const currentPoint = new Point(animData.x, animData.y);
        PenPositionEmitter.emit(currentPoint);
      },
      onComplete: () => {
        this.lastScreenPosition = targetScreen;
        if (onComplete) onComplete();
      }
    });
  }

  /**
   * Calculate duration based on distance (similar to 2D PenMovementAnimator)
   */
  durationByDistance(distance) {
    const minDistance = 50;
    const maxDistance = 1000;
    const minTime = 0.3;
    const maxTime = 2;
    return GeomUtil.map(distance, minDistance, maxDistance, minTime, maxTime);
  }

  /**
   * Emit the current screen position of a 3D object
   * @param {THREE.Object3D} object3d - The object to track
   */
  emitPosition(object3d) {
    const screenPoint = PenPositionEmitter.threeToViewport(
      object3d,
      this.camera,
      this.canvas
    );
    this.lastScreenPosition = screenPoint;
    PenPositionEmitter.emit(screenPoint);
  }

  /**
   * Emit an interpolated position along a line between two points
   * Useful for line/segment drawing animations
   * @param {THREE.Vector3} startVec3 - Start position
   * @param {THREE.Vector3} endVec3 - End position
   * @param {number} ratio - Progress ratio (0-1)
   */
  emitInterpolated(startVec3, endVec3, ratio) {
    const screenPoint = PenPositionEmitter.interpolatedToViewport(
      startVec3,
      endVec3,
      ratio,
      this.camera,
      this.canvas
    );
    this.lastScreenPosition = screenPoint;
    PenPositionEmitter.emit(screenPoint);
  }

  /**
   * Emit position from a raw world position vector
   * @param {THREE.Vector3} worldPosition - World position
   */
  emitWorldPosition(worldPosition) {
    const screenPoint = PenPositionEmitter.worldPosToViewport(
      worldPosition,
      this.camera,
      this.canvas
    );
    this.lastScreenPosition = screenPoint;
    PenPositionEmitter.emit(screenPoint);
  }
}
