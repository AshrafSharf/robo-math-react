import { Point } from './Point.js';
import { GeomUtil } from './GeomUtil.js';

/**
 * TriangleUtil - Static utility class for triangle operations.
 * Ported from Python Manim add-ons (triangle_utils.py, shape_utils.py).
 *
 * All methods work with Point objects or any point-like input
 * (objects with x,y properties or [x,y] arrays).
 */
export class TriangleUtil {

  //=========================================================
  // Triangle Centers
  //=========================================================

  /**
   * Calculates the centroid (center of mass) of a triangle.
   * The centroid is the intersection of the medians.
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {Point} Centroid
   */
  static centroid(A, B, C) {
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    return new Point((ax + bx + cx) / 3, (ay + by + cy) / 3);
  }

  /**
   * Calculates the circumcenter of a triangle.
   * The circumcenter is the center of the circumscribed circle,
   * and is the intersection of the perpendicular bisectors.
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {Point} Circumcenter
   */
  static circumcenter(A, B, C) {
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    // Midpoints of AB and AC
    const midABx = (ax + bx) / 2;
    const midABy = (ay + by) / 2;
    const midACx = (ax + cx) / 2;
    const midACy = (ay + cy) / 2;

    // Direction vectors of AB and AC
    const dABx = bx - ax;
    const dABy = by - ay;
    const dACx = cx - ax;
    const dACy = cy - ay;

    // Perpendicular directions (rotate 90 degrees)
    const perpABx = -dABy;
    const perpABy = dABx;
    const perpACx = -dACy;
    const perpACy = dACx;

    // Solve for intersection of perpendicular bisectors
    // Line 1: midAB + t * perpAB
    // Line 2: midAC + s * perpAC
    // System: midAB + t * perpAB = midAC + s * perpAC

    const det = perpABx * perpACy - perpABy * perpACx;

    if (Math.abs(det) < 1e-10) {
      // Degenerate triangle (collinear points), return centroid
      return TriangleUtil.centroid(A, B, C);
    }

    const dx = midACx - midABx;
    const dy = midACy - midABy;

    const t = (dx * perpACy - dy * perpACx) / det;

    return new Point(midABx + t * perpABx, midABy + t * perpABy);
  }

  /**
   * Calculates the orthocenter of a triangle.
   * The orthocenter is the intersection of the altitudes.
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {Point} Orthocenter
   */
  static orthocenter(A, B, C) {
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    // Direction of BC and CA
    const dBCx = cx - bx;
    const dBCy = cy - by;
    const dCAx = ax - cx;
    const dCAy = ay - cy;

    // Perpendiculars (altitudes go from vertex perpendicular to opposite side)
    // Altitude from A perpendicular to BC
    const perpBCx = -dBCy;
    const perpBCy = dBCx;

    // Altitude from B perpendicular to CA
    const perpCAx = -dCAy;
    const perpCAy = dCAx;

    // Solve for intersection
    // Line 1: A + t * perpBC
    // Line 2: B + s * perpCA

    const det = perpBCx * perpCAy - perpBCy * perpCAx;

    if (Math.abs(det) < 1e-10) {
      // Degenerate triangle, return centroid
      return TriangleUtil.centroid(A, B, C);
    }

    const dx = bx - ax;
    const dy = by - ay;

    const t = (dx * perpCAy - dy * perpCAx) / det;

    return new Point(ax + t * perpBCx, ay + t * perpBCy);
  }

