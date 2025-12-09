import { Point } from './Point.js';
import { GeomUtil } from './GeomUtil.js';

/**
 * IntersectionUtil - Static utility class for geometric intersection calculations.
 * Ported from Python Manim add-ons (intersection_utils.py).
 *
 * All methods work with Point objects or any point-like input
 * (objects with x,y properties or [x,y] arrays).
 */
export class IntersectionUtil {

  //=========================================================
  // Line-Line Intersection
  //=========================================================

  /**
   * Finds the intersection point of two infinite lines.
   * Returns null if lines are parallel.
   * @param {Point|Object|Array} line1Start - First line start
   * @param {Point|Object|Array} line1End - First line end
   * @param {Point|Object|Array} line2Start - Second line start
   * @param {Point|Object|Array} line2End - Second line end
   * @returns {Point|null} Intersection point or null if parallel
   */
  static lineLineIntersection(line1Start, line1End, line2Start, line2End) {
    const x1 = GeomUtil.getX(line1Start);
    const y1 = GeomUtil.getY(line1Start);
    const x2 = GeomUtil.getX(line1End);
    const y2 = GeomUtil.getY(line1End);
    const x3 = GeomUtil.getX(line2Start);
    const y3 = GeomUtil.getY(line2Start);
    const x4 = GeomUtil.getX(line2End);
    const y4 = GeomUtil.getY(line2End);

    // Direction vectors
    const d1x = x2 - x1;
    const d1y = y2 - y1;
    const d2x = x4 - x3;
    const d2y = y4 - y3;

    // Cross product of directions (denominator)
    const cross = d1x * d2y - d1y * d2x;

    // Check if lines are parallel
    if (Math.abs(cross) < 1e-10) {
      return null;
    }

    // Calculate parameter t for line 1
    // P = line1Start + t * (line1End - line1Start)
    const t = ((x3 - x1) * d2y - (y3 - y1) * d2x) / cross;

    return new Point(x1 + t * d1x, y1 + t * d1y);
  }

  /**
   * Finds the intersection point of two line segments.
   * Returns null if segments don't intersect.
   * @param {Point|Object|Array} seg1Start - First segment start
   * @param {Point|Object|Array} seg1End - First segment end
   * @param {Point|Object|Array} seg2Start - Second segment start
   * @param {Point|Object|Array} seg2End - Second segment end
   * @returns {Point|null} Intersection point or null if no intersection
   */
  static segmentSegmentIntersection(seg1Start, seg1End, seg2Start, seg2End) {
    const x1 = GeomUtil.getX(seg1Start);
    const y1 = GeomUtil.getY(seg1Start);
    const x2 = GeomUtil.getX(seg1End);
    const y2 = GeomUtil.getY(seg1End);
    const x3 = GeomUtil.getX(seg2Start);
    const y3 = GeomUtil.getY(seg2Start);
    const x4 = GeomUtil.getX(seg2End);
    const y4 = GeomUtil.getY(seg2End);

    // Direction vectors
    const d1x = x2 - x1;
    const d1y = y2 - y1;
    const d2x = x4 - x3;
    const d2y = y4 - y3;

    // Cross product of directions (denominator)
    const cross = d1x * d2y - d1y * d2x;

    // Check if lines are parallel
    if (Math.abs(cross) < 1e-10) {
      return null;
    }

    // Calculate parameters t and u
    const t = ((x3 - x1) * d2y - (y3 - y1) * d2x) / cross;
    const u = ((x3 - x1) * d1y - (y3 - y1) * d1x) / cross;

    // Check if intersection is within both segments
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return new Point(x1 + t * d1x, y1 + t * d1y);
    }

