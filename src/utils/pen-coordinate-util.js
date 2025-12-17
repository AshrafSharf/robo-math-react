import { Point } from '../geom/Point.js';
import { RoboEventManager } from '../events/robo-event-manager.js';

/**
 * Utility for converting coordinates to screen space for pen tracking.
 * Screen coordinates are what the pen system expects (viewport/client coords).
 *
 * Formula: screenPos = parentRect + (localCanvasPos * scaleFactor)
 */
export class PenCoordinateUtil {
  /**
   * Convert canvas coordinates to screen coordinates for pen.
   * Uses parent container's bounding rect + local position * scale factor.
   *
   * @param {HTMLElement} parentElement - Parent container element
   * @param {number} canvasX - X position in canvas space
   * @param {number} canvasY - Y position in canvas space
   * @returns {Point} Screen coordinates for pen
   */
  static canvasToScreen(parentElement, canvasX, canvasY) {
    const rect = parentElement.getBoundingClientRect();
    const scaleFactor = RoboEventManager.getScaleFactor();
    return new Point(
      rect.left + canvasX * scaleFactor,
      rect.top + canvasY * scaleFactor
    );
  }
}
