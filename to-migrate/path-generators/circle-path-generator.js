export class CirclePathGenerator {
  generate(options) {
    const cx = options.cx;
    const cy = options.cy;
    const myr = options.r;
    return `M${cx},${cy} ` +
      `m${-myr}, 0 ` +
      `a${myr},${myr} 0 1,0 ${myr * 2},0 ` +
      `a${myr},${myr} 0 1,0 ${-myr * 2},0Z`;
  }
}