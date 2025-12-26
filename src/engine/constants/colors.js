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

/**
 * Lighten a color by mixing with white
 * @param {string} color - Hex color or CSS color name
 * @param {number} amount - Amount to lighten (0-1), default 0.3
 * @returns {string} Lightened hex color
 */
export function lighten(color, amount = 0.3) {
  // Convert named colors or hex to RGB
  const rgb = parseColor(color);
  if (!rgb) return color;

  // Mix with white
  const r = Math.round(rgb.r + (255 - rgb.r) * amount);
  const g = Math.round(rgb.g + (255 - rgb.g) * amount);
  const b = Math.round(rgb.b + (255 - rgb.b) * amount);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Parse color string to RGB object
 * @param {string} color - Hex color or CSS color name
 * @returns {{r: number, g: number, b: number}|null}
 */
export function parseColor(color) {
  if (!color) return null;

  // Hex color
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  // Named colors (common ones)
  const namedColors = {
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
    yellow: { r: 255, g: 255, b: 0 },
    orange: { r: 255, g: 165, b: 0 },
    purple: { r: 128, g: 0, b: 128 },
    pink: { r: 255, g: 192, b: 203 },
    cyan: { r: 0, g: 255, b: 255 },
    magenta: { r: 255, g: 0, b: 255 },
    brown: { r: 139, g: 69, b: 19 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 }
  };

  return namedColors[color.toLowerCase()] || null;
}
