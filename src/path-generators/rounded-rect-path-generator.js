export class RoundedRectPathGenerator {
  generate(x, y, w, h, rx = 20, ry = 20) {
    if (rx < 0) rx = 0;
    if (ry < 0) ry = 0;
    rx = rx || ry;
    ry = ry || rx;
    if (rx > w / 2) rx = w / 2;
    if (ry > h / 2) ry = h / 2;

    const d = [
      'M', rx + x, y,
      'h', w - 2 * rx,
      'a', rx, ry, 0, 0, 1, rx, ry,
      'v', h - 2 * ry,
      'a', rx, ry, 0, 0, 1, -rx, ry,
      'h', -w + 2 * rx,
      'a', rx, ry, 0, 0, 1, -rx, -ry,
      'v', -h + 2 * ry,
      'a', rx, ry, 0, 0, 1, rx, -ry,
      'z'
    ];

    return d.join(" ");
  }
}