  /**
   * Calculates the incenter of a triangle.
   * The incenter is the center of the inscribed circle,
   * and is the intersection of the angle bisectors.
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {Point} Incenter
   */
  static incenter(A, B, C) {
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    // Side lengths
    const a = Math.sqrt((cx - bx) * (cx - bx) + (cy - by) * (cy - by)); // BC, opposite to A
    const b = Math.sqrt((ax - cx) * (ax - cx) + (ay - cy) * (ay - cy)); // CA, opposite to B
    const c = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay)); // AB, opposite to C

    const perimeter = a + b + c;

    if (perimeter < 1e-10) {
      // Degenerate triangle
      return new Point(ax, ay);
    }

    // Incenter is weighted average: I = (a*A + b*B + c*C) / (a + b + c)
    return new Point(
      (a * ax + b * bx + c * cx) / perimeter,
      (a * ay + b * by + c * cy) / perimeter
    );
  }

  //=========================================================
  // Triangle Construction
  //=========================================================

  /**
   * Constructs a triangle from three side lengths (SSS).
   * Places vertex A at origin, B on positive x-axis.
   * @param {number} a - Length of side BC (opposite to A)
   * @param {number} b - Length of side CA (opposite to B)
   * @param {number} c - Length of side AB (opposite to C)
   * @returns {{A: Point, B: Point, C: Point}|null} Triangle vertices or null if invalid
   */
  static fromSSS(a, b, c) {
    // Validate triangle inequality
    if (!TriangleUtil.isValidSSS(a, b, c)) {
      return null;
    }

    // Place A at origin, B at (c, 0)
    const A = new Point(0, 0);
    const B = new Point(c, 0);

    // Find C using law of cosines: cos(A) = (b^2 + c^2 - a^2) / (2bc)
    const cosA = (b * b + c * c - a * a) / (2 * b * c);
    const sinA = Math.sqrt(1 - cosA * cosA);

    const C = new Point(b * cosA, b * sinA);

    return { A, B, C };
  }

  /**
   * Constructs a triangle from two sides and included angle (SAS).
   * Places vertex A at origin, B on positive x-axis.
   * @param {number} a - Length of side AB
   * @param {number} angleDeg - Angle at A in degrees
   * @param {number} b - Length of side AC
   * @returns {{A: Point, B: Point, C: Point}|null} Triangle vertices or null if invalid
   */
  static fromSAS(a, angleDeg, b) {
    // Validate angle
    if (angleDeg <= 0 || angleDeg >= 180) {
      return null;
    }

    if (a <= 0 || b <= 0) {
      return null;
    }

    const angleRad = GeomUtil.toRadians(angleDeg);

    // Place A at origin, B at (a, 0)
    const A = new Point(0, 0);
    const B = new Point(a, 0);

    // C at angle from A, distance b
    const C = new Point(b * Math.cos(angleRad), b * Math.sin(angleRad));

    return { A, B, C };
  }

  /**
   * Constructs a triangle from two sides and angle opposite one side (SSA).
   * This is the ambiguous case - may have 0, 1, or 2 solutions.
   * Places vertex A at origin, B on positive x-axis.
   * @param {number} a - Length of side BC (opposite to angle A)
   * @param {number} b - Length of side AC
   * @param {number} angleDeg - Angle at A in degrees
   * @returns {{A: Point, B: Point, C: Point}|null} Triangle vertices or null if invalid
   */
  static fromSSA(a, b, angleDeg) {
    // Validate inputs
    if (a <= 0 || b <= 0 || angleDeg <= 0 || angleDeg >= 180) {
      return null;
    }

    const angleA = GeomUtil.toRadians(angleDeg);

    // Using law of sines: sin(B) / b = sin(A) / a
    // sin(B) = b * sin(A) / a
    const sinB = b * Math.sin(angleA) / a;

    // Check if triangle is possible
    if (sinB > 1) {
      return null; // No solution
    }

    const angleB = Math.asin(sinB);
    const angleC = Math.PI - angleA - angleB;

    // Check if angle C is valid
    if (angleC <= 0) {
      return null;
    }

    // Calculate side c using law of sines: c / sin(C) = a / sin(A)
    const c = a * Math.sin(angleC) / Math.sin(angleA);

    // Place A at origin, B at (c, 0)
    const A = new Point(0, 0);
    const B = new Point(c, 0);

    // C at angle A from origin, distance b
    const C = new Point(b * Math.cos(angleA), b * Math.sin(angleA));

    return { A, B, C };
  }

  //=========================================================
  // Triangle Properties
  //=========================================================

  /**
   * Calculates the altitude from a vertex to the opposite side.
   * @param {Point|Object|Array} vertex - Vertex of the triangle
   * @param {Point|Object|Array} oppositeStart - Start of opposite side
   * @param {Point|Object|Array} oppositeEnd - End of opposite side
   * @returns {{foot: Point, length: number}} Foot of altitude and altitude length
   */
  static altitude(vertex, oppositeStart, oppositeEnd) {
    const vx = GeomUtil.getX(vertex);
    const vy = GeomUtil.getY(vertex);
    const x1 = GeomUtil.getX(oppositeStart);
    const y1 = GeomUtil.getY(oppositeStart);
    const x2 = GeomUtil.getX(oppositeEnd);
    const y2 = GeomUtil.getY(oppositeEnd);

    // Direction of opposite side
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq < 1e-20) {
      // Degenerate case
      return {
        foot: new Point(x1, y1),
        length: Math.sqrt((vx - x1) * (vx - x1) + (vy - y1) * (vy - y1))
      };
    }

    // Project vertex onto the line containing the opposite side
    const t = ((vx - x1) * dx + (vy - y1) * dy) / lenSq;
    const foot = new Point(x1 + t * dx, y1 + t * dy);

    const length = Math.sqrt(
      (vx - foot.x) * (vx - foot.x) + (vy - foot.y) * (vy - foot.y)
    );

    return { foot, length };
  }

  /**
   * Calculates the area of a triangle using the cross product formula.
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {number} Area of the triangle (always positive)
   */
  static area(A, B, C) {
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    // Area = |((B-A) x (C-A))| / 2
    const cross = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    return Math.abs(cross) / 2;
  }

  /**
   * Calculates the signed area of a triangle.
   * Positive if vertices are counter-clockwise, negative if clockwise.
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {number} Signed area
   */
  static signedArea(A, B, C) {
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    return ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax)) / 2;
  }

  /**
   * Calculates the circumradius (radius of circumscribed circle).
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {number} Circumradius
   */
  static circumradius(A, B, C) {
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    // Side lengths
    const a = Math.sqrt((cx - bx) * (cx - bx) + (cy - by) * (cy - by));
    const b = Math.sqrt((ax - cx) * (ax - cx) + (ay - cy) * (ay - cy));
    const c = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));

    const area = TriangleUtil.area(A, B, C);

    if (area < 1e-10) {
      return Infinity; // Degenerate triangle
    }

    // R = abc / (4 * area)
    return (a * b * c) / (4 * area);
  }

  /**
   * Calculates the inradius (radius of inscribed circle).
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {number} Inradius
   */
  static inradius(A, B, C) {
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    // Side lengths
    const a = Math.sqrt((cx - bx) * (cx - bx) + (cy - by) * (cy - by));
    const b = Math.sqrt((ax - cx) * (ax - cx) + (ay - cy) * (ay - cy));
    const c = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));

    const s = (a + b + c) / 2; // Semi-perimeter
    const area = TriangleUtil.area(A, B, C);

    if (s < 1e-10) {
      return 0; // Degenerate triangle
    }

    // r = area / s
    return area / s;
  }

  /**
   * Calculates the perimeter of a triangle.
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {number} Perimeter
   */
  static perimeter(A, B, C) {
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    const a = Math.sqrt((cx - bx) * (cx - bx) + (cy - by) * (cy - by));
    const b = Math.sqrt((ax - cx) * (ax - cx) + (ay - cy) * (ay - cy));
    const c = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));

    return a + b + c;
  }

  //=========================================================
  // Validation
  //=========================================================

  /**
   * Checks if three side lengths can form a valid triangle (triangle inequality).
   * @param {number} a - First side length
   * @param {number} b - Second side length
   * @param {number} c - Third side length
   * @returns {boolean} True if valid triangle
   */
  static isValidSSS(a, b, c) {
    if (a <= 0 || b <= 0 || c <= 0) {
      return false;
    }
    return (a + b > c) && (a + c > b) && (b + c > a);
  }

  /**
   * Checks if a point is inside a triangle (using barycentric coordinates).
   * @param {Point|Object|Array} point - Point to check
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {boolean} True if point is inside triangle
   */
  static containsPoint(point, A, B, C) {
    const px = GeomUtil.getX(point);
    const py = GeomUtil.getY(point);
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    // Calculate barycentric coordinates
    const denom = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);

    if (Math.abs(denom) < 1e-10) {
      return false; // Degenerate triangle
    }

    const alpha = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / denom;
    const beta = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / denom;
    const gamma = 1 - alpha - beta;

    return alpha >= 0 && beta >= 0 && gamma >= 0;
  }

  /**
   * Returns the angles of a triangle in radians.
   * @param {Point|Object|Array} A - First vertex
   * @param {Point|Object|Array} B - Second vertex
   * @param {Point|Object|Array} C - Third vertex
   * @returns {{A: number, B: number, C: number}} Angles at each vertex in radians
   */
  static angles(A, B, C) {
    const ax = GeomUtil.getX(A);
    const ay = GeomUtil.getY(A);
    const bx = GeomUtil.getX(B);
    const by = GeomUtil.getY(B);
    const cx = GeomUtil.getX(C);
    const cy = GeomUtil.getY(C);

    // Side lengths
    const a = Math.sqrt((cx - bx) * (cx - bx) + (cy - by) * (cy - by)); // BC
    const b = Math.sqrt((ax - cx) * (ax - cx) + (ay - cy) * (ay - cy)); // CA
    const c = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay)); // AB

    // Using law of cosines
    const angleA = Math.acos(GeomUtil.clamp((b * b + c * c - a * a) / (2 * b * c), -1, 1));
    const angleB = Math.acos(GeomUtil.clamp((a * a + c * c - b * b) / (2 * a * c), -1, 1));
    const angleC = Math.PI - angleA - angleB;

    return { A: angleA, B: angleB, C: angleC };
  }
}
