import { Point } from './Point.js';
import { GeomUtil } from './GeomUtil.js';
import { TriangleUtil } from './TriangleUtil.js';

/**
 * CircleUtil - Static utility class for circle operations.
 * Ported from Python Manim add-ons (circle_utils.py).
 *
 * All methods work with Point objects or any point-like input
 * (objects with x,y properties or [x,y] arrays).
 *
 * Circle representation: { center: Point, radius: number }
 */
export class CircleUtil {

  //=========================================================
  // Point on Circle
  //=========================================================

  /**
   * Returns a point on a circle at the given angle.
   * Angle is measured counter-clockwise from the positive x-axis.
   * @param {Point|Object|Array} center - Circle center
   * @param {number} radius - Circle radius
   * @param {number} angleDeg - Angle in degrees
   * @returns {Point} Point on the circle
   */
  static pointAtAngle(center, radius, angleDeg) {
    return GeomUtil.pointOnCircleAtAngle(center, radius, angleDeg);
  }

  /**
   * Returns the angle (in degrees) of a point relative to the circle center.
   * @param {Point|Object|Array} center - Circle center
   * @param {Point|Object|Array} point - Point on or near circle
   * @returns {number} Angle in degrees [0, 360)
   */
  static angleOfPoint(center, point) {
    const cx = GeomUtil.getX(center);
    const cy = GeomUtil.getY(center);
    const px = GeomUtil.getX(point);
    const py = GeomUtil.getY(point);

    const angle = Math.atan2(py - cy, px - cx);
    return GeomUtil.toDegrees(GeomUtil.formatAngle(angle));
  }

  //=========================================================
  // Tangent and Normal Lines
  //=========================================================

  /**
   * Creates a tangent line at a point on the circle specified by angle.
   * @param {Point|Object|Array} center - Circle center
   * @param {number} radius - Circle radius
   * @param {number} angleDeg - Angle in degrees where tangent touches circle
   * @param {number} length - Length of the tangent line (default: 2)
   * @returns {{start: Point, end: Point}} Tangent line
   */
  static tangentAtAngle(center, radius, angleDeg, length = 2) {
    const cx = GeomUtil.getX(center);
    const cy = GeomUtil.getY(center);
    const angleRad = GeomUtil.toRadians(angleDeg);

    // Point on circle
    const px = cx + radius * Math.cos(angleRad);
    const py = cy + radius * Math.sin(angleRad);

    // Tangent direction (perpendicular to radius, rotate 90 degrees CCW)
    const tangentDirX = -Math.sin(angleRad);
    const tangentDirY = Math.cos(angleRad);

    const halfLen = length / 2;

    return {
      start: new Point(px - tangentDirX * halfLen, py - tangentDirY * halfLen),
      end: new Point(px + tangentDirX * halfLen, py + tangentDirY * halfLen)
    };
  }

  /**
   * Creates a tangent line at a given point on the circle.
   * @param {Point|Object|Array} center - Circle center
   * @param {Point|Object|Array} point - Point on the circle
   * @param {number} length - Length of the tangent line (default: 2)
   * @returns {{start: Point, end: Point}} Tangent line
   */
  static tangentAtPoint(center, point, length = 2) {
    const angleDeg = CircleUtil.angleOfPoint(center, point);
    return CircleUtil.tangentAtAngle(center, 0, angleDeg, length);
  }

  /**
   * Creates a normal (radius) line at a point on the circle specified by angle.
   * The normal extends from inside the circle through the surface point.
   * @param {Point|Object|Array} center - Circle center
   * @param {number} radius - Circle radius
   * @param {number} angleDeg - Angle in degrees
   * @param {number} length - Total length of the normal line (default: radius * 2)
   * @param {string} placement - 'center' (default), 'inside', or 'outside'
   * @returns {{start: Point, end: Point}} Normal line
   */
  static normalAtAngle(center, radius, angleDeg, length = null, placement = 'center') {
    const cx = GeomUtil.getX(center);
    const cy = GeomUtil.getY(center);
    const angleRad = GeomUtil.toRadians(angleDeg);

    // Direction from center to point on circle
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);

    // Point on circle
    const px = cx + radius * dirX;
    const py = cy + radius * dirY;

    const totalLength = length !== null ? length : radius * 2;

    let startDist, endDist;
    switch (placement) {
      case 'inside':
        startDist = -totalLength;
        endDist = 0;
        break;
      case 'outside':
        startDist = 0;
        endDist = totalLength;
        break;
      case 'center':
      default:
        startDist = -totalLength / 2;
        endDist = totalLength / 2;
        break;
    }

