import { Point } from './Point.js';
import { GeomUtil } from './GeomUtil.js';

/**
 * AngleUtil - Static utility class for angle operations.
 *
 * Provides utilities for computing angles from various inputs
 * (two lines, three points, etc.)
 */
export class AngleUtil {

  /**
   * Finds the intersection point of two lines (infinite lines, not segments).
   * Returns null if lines are parallel.
   *
   * @param {Object} line1 - First line {start: {x,y}, end: {x,y}}
   * @param {Object} line2 - Second line {start: {x,y}, end: {x,y}}
   * @param {number} tolerance - Tolerance for parallel check (default: 1e-10)
   * @returns {Point|null} Intersection point or null if parallel
   */
  static lineIntersection(line1, line2, tolerance = 1e-10) {
    const x1 = line1.start.x;
    const y1 = line1.start.y;
    const x2 = line1.end.x;
    const y2 = line1.end.y;

    const x3 = line2.start.x;
    const y3 = line2.start.y;
    const x4 = line2.end.x;
    const y4 = line2.end.y;

    // Direction vectors
    const d1x = x2 - x1;
    const d1y = y2 - y1;
    const d2x = x4 - x3;
    const d2y = y4 - y3;

    // Cross product of direction vectors (determinant)
    const denom = d1x * d2y - d1y * d2x;

    // If denominator is zero, lines are parallel
    if (Math.abs(denom) < tolerance) {
      return null;
    }

    // Solve for t parameter on line1
    const t = ((x3 - x1) * d2y - (y3 - y1) * d2x) / denom;

    // Calculate intersection point
    return new Point(x1 + t * d1x, y1 + t * d1y);
  }

  /**
   * Computes angle data from two lines.
   * Returns vertex (intersection point) and two points (one from each line).
   *
   * The points are chosen as the endpoints that are furthest from the intersection,
   * giving a consistent angle representation.
   *
   * @param {Object} line1 - First line {start: {x,y}, end: {x,y}} or [x1,y1,x2,y2]
   * @param {Object} line2 - Second line {start: {x,y}, end: {x,y}} or [x1,y1,x2,y2]
   * @returns {{vertex: Point, point1: Point, point2: Point}|null} Angle data or null if parallel
   */
  static fromTwoLines(line1, line2) {
    // Normalize input to {start, end} format
    const l1 = AngleUtil._normalizeLine(line1);
    const l2 = AngleUtil._normalizeLine(line2);

    // Find intersection (vertex)
    const vertex = AngleUtil.lineIntersection(l1, l2);

    if (!vertex) {
      // Lines are parallel, no angle
      return null;
    }

    // Choose point1 from line1: the endpoint furthest from vertex
    const point1 = AngleUtil._getFurthestEndpoint(l1, vertex);

    // Choose point2 from line2: the endpoint furthest from vertex
    const point2 = AngleUtil._getFurthestEndpoint(l2, vertex);

    return { vertex, point1, point2 };
  }

  /**
   * Normalizes line input to {start, end} format.
   * Accepts either {start, end} object or array [x1, y1, x2, y2].
   *
   * @param {Object|Array} line - Line in either format
   * @returns {{start: {x,y}, end: {x,y}}} Normalized line
   */
  static _normalizeLine(line) {
    if (Array.isArray(line)) {
      return {
        start: { x: line[0], y: line[1] },
        end: { x: line[2], y: line[3] }
      };
    }
    return line;
  }

  /**
   * Returns the endpoint of a line that is furthest from a given point.
   *
   * @param {Object} line - Line {start, end}
   * @param {Point} point - Reference point
   * @returns {Point} The furthest endpoint
   */
  static _getFurthestEndpoint(line, point) {
    const distToStart = GeomUtil.getMagnitude(line.start, point);
    const distToEnd = GeomUtil.getMagnitude(line.end, point);

    if (distToStart >= distToEnd) {
      return new Point(line.start.x, line.start.y);
    } else {
      return new Point(line.end.x, line.end.y);
    }
  }

  /**
   * Computes the angle in degrees between two vectors from a common vertex.
   *
   * @param {Object} vertex - Vertex point {x, y}
   * @param {Object} point1 - First ray endpoint {x, y}
   * @param {Object} point2 - Second ray endpoint {x, y}
   * @returns {number} Angle in degrees [0, 180]
   */
  static angleBetweenPoints(vertex, point1, point2) {
    const v1x = point1.x - vertex.x;
    const v1y = point1.y - vertex.y;
    const v2x = point2.x - vertex.x;
    const v2y = point2.y - vertex.y;

    // Dot product
    const dot = v1x * v2x + v1y * v2y;

    // Magnitudes
    const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

    if (mag1 < 1e-10 || mag2 < 1e-10) {
      return 0;
    }

    // Clamp to avoid floating point issues with acos
    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));

    return GeomUtil.toDegrees(Math.acos(cosAngle));
  }
}
