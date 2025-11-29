export class RectPathGenerator {
  generate(dimensions) {
    const x_offset = dimensions.x || 0;
    const y_offset = dimensions.y || 0;
    const upper_left = `M ${x_offset},${y_offset}`;
    const upper_right = `l ${dimensions.width},0`;
    const lower_right = `l 0,${dimensions.height}`;
    const lower_left = `l ${dimensions.width * -1},0`;
    const close = 'z';
    
    const path_string = [
      upper_left,
      upper_right,
      lower_right,
      lower_left,
      close
    ].join(' ');
    
    return path_string;
  }
}