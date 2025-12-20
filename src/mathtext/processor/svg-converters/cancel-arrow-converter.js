/**
 * CancelArrowConverter - Processes cancel/menclose elements:
 *   1. Removes arrow head polygons (closed paths ending with Z)
 *   2. Shortens diagonal lines using a configurable strategy
 *
 * @example
 * // In jax-output-processor.js:
 * import { convertCancelArrows, setTrimStrategy } from './cancel-arrow-converter.js';
 * setTrimStrategy('fixed');  // or 'calculated', 'none'
 * convertCancelArrows(cheerio$, strokeWidth);
 */

// ============ CONFIGURATION ============

/**
 * Available trim strategies:
 * - 'fixed': Trim by fixed percentage (28%) from both ends - simple, tested
 * - 'calculated': Calculate trim based on arrow head size - more precise
 * - 'none': No trimming, just remove arrow heads
 */
let currentStrategy = 'calculated';

// Fixed strategy settings
const FIXED_TRIM_RATIO = 0.28;

/**
 * Set the trim strategy
 * @param {'fixed' | 'calculated' | 'none'} strategy
 */
export function setTrimStrategy(strategy) {
  if (['fixed', 'calculated', 'none'].includes(strategy)) {
    currentStrategy = strategy;
  }
}

/**
 * Get current trim strategy
 * @returns {string}
 */
export function getTrimStrategy() {
  return currentStrategy;
}

// ============ MAIN CONVERTER ============

/**
 * Process cancel elements - remove arrow heads and shorten lines
 * @param {CheerioStatic} cheerio$ - Cheerio instance
 * @param {number} strokeWidth - Stroke width (unused, kept for API consistency)
 */
export function convertCancelArrows(cheerio$, strokeWidth) {
  // First pass: collect arrow head info for 'calculated' strategy
  const arrowHeads = [];

  cheerio$('.mjx-svg-menclose path').each(function () {
    const $path = cheerio$(this);
    const d = $path.attr('d');
    if (!d) return;

    if (d.trim().toUpperCase().endsWith('Z')) {
      // Store arrow head bounds before removing
      if (currentStrategy === 'calculated') {
        const bounds = parsePolygonBounds(d);
        if (bounds) arrowHeads.push(bounds);
      }
      $path.remove();
    }
  });

  // Second pass: shorten lines
  if (currentStrategy === 'none') return;

  cheerio$('.mjx-svg-menclose path').each(function () {
    const $path = cheerio$(this);
    const d = $path.attr('d');
    if (!d) return;

    let trimmed;
    if (currentStrategy === 'calculated' && arrowHeads.length > 0) {
      trimmed = shortenLineByArrowSize(d, arrowHeads);
    } else {
      trimmed = shortenLineFixed(d, FIXED_TRIM_RATIO);
    }

    if (trimmed) {
      $path.attr('d', trimmed);
    }
  });
}

// ============ STRATEGY: FIXED ============

/**
 * Strategy 'fixed': Trim by fixed percentage from both ends
 * Simple and tested - works well for typical use cases
 */
function shortenLineFixed(d, ratio) {
  const match = d.match(/M\s*([-\d.]+)[\s,]+([-\d.]+)\s*L\s*([-\d.]+)[\s,]+([-\d.]+)/i);
  if (!match) return null;

  const x1 = parseFloat(match[1]);
  const y1 = parseFloat(match[2]);
  const x2 = parseFloat(match[3]);
  const y2 = parseFloat(match[4]);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const halfRatio = ratio / 2;

  const newX1 = x1 + dx * halfRatio;
  const newY1 = y1 + dy * halfRatio;
  const newX2 = x2 - dx * halfRatio;
  const newY2 = y2 - dy * halfRatio;

  return `M ${newX1} ${newY1} L ${newX2} ${newY2}`;
}

// ============ STRATEGY: CALCULATED ============

/**
 * Parse polygon path to get bounding box
 * @param {string} d - Polygon path data (e.g., "M x1 y1 L x2 y2 L x3 y3 Z")
 * @returns {{minX, minY, maxX, maxY, width, height}|null}
 */
function parsePolygonBounds(d) {
  const coords = [];
  const regex = /([ML])\s*([-\d.]+)[\s,]+([-\d.]+)/gi;
  let match;

  while ((match = regex.exec(d)) !== null) {
    coords.push({ x: parseFloat(match[2]), y: parseFloat(match[3]) });
  }

  if (coords.length < 3) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of coords) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  return {
    minX, minY, maxX, maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Strategy 'calculated': Trim based on actual arrow head size
 * More precise but depends on arrow head being parsed correctly
 */
function shortenLineByArrowSize(d, arrowHeads) {
  const match = d.match(/M\s*([-\d.]+)[\s,]+([-\d.]+)\s*L\s*([-\d.]+)[\s,]+([-\d.]+)/i);
  if (!match) return null;

  const x1 = parseFloat(match[1]);
  const y1 = parseFloat(match[2]);
  const x2 = parseFloat(match[3]);
  const y2 = parseFloat(match[4]);

  // Calculate line length
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lineLength = Math.sqrt(dx * dx + dy * dy);

  // Use average arrow head diagonal as trim amount
  let totalArrowSize = 0;
  for (const ah of arrowHeads) {
    const arrowDiag = Math.sqrt(ah.width * ah.width + ah.height * ah.height);
    totalArrowSize += arrowDiag;
  }
  const avgArrowSize = totalArrowSize / arrowHeads.length;

  // Trim arrow size from end, plus small amount from start for balance
  const endTrim = avgArrowSize / lineLength;
  const startTrim = endTrim * 0.3; // 30% of end trim for balance

  const newX1 = x1 + dx * startTrim;
  const newY1 = y1 + dy * startTrim;
  const newX2 = x2 - dx * endTrim;
  const newY2 = y2 - dy * endTrim;

  return `M ${newX1} ${newY1} L ${newX2} ${newY2}`;
}
