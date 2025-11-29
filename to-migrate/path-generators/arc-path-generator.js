export class ArcPathGenerator {
  static generate(start, end, rx, ry, largeflag = 1, sweepflag = 0) {
    return `M${start.x},${start.y}
    A${rx},${ry} 0 ${largeflag},${sweepflag} ${end.x},${end.y}`;
  }
}