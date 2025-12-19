/**
 * SVG Converters Module
 *
 * Post-processors that convert MathJax SVG elements to strokeable paths
 * suitable for pen animation.
 *
 * @example
 * import { runAllConverters } from './svg-converters/index.js';
 * runAllConverters(cheerio$, strokeWidth);
 */

import { convertRectsToPath, convertLinesToPath } from './rect-to-path-converter.js';
import { convertPolygonsToPath } from './polygon-to-path-converter.js';
import { convertEllipsesToPath, convertCirclesToPath } from './ellipse-to-path-converter.js';
import { convertCancelArrows } from './cancel-arrow-converter.js';

// Re-export all converters
export {
  convertRectsToPath,
  convertLinesToPath,
  convertPolygonsToPath,
  convertEllipsesToPath,
  convertCirclesToPath,
  convertCancelArrows
};

/**
 * Run all SVG converters in sequence
 * @param {CheerioStatic} cheerio$ - Cheerio instance with SVG
 * @param {number} strokeWidth - Stroke width to apply
 */
export function runAllConverters(cheerio$, strokeWidth) {
  convertRectsToPath(cheerio$, strokeWidth);
  convertLinesToPath(cheerio$, strokeWidth);
  convertPolygonsToPath(cheerio$, strokeWidth);
  convertEllipsesToPath(cheerio$, strokeWidth);
  convertCirclesToPath(cheerio$, strokeWidth);
  convertCancelArrows(cheerio$, strokeWidth);
}
