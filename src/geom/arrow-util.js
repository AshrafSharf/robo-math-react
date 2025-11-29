import { Point } from './Point.js';

export class ArrowUtil {
  static getArrowPath(from, to, angle = Math.PI, clockwise = true) {
    angle = Math.min(Math.max(angle, 1e-6), Math.PI - 1e-6);

    function hypotenuse(a, b) {
      return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    }

    // get the chord length ("height" {h}) between points
    const h = hypotenuse(to.x - from.x, to.y - from.y);

    // get the distance at which chord of height h subtends {angle} radians
    const d = h / (2 * Math.tan(angle / 2));

    // get the radius {r} of the circumscribed circle
    const r = hypotenuse(d, h / 2);

    const path = "M " + from.x + "," + from.y
      + " a " + r + "," + r
      + " 0 0," + (clockwise ? "1" : "0") + " "
      + (to.x - from.x) + "," + (to.y - from.y);

    return path;
  }
}