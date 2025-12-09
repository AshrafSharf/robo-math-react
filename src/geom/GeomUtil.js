import { Point } from './Point.js';

export class GeomUtil {
  /**
   * Returns the original value if it is inclusively within the [max,min] range. If it's below the range, min is
   * returned, and if it's above the range, max is returned.
   * @public
   *
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  static clamp(value, min, max) {
    if (value < min) {
      return min;
    }
    else if (value > max) {
      return max;
    }
    else {
      return value;
    }
  }

  /**
   * Converts degrees to radians.
   * @public
   *
   * @param {number} degrees
   * @returns {number}
   */
  static toRadians(degrees) {
    return Math.PI * degrees / 180;
  }

  /**
   * Converts radians to degrees.
   * @public
   *
   * @param {number} radians
   * @returns {number}
   */
  static toDegrees(radians) {
    return 180 * radians / Math.PI;
  }

  /**
   * Rounds using "Round half away from zero" algorithm. See dot#35.
   * @public
   *
   * JavaScript's Math.round is not symmetric for positive and negative numbers, it uses IEEE 754 "Round half up".
   * See https://en.wikipedia.org/wiki/Rounding#Round_half_up.
   * For sims, we want to treat positive and negative values symmetrically, which is IEEE 754 "Round half away from zero",
   * See https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero
   *
   * Note that -0 is rounded to 0, since we typically do not want to display -0 in sims.
   *
   * @param {number} value                               
   * @returns {number}
   */
  static roundSymmetric(value) {
    return ((value < 0) ? -1 : 1) * Math.round(Math.abs(value));
  }

  /**
   * The amount to multiply with when converting radians to degrees.
   */
  static RADIANS_TO_DEGREES = 180 / Math.PI;

  /**
   * The amount to multiply with when converting degrees to radians.
   */
  static DEGREES_TO_RADIANS = Math.PI / 180;

  //=========================================================
  // Constants
  //=========================================================

  static HALF_PI = Math.PI / 2;
  static TWO_PI = Math.PI * 2;
  static PI = Math.PI;

  static degrees(aAngle) {
    return (aAngle * 180) / Math.PI;
  }

  static radians(aAngle) {
    return (aAngle / 180) * Math.PI;
  }

  static formatAngle(ang) {
    return ((ang % GeomUtil.TWO_PI) + GeomUtil.TWO_PI) % GeomUtil.TWO_PI;
  }

