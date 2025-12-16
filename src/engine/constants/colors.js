/**
 * Default colors for cycling through when no color is explicitly specified.
 * These match the colors in the ColorPicker carousel.
 */
export const DEFAULT_COLORS = [
  '#DC3912',  // dark-red
  '#3366CC',  // blue
  '#109618',  // green
  '#FF9900',  // orange
  '#990099',  // purple
  '#0099C6',  // teal
  '#DD4477',  // pink
  '#6633CC',  // violet
  '#8B4513',  // brown
  '#4169E1',  // royal blue
  '#FF0000',  // red
  '#FFD700',  // yellow
  '#90EE90',  // light green
  '#FF00FF',  // magenta
  '#000000',  // black
];

/**
 * Get a color from the default color list by index (cycling)
 * @param {number} index - Command index
 * @returns {string} Hex color string
 */
export function getColorByIndex(index) {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}
