/**
 * PenPositionEmitter - Unified utility for pen position emission
 * Handles coordinate conversion for both 2D (SVG) and 3D (Three.js)
 */

import * as THREE from 'three';
import { Point } from '../geom/Point.js';
import { RoboEventManager } from './robo-event-manager.js';
import { PenEvent } from './pen-event.js';

export class PenPositionEmitter {
  /**
   * Emit pen position from screen coordinates
   * @param {Point|{x,y}} screenPoint - Screen coordinates
   */
  static emit(screenPoint) {
    const point = screenPoint instanceof Point
      ? screenPoint
      : new Point(screenPoint.x, screenPoint.y);
    RoboEventManager.firePenPosition(new PenEvent(point));
  }

  /**
   * Convert SVG local coordinates to global viewport coordinates
   * @param {SVGElement} svgElement - The SVG root element
   * @param {{x,y}} localPoint - Local SVG coordinates
   * @returns {Point} Global viewport coordinates
   */
  static svgToViewport(svgElement, localPoint) {
    const rect = svgElement.getBoundingClientRect();
    const scaleFactor = RoboEventManager.getScaleFactor();
    return new Point(
      rect.left + localPoint.x * scaleFactor,
      rect.top + localPoint.y * scaleFactor
    );
  }

  /**
   * Convert Three.js object world position to global viewport coordinates
   * Works regardless of coordinate system (LHS/RHS)
   * @param {THREE.Object3D} object3d - The 3D object
   * @param {THREE.Camera} camera - The camera for projection
   * @param {HTMLElement} canvas - The renderer's canvas DOM element
   * @returns {Point} Global viewport coordinates
   */
  static threeToViewport(object3d, camera, canvas) {
    const worldPos = new THREE.Vector3();
    object3d.getWorldPosition(worldPos);
    return this.worldPosToViewport(worldPos, camera, canvas);
  }

  /**
   * Convert Three.js Vector3 world position to global viewport coordinates
   * @param {THREE.Vector3} worldPosition - World position vector
   * @param {THREE.Camera} camera - The camera for projection
   * @param {HTMLElement} canvas - The renderer's canvas DOM element
   * @returns {Point} Global viewport coordinates
   */
  static worldPosToViewport(worldPosition, camera, canvas) {
    const vector = worldPosition.clone().project(camera);

    const widthHalf = canvas.clientWidth / 2;
    const heightHalf = canvas.clientHeight / 2;
    const canvasX = vector.x * widthHalf + widthHalf;
    const canvasY = -vector.y * heightHalf + heightHalf;

    // Convert to global viewport coordinates (accounts for scroll via getBoundingClientRect)
    const rect = canvas.getBoundingClientRect();
    return new Point(rect.left + canvasX, rect.top + canvasY);
  }

  /**
   * Convert interpolated position along a line to global viewport coordinates
   * Useful for line/segment drawing animations
   * @param {THREE.Vector3} start - Start position vector
   * @param {THREE.Vector3} end - End position vector
   * @param {number} ratio - Progress ratio (0-1)
   * @param {THREE.Camera} camera - The camera for projection
   * @param {HTMLElement} canvas - The renderer's canvas DOM element
   * @returns {Point} Global viewport coordinates
   */
  static interpolatedToViewport(start, end, ratio, camera, canvas) {
    const pos = new THREE.Vector3().lerpVectors(start, end, ratio);
    return this.worldPosToViewport(pos, camera, canvas);
  }
}
