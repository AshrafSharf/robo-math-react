import { TweenablePath } from '../animator/tweenable-path.js';
import { IdUtil } from '../utils/id-util.js';

/**
 * MathTextUnderbraceShape - A curly brace shape below math text
 *
 * Draws a horizontal curly brace with:
 * - Left curl curving down
 * - Horizontal line to center
 * - Center peak pointing down
 * - Horizontal line to right
 * - Right curl curving up
 *
 * Renders into annotation layer SVG using pixel coordinates.
 * Supports pen-traced animation via TweenablePath.
 */
export class MathTextUnderbraceShape {
  /**
   * @param {SVGSVGElement} svgElement - The annotation layer SVG to render into
   * @param {{x: number, y: number, width: number, height: number}|Bounds2} bounds - Text bounds in pixels
   * @param {Object} options - Styling options
   * @param {string} options.stroke - Stroke color (default: '#333')
   * @param {number} options.strokeWidth - Stroke width (default: 2)
   * @param {number} options.buffer - Space between text and brace (default: 5)
   * @param {number} options.curveHeight - Height of the brace curves (default: 8)
   */
  constructor(svgElement, bounds, options = {}) {
    this.svgElement = svgElement;
    this.bounds = bounds;
    this.id = `math-text-underbrace_${IdUtil.getID()}`;

    this.buffer = options.buffer ?? 5;
    this.curveHeight = options.curveHeight ?? 8;

    // Styling
    this.styleObj = {
      'stroke': options.stroke || '#333',
      'stroke-width': options.strokeWidth || 2,
      'fill': 'none',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    };

    // SVG elements
    this.shapeGroup = null;
    this.pathElement = null;
  }

  /**
   * Create the SVG elements
   */
  create() {
    this.doCreate();
  }

  doCreate() {
    // Create a group element
    this.shapeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.shapeGroup.setAttribute('id', this.id);

    // Create path element
    this.pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Generate the underbrace path
    this.generatePath();

    // Apply styles
    Object.entries(this.styleObj).forEach(([key, value]) => {
      this.pathElement.setAttribute(key, value);
    });

    // Add path to group
    this.shapeGroup.appendChild(this.pathElement);

    // Add group to SVG
    this.svgElement.appendChild(this.shapeGroup);

    // Initially hidden
    this.hide();
  }

  /**
   * Generate the underbrace path string
   * Creates a curly brace shape below the bounds
   */
  generatePath() {
    const x = this.bounds.x ?? this.bounds.minX;
    const y = this.bounds.y ?? this.bounds.minY;
    const width = this.bounds.width;
    const height = this.bounds.height;

    // Brace sits below the text
    const braceY = y + height + this.buffer;
    const curveH = this.curveHeight;
    const midX = x + width / 2;

    // Curl radius - proportional to curve height
    const curlRadius = Math.min(curveH, width / 6);

    // Build path:
    // Start at left edge, curve down, horizontal to center, peak down, horizontal to right, curve up
    const pathStr = [
      // Start at left top
      `M ${x},${braceY}`,
      // Left curl going down (quadratic bezier)
      `Q ${x},${braceY + curveH} ${x + curlRadius},${braceY + curveH}`,
      // Horizontal line to just before center
      `L ${midX - curlRadius},${braceY + curveH}`,
      // Center peak going down (quadratic bezier down)
      `Q ${midX},${braceY + curveH} ${midX},${braceY + curveH * 1.5}`,
      // Center peak coming up (quadratic bezier up)
      `Q ${midX},${braceY + curveH} ${midX + curlRadius},${braceY + curveH}`,
      // Horizontal line to just before right
      `L ${x + width - curlRadius},${braceY + curveH}`,
      // Right curl going up (quadratic bezier)
      `Q ${x + width},${braceY + curveH} ${x + width},${braceY}`
    ].join(' ');

    this.pathElement.setAttribute('d', pathStr);
  }

  /**
   * Render end state (show with full stroke)
   */
  renderEndState() {
    this.doRenderEndState();
  }

  doRenderEndState() {
    this.enableStroke();
    this.show();
  }

  /**
   * Render with pen animation
   * @param {Object} penStartPoint - Starting point for pen (optional)
   * @param {Function} completionHandler - Called when animation completes
   */
  renderWithAnimation(penStartPoint, completionHandler) {
    try {
      const onComplete = () => {
        this.enableStroke();
        completionHandler();
      };

      const tweenablePath = new TweenablePath(this.pathElement);
      this.show();
      this.disableStroke();
      tweenablePath.setSlow();
      tweenablePath.tween(
        onComplete,
        penStartPoint,
        () => this.enableStroke(),
        null
      );
    } catch (e) {
      console.error('MathTextUnderbraceShape: Animation error', e);
      completionHandler();
    }
  }

  /**
   * Hide stroke during animation
   */
  disableStroke() {
    this.pathElement.setAttribute('stroke-dasharray', '0,10000');
  }

  /**
   * Show full stroke after animation
   */
  enableStroke() {
    this.pathElement.setAttribute('stroke-dasharray', '0,0');
  }

  /**
   * Show the shape
   */
  show() {
    if (this.shapeGroup) {
      this.shapeGroup.style.display = '';
      this.shapeGroup.style.visibility = 'visible';
    }
  }

  /**
   * Hide the shape
   */
  hide() {
    if (this.shapeGroup) {
      this.shapeGroup.style.display = 'none';
    }
  }

  /**
   * Remove from DOM
   */
  remove() {
    if (this.shapeGroup && this.shapeGroup.parentNode) {
      this.shapeGroup.parentNode.removeChild(this.shapeGroup);
    }
    this.shapeGroup = null;
    this.pathElement = null;
  }

  /**
   * Update styling
   * @param {Object} newStyleObj - New style properties
   */
  setStyle(newStyleObj) {
    this.styleObj = Object.assign(this.styleObj, newStyleObj);
    if (this.pathElement) {
      Object.entries(this.styleObj).forEach(([key, value]) => {
        this.pathElement.setAttribute(key, value);
      });
    }
  }

  /**
   * Get shape type identifier
   */
  getShapeType() {
    return 'math-text-underbrace';
  }

  /**
   * Get the path element
   */
  getPathElement() {
    return this.pathElement;
  }

  /**
   * Get shape containers
   */
  getShapeContainers() {
    return [this.shapeGroup];
  }
}