  /**
   * Returns the horizontal angle formed by the line joining the two given
   * points.
   */
  static horizontalAngle(p1, p2) {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) + GeomUtil.TWO_PI) % (GeomUtil.TWO_PI);
  }

  static hypot(x, y) {
    return Math.sqrt((x * x) + (y * y));
  }

  /**
   * Returns the Euclidean norm (magnitude/length) of a vector.
   * @public
   *
   * @param {Object|number} pointOrX - Either a point/vector object with x,y properties, or the x component
   * @param {number} [y] - The y component (if first param is a number)
   * @returns {number}
   */
  static norm(pointOrX, y) {
    if (typeof pointOrX === 'object') {
      return Math.sqrt(pointOrX.x * pointOrX.x + pointOrX.y * pointOrX.y);
    }
    return Math.sqrt(pointOrX * pointOrX + y * y);
  }

  static map(value, istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  }

  static lerp(value1, value2, amt) {
    return value1 + ((value2 - value1) * amt);
  }

  static square(n) {
    return n * n;
  }

  static isEqual(toCheck, against, range = 0.02) {
    return ((-range + against) < toCheck) && (toCheck < (range + against));
  }

  static isNaN(toCheck) {
    if (isNaN(toCheck))
      return true;

    if (toCheck == undefined || toCheck == null)
      return true;

    return false;
  }

  static isWithInRange(val, from, to, range = 0) {
    if (GeomUtil.isEqual1(val, from, range))
      return true;

    if (GeomUtil.isEqual1(val, to, range))
      return true;

    if (GeomUtil.isBetween(val, from, to))
      return true;

    return false;
  }

  static isEqual1(val1, val2, precision = 0) {
    return Math.abs(val1 - val2) <= Math.abs(precision);
  }

  static isBetween(value, firstValue, secondValue) {
    return !(value < Math.min(firstValue, secondValue) || value > Math.max(firstValue, secondValue));
  }

  static angleBetweenLine(linePts, isReflex = false) {
    // This would require Vector3D which we haven't migrated yet
    // For now, we'll leave this as a placeholder
    throw new Error('angleBetweenLine requires Vector3D which is not yet migrated');
  }

  static isZero(toCheck, tolerance = 1E-8) {
    return (-tolerance < toCheck) && (toCheck < tolerance);
  }

  static isNumber(toCheck, against, range = 0.2) {
    return ((-range + against) < toCheck) && (toCheck < (range + against));
  }

  static toDegree(angle) {
    return angle * (180 / Math.PI);
  }

  static toRadian(degree) {
    return (degree / 180) * Math.PI;
  }

  static getAsFraction(numerator, denominator, mutiple) {
    const currentNumeratorValue = numerator * mutiple;
    const gcdValue = GeomUtil.gcd(currentNumeratorValue, denominator);

    const reducedNumerator = currentNumeratorValue / gcdValue;
    const reducedDenominator = denominator / gcdValue;

    const fraction = {num: reducedNumerator, denom: reducedDenominator};
    return fraction;
  }

  static roundDecimal(num, precision) {
    const decimal = Math.pow(10, precision);
    return Math.round(decimal * num) / decimal;
  }

  static gcd(i1, i2) {
    if (i2 == 0) {
      return i1;
    }
    else if (i1 == i2) {
      return i1;
    }
    else {
      let t;
      while (i2 != 0) {
        t = i2;
        i2 = i1 % i2;
        i1 = t;
      }
      return i1;
    }
  }

  static calculatePositiveAngle(val) {
    const EPSILON = 1E-8;
    const _2PI = 2.0 * Math.PI;

    if (val > EPSILON && val < _2PI) return val;

    let value = val % _2PI;
    if (GeomUtil.isZero(value)) {
      if (val < 1.0) value = 0.0;
      else value = _2PI;

    } else if (value < 0.0) {
      value += _2PI;
    }
    return value;
  }

  static rotatePoint(angleInDegree, px, py, ox, oy) {
    const angle = this.radians(angleInDegree);
    const point = new Point(px, py);
    const origin = new Point(ox, oy);

    if (angle == 0) {
      return new Point(point.x, point.y);
    }
    const d = Math.sqrt((origin.x - point.x) * (origin.x - point.x) + (origin.y - point.y) * (origin.y - point.y));
    const ang = Math.atan2((point.y - origin.y), (point.x - origin.x));
    return new Point(origin.x + (d * Math.cos(ang + angle)), origin.y + (d * Math.sin(ang + angle)));
  }

  static rotatePoints(angleInDegree, points, ox, oy) {
    const rotatedPoints = [];
    for (let i = 0; i < points.length; i++) {
      rotatedPoints.push(this.rotatePoint(angleInDegree, points[i].x, points[i].y, ox, oy));
    }
    return rotatedPoints;
  }

  static dilate(px, py, ratio, ax, ay) {
    const dialatedPt = new Point();
    dialatedPt.x = (ax) + (px - ax) * ratio;
    dialatedPt.y = (ay) + (py - ay) * ratio;
    return dialatedPt;
  }

  static dilatePoints(points, ratio, cx, cy) {
    const dialtedPoints = [];
    for (let i = 0; i < points.length; i++) {
      dialtedPoints.push(this.dilate(points[i].x, points[i].y, ratio, cx, cy));
    }
    return dialtedPoints;
  }

  static translatePoint(px, py, tx, ty, aboutX = 0, aboutY = 0) {
    const withRespX = px - aboutX;
    const withRespY = py - aboutY;
    return new Point(withRespX + tx, withRespY + ty);
  }

  static translatePoints(points, tx, ty, aboutX = 0, aboutY = 0) {
    const translatedPoints = [];
    for (let i = 0; i < points.length; i++) {
      translatedPoints.push(this.translatePoint(points[i].x, points[i].y, tx, ty, aboutX, aboutX));
    }
    return translatedPoints;
  }

  //=========================================================
  // Coordinate Extraction Utilities (ported from exp_utils)
  //=========================================================

  /**
   * Extracts x coordinate from various point-like objects.
   * Accepts Point, Vector2, {x, y} objects, or [x, y] arrays.
   * @param {Point|Object|Array} obj - Point-like object
   * @returns {number} The x coordinate
   */
  static getX(obj) {
    if (obj === null || obj === undefined) {
      throw new Error('getX: input is null or undefined');
    }
    if (Array.isArray(obj)) {
      return obj[0];
    }
    if (typeof obj.x === 'number') {
      return obj.x;
    }
    throw new Error('getX: cannot extract x coordinate from input');
  }

  /**
   * Extracts y coordinate from various point-like objects.
   * Accepts Point, Vector2, {x, y} objects, or [x, y] arrays.
   * @param {Point|Object|Array} obj - Point-like object
   * @returns {number} The y coordinate
   */
  static getY(obj) {
    if (obj === null || obj === undefined) {
      throw new Error('getY: input is null or undefined');
    }
    if (Array.isArray(obj)) {
      return obj[1];
    }
    if (typeof obj.y === 'number') {
      return obj.y;
    }
    throw new Error('getY: cannot extract y coordinate from input');
  }

  /**
   * Returns the angle from p1 to p2 in radians.
   * Result is in range [0, 2π).
   * @param {Point|Object|Array} p1 - Start point
   * @param {Point|Object|Array} p2 - End point
   * @returns {number} Angle in radians [0, 2π)
   */
  static getAngle(p1, p2) {
    const x1 = GeomUtil.getX(p1);
    const y1 = GeomUtil.getY(p1);
    const x2 = GeomUtil.getX(p2);
    const y2 = GeomUtil.getY(p2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    return ((angle % GeomUtil.TWO_PI) + GeomUtil.TWO_PI) % GeomUtil.TWO_PI;
  }

  /**
   * Returns the slope between two points (rise/run).
   * Returns Infinity for vertical lines (dx = 0).
   * @param {Point|Object|Array} p1 - First point
   * @param {Point|Object|Array} p2 - Second point
   * @returns {number} Slope value (or Infinity for vertical)
   */
  static getSlope(p1, p2) {
    const x1 = GeomUtil.getX(p1);
    const y1 = GeomUtil.getY(p1);
    const x2 = GeomUtil.getX(p2);
    const y2 = GeomUtil.getY(p2);
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (Math.abs(dx) < 1e-10) {
      return dy >= 0 ? Infinity : -Infinity;
    }
    return dy / dx;
  }

  /**
   * Returns the distance between two points (magnitude of the vector).
   * @param {Point|Object|Array} p1 - First point
   * @param {Point|Object|Array} p2 - Second point
   * @returns {number} Euclidean distance
   */
  static getMagnitude(p1, p2) {
    const x1 = GeomUtil.getX(p1);
    const y1 = GeomUtil.getY(p1);
    const x2 = GeomUtil.getX(p2);
    const y2 = GeomUtil.getY(p2);
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Returns the midpoint between two points.
   * @param {Point|Object|Array} p1 - First point
   * @param {Point|Object|Array} p2 - Second point
   * @returns {Point} Midpoint
   */
  static getMidpoint(p1, p2) {
    const x1 = GeomUtil.getX(p1);
    const y1 = GeomUtil.getY(p1);
    const x2 = GeomUtil.getX(p2);
    const y2 = GeomUtil.getY(p2);
    return new Point((x1 + x2) / 2, (y1 + y2) / 2);
  }

  /**
   * Returns the unit vector (direction) from p1 to p2.
   * @param {Point|Object|Array} p1 - Start point
   * @param {Point|Object|Array} p2 - End point
   * @returns {Point} Unit vector as Point (magnitude = 1)
   */
  static getUnitVector(p1, p2) {
    const x1 = GeomUtil.getX(p1);
    const y1 = GeomUtil.getY(p1);
    const x2 = GeomUtil.getX(p2);
    const y2 = GeomUtil.getY(p2);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag < 1e-10) {
      return new Point(0, 0);
    }
    return new Point(dx / mag, dy / mag);
  }

  /**
   * Returns a point at proportion t along the line from start to end.
   * t=0 returns start, t=1 returns end, t=0.5 returns midpoint.
   * @param {Point|Object|Array} start - Start point
   * @param {Point|Object|Array} end - End point
   * @param {number} t - Proportion (0 to 1, can be outside for extrapolation)
   * @returns {Point} Point at proportion t
   */
  static pointAtProportion(start, end, t) {
    const x1 = GeomUtil.getX(start);
    const y1 = GeomUtil.getY(start);
    const x2 = GeomUtil.getX(end);
    const y2 = GeomUtil.getY(end);
    return new Point(
      x1 + (x2 - x1) * t,
      y1 + (y2 - y1) * t
    );
  }

  /**
   * Returns a point on a circle at the given angle.
   * Angle is measured counter-clockwise from the positive x-axis.
   * @param {Point|Object|Array} center - Circle center
   * @param {number} radius - Circle radius
   * @param {number} angleDeg - Angle in degrees
   * @returns {Point} Point on the circle
   */
  static pointOnCircleAtAngle(center, radius, angleDeg) {
    const cx = GeomUtil.getX(center);
    const cy = GeomUtil.getY(center);
    const angleRad = GeomUtil.toRadians(angleDeg);
    return new Point(
      cx + radius * Math.cos(angleRad),
      cy + radius * Math.sin(angleRad)
    );
  }
}