    return null;
  }

  //=========================================================
  // Line-Circle Intersection
  //=========================================================

  /**
   * Finds intersection points of an infinite line with a circle.
   * Returns an array with 0, 1, or 2 points.
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @param {Point|Object|Array} center - Circle center
   * @param {number} radius - Circle radius
   * @returns {Point[]} Array of intersection points (0-2 points)
   */
  static lineCircleIntersection(lineStart, lineEnd, center, radius) {
    const x1 = GeomUtil.getX(lineStart);
    const y1 = GeomUtil.getY(lineStart);
    const x2 = GeomUtil.getX(lineEnd);
    const y2 = GeomUtil.getY(lineEnd);
    const cx = GeomUtil.getX(center);
    const cy = GeomUtil.getY(center);

    // Direction vector
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Translate so circle is at origin
    const fx = x1 - cx;
    const fy = y1 - cy;

    // Quadratic equation coefficients: at^2 + bt + c = 0
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - radius * radius;

    const discriminant = b * b - 4 * a * c;

    if (discriminant < -1e-10) {
      // No intersection
      return [];
    }

    if (discriminant < 1e-10) {
      // Tangent (one intersection)
      const t = -b / (2 * a);
      return [new Point(x1 + t * dx, y1 + t * dy)];
    }

    // Two intersections
    const sqrtDisc = Math.sqrt(discriminant);
    const t1 = (-b - sqrtDisc) / (2 * a);
    const t2 = (-b + sqrtDisc) / (2 * a);

    return [
      new Point(x1 + t1 * dx, y1 + t1 * dy),
      new Point(x1 + t2 * dx, y1 + t2 * dy)
    ];
  }

  /**
   * Finds intersection points of a line segment with a circle.
   * Only returns points that lie on the segment.
   * @param {Point|Object|Array} segStart - Segment start point
   * @param {Point|Object|Array} segEnd - Segment end point
   * @param {Point|Object|Array} center - Circle center
   * @param {number} radius - Circle radius
   * @returns {Point[]} Array of intersection points (0-2 points)
   */
  static segmentCircleIntersection(segStart, segEnd, center, radius) {
    const x1 = GeomUtil.getX(segStart);
    const y1 = GeomUtil.getY(segStart);
    const x2 = GeomUtil.getX(segEnd);
    const y2 = GeomUtil.getY(segEnd);
    const cx = GeomUtil.getX(center);
    const cy = GeomUtil.getY(center);

    // Direction vector
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Translate so circle is at origin
    const fx = x1 - cx;
    const fy = y1 - cy;

    // Quadratic equation coefficients
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - radius * radius;

    const discriminant = b * b - 4 * a * c;

    if (discriminant < -1e-10) {
      return [];
    }

    const results = [];

    if (discriminant < 1e-10) {
      const t = -b / (2 * a);
      if (t >= 0 && t <= 1) {
        results.push(new Point(x1 + t * dx, y1 + t * dy));
      }
    } else {
      const sqrtDisc = Math.sqrt(discriminant);
      const t1 = (-b - sqrtDisc) / (2 * a);
      const t2 = (-b + sqrtDisc) / (2 * a);

      if (t1 >= 0 && t1 <= 1) {
        results.push(new Point(x1 + t1 * dx, y1 + t1 * dy));
      }
      if (t2 >= 0 && t2 <= 1) {
        results.push(new Point(x1 + t2 * dx, y1 + t2 * dy));
      }
    }

    return results;
  }

  //=========================================================
  // Circle-Circle Intersection
  //=========================================================

  /**
   * Finds intersection points of two circles.
   * Returns an array with 0, 1, or 2 points.
   * @param {Point|Object|Array} center1 - First circle center
   * @param {number} radius1 - First circle radius
   * @param {Point|Object|Array} center2 - Second circle center
   * @param {number} radius2 - Second circle radius
   * @returns {Point[]} Array of intersection points (0-2 points)
   */
  static circleCircleIntersection(center1, radius1, center2, radius2) {
    const x1 = GeomUtil.getX(center1);
    const y1 = GeomUtil.getY(center1);
    const x2 = GeomUtil.getX(center2);
    const y2 = GeomUtil.getY(center2);
    const r1 = Math.abs(radius1);
    const r2 = Math.abs(radius2);

    // Distance between centers
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx * dx + dy * dy);

    // Check for special cases
    if (d < 1e-10) {
      // Circles are concentric
      if (Math.abs(r1 - r2) < 1e-10) {
        // Same circle (infinite intersections, return empty)
        return [];
      }
      // Concentric, different radii - no intersection
      return [];
    }

    // Check if circles are too far apart or one is inside the other
    if (d > r1 + r2 + 1e-10) {
      // Circles are separated
      return [];
    }

    if (d < Math.abs(r1 - r2) - 1e-10) {
      // One circle is inside the other
      return [];
    }

    // Check for external tangent (one point)
    if (Math.abs(d - (r1 + r2)) < 1e-10) {
      // Externally tangent
      const t = r1 / d;
      return [new Point(x1 + t * dx, y1 + t * dy)];
    }

    // Check for internal tangent (one point)
    if (Math.abs(d - Math.abs(r1 - r2)) < 1e-10) {
      // Internally tangent
      const t = r1 / d;
      if (r1 > r2) {
        return [new Point(x1 + t * dx, y1 + t * dy)];
      } else {
        return [new Point(x1 - t * dx, y1 - t * dy)];
      }
    }

    // Two intersection points
    // Using law of cosines to find the angle at center1
    // cos(alpha) = (r1^2 + d^2 - r2^2) / (2 * r1 * d)
    const cosAlpha = (r1 * r1 + d * d - r2 * r2) / (2 * r1 * d);
    const alpha = Math.acos(GeomUtil.clamp(cosAlpha, -1, 1));

    // Angle from center1 to center2
    const baseAngle = Math.atan2(dy, dx);

    // Two intersection points at baseAngle +/- alpha
    const angle1 = baseAngle + alpha;
    const angle2 = baseAngle - alpha;

    return [
      new Point(x1 + r1 * Math.cos(angle1), y1 + r1 * Math.sin(angle1)),
      new Point(x1 + r1 * Math.cos(angle2), y1 + r1 * Math.sin(angle2))
    ];
  }

  //=========================================================
  // Line-Polygon Intersection
  //=========================================================

  /**
   * Finds intersection points of an infinite line with a polygon.
   * @param {Point|Object|Array} lineStart - Line start point
   * @param {Point|Object|Array} lineEnd - Line end point
   * @param {Array<Point|Object|Array>} polygonPoints - Array of polygon vertices (in order)
   * @returns {Point[]} Array of intersection points
   */
  static linePolygonIntersection(lineStart, lineEnd, polygonPoints) {
    const results = [];
    const n = polygonPoints.length;

    for (let i = 0; i < n; i++) {
      const edgeStart = polygonPoints[i];
      const edgeEnd = polygonPoints[(i + 1) % n];

      // Find intersection of line with this edge (as segment)
      const intersection = IntersectionUtil.lineSegmentIntersection(
        lineStart, lineEnd, edgeStart, edgeEnd
      );

      if (intersection !== null) {
        // Check if this point is already in results (avoid duplicates at vertices)
        const isDuplicate = results.some(p =>
          Math.abs(p.x - intersection.x) < 1e-8 &&
          Math.abs(p.y - intersection.y) < 1e-8
        );
        if (!isDuplicate) {
          results.push(intersection);
        }
      }
    }

    return results;
  }

  /**
   * Finds intersection point of an infinite line with a line segment.
   * @param {Point|Object|Array} lineStart - Infinite line start point
   * @param {Point|Object|Array} lineEnd - Infinite line end point
   * @param {Point|Object|Array} segStart - Segment start point
   * @param {Point|Object|Array} segEnd - Segment end point
   * @returns {Point|null} Intersection point or null if no intersection
   */
  static lineSegmentIntersection(lineStart, lineEnd, segStart, segEnd) {
    const x1 = GeomUtil.getX(lineStart);
    const y1 = GeomUtil.getY(lineStart);
    const x2 = GeomUtil.getX(lineEnd);
    const y2 = GeomUtil.getY(lineEnd);
    const x3 = GeomUtil.getX(segStart);
    const y3 = GeomUtil.getY(segStart);
    const x4 = GeomUtil.getX(segEnd);
    const y4 = GeomUtil.getY(segEnd);

    // Direction vectors
    const d1x = x2 - x1;
    const d1y = y2 - y1;
    const d2x = x4 - x3;
    const d2y = y4 - y3;

    // Cross product of directions
    const cross = d1x * d2y - d1y * d2x;

    if (Math.abs(cross) < 1e-10) {
      // Lines are parallel
      return null;
    }

    // Calculate parameter u for the segment
    const u = ((x1 - x3) * d1y - (y1 - y3) * d1x) / (-cross);

    // Check if intersection is within segment
    if (u >= 0 && u <= 1) {
      return new Point(x3 + u * d2x, y3 + u * d2y);
    }

    return null;
  }

  //=========================================================
  // Helper Methods
  //=========================================================

  /**
   * Checks if a point lies on a line segment (within tolerance).
   * @param {Point|Object|Array} point - Point to check
   * @param {Point|Object|Array} segStart - Segment start
   * @param {Point|Object|Array} segEnd - Segment end
   * @param {number} tolerance - Distance tolerance (default: 1e-8)
   * @returns {boolean} True if point is on segment
   */
  static isPointOnSegment(point, segStart, segEnd, tolerance = 1e-8) {
    const px = GeomUtil.getX(point);
    const py = GeomUtil.getY(point);
    const x1 = GeomUtil.getX(segStart);
    const y1 = GeomUtil.getY(segStart);
    const x2 = GeomUtil.getX(segEnd);
    const y2 = GeomUtil.getY(segEnd);

    // Check bounding box
    const minX = Math.min(x1, x2) - tolerance;
    const maxX = Math.max(x1, x2) + tolerance;
    const minY = Math.min(y1, y2) - tolerance;
    const maxY = Math.max(y1, y2) + tolerance;

    if (px < minX || px > maxX || py < minY || py > maxY) {
      return false;
    }

    // Calculate perpendicular distance to line
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq < 1e-20) {
      // Segment is a point
      return GeomUtil.getMagnitude(point, segStart) <= tolerance;
    }

    // Distance from point to infinite line
    const dist = Math.abs((py - y1) * dx - (px - x1) * dy) / Math.sqrt(lenSq);

    return dist <= tolerance;
  }

  /**
   * Checks if two lines are parallel (within tolerance).
   * @param {Point|Object|Array} line1Start - First line start
   * @param {Point|Object|Array} line1End - First line end
   * @param {Point|Object|Array} line2Start - Second line start
   * @param {Point|Object|Array} line2End - Second line end
   * @param {number} tolerance - Tolerance (default: 1e-8)
   * @returns {boolean} True if lines are parallel
   */
  static areParallel(line1Start, line1End, line2Start, line2End, tolerance = 1e-8) {
    const d1x = GeomUtil.getX(line1End) - GeomUtil.getX(line1Start);
    const d1y = GeomUtil.getY(line1End) - GeomUtil.getY(line1Start);
    const d2x = GeomUtil.getX(line2End) - GeomUtil.getX(line2Start);
    const d2y = GeomUtil.getY(line2End) - GeomUtil.getY(line2Start);

    const cross = d1x * d2y - d1y * d2x;
    return Math.abs(cross) < tolerance;
  }

  /**
   * Finds the closest point on a line segment to a given point.
   * @param {Point|Object|Array} point - Reference point
   * @param {Point|Object|Array} segStart - Segment start
   * @param {Point|Object|Array} segEnd - Segment end
   * @returns {Point} Closest point on segment
   */
  static closestPointOnSegment(point, segStart, segEnd) {
    const px = GeomUtil.getX(point);
    const py = GeomUtil.getY(point);
    const x1 = GeomUtil.getX(segStart);
    const y1 = GeomUtil.getY(segStart);
    const x2 = GeomUtil.getX(segEnd);
    const y2 = GeomUtil.getY(segEnd);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq < 1e-20) {
      // Segment is a point
      return new Point(x1, y1);
    }

    // Parameter t clamped to [0, 1]
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = GeomUtil.clamp(t, 0, 1);

    return new Point(x1 + t * dx, y1 + t * dy);
  }
}
