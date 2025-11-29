/**
 * The Point object represents a location in a two-dimensional coordinate
 * system, where x represents the horizontal axis and y
 * represents the vertical axis.
 */
export class Point {
  /**
   * Creates a new point. If you pass no parameters to this method, a point is
   * created at(0,0).
   *
   * @param {number} x The horizontal coordinate.
   * @param {number} y The vertical coordinate.
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * The length of the line segment from(0,0) to this point.
   */
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Adds the coordinates of another point to the coordinates of this point to
   * create a new point.
   *
   * @param {Point} v The point to be added.
   * @return {Point} The new point.
   */
  add(v) {
    return new Point(this.x + v.x, this.y + v.y);
  }

  /**
   * Creates a copy of this Point object.
   *
   * @return {Point} The new Point object.
   */
  clone() {
    return new Point(this.x, this.y);
  }

  copyFrom(sourcePoint) {

  }

  /**
   * Determines whether two points are equal. Two points are equal if they have
   * the same x and y values.
   *
   * @param {Point} toCompare The point to be compared.
   * @return {boolean} A value of true if the object is equal to this Point
   *         object; false if it is not equal.
   */
  equals(toCompare) {
    return (this.x == toCompare.x && this.y == toCompare.y);
  }

  /**
   * Scales the line segment between(0,0) and the current point to a set
   * length.
   *
   * @param {number} thickness The scaling value. For example, if the current point is
   *                 (0,5), and you normalize it to 1, the point returned is
   *                  at(0,1).
   */
  normalize(thickness = 1) {
    const len = this.length;

    if (len) {
      const invLength = thickness / len;
      this.x *= invLength;
      this.y *= invLength;
    }
  }

  /**
   * Offsets the Point object by the specified amount. The value of
   * dx is added to the original value of x to create the
   * new x value. The value of dy is added to the original
   * value of y to create the new y value.
   *
   * @param {number} dx The amount by which to offset the horizontal coordinate, x.
   * @param {number} dy The amount by which to offset the vertical coordinate, y.
   */
  offset(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  setTo(xa, ya) {
    this.x = xa;
    this.y = ya;
  }

  /**
   * Subtracts the coordinates of another point from the coordinates of this
   * point to create a new point.
   *
   * @param {Point} v The point to be subtracted.
   * @return {Point} The new point.
   */
  subtract(v) {
    return new Point(this.x - v.x, this.y - v.y);
  }

  /**
   * Returns a string that contains the values of the x and y
   * coordinates.
   *
   * @return {string} The string representation of the coordinates.
   */
  toString() {
    return "[Point] (x=" + this.x + ", y=" + this.y + ")";
  }

  /**
   * Returns the distance between pt1 and pt2.
   *
   * @param {Point} pt1 The first point.
   * @param {Point} pt2 The second point.
   * @return {number} The distance between the first and second points.
   */
  static distance(pt1, pt2) {
    const dx = pt2.x - pt1.x;
    const dy = pt2.y - pt1.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Determines a point between two specified points. The parameter
   * f determines where the new interpolated point is located
   * relative to the two end points specified by parameters pt1
   * and pt2. The closer the value of the parameter f
   * is to 1.0, the closer the interpolated point is to the first
   * point(parameter pt1). The closer the value of the parameter
   * f is to 0, the closer the interpolated point is to the second
   * point(parameter pt2).
   *
   * @param {Point} pt1 The first point.
   * @param {Point} pt2 The second point.
   * @param {number} f   The level of interpolation between the two points. Indicates
   *            where the new point will be, along the line between
   *            pt1 and pt2. If f=1,
   *            pt1 is returned; if f=0,
   *            pt2 is returned.
   * @return {Point} The new, interpolated point.
   */
  static interpolate(pt1, pt2, f) {
    return new Point(pt2.x + (pt1.x - pt2.x) * f, pt2.y + (pt1.y - pt2.y) * f);
  }

  /**
   * Converts a pair of polar coordinates to a Cartesian point coordinate.
   *
   * @param {number} len   The length coordinate of the polar pair.
   * @param {number} angle The angle, in radians, of the polar pair.
   * @return {Point} The Cartesian point.
   */
  static polar(len, angle) {
    return new Point(len * Math.cos(angle), len * Math.sin(angle));
  }

  distanceTo(otherPoint) {
    const distance = Math.sqrt(
      (otherPoint.x - this.x) * (otherPoint.x - this.x) +
      (otherPoint.y - this.y) * (otherPoint.y - this.y)
    );
    return distance;
  }

  distance() {
    const distanceVal = Math.sqrt(
      (this.x * this.x) +
      (this.y * this.y)
    );
    return distanceVal;
  }

  lerp(other, ratio) {
    const xVal = this.x + ((other.x - this.x) * ratio);
    const yVal = this.y + ((other.y - this.y) * ratio);
    return new Point(xVal, yVal);
  }

  // Mutating Methods
  translate(x, y) {
    this.x += x;
    this.y += y;
    return this;
  }

  static toNumbers(pts) {
    const coords = [];
    pts.forEach((pt) => {
      coords.push(pt.x);
      coords.push(pt.y);
    });
    return coords;
  }

  static toPoints(coords) {
    if (coords.length % 2 != 0) {
      throw new Error(`Should have even number of values to convert to point`);
    }
    const points = [];
    for (let i = 0; i < coords.length; i += 2) {
      points.push(new Point(coords[i], coords[i + 1]));
    }
    return points;
  }
}