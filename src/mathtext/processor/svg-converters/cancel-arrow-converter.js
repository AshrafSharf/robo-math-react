/**
 * CancelArrowConverter - Processes cancel/menclose elements:
 *   1. Removes arrow head polygons (closed paths ending with Z)
 *   2. Shortens diagonal lines that extended to the arrow tip
 *
 * @example
 * // In jax-output-processor.js:
 * import { convertCancelArrows } from './cancel-arrow-converter.js';
 * convertCancelArrows(cheerio$, strokeWidth);
 */

// How much to shorten the line (percentage of line length to trim from end)
const TRIM_RATIO = 0.28;

/**
 * Process cancel elements - remove arrow heads and shorten lines
 * @param {CheerioStatic} cheerio$ - Cheerio instance
 * @param {number} strokeWidth - Stroke width (unused, kept for API consistency)
 */
export function convertCancelArrows(cheerio$, strokeWidth) {
  cheerio$('.mjx-svg-menclose path').each(function () {
    const $path = cheerio$(this);
    const d = $path.attr('d');
    if (!d) return;

    // Remove closed polygons (arrow heads)
    if (d.trim().toUpperCase().endsWith('Z')) {
      $path.remove();
      return;
    }

    // Shorten open line paths (the diagonal strikes)
    // Format: "M x1 y1 L x2 y2" or similar
    const trimmed = shortenLinePath(d, TRIM_RATIO);
    if (trimmed) {
      $path.attr('d', trimmed);
    }
  });
}

/**
 * Shorten a line path by trimming from the end
 * @param {string} d - Path data string
 * @param {number} ratio - How much to trim (0.1 = 10% from end)
 * @returns {string|null} - Shortened path or null if not a simple line
 */
function shortenLinePath(d, ratio) {
  // Parse simple line: M x1 y1 L x2 y2 (with optional commas)
  const match = d.match(/M\s*([-\d.]+)[\s,]+([-\d.]+)\s*L\s*([-\d.]+)[\s,]+([-\d.]+)/i);
  if (!match) return null;

  const x1 = parseFloat(match[1]);
  const y1 = parseFloat(match[2]);
  const x2 = parseFloat(match[3]);
  const y2 = parseFloat(match[4]);

  // Shorten from BOTH ends to keep line centered
  const dx = x2 - x1;
  const dy = y2 - y1;
  const halfRatio = ratio / 2;

  // Trim start point (move towards end)
  const newX1 = x1 + dx * halfRatio;
  const newY1 = y1 + dy * halfRatio;

  // Trim end point (move towards start)
  const newX2 = x2 - dx * halfRatio;
  const newY2 = y2 - dy * halfRatio;

  return `M ${newX1} ${newY1} L ${newX2} ${newY2}`;
}
