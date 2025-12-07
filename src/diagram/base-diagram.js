/**
 * BaseDiagram - Abstract base class for StaticDiagram and AnimatedDiagram
 * Contains common code shared between static and animated diagram implementations
 */

import { MathTextComponent } from '../mathtext/components/math-text-component.js';
import { parseColor } from './style_helper.js';
import { Grapher } from '../blocks/grapher.js';

export class BaseDiagram {
  /**
   * @param {Object} coordinateMapper - Coordinate mapper for logical to pixel conversion
   * @param {HTMLElement} canvasSection - Parent DOM element for rendering
   * @param {Object} roboCanvas - RoboCanvas instance for auto-scrolling
   * @param {Object} options - Additional options
   */
  constructor(coordinateMapper, canvasSection, roboCanvas, options = {}) {
    this.coordinateMapper = coordinateMapper;
    this.canvasSection = canvasSection;
    this.roboCanvas = roboCanvas;
    this.options = options;

    // Track objects for utility methods
    this.objects = [];

    // Track graph containers created by graphContainer() method
    this.graphContainers = [];
  }

  // ============= PROTECTED METHODS (for use by subclasses) =============

  /**
   * Apply common styling to a shape
   * @protected
   */
  _applyStyle(shape, color, options = {}) {
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(parseColor(options.fill));
  }

  /**
   * Create a MathTextComponent (hidden by default with stroke disabled)
   * @param {string} text - LaTeX mathematical expression
   * @param {number} col - Logical column coordinate
   * @param {number} row - Logical row coordinate
   * @param {Object} options - Rendering options {fontSize, stroke, fill}
   * @returns {MathTextComponent} Math text component (hidden)
   * @protected
   */
  _createMathText(text, col, row, options = {}) {
    const mathComponent = new MathTextComponent(
      text,
      col,
      row,
      this.coordinateMapper,
      this.canvasSection,
      {
        fontSize: options.fontSize || 32,
        stroke: options.stroke || '#000000',
        fill: options.fill || '#000000'
      }
    );

    mathComponent.hide();
    mathComponent.disableStroke();

    return mathComponent;
  }

  /**
   * Create an angle shape (without rendering)
   * @protected
   */
  _createAngle(graphContainer, vertex, point1, point2, angleType, color, options = {}) {
    const shape = graphContainer.angle(vertex, point1, point2, angleType, options);
    shape.stroke(parseColor(color));
    shape.fill(parseColor(options.fill || color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    return shape;
  }

  /**
   * Create a point shape (without rendering)
   * @protected
   */
  _createPoint(graphContainer, position, color, options = {}) {
    const shape = graphContainer.point(position.x, position.y, options.radius || 4);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create a line shape (without rendering)
   * @protected
   */
  _createLine(graphContainer, start, end, color, options = {}) {
    const shape = graphContainer.line(start.x, start.y, end.x, end.y);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create an arc shape (without rendering)
   * @protected
   */
  _createArc(graphContainer, start, end, rx, ry, color, options = {}) {
    const shape = graphContainer.arc(start, end, rx, ry);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create a curve shape (without rendering)
   * @protected
   */
  _createCurve(graphContainer, type, points, color, options = {}) {
    const coords = [];
    points.forEach(p => {
      coords.push(p.x, p.y);
    });
    const shape = graphContainer.curve(type, ...coords);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create a plot shape (without rendering)
   * @protected
   */
  _createPlot(graphContainer, equation, domainMin, domainMax, color, options = {}) {
    const shape = graphContainer.plot(equation, domainMin, domainMax);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create a circle shape (without rendering)
   * @protected
   */
  _createCircle(graphContainer, center, radius, color, options = {}) {
    const shape = graphContainer.circle(center.x, center.y, radius, options);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create an ellipse shape (without rendering)
   * @protected
   */
  _createEllipse(graphContainer, center, rx, ry, color, options = {}) {
    const shape = graphContainer.ellipse(center.x, center.y, rx, ry, options);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create a polygon shape (without rendering)
   * @protected
   */
  _createPolygon(graphContainer, vertices, color, options = {}) {
    const coords = [];
    vertices.forEach(v => {
      coords.push(v.x, v.y);
    });
    const shape = graphContainer.polygon(...coords, options);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create a vector shape (without rendering)
   * @protected
   */
  _createVector(graphContainer, start, end, color, options = {}) {
    const shape = graphContainer.vector(start.x, start.y, end.x, end.y);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create an arrow shape (without rendering)
   * @protected
   */
  _createArrow(graphContainer, start, end, color, options = {}) {
    const shape = graphContainer.arrow(
      start.x,
      start.y,
      end.x,
      end.y,
      options.angle || Math.PI,
      options.clockwise !== undefined ? options.clockwise : true
    );
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create a measurement indicator shape (without rendering)
   * @protected
   */
  _createMeasurementIndicator(graphContainer, start, end, color, options = {}) {
    const shape = graphContainer.measurementIndicator(start.x, start.y, end.x, end.y, options);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create a dashed vector shape (without rendering)
   * @protected
   */
  _createDashedVector(graphContainer, start, end, color, options = {}) {
    const shape = graphContainer.vector(start.x, start.y, end.x, end.y);
    this._applyStyle(shape, color, options);
    const dashPattern = options.dashPattern || '5,3';
    shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    return shape;
  }

  /**
   * Create a parametric plot shape (without rendering)
   * @protected
   */
  _createParametricPlot(graphContainer, xFunction, yFunction, tMin, tMax, color, options = {}) {
    const shape = graphContainer.parametricPlot(xFunction, yFunction, tMin, tMax);
    this._applyStyle(shape, color, options);
    return shape;
  }

  /**
   * Create a LaTeX/TeX to SVG shape (without rendering)
   * @protected
   */
  _createTexToSvg(graphContainer, position, latexString, color, options = {}) {
    const shape = graphContainer.latex(position.x, position.y, latexString, options);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    return shape;
  }

  /**
   * Create a label at a specific point (without rendering)
   * @protected
   */
  _createLabelOnPoint(graphContainer, point, latexString, color, options = {}) {
    const shape = graphContainer.latex(point.x, point.y, latexString, options);
    shape.fill(parseColor(color));
    shape.stroke('none');
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    // Apply rotation if specified
    if (options.rotation !== undefined) {
      shape.shapeGroup.transform({ rotation: options.rotation, cx: 0, cy: 0 });
    }

    // Apply perpendicular offset if specified
    if (options.offset !== undefined && options.offset !== 0) {
      const offsetX = options.offset * Math.cos((options.rotation || 0) + Math.PI / 2);
      const offsetY = options.offset * Math.sin((options.rotation || 0) + Math.PI / 2);
      shape.shapeGroup.move(point.x + offsetX, point.y + offsetY);
    }

    return shape;
  }

  /**
   * Create a label between two points (without rendering)
   * @protected
   */
  _createLabelBetweenPoints(graphContainer, start, end, latexString, color, options = {}) {
    // Calculate midpoint
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    // Calculate rotation angle in model coordinates, then flip sign for SVG
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const modelRotation = Math.atan2(dy, dx) * (180 / Math.PI);
    const svgRotation = -modelRotation;

    // Create the label at midpoint
    const shape = graphContainer.latex(midX, midY, latexString, options);
    shape.fill(parseColor(color));
    shape.stroke('none');
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    // Apply rotation with center at (0,0) relative to the element
    shape.shapeGroup.rotate(svgRotation, 0, 0);

    // Apply vertical offset after rotation (default 30px or user-specified)
    const verticalOffset = options.offset !== undefined ? options.offset : 30;
    if (verticalOffset !== 0) {
      shape.shapeGroup.dy(-verticalOffset);
    }

    return shape;
  }

  // ============= MATH TEXT WRITE METHODS =============

  /**
   * Show a math text component (no animation in base class)
   * @param {MathTextComponent} mathComponent - The math text component to show
   * @returns {BaseDiagram} - For chaining
   */
  write(mathComponent) {
    mathComponent.show();
    mathComponent.enableStroke();
    return this;
  }

  /**
   * Show everything except bbox-marked sections (no animation in base class)
   * @param {MathTextComponent} mathComponent - The math text component
   * @returns {BaseDiagram} - For chaining
   */
  writeWithout(mathComponent) {
    mathComponent.showWithoutBBox();
    return this;
  }

  /**
   * Show only bbox-marked sections (no animation in base class)
   * @param {MathTextComponent} mathComponent - The math text component
   * @param {boolean} includeAll - Whether to include all content (default: false)
   * @returns {BaseDiagram} - For chaining
   */
  writeOnly(mathComponent, includeAll = false) {
    mathComponent.showOnlyBBox(includeAll);
    return this;
  }

  // ============= OBJECT MANAGEMENT METHODS =============

  /**
   * Clear all shapes from the diagram
   */
  clearAll() {
    this.objects.forEach(obj => {
      if (obj.remove) {
        obj.remove();
      } else if (obj.hide) {
        obj.hide();
      }
    });
    this.objects = [];
  }

  /**
   * Hide all shapes
   */
  hideAll() {
    this.objects.forEach(obj => {
      if (obj.hide) {
        obj.hide();
      }
    });
  }

  /**
   * Show all shapes
   */
  showAll() {
    this.objects.forEach(obj => {
      if (obj.show) {
        obj.show();
      }
    });
  }

  /**
   * Get all created objects
   * @returns {Array} Array of shape objects
   */
  getObjects() {
    return this.objects;
  }

  // ============= STYLE HELPER METHODS =============

  /**
   * Parse color from name or hex string
   * Delegates to the style helper function
   * @param {string} color - Color name or hex string
   * @returns {string} Color value for SVG
   */
  parseColor(color) {
    return parseColor(color);
  }

  // ============= CELL CREATION METHODS (JUPYTER-STYLE) =============

  /**
   * Create a graph container cell at logical coordinates
   * Similar to creating a graph cell in a Jupyter notebook
   * @param {number} col - Logical column coordinate
   * @param {number} row - Logical row coordinate
   * @param {Object} options - Graph options {width, height, showGrid, xRange, yRange}
   * @returns {Grapher} Graph container instance for drawing
   */
  graphContainer(col, row, options = {}) {
    if (!this.coordinateMapper || !this.canvasSection) {
      throw new Error('graphContainer requires coordinateMapper and canvasSection to be initialized');
    }

    // Convert logical coordinates to pixel coordinates
    const pixelCoords = this.coordinateMapper.toPixel(col, row);

    // Create container div at position
    const containerDOM = document.createElement('div');
    containerDOM.style.position = 'absolute';
    containerDOM.style.left = pixelCoords.x + 'px';
    containerDOM.style.top = pixelCoords.y + 'px';
    containerDOM.style.width = (options.width || 600) + 'px';
    containerDOM.style.height = (options.height || 400) + 'px';
    this.canvasSection.appendChild(containerDOM);

    // Create Grapher instance in this container
    const grapher = new Grapher(containerDOM, {
      width: options.width || 600,
      height: options.height || 400,
      showGrid: options.showGrid !== false,
      xRange: options.xRange || [-10, 10],
      yRange: options.yRange || [-10, 10]
    });

    // Attach outer containerDOM for scrolling (grapher has its own inner containerDOM)
    grapher.containerDOM = containerDOM;

    // Track for cleanup
    this.graphContainers.push({ grapher, containerDOM });

    return grapher;
  }

  /**
   * Create mathematical text using MathJax rendering
   * Similar to creating a text cell in a Jupyter notebook
   * @param {string} text - LaTeX mathematical expression
   * @param {number} col - Logical column coordinate
   * @param {number} row - Logical row coordinate
   * @param {Object} options - Rendering options {fontSize, stroke, fill}
   * @returns {MathTextComponent} Math text component
   */
  mathText(text, col, row, options = {}) {
    const mathComponent = this._createMathText(text, col, row, options);
    this.objects.push(mathComponent);
    return mathComponent;
  }

  // ============= CLEANUP METHODS =============

  /**
   * Clear all shapes and clean up resources
   * Destroys all graphContainers created by this diagram
   */
  destroy() {
    // Clear all shapes first
    this.clearAll();

    // Destroy all graph containers
    this.graphContainers.forEach(gc => {
      gc.grapher.destroy();
      gc.containerDOM.parentNode.removeChild(gc.containerDOM);
    });
    this.graphContainers = [];

    // Clear references
    this.objects = [];
  }
}