    return {
      start: new Point(px + dirX * startDist, py + dirY * startDist),
      end: new Point(px + dirX * endDist, py + dirY * endDist)
    };
  }

  //=========================================================
  // Chord Operations
  //=========================================================

  /**
   * Creates a chord between two angles on a circle.
   * @param {Point|Object|Array} center - Circle center
   * @param {number} radius - Circle radius
   * @param {number} angle1Deg - First angle in degrees
   * @param {number} angle2Deg - Second angle in degrees
   * @returns {{start: Point, end: Point}} Chord line
   */
  static chord(center, radius, angle1Deg, angle2Deg) {
    return {
      start: CircleUtil.pointAtAngle(center, radius, angle1Deg),
      end: CircleUtil.pointAtAngle(center, radius, angle2Deg)
    };
  }

  /**
   * Calculates the chord length for a given central angle.
   * @param {number} radius - Circle radius
   * @param {number} angleDeg - Central angle in degrees
   * @returns {number} Chord length
   */
  static chordLength(radius, angleDeg) {
    const angleRad = GeomUtil.toRadians(angleDeg);
    // chord = 2 * r * sin(angle/2)
    return 2 * radius * Math.sin(angleRad / 2);
  }

  /**
   * Calculates the central angle for a given chord length.
   * @param {number} radius - Circle radius
   * @param {number} chordLen - Chord length
   * @returns {number} Central angle in degrees
   */
  static chordAngle(radius, chordLen) {
    // angle = 2 * arcsin(chord / (2r))
    const sinHalfAngle = chordLen / (2 * radius);
    if (sinHalfAngle > 1) {
      return 180; // Max angle for diameter
    }
    return GeomUtil.toDegrees(2 * Math.asin(sinHalfAngle));
  }

  //=========================================================
  // Arc Utilities
  //=========================================================

  /**
   * Calculates the arc length for a given central angle.
   * @param {number} radius - Circle radius
   * @param {number} angleDeg - Central angle in degrees
   * @returns {number} Arc length
   */
  static arcLength(radius, angleDeg) {
    const angleRad = GeomUtil.toRadians(angleDeg);
    return radius * angleRad;
  }

  /**
   * Calculates the sector area for a given central angle.
   * @param {number} radius - Circle radius
   * @param {number} angleDeg - Central angle in degrees
   * @returns {number} Sector area
   */
  static sectorArea(radius, angleDeg) {
    const angleRad = GeomUtil.toRadians(angleDeg);
    return (radius * radius * angleRad) / 2;
  }

  /**
   * Calculates the segment area (area between chord and arc).
   * @param {number} radius - Circle radius
   * @param {number} angleDeg - Central angle in degrees
   * @returns {number} Segment area
   */
  static segmentArea(radius, angleDeg) {
    const angleRad = GeomUtil.toRadians(angleDeg);
    // Area = (r^2 / 2) * (angle - sin(angle))
    return (radius * radius / 2) * (angleRad - Math.sin(angleRad));
  }

  //=========================================================
  // Circle from Points
  //=========================================================

  /**
   * Creates the circumscribed circle (circumcircle) of a triangle.
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {{center: Point, radius: number}} Circle definition
   */
  static circumscribedCircle(A, B, C) {
    const center = TriangleUtil.circumcenter(A, B, C);
    const radius = TriangleUtil.circumradius(A, B, C);
    return { center, radius };
  }

  /**
   * Creates the inscribed circle (incircle) of a triangle.
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {{center: Point, radius: number}} Circle definition
   */
  static inscribedCircle(A, B, C) {
    const center = TriangleUtil.incenter(A, B, C);
    const radius = TriangleUtil.inradius(A, B, C);
    return { center, radius };
  }

  /**
   * Creates a circle passing through three points.
   * Same as circumscribed circle of the triangle formed by the points.
   * @param {Point|Object|Array} p1 - First point
   * @param {Point|Object|Array} p2 - Second point
   * @param {Point|Object|Array} p3 - Third point
   * @returns {{center: Point, radius: number}} Circle definition
   */
  static fromThreePoints(p1, p2, p3) {
    return CircleUtil.circumscribedCircle(p1, p2, p3);
  }

  /**
   * Creates a circle from center and a point on the circle.
   * @param {Point|Object|Array} center - Circle center
   * @param {Point|Object|Array} pointOnCircle - Point on the circle
   * @returns {{center: Point, radius: number}} Circle definition
   */
  static fromCenterAndPoint(center, pointOnCircle) {
    const cx = GeomUtil.getX(center);
    const cy = GeomUtil.getY(center);
    const radius = GeomUtil.getMagnitude(center, pointOnCircle);
    return {
      center: new Point(cx, cy),
      radius
    };
  }

  /**
   * Creates a circle from diameter endpoints.
   * @param {Point|Object|Array} p1 - First diameter endpoint
   * @param {Point|Object|Array} p2 - Second diameter endpoint
   * @returns {{center: Point, radius: number}} Circle definition
   */
  static fromDiameter(p1, p2) {
    const center = GeomUtil.getMidpoint(p1, p2);
    const radius = GeomUtil.getMagnitude(p1, p2) / 2;
    return { center, radius };
  }

  //=========================================================
  // Circle Properties and Checks
  //=========================================================

  /**
   * Checks if a point is inside a circle.
   * @param {Point|Object|Array} point - Point to check
   * @param {Point|Object|Array} center - Circle center
   * @param {number} radius - Circle radius
   * @param {number} tolerance - Distance tolerance (default: 1e-8)
   * @returns {boolean} True if point is inside (or on) circle
   */
  static containsPoint(point, center, radius, tolerance = 1e-8) {
    const dist = GeomUtil.getMagnitude(point, center);
    return dist <= radius + tolerance;
  }

  /**
   * Checks if a point is on the circle boundary.
   * @param {Point|Object|Array} point - Point to check
   * @param {Point|Object|Array} center - Circle center
   * @param {number} radius - Circle radius
   * @param {number} tolerance - Distance tolerance (default: 1e-8)
   * @returns {boolean} True if point is on circle boundary
   */
  static isPointOnCircle(point, center, radius, tolerance = 1e-8) {
    const dist = GeomUtil.getMagnitude(point, center);
    return Math.abs(dist - radius) <= tolerance;
  }

  /**
   * Returns the circumference of a circle.
   * @param {number} radius - Circle radius
   * @returns {number} Circumference
   */
  static circumference(radius) {
    return 2 * Math.PI * radius;
  }

  /**
   * Returns the area of a circle.
   * @param {number} radius - Circle radius
   * @returns {number} Area
   */
  static area(radius) {
    return Math.PI * radius * radius;
  }

  //=========================================================
  // External Tangent Lines
  //=========================================================

  /**
   * Finds external tangent lines between two circles.
   * @param {Point|Object|Array} center1 - First circle center
   * @param {number} radius1 - First circle radius
   * @param {Point|Object|Array} center2 - Second circle center
   * @param {number} radius2 - Second circle radius
   * @returns {Array<{start: Point, end: Point}>} Array of tangent lines (0-4 lines)
   */
  static externalTangentLines(center1, radius1, center2, radius2) {
    const c1x = GeomUtil.getX(center1);
    const c1y = GeomUtil.getY(center1);
    const c2x = GeomUtil.getX(center2);
    const c2y = GeomUtil.getY(center2);
    const r1 = Math.abs(radius1);
    const r2 = Math.abs(radius2);

    const dx = c2x - c1x;
    const dy = c2y - c1y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < 1e-10) {
      return []; // Concentric circles
    }

    const results = [];

    // External tangents (same-side tangents)
    if (d >= Math.abs(r1 - r2)) {
      const rDiff = r1 - r2;
      const sinA = rDiff / d;

      if (Math.abs(sinA) <= 1) {
        const a = Math.asin(sinA);
        const baseAngle = Math.atan2(dy, dx);

        // Two external tangent angles
        const angles = [baseAngle + Math.PI / 2 - a, baseAngle - Math.PI / 2 + a];

        for (const angle of angles) {
          const p1 = new Point(
            c1x + r1 * Math.cos(angle),
            c1y + r1 * Math.sin(angle)
          );
          const p2 = new Point(
            c2x + r2 * Math.cos(angle),
            c2y + r2 * Math.sin(angle)
          );
          results.push({ start: p1, end: p2 });
        }
      }
    }

    return results;
  }

  /**
   * Finds internal tangent lines between two circles.
   * @param {Point|Object|Array} center1 - First circle center
   * @param {number} radius1 - First circle radius
   * @param {Point|Object|Array} center2 - Second circle center
   * @param {number} radius2 - Second circle radius
   * @returns {Array<{start: Point, end: Point}>} Array of tangent lines (0-2 lines)
   */
  static internalTangentLines(center1, radius1, center2, radius2) {
    const c1x = GeomUtil.getX(center1);
    const c1y = GeomUtil.getY(center1);
    const c2x = GeomUtil.getX(center2);
    const c2y = GeomUtil.getY(center2);
    const r1 = Math.abs(radius1);
    const r2 = Math.abs(radius2);

    const dx = c2x - c1x;
    const dy = c2y - c1y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < 1e-10 || d < r1 + r2) {
      return []; // Circles overlap or are concentric
    }

    const results = [];

    // Internal tangents (cross tangents)
    const rSum = r1 + r2;
    const sinA = rSum / d;

    if (sinA <= 1) {
      const a = Math.asin(sinA);
      const baseAngle = Math.atan2(dy, dx);

      // Two internal tangent angles
      const angle1 = baseAngle + Math.PI / 2 - a;
      const angle2 = baseAngle - Math.PI / 2 + a;

      const p1a = new Point(
        c1x + r1 * Math.cos(angle1),
        c1y + r1 * Math.sin(angle1)
      );
      const p2a = new Point(
        c2x - r2 * Math.cos(angle1),
        c2y - r2 * Math.sin(angle1)
      );
      results.push({ start: p1a, end: p2a });

      const p1b = new Point(
        c1x + r1 * Math.cos(angle2),
        c1y + r1 * Math.sin(angle2)
      );
      const p2b = new Point(
        c2x - r2 * Math.cos(angle2),
        c2y - r2 * Math.sin(angle2)
      );
      results.push({ start: p1b, end: p2b });
    }

    return results;
  }
}
