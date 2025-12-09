import { Point } from './Point.js';
import { GeomUtil } from './GeomUtil.js';

/**
 * VectorUtil - Static utility class for vector operations.
 * Ported from Python Manim add-ons (vector_utils.py).
 *
 * These utilities work with vectors represented as two points (start and end)
 * or as Point/Vector2 objects representing direction.
 *
 * Note: Vector2 class already provides most vector operations.
 * This class provides additional utilities for positioned vectors
 * (vectors with specific start/end points rather than just direction).
 */
export class VectorUtil {

  //=========================================================
  // Vector Properties
  //=========================================================

  /**
   * Gets the direction vector from start to end.
   * @param {Point|Object|Array} start - Vector start point
   * @param {Point|Object|Array} end - Vector end point
   * @returns {Point} Direction vector (not normalized)
   */
  static getVector(start, end) {
    const sx = GeomUtil.getX(start);
    const sy = GeomUtil.getY(start);
    const ex = GeomUtil.getX(end);
    const ey = GeomUtil.getY(end);
    return new Point(ex - sx, ey - sy);
  }

  /**
   * Gets the unit direction vector from start to end.
   * @param {Point|Object|Array} start - Vector start point
   * @param {Point|Object|Array} end - Vector end point
   * @returns {Point} Unit direction vector
   */
  static getUnitVector(start, end) {
    return GeomUtil.getUnitVector(start, end);
  }

  /**
   * Gets the magnitude (length) of a vector.
   * @param {Point|Object|Array} start - Vector start point
   * @param {Point|Object|Array} end - Vector end point
   * @returns {number} Vector magnitude
   */
  static getMagnitude(start, end) {
    return GeomUtil.getMagnitude(start, end);
  }

  /**
   * Gets the angle of a vector in radians.
   * @param {Point|Object|Array} start - Vector start point
   * @param {Point|Object|Array} end - Vector end point
   * @returns {number} Angle in radians [0, 2π)
   */
  static getAngle(start, end) {
    return GeomUtil.getAngle(start, end);
  }

  //=========================================================
  // Vector Projection
  //=========================================================

  /**
   * Projects one vector onto another.
   * Returns the projection of vectorA onto vectorB.
   * @param {Point|Object|Array} aStart - First vector start
   * @param {Point|Object|Array} aEnd - First vector end
   * @param {Point|Object|Array} bStart - Target vector start
   * @param {Point|Object|Array} bEnd - Target vector end
   * @returns {{start: Point, end: Point, magnitude: number}} Projected vector and its magnitude
   */
  static projectOnto(aStart, aEnd, bStart, bEnd) {
    // Get direction vectors
    const a = VectorUtil.getVector(aStart, aEnd);
    const b = VectorUtil.getVector(bStart, bEnd);

    // Magnitude of b squared
    const bMagSq = b.x * b.x + b.y * b.y;

    if (bMagSq < 1e-20) {
      // Target vector is zero-length
      return {
        start: new Point(GeomUtil.getX(bStart), GeomUtil.getY(bStart)),
        end: new Point(GeomUtil.getX(bStart), GeomUtil.getY(bStart)),
        magnitude: 0
      };
    }

    // Dot product
    const dot = a.x * b.x + a.y * b.y;

    // Scalar projection
    const scalar = dot / bMagSq;

    // Vector projection
    const projX = scalar * b.x;
    const projY = scalar * b.y;

    const bsx = GeomUtil.getX(bStart);
    const bsy = GeomUtil.getY(bStart);

    return {
      start: new Point(bsx, bsy),
      end: new Point(bsx + projX, bsy + projY),
      magnitude: Math.sqrt(projX * projX + projY * projY) * Math.sign(scalar)
    };
  }

