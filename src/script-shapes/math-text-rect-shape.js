import { RectPathGenerator } from '../path-generators/rect-path-generator.js';
import { TweenablePath } from '../animator/tweenable-path.js';
import { IdUtil } from '../shared/utils/id-util.js';

/**
 * MathTextRectShape - A rectangle shape that renders inside a MathText SVG
 *
 * Unlike other shapes that render in grapher layers with model coordinates,
 * this shape renders directly into a MathText's SVG using pixel coordinates.
 * Supports pen-traced animation via TweenablePath.
 */
export class MathTextRectShape {
  /**
   * @param {SVGSVGElement} svgElement - The MathText's SVG element to render into
   * @param {{x: number, y: number, width: number, height: number}} bounds - Rectangle bounds in pixels (relative to SVG)
   * @param {Object} options - Styling options
   * @param {string} options.stroke - Stroke color (default: '#333')
   * @param {number} options.strokeWidth - Stroke width (default: 2)
   * @param {string} options.fill - Fill color (default: 'transparent')
   * @param {number} options.fillOpacity - Fill opacity (default: 0)
   * @param {number} options.padding - Padding around bounds (default: 2)
   */
  constructor(svgElement, bounds, options = {}) {
    this.svgElement = svgElement;
    this.bounds = bounds;
    this.id = `math-text-rect_${IdUtil.getID()}`;

    // Styling
    this.styleObj = {
      'stroke': options.stroke || '#333',
      'stroke-width': options.strokeWidth || 2,
      'fill': options.fill || 'transparent',
      'fill-opacity': options.fillOpacity || 0
    };

    this.padding = options.padding !== undefined ? options.padding : 2;

    // SVG elements (created in doCreate)
    this.shapeGroup = null;
    this.pathElement = null;
    this.pathGenerator = new RectPathGenerator();
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

    // Generate the rectangle path
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
   * Generate the rectangle path string
   */
  generatePath() {
    const dimensions = {
      x: this.bounds.x - this.padding,
      y: this.bounds.y - this.padding,
      width: this.bounds.width + (this.padding * 2),
      height: this.bounds.height + (this.padding * 2)
    };

    const pathStr = this.pathGenerator.generate(dimensions);
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
      console.error('MathTextRectShape: Animation error', e);
      completionHandler();
    }
  }

  /**
   * Hide stroke during animation (progressive reveal)
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
    return 'math-text-rect';
  }

  /**
   * Get the path element for effects
   */
  getPathElement() {
    return this.pathElement;
  }

  /**
   * Get shape containers (for compatibility)
   */
  getShapeContainers() {
    return [this.shapeGroup];
  }
}
