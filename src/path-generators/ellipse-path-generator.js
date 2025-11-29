export class EllipsePathGenerator {
  static generate(cx, cy, rx, ry) {
    const d = [
      'M', cx - rx, cy,
      'A', rx, ry, 0, 0, 0, cx + rx, cy,
      'A', rx, ry, 0, 0, 0, cx - rx, cy,
      'z'
    ];
    return d.join(" ");
  }
}