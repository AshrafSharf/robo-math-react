import { Point } from './Point.js';
import { GeomUtil } from './GeomUtil.js';

/**
 * LineUtil - Static utility class for line operations.
 * Ported from Python Manim add-ons (geometry_utils.py).
 *
 * All methods work with Point objects or any point-like input
 * (objects with x,y properties or [x,y] arrays).
 *
 * Line representation: { start: Point, end: Point }
 */
export class LineUtil {

  //=========================================================
  // Line Creation
  //=========================================================

  /**
   * Creates a line from two points.
   * @param {Point|Object|Array} p1 - Start point
   * @param {Point|Object|Array} p2 - End point
   * @returns {{start: Point, end: Point}} Line object
   */
  static fromPoints(p1, p2) {
    return {
      start: new Point(GeomUtil.getX(p1), GeomUtil.getY(p1)),
      end: new Point(GeomUtil.getX(p2), GeomUtil.getY(p2))
    };
  }

  /**
   * Creates a vertical line at x from y1 to y2.
   * @param {number} x - X coordinate
   * @param {number} y1 - Start Y coordinate (default: -10)
   * @param {number} y2 - End Y coordinate (default: 10)
   * @returns {{start: Point, end: Point}} Line object
   */
  static vertical(x, y1 = -10, y2 = 10) {
    return {
      start: new Point(x, y1),
      end: new Point(x, y2)
    };
  }

  /**
   * Creates a horizontal line at y from x1 to x2.
   * @param {number} y - Y coordinate
   * @param {number} x1 - Start X coordinate (default: -10)
   * @param {number} x2 - End X coordinate (default: 10)
   * @returns {{start: Point, end: Point}} Line object
   */
  static horizontal(y, x1 = -10, x2 = 10) {
    return {
      start: new Point(x1, y),
      end: new Point(x2, y)
    };
  }

  /**
   * Creates a line from polar coordinates (length and angle from origin).
   * @param {number} length - Line length
   * @param {number} angleDeg - Angle in degrees from positive x-axis
   * @param {Point|Object|Array} origin - Starting point (default: origin)
   * @returns {{start: Point, end: Point}} Line object
   */
  static fromPolar(length, angleDeg, origin = { x: 0, y: 0 }) {
    const ox = GeomUtil.getX(origin);
    const oy = GeomUtil.getY(origin);
    const angleRad = GeomUtil.toRadians(angleDeg);
    return {
      start: new Point(ox, oy),
      end: new Point(
        ox + length * Math.cos(angleRad),
        oy + length * Math.sin(angleRad)
      )
    };
  }

  //=========================================================
  // Line Properties
  //=========================================================

  /**
   * Returns the length of a line segment.
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @returns {number} Length of the line
   */
  static getLength(lineStart, lineEnd) {
    return GeomUtil.getMagnitude(lineStart, lineEnd);
  }

  /**
   * Returns the angle of the line in radians [0, 2π).
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @returns {number} Angle in radians
   */
  static getAngle(lineStart, lineEnd) {
    return GeomUtil.getAngle(lineStart, lineEnd);
  }

  /**
   * Returns the unit direction vector of the line.
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @returns {Point} Unit vector
   */
  static getDirection(lineStart, lineEnd) {
    return GeomUtil.getUnitVector(lineStart, lineEnd);
  }

  /**
   * Returns the direction vector (not normalized) of the line.
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @returns {Point} Direction vector
   */
  static getVector(lineStart, lineEnd) {
    const x1 = GeomUtil.getX(lineStart);
    const y1 = GeomUtil.getY(lineStart);
    const x2 = GeomUtil.getX(lineEnd);
    const y2 = GeomUtil.getY(lineEnd);
    return new Point(x2 - x1, y2 - y1);
  }

  //=========================================================
  // Line Operations
  //=========================================================

  /**
   * Creates a perpendicular line through a point.
   * The perpendicular passes through the given point and is perpendicular
   * to the reference line.
   * @param {Point|Object|Array} lineStart - Reference line start
   * @param {Point|Object|Array} lineEnd - Reference line end
   * @param {Point|Object|Array} point - Point through which perpendicular passes
   * @param {number} length - Length of the perpendicular line (default: same as reference)
   * @returns {{start: Point, end: Point}} Perpendicular line
   */
  static perpendicularThrough(lineStart, lineEnd, point, length = null) {
    const dir = LineUtil.getDirection(lineStart, lineEnd);
    // Perpendicular direction: rotate 90 degrees (swap and negate y)
    const perpDir = new Point(-dir.y, dir.x);

    const px = GeomUtil.getX(point);
    const py = GeomUtil.getY(point);

    const lineLen = length !== null ? length : LineUtil.getLength(lineStart, lineEnd);
    const halfLen = lineLen / 2;

    return {
      start: new Point(px - perpDir.x * halfLen, py - perpDir.y * halfLen),
      end: new Point(px + perpDir.x * halfLen, py + perpDir.y * halfLen)
    };
  }

  /**
   * Creates a parallel line through a point.
   * @param {Point|Object|Array} lineStart - Reference line start
   * @param {Point|Object|Array} lineEnd - Reference line end
   * @param {Point|Object|Array} point - Point through which parallel passes
   * @param {number} length - Length of the parallel line (default: same as reference)
   * @returns {{start: Point, end: Point}} Parallel line
   */
  static parallelThrough(lineStart, lineEnd, point, length = null) {
    const dir = LineUtil.getDirection(lineStart, lineEnd);

    const px = GeomUtil.getX(point);
    const py = GeomUtil.getY(point);

    const lineLen = length !== null ? length : LineUtil.getLength(lineStart, lineEnd);
    const halfLen = lineLen / 2;

    return {
      start: new Point(px - dir.x * halfLen, py - dir.y * halfLen),
      end: new Point(px + dir.x * halfLen, py + dir.y * halfLen)
    };
  }

  /**
   * Extends a line by a proportion of its length.
   * proportion > 1: extends beyond end point
   * proportion < 0: extends beyond start point
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @param {number} proportion - Proportion to extend (1.5 = extend 50% beyond end)
   * @returns {{start: Point, end: Point}} Extended line
   */
  static extend(lineStart, lineEnd, proportion) {
    const x1 = GeomUtil.getX(lineStart);
    const y1 = GeomUtil.getY(lineStart);
    const x2 = GeomUtil.getX(lineEnd);
    const y2 = GeomUtil.getY(lineEnd);

    const dx = x2 - x1;
    const dy = y2 - y1;

    return {
      start: new Point(x1, y1),
      end: new Point(x1 + dx * proportion, y1 + dy * proportion)
    };
  }

  /**
   * Extends a line in both directions.
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @param {number} startProportion - How far to extend from start (negative = extend backward)
   * @param {number} endProportion - How far to extend from end (>1 = extend forward)
   * @returns {{start: Point, end: Point}} Extended line
   */
  static extendBoth(lineStart, lineEnd, startProportion, endProportion) {
    const x1 = GeomUtil.getX(lineStart);
    const y1 = GeomUtil.getY(lineStart);
    const x2 = GeomUtil.getX(lineEnd);
    const y2 = GeomUtil.getY(lineEnd);

    const dx = x2 - x1;
    const dy = y2 - y1;

    return {
      start: new Point(x1 + dx * startProportion, y1 + dy * startProportion),
      end: new Point(x1 + dx * endProportion, y1 + dy * endProportion)
    };
  }

  //=========================================================
  // Point Operations on Lines
  //=========================================================

  /**
   * Projects a point onto an infinite line (finds the foot of perpendicular).
   * @param {Point|Object|Array} point - Point to project
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @returns {Point} Projected point (foot of perpendicular)
   */
  static projectPoint(point, lineStart, lineEnd) {
    const px = GeomUtil.getX(point);
    const py = GeomUtil.getY(point);
    const x1 = GeomUtil.getX(lineStart);
    const y1 = GeomUtil.getY(lineStart);
    const x2 = GeomUtil.getX(lineEnd);
    const y2 = GeomUtil.getY(lineEnd);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq < 1e-10) {
      // Line is a point, return the line start
      return new Point(x1, y1);
    }

    // Parameter t for the projection point on the line
    // P = lineStart + t * (lineEnd - lineStart)
    const t = ((px - x1) * dx + (py - y1) * dy) / lenSq;

    return new Point(x1 + t * dx, y1 + t * dy);
  }

  /**
   * Reflects a point across an infinite line.
   * @param {Point|Object|Array} point - Point to reflect
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @returns {Point} Reflected point
   */
  static reflectPoint(point, lineStart, lineEnd) {
    const px = GeomUtil.getX(point);
    const py = GeomUtil.getY(point);

    // Get projection (foot of perpendicular)
    const proj = LineUtil.projectPoint(point, lineStart, lineEnd);

    // Reflected point is on the opposite side of the projection
    // reflected = projection + (projection - point) = 2 * projection - point
    return new Point(2 * proj.x - px, 2 * proj.y - py);
  }

  /**
   * Returns the perpendicular distance from a point to an infinite line.
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @param {Point|Object|Array} point - Point to measure distance from
   * @returns {number} Perpendicular distance
   */
  static distanceToPoint(lineStart, lineEnd, point) {
    const proj = LineUtil.projectPoint(point, lineStart, lineEnd);
    return GeomUtil.getMagnitude(point, proj);
  }

  /**
   * Checks if a point lies on a line segment (within tolerance).
   * @param {Point|Object|Array} point - Point to check
   * @param {Point|Object|Array} lineStart - Segment start
   * @param {Point|Object|Array} lineEnd - Segment end
   * @param {number} tolerance - Distance tolerance (default: 1e-8)
   * @returns {boolean} True if point is on segment
   */
  static isPointOnSegment(point, lineStart, lineEnd, tolerance = 1e-8) {
    const px = GeomUtil.getX(point);
    const py = GeomUtil.getY(point);
    const x1 = GeomUtil.getX(lineStart);
    const y1 = GeomUtil.getY(lineStart);
    const x2 = GeomUtil.getX(lineEnd);
    const y2 = GeomUtil.getY(lineEnd);

    // Check if point is within bounding box
    const minX = Math.min(x1, x2) - tolerance;
    const maxX = Math.max(x1, x2) + tolerance;
    const minY = Math.min(y1, y2) - tolerance;
    const maxY = Math.max(y1, y2) + tolerance;

    if (px < minX || px > maxX || py < minY || py > maxY) {
      return false;
    }

    // Check perpendicular distance to line
    const dist = LineUtil.distanceToPoint(lineStart, lineEnd, point);
    return dist <= tolerance;
  }

  /**
   * Returns the parameter t for a point's projection onto a line.
   * t=0 at lineStart, t=1 at lineEnd.
   * @param {Point|Object|Array} point - Point to project
   * @param {Point|Object|Array} lineStart - Line start
   * @param {Point|Object|Array} lineEnd - Line end
   * @returns {number} Parameter t
   */
  static getProjectionParameter(point, lineStart, lineEnd) {
    const px = GeomUtil.getX(point);
    const py = GeomUtil.getY(point);
    const x1 = GeomUtil.getX(lineStart);
    const y1 = GeomUtil.getY(lineStart);
    const x2 = GeomUtil.getX(lineEnd);
    const y2 = GeomUtil.getY(lineEnd);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq < 1e-10) {
      return 0;
    }

    return ((px - x1) * dx + (py - y1) * dy) / lenSq;
  }

  /**
   * Returns the midpoint of a line segment.
   * @param {Point|Object|Array} lineStart - Line start
   * @param {Point|Object|Array} lineEnd - Line end
   * @returns {Point} Midpoint
   */
  static getMidpoint(lineStart, lineEnd) {
    return GeomUtil.getMidpoint(lineStart, lineEnd);
  }

  /**
   * Checks if two lines are parallel (within tolerance).
   * @param {Point|Object|Array} line1Start - First line start
   * @param {Point|Object|Array} line1End - First line end
   * @param {Point|Object|Array} line2Start - Second line start
   * @param {Point|Object|Array} line2End - Second line end
   * @param {number} tolerance - Tolerance for comparison (default: 1e-8)
   * @returns {boolean} True if lines are parallel
   */
  static areParallel(line1Start, line1End, line2Start, line2End, tolerance = 1e-8) {
    const d1 = LineUtil.getVector(line1Start, line1End);
    const d2 = LineUtil.getVector(line2Start, line2End);

    // Cross product of direction vectors should be zero for parallel lines
    const cross = d1.x * d2.y - d1.y * d2.x;
    return Math.abs(cross) < tolerance;
  }

  /**
   * Checks if two lines are perpendicular (within tolerance).
   * @param {Point|Object|Array} line1Start - First line start
   * @param {Point|Object|Array} line1End - First line end
   * @param {Point|Object|Array} line2Start - Second line start
   * @param {Point|Object|Array} line2End - Second line end
   * @param {number} tolerance - Tolerance for comparison (default: 1e-8)
   * @returns {boolean} True if lines are perpendicular
   */
  static arePerpendicular(line1Start, line1End, line2Start, line2End, tolerance = 1e-8) {
    const d1 = LineUtil.getVector(line1Start, line1End);
    const d2 = LineUtil.getVector(line2Start, line2End);

    // Dot product of direction vectors should be zero for perpendicular lines
    const dot = d1.x * d2.x + d1.y * d2.y;
    return Math.abs(dot) < tolerance;
  }
}