  /**
   * Decomposes a vector into parallel and perpendicular components
   * relative to a target vector.
   * @param {Point|Object|Array} aStart - Vector to decompose start
   * @param {Point|Object|Array} aEnd - Vector to decompose end
   * @param {Point|Object|Array} bStart - Reference vector start
   * @param {Point|Object|Array} bEnd - Reference vector end
   * @returns {{parallel: {start: Point, end: Point}, perpendicular: {start: Point, end: Point}}}
   */
  static decompose(aStart, aEnd, bStart, bEnd) {
    const a = VectorUtil.getVector(aStart, aEnd);
    const b = VectorUtil.getVector(bStart, bEnd);

    const bMagSq = b.x * b.x + b.y * b.y;
    const bsx = GeomUtil.getX(bStart);
    const bsy = GeomUtil.getY(bStart);

    if (bMagSq < 1e-20) {
      // Reference vector is zero-length, return original as perpendicular
      return {
        parallel: {
          start: new Point(bsx, bsy),
          end: new Point(bsx, bsy)
        },
        perpendicular: {
          start: new Point(bsx, bsy),
          end: new Point(bsx + a.x, bsy + a.y)
        }
      };
    }

    // Parallel component (projection)
    const dot = a.x * b.x + a.y * b.y;
    const scalar = dot / bMagSq;
    const parallelX = scalar * b.x;
    const parallelY = scalar * b.y;

    // Perpendicular component = original - parallel
    const perpX = a.x - parallelX;
    const perpY = a.y - parallelY;

    return {
      parallel: {
        start: new Point(bsx, bsy),
        end: new Point(bsx + parallelX, bsy + parallelY)
      },
      perpendicular: {
        start: new Point(bsx + parallelX, bsy + parallelY),
        end: new Point(bsx + parallelX + perpX, bsy + parallelY + perpY)
      }
    };
  }

  //=========================================================
  // Vector Translation/Movement
  //=========================================================

  /**
   * Shifts a vector forward (in its direction) by a distance.
   * @param {Point|Object|Array} start - Vector start point
   * @param {Point|Object|Array} end - Vector end point
   * @param {number} distance - Distance to shift
   * @returns {{start: Point, end: Point}} Shifted vector
   */
  static shiftForward(start, end, distance) {
    const dir = VectorUtil.getUnitVector(start, end);

    const sx = GeomUtil.getX(start);
    const sy = GeomUtil.getY(start);
    const ex = GeomUtil.getX(end);
    const ey = GeomUtil.getY(end);

    return {
      start: new Point(sx + dir.x * distance, sy + dir.y * distance),
      end: new Point(ex + dir.x * distance, ey + dir.y * distance)
    };
  }

  /**
   * Shifts a vector backward (opposite to its direction) by a distance.
   * @param {Point|Object|Array} start - Vector start point
   * @param {Point|Object|Array} end - Vector end point
   * @param {number} distance - Distance to shift
   * @returns {{start: Point, end: Point}} Shifted vector
   */
  static shiftBackward(start, end, distance) {
    return VectorUtil.shiftForward(start, end, -distance);
  }

  /**
   * Shifts a vector perpendicular to its direction.
   * Positive distance shifts to the left (CCW), negative to the right (CW).
   * @param {Point|Object|Array} start - Vector start point
   * @param {Point|Object|Array} end - Vector end point
   * @param {number} distance - Distance to shift (positive = left, negative = right)
   * @returns {{start: Point, end: Point}} Shifted vector
   */
  static shiftPerpendicular(start, end, distance) {
    const dir = VectorUtil.getUnitVector(start, end);

    // Perpendicular direction (rotate 90 degrees CCW)
    const perpX = -dir.y;
    const perpY = dir.x;

    const sx = GeomUtil.getX(start);
    const sy = GeomUtil.getY(start);
    const ex = GeomUtil.getX(end);
    const ey = GeomUtil.getY(end);

    return {
      start: new Point(sx + perpX * distance, sy + perpY * distance),
      end: new Point(ex + perpX * distance, ey + perpY * distance)
    };
  }

  /**
   * Copies a vector to a new starting point, preserving direction and length.
   * @param {Point|Object|Array} start - Original vector start
   * @param {Point|Object|Array} end - Original vector end
   * @param {Point|Object|Array} newStart - New starting point
   * @returns {{start: Point, end: Point}} Copied vector at new position
   */
  static copyAt(start, end, newStart) {
    const dir = VectorUtil.getVector(start, end);
    const nsx = GeomUtil.getX(newStart);
    const nsy = GeomUtil.getY(newStart);

    return {
      start: new Point(nsx, nsy),
      end: new Point(nsx + dir.x, nsy + dir.y)
    };
  }

