import { TweenablePath } from '../animator/tweenable-path.js';
import { IdUtil } from '../utils/id-util.js';
import { Bounds2 } from '../geom/Bounds2.js';

/**
 * MathTextCancelShape - A cancel strikethrough shape for math text
 *
 * Draws diagonal line(s) over text bounds:
 * - 'u' (cancel): bottom-left to top-right
 * - 'd' (bcancel): top-left to bottom-right
 * - 'x' (xcancel): both diagonals
 *
 * Renders into annotation layer SVG using pixel coordinates.
 * Supports pen-traced animation via TweenablePath.
 */
export class MathTextCancelShape {
  /**
   * @param {SVGSVGElement} svgElement - The annotation layer SVG to render into
   * @param {{x: number, y: number, width: number, height: number}|Bounds2} bounds - Cancel bounds in pixels
   * @param {Object} options - Styling options
   * @param {string} options.direction - 'u' (up/cancel), 'd' (down/bcancel), 'x' (xcancel)
   * @param {string} options.stroke - Stroke color (default: 'red')
   * @param {number} options.strokeWidth - Stroke width (default: 2)
   */
  constructor(svgElement, bounds, options = {}) {
    this.svgElement = svgElement;
    this.bounds = bounds;
    this.id = `math-text-cancel_${IdUtil.getID()}`;

    this.direction = options.direction || 'u';

    // Styling
    this.styleObj = {
      'stroke': options.stroke || 'red',
      'stroke-width': options.strokeWidth || 2,
      'fill': 'none',
      'stroke-linecap': 'round'
    };

    // SVG elements
    this.shapeGroup = null;
    this.pathElements = [];
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

    // Get bounds values
    const x = this.bounds.x ?? this.bounds.minX;
    const y = this.bounds.y ?? this.bounds.minY;
    const width = this.bounds.width;
    const height = this.bounds.height;

    // Generate path(s) based on direction
    const paths = this._generatePaths(x, y, width, height);

    paths.forEach(pathStr => {
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', pathStr);

      // Apply styles
      Object.entries(this.styleObj).forEach(([key, value]) => {
        pathElement.setAttribute(key, value);
      });

      this.shapeGroup.appendChild(pathElement);
      this.pathElements.push(pathElement);
    });

    // Add group to SVG
    this.svgElement.appendChild(this.shapeGroup);

    // Initially hidden
    this.hide();
  }

  /**
   * Generate path strings based on direction
   */
  _generatePaths(x, y, width, height) {
    const paths = [];

    // Up diagonal (cancel): bottom-left to top-right
    if (this.direction === 'u' || this.direction === 'x') {
      paths.push(`M ${x},${y + height} L ${x + width},${y}`);
    }

    // Down diagonal (bcancel): top-left to bottom-right
    if (this.direction === 'd' || this.direction === 'x') {
      paths.push(`M ${x},${y} L ${x + width},${y + height}`);
    }

    return paths;
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
      let completedCount = 0;
      const totalPaths = this.pathElements.length;

      const onPathComplete = () => {
        completedCount++;
        if (completedCount >= totalPaths) {
          this.enableStroke();
          completionHandler();
        }
      };

      this.show();
      this.disableStroke();

      // Animate each path
      this.pathElements.forEach(pathElement => {
        const tweenablePath = new TweenablePath(pathElement);
        tweenablePath.setSlow();
        tweenablePath.tween(
          onPathComplete,
          penStartPoint,
          () => this._enablePathStroke(pathElement),
          null
        );
      });
    } catch (e) {
      console.error('MathTextCancelShape: Animation error', e);
      completionHandler();
    }
  }

  /**
   * Hide stroke during animation
   */
  disableStroke() {
    this.pathElements.forEach(path => {
      path.setAttribute('stroke-dasharray', '0,10000');
    });
  }

  /**
   * Show full stroke after animation
   */
  enableStroke() {
    this.pathElements.forEach(path => {
      this._enablePathStroke(path);
    });
  }

  _enablePathStroke(pathElement) {
    pathElement.setAttribute('stroke-dasharray', '0,0');
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
    this.pathElements = [];
  }

  /**
   * Update styling
   * @param {Object} newStyleObj - New style properties
   */
  setStyle(newStyleObj) {
    this.styleObj = Object.assign(this.styleObj, newStyleObj);
    this.pathElements.forEach(pathElement => {
      Object.entries(this.styleObj).forEach(([key, value]) => {
        pathElement.setAttribute(key, value);
      });
    });
  }

  /**
   * Get shape type identifier
   */
  getShapeType() {
    return 'math-text-cancel';
  }

  /**
   * Get the path elements
   */
  getPathElements() {
    return this.pathElements;
  }

  /**
   * Get shape containers
   */
  getShapeContainers() {
    return [this.shapeGroup];
  }
}
