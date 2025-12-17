/**
 * FocusIndicator2D - SVG arrow indicator for 2D shapes
 *
 * Draws a simple line with arrowhead pointing to the focused shape's anchor.
 * Pure SVG manipulation, no framework dependencies.
 */
export class FocusIndicator2D {
  constructor() {
    this.group = null;
    this.line = null;
    this.arrowhead = null;
    this.annotationLayer = null;

    // Arrow styling
    this.strokeColor = '#0066cc';
    this.strokeWidth = 3;
    this.arrowSize = 18;

    // Arrow length (shaft length)
    this.arrowLength = 10;

    // Offset from target (gap between arrowhead tip and shape)
    this.targetOffset = 10;

    // Current arrow angle (randomized on each update)
    this.currentAngle = -Math.PI / 4;
  }

  /**
   * Create SVG elements and add to annotation layer
   * @param {SVGElement} annotationLayer - The annotation SVG layer
   */
  create(annotationLayer) {
    if (!annotationLayer) return;

    this.annotationLayer = annotationLayer;
    const svgNS = 'http://www.w3.org/2000/svg';

    // Create defs (gradient and filter)
    this._createDefs(annotationLayer);

    // Create group container
    this.group = document.createElementNS(svgNS, 'g');
    this.group.setAttribute('class', 'focus-indicator');
    this.group.setAttribute('filter', 'url(#focus-indicator-shadow)');

    // Create line (shaft)
    this.line = document.createElementNS(svgNS, 'line');
    this.line.setAttribute('stroke', '#ff6b6b');
    this.line.setAttribute('stroke-width', this.strokeWidth);
    this.line.setAttribute('stroke-linecap', 'round');

    // Create arrowhead (triangle polygon) with gradient
    this.arrowhead = document.createElementNS(svgNS, 'polygon');
    this.arrowhead.setAttribute('fill', 'url(#focus-indicator-gradient)');

    // Assemble
    this.group.appendChild(this.line);
    this.group.appendChild(this.arrowhead);
    annotationLayer.appendChild(this.group);
  }

  /**
   * Create SVG defs (gradient and filter)
   * @param {SVGElement} svg - The SVG element
   * @private
   */
  _createDefs(svg) {
    const svgNS = 'http://www.w3.org/2000/svg';

    // Create or get defs element
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(svgNS, 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    // Create gradient if not exists
    if (!svg.querySelector('#focus-indicator-gradient')) {
      const gradient = document.createElementNS(svgNS, 'linearGradient');
      gradient.setAttribute('id', 'focus-indicator-gradient');
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '100%');

      const stop1 = document.createElementNS(svgNS, 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', '#ff6b6b');

      const stop2 = document.createElementNS(svgNS, 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', '#ee5a24');

      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);
    }

    // Create drop shadow filter if not exists
    if (!svg.querySelector('#focus-indicator-shadow')) {
      const filter = document.createElementNS(svgNS, 'filter');
      filter.setAttribute('id', 'focus-indicator-shadow');
      filter.setAttribute('x', '-100%');
      filter.setAttribute('y', '-100%');
      filter.setAttribute('width', '300%');
      filter.setAttribute('height', '300%');

      // Stronger drop shadow
      const feDropShadow = document.createElementNS(svgNS, 'feDropShadow');
      feDropShadow.setAttribute('dx', '3');
      feDropShadow.setAttribute('dy', '3');
      feDropShadow.setAttribute('stdDeviation', '4');
      feDropShadow.setAttribute('flood-color', '#000');
      feDropShadow.setAttribute('flood-opacity', '0.5');

      filter.appendChild(feDropShadow);
      defs.appendChild(filter);
    }
  }

  /**
   * Update arrow position to point at target
   * @param {number} targetX - Target X coordinate (canvas-relative)
   * @param {number} targetY - Target Y coordinate (canvas-relative)
   */
  update(targetX, targetY) {
    if (!this.line || !this.arrowhead) return;

    // Arrow points straight down (direction vector pointing down)
    const nx = 0;
    const ny = 1;

    // Arrow tip is at target position (or slightly above with offset)
    const tipX = targetX;
    const tipY = targetY - this.targetOffset;

    // Line starts above, ends at arrowhead base (which is above tip)
    const startX = tipX;
    const startY = tipY - this.arrowLength - this.arrowSize;
    const lineEndX = tipX;
    const lineEndY = tipY - this.arrowSize;

    this.line.setAttribute('x1', startX);
    this.line.setAttribute('y1', startY);
    this.line.setAttribute('x2', lineEndX);
    this.line.setAttribute('y2', lineEndY);

    // Calculate arrowhead points - pointing downward
    const arrowPoints = this._calculateArrowheadDown(tipX, tipY);
    this.arrowhead.setAttribute('points', arrowPoints);
  }

  /**
   * Calculate arrowhead polygon points for downward-pointing arrow
   * @param {number} tipX - Arrow tip X
   * @param {number} tipY - Arrow tip Y
   * @returns {string} SVG points string
   * @private
   */
  _calculateArrowheadDown(tipX, tipY) {
    const halfWidth = this.arrowSize * 0.5;
    // Base is above the tip
    const baseY = tipY - this.arrowSize;

    // Three points: tip (bottom), left wing (top-left), right wing (top-right)
    const points = [
      `${tipX},${tipY}`,
      `${tipX - halfWidth},${baseY}`,
      `${tipX + halfWidth},${baseY}`
    ];

    return points.join(' ');
  }

  /**
   * Set the origin point for the arrow
   * @param {number} x - Origin X coordinate
   * @param {number} y - Origin Y coordinate
   */
  setOrigin(x, y) {
    this.originX = x;
    this.originY = y;
  }

  /**
   * Set arrow styling
   * @param {Object} style - Style options
   * @param {string} [style.color] - Stroke and fill color
   * @param {number} [style.strokeWidth] - Line width
   * @param {number} [style.arrowSize] - Arrowhead size
   */
  setStyle({ color, strokeWidth, arrowSize }) {
    if (color) {
      this.strokeColor = color;
      if (this.line) this.line.setAttribute('stroke', color);
      if (this.arrowhead) this.arrowhead.setAttribute('fill', color);
    }
    if (strokeWidth) {
      this.strokeWidth = strokeWidth;
      if (this.line) this.line.setAttribute('stroke-width', strokeWidth);
    }
    if (arrowSize) {
      this.arrowSize = arrowSize;
    }
  }

  /**
   * Show the indicator
   */
  show() {
    if (this.group) {
      this.group.style.display = '';
    }
  }

  /**
   * Hide the indicator
   */
  hide() {
    if (this.group) {
      this.group.style.display = 'none';
    }
  }

  /**
   * Remove indicator from DOM
   */
  remove() {
    if (this.group && this.group.parentNode) {
      this.group.parentNode.removeChild(this.group);
    }
    this.group = null;
    this.line = null;
    this.arrowhead = null;
    this.annotationLayer = null;
  }

  /**
   * Check if indicator is attached to DOM
   * @returns {boolean}
   */
  isAttached() {
    return this.group !== null && this.group.parentNode !== null;
  }
}