  /**
   * Creates a reversed vector at a new starting point.
   * @param {Point|Object|Array} start - Original vector start
   * @param {Point|Object|Array} end - Original vector end
   * @param {Point|Object|Array} newStart - New starting point
   * @returns {{start: Point, end: Point}} Reversed vector at new position
   */
  static reverseAt(start, end, newStart) {
    const dir = VectorUtil.getVector(start, end);
    const nsx = GeomUtil.getX(newStart);
    const nsy = GeomUtil.getY(newStart);

    return {
      start: new Point(nsx, nsy),
      end: new Point(nsx - dir.x, nsy - dir.y)
    };
  }

  /**
   * Positions vectorB so its tail is at vectorA's tip (tail-to-tip).
   * @param {Point|Object|Array} aStart - First vector start
   * @param {Point|Object|Array} aEnd - First vector end (tip)
   * @param {Point|Object|Array} bStart - Second vector start
   * @param {Point|Object|Array} bEnd - Second vector end
   * @returns {{start: Point, end: Point}} Second vector repositioned
   */
  static tailAtTip(aStart, aEnd, bStart, bEnd) {
    return VectorUtil.copyAt(bStart, bEnd, aEnd);
  }

  //=========================================================
  // Vector Arithmetic (with positioned vectors)
  //=========================================================

  /**
   * Adds two vectors, returning result vector starting from a given point.
   * @param {Point|Object|Array} aStart - First vector start
   * @param {Point|Object|Array} aEnd - First vector end
   * @param {Point|Object|Array} bStart - Second vector start
   * @param {Point|Object|Array} bEnd - Second vector end
   * @param {Point|Object|Array} resultStart - Starting point for result vector (default: aStart)
   * @returns {{start: Point, end: Point}} Resultant vector
   */
  static addVectors(aStart, aEnd, bStart, bEnd, resultStart = null) {
    const a = VectorUtil.getVector(aStart, aEnd);
    const b = VectorUtil.getVector(bStart, bEnd);

    const rsx = resultStart !== null ? GeomUtil.getX(resultStart) : GeomUtil.getX(aStart);
    const rsy = resultStart !== null ? GeomUtil.getY(resultStart) : GeomUtil.getY(aStart);

    return {
      start: new Point(rsx, rsy),
      end: new Point(rsx + a.x + b.x, rsy + a.y + b.y)
    };
  }

  /**
   * Subtracts second vector from first, returning result vector.
   * @param {Point|Object|Array} aStart - First vector start
   * @param {Point|Object|Array} aEnd - First vector end
   * @param {Point|Object|Array} bStart - Second vector start
   * @param {Point|Object|Array} bEnd - Second vector end
   * @param {Point|Object|Array} resultStart - Starting point for result vector (default: aStart)
   * @returns {{start: Point, end: Point}} Resultant vector (A - B)
   */
  static subtractVectors(aStart, aEnd, bStart, bEnd, resultStart = null) {
    const a = VectorUtil.getVector(aStart, aEnd);
    const b = VectorUtil.getVector(bStart, bEnd);

    const rsx = resultStart !== null ? GeomUtil.getX(resultStart) : GeomUtil.getX(aStart);
    const rsy = resultStart !== null ? GeomUtil.getY(resultStart) : GeomUtil.getY(aStart);

    return {
      start: new Point(rsx, rsy),
      end: new Point(rsx + a.x - b.x, rsy + a.y - b.y)
    };
  }

  /**
   * Multiplies a vector by a scalar.
   * @param {Point|Object|Array} start - Vector start point
   * @param {Point|Object|Array} end - Vector end point
   * @param {number} scalar - Scalar multiplier
   * @param {Point|Object|Array} resultStart - Starting point for result (default: start)
   * @returns {{start: Point, end: Point}} Scaled vector
   */
  static scalarMultiply(start, end, scalar, resultStart = null) {
    const v = VectorUtil.getVector(start, end);

    const rsx = resultStart !== null ? GeomUtil.getX(resultStart) : GeomUtil.getX(start);
    const rsy = resultStart !== null ? GeomUtil.getY(resultStart) : GeomUtil.getY(start);

    return {
      start: new Point(rsx, rsy),
      end: new Point(rsx + v.x * scalar, rsy + v.y * scalar)
    };
  }

  //=========================================================
  // Vector Calculations
  //=========================================================

  /**
   * Calculates the dot product of two vectors.
   * @param {Point|Object|Array} aStart - First vector start
   * @param {Point|Object|Array} aEnd - First vector end
   * @param {Point|Object|Array} bStart - Second vector start
   * @param {Point|Object|Array} bEnd - Second vector end
   * @returns {number} Dot product
   */
  static dotProduct(aStart, aEnd, bStart, bEnd) {
    const a = VectorUtil.getVector(aStart, aEnd);
    const b = VectorUtil.getVector(bStart, bEnd);
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Calculates the cross product (scalar) of two vectors.
   * In 2D, this returns the z-component of the 3D cross product.
   * @param {Point|Object|Array} aStart - First vector start
   * @param {Point|Object|Array} aEnd - First vector end
   * @param {Point|Object|Array} bStart - Second vector start
   * @param {Point|Object|Array} bEnd - Second vector end
   * @returns {number} Cross product (scalar, positive = CCW, negative = CW)
   */
  static crossProduct(aStart, aEnd, bStart, bEnd) {
    const a = VectorUtil.getVector(aStart, aEnd);
    const b = VectorUtil.getVector(bStart, bEnd);
    return a.x * b.y - a.y * b.x;
  }

  /**
   * Calculates the angle between two vectors.
   * @param {Point|Object|Array} aStart - First vector start
   * @param {Point|Object|Array} aEnd - First vector end
   * @param {Point|Object|Array} bStart - Second vector start
   * @param {Point|Object|Array} bEnd - Second vector end
   * @returns {number} Angle between vectors in radians [0, π]
   */
  static angleBetween(aStart, aEnd, bStart, bEnd) {
    const a = VectorUtil.getVector(aStart, aEnd);
    const b = VectorUtil.getVector(bStart, bEnd);

    const aMag = Math.sqrt(a.x * a.x + a.y * a.y);
    const bMag = Math.sqrt(b.x * b.x + b.y * b.y);

    if (aMag < 1e-10 || bMag < 1e-10) {
      return 0;
    }

    const dot = a.x * b.x + a.y * b.y;
    const cosAngle = GeomUtil.clamp(dot / (aMag * bMag), -1, 1);

    return Math.acos(cosAngle);
  }

  /**
   * Calculates the signed angle from vector A to vector B.
   * Positive = CCW rotation, Negative = CW rotation.
   * @param {Point|Object|Array} aStart - First vector start
   * @param {Point|Object|Array} aEnd - First vector end
   * @param {Point|Object|Array} bStart - Second vector start
   * @param {Point|Object|Array} bEnd - Second vector end
   * @returns {number} Signed angle in radians [-π, π]
   */
  static signedAngleBetween(aStart, aEnd, bStart, bEnd) {
    const a = VectorUtil.getVector(aStart, aEnd);
    const b = VectorUtil.getVector(bStart, bEnd);

    return Math.atan2(
      a.x * b.y - a.y * b.x, // cross product
      a.x * b.x + a.y * b.y  // dot product
    );
  }

  /**
   * Checks if two vectors are parallel (within tolerance).
   * @param {Point|Object|Array} aStart - First vector start
   * @param {Point|Object|Array} aEnd - First vector end
   * @param {Point|Object|Array} bStart - Second vector start
   * @param {Point|Object|Array} bEnd - Second vector end
   * @param {number} tolerance - Tolerance (default: 1e-8)
   * @returns {boolean} True if vectors are parallel
   */
  static areParallel(aStart, aEnd, bStart, bEnd, tolerance = 1e-8) {
    const cross = VectorUtil.crossProduct(aStart, aEnd, bStart, bEnd);
    return Math.abs(cross) < tolerance;
  }

  /**
   * Checks if two vectors are perpendicular (within tolerance).
   * @param {Point|Object|Array} aStart - First vector start
   * @param {Point|Object|Array} aEnd - First vector end
   * @param {Point|Object|Array} bStart - Second vector start
   * @param {Point|Object|Array} bEnd - Second vector end
   * @param {number} tolerance - Tolerance (default: 1e-8)
   * @returns {boolean} True if vectors are perpendicular
   */
  static arePerpendicular(aStart, aEnd, bStart, bEnd, tolerance = 1e-8) {
    const dot = VectorUtil.dotProduct(aStart, aEnd, bStart, bEnd);
    return Math.abs(dot) < tolerance;
  }
}
