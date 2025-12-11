/**
 * BaseDiagram2d - Abstract base class for StaticDiagram2d and AnimatedDiagram2d
 * Contains common code shared between static and animated 2D diagram implementations
 */

import { MathTextComponent } from '../mathtext/components/math-text-component.js';
import { parseColor } from './style_helper.js';
import { Grapher } from '../blocks/grapher.js';
import { compile } from 'mathjs';

export class BaseDiagram2d {
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
   * @param {number} row - Logical row coordinate
   * @param {number} col - Logical column coordinate
   * @param {Object} options - Rendering options {fontSize, stroke, fill}
   * @returns {MathTextComponent} Math text component (hidden)
   * @protected
   */
  _createMathText(text, row, col, options = {}) {
    const mathComponent = new MathTextComponent(
      text,
      row,
      col,
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
   * Compile a math expression string to a callable function
   * Uses math.js for parsing and evaluation
   * @param {string} expression - Math expression like "x^2 + sin(x)"
   * @param {string} variable - The independent variable (default: 'x')
   * @param {Object} scope - Variable substitutions like {a: 2, b: 3}
   * @returns {Function} A function that takes the variable value and returns result
   */
  compileExpression(expression, variable = 'x', scope = {}) {
    const compiled = compile(expression);
    return (value) => {
      const evalScope = { ...scope, [variable]: value };
      return compiled.evaluate(evalScope);
    };
  }

  /**
   * Create a plot from expression string (without rendering)
   * @protected
   */
  _createPlotFromExpression(graphContainer, expression, variable, scope, domainMin, domainMax, color, options = {}) {
    const func = this.compileExpression(expression, variable, scope);
    return this._createPlot(graphContainer, func, domainMin, domainMax, color, options);
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

  /**
   * Create a MathTextComponent label positioned on a grapher using model coordinates.
   * The label is absolutely positioned over the grapher with pen animation support.
   *
   * @param {Grapher} graphContainer - The grapher to position the label on
   * @param {Object} position - Position in model coordinates {x, y}
   * @param {string} latexString - LaTeX string to render
   * @param {string} color - Text color
   * @param {Object} options - Options {fontSize, background, offset}
   *   - fontSize: Font size in pixels (default: 22)
   *   - background: Background color (default: transparent)
   *   - offset: Pixel offset {x, y} from calculated position (default: {x: 0, y: 0})
   * @returns {MathTextComponent} Math text component (hidden, ready for animation)
   * @protected
   */
  _createLabel(graphContainer, position, latexString, color, options = {}) {
    // 1. Get grapher's top-left position relative to canvas
    const grapherOffsetLeft = graphContainer.containerDOM.offsetLeft;
    const grapherOffsetTop = graphContainer.containerDOM.offsetTop;

    // 2. Convert model coords to view coords within grapher
    const viewX = graphContainer.toViewX(position.x);
    const viewY = graphContainer.toViewY(position.y);

    // 3. Calculate absolute pixel position on canvas
    const absoluteX = grapherOffsetLeft + viewX + (options.offset?.x || 0);
    const absoluteY = grapherOffsetTop + viewY + (options.offset?.y || 0);

    // 4. Create a pass-through coordinateMapper that returns pixel coords directly
    // Note: MathTextComponent now expects (row, col) and toPixel returns {x, y}
    // Since we're passing pixel values directly, row->y and col->x
    const pixelCoordinateMapper = {
      toPixel: (row, col) => ({ x: col, y: row })
    };

    // 5. Create MathTextComponent at absolute pixel position (row=Y, col=X)
    const mathComponent = new MathTextComponent(
      latexString,
      absoluteY,  // row (Y position)
      absoluteX,  // col (X position)
      pixelCoordinateMapper,
      this.canvasSection,
      {
        fontSize: options.fontSize || 22,
        stroke: parseColor(color),
        fill: parseColor(color)
      }
    );

    // 6. Apply background if specified
    if (options.background) {
      mathComponent.style({
        'background-color': options.background,
        'padding': '2px 4px',
        'border-radius': '2px'
      });
    }

    // 7. Hide and disable stroke for animation
    mathComponent.hide();
    mathComponent.disableStroke();

    // 8. Track for cleanup
    this.objects.push(mathComponent);

    return mathComponent;
  }

  // ============= MATH TEXT WRITE METHODS =============

  /**
   * Show a math text component (no animation in base class)
   * @param {MathTextComponent} mathComponent - The math text component to show
   * @returns {BaseDiagram2d} - For chaining
   */
  write(mathComponent) {
    mathComponent.show();
    mathComponent.enableStroke();
    return this;
  }

  /**
   * Show everything except bbox-marked sections (no animation in base class)
   * @param {MathTextComponent} mathComponent - The math text component
   * @returns {BaseDiagram2d} - For chaining
   */
  writeWithout(mathComponent) {
    mathComponent.showWithoutBBox();
    return this;
  }

  /**
   * Show only bbox-marked sections (no animation in base class)
   * @param {MathTextComponent} mathComponent - The math text component
   * @param {boolean} includeAll - Whether to include all content (default: false)
   * @returns {BaseDiagram2d} - For chaining
   */
  writeOnly(mathComponent, includeAll = false) {
    mathComponent.showOnlyBBox(includeAll);
    return this;
  }

  // ============= OBJECT MANAGEMENT METHODS =============

  /**
   * Clear all shapes and graph containers from the diagram
   */
  clearAll() {
    // Clear shapes
    this.objects.forEach(obj => {
      if (obj.remove) {
        obj.remove();
      } else if (obj.hide) {
        obj.hide();
      }
    });
    this.objects = [];

    // Clear graph containers
    this.graphContainers.forEach(gc => {
      gc.grapher.destroy();
      if (gc.containerDOM && gc.containerDOM.parentNode) {
        gc.containerDOM.parentNode.removeChild(gc.containerDOM);
      }
    });
    this.graphContainers = [];
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
   * Create a graph container cell using logical coordinate bounds
   * Similar to creating a graph cell in a Jupyter notebook
   * @param {number} row1 - Start row (top)
   * @param {number} col1 - Start column (left)
   * @param {number} row2 - End row (bottom)
   * @param {number} col2 - End column (right)
   * @param {Object} options - Graph options {showGrid, xRange, yRange}
   * @returns {Grapher} Graph container instance for drawing
   */
  graphContainer(row1, col1, row2, col2, options = {}) {
    if (!this.coordinateMapper || !this.canvasSection) {
      throw new Error('graphContainer requires coordinateMapper and canvasSection to be initialized');
    }

    // Convert logical coordinates to pixel coordinates
    const pixelCoords = this.coordinateMapper.toPixel(row1, col1);

    // Calculate dimensions from logical bounds
    const unitSize = this.coordinateMapper.getLogicalUnitSize();
    const width = (col2 - col1) * unitSize.col;
    const height = (row2 - row1) * unitSize.row;

    console.log(`graphContainer: (${row1},${col1}) to (${row2},${col2}) -> pixel(${pixelCoords.x}, ${pixelCoords.y}), size(${width}x${height})`);

    // Create container div at position
    const containerDOM = document.createElement('div');
    containerDOM.id = `graph-container-${row1}-${col1}-${row2}-${col2}`;
    containerDOM.style.position = 'absolute';
    containerDOM.style.left = pixelCoords.x + 'px';
    containerDOM.style.top = pixelCoords.y + 'px';
    containerDOM.style.width = width + 'px';
    containerDOM.style.height = height + 'px';
    containerDOM.style.border = '1px solid red'; // Debug border
    this.canvasSection.appendChild(containerDOM);
    console.log(`graphContainer: appended to canvasSection, id=${this.canvasSection.id}`);

    // Create Grapher instance in this container
    const grapher = new Grapher(containerDOM, {
      width: width,
      height: height,
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
   * @param {number} row - Logical row coordinate
   * @param {number} col - Logical column coordinate
   * @param {Object} options - Rendering options {fontSize, stroke, fill}
   * @returns {MathTextComponent} Math text component
   */
  mathText(text, row, col, options = {}) {
    const mathComponent = this._createMathText(text, row, col, options);
    this.objects.push(mathComponent);
    return mathComponent;
  }

  /**
   * Create a MathTextComponent by cloning an existing MathTextComponent's SVG
   * Used by TransformCopy to create identical copies at different positions
   *
   * @param {MathTextComponent} sourceMathText - The source MathTextComponent to clone from
   * @param {number} row - Logical row coordinate for the clone
   * @param {number} col - Logical column coordinate for the clone
   * @returns {MathTextComponent} A new MathTextComponent with cloned SVG
   */
  mathTextFromClone(sourceMathText, row, col) {
    // Get source SVG element
    const sourceSvg = sourceMathText.getMathSVGRoot()[0];
    if (!sourceSvg) {
      console.error('mathTextFromClone: Source MathTextComponent has no SVG');
      return null;
    }

    // Convert logical coordinates to pixel coordinates
    const pixelCoords = this.coordinateMapper.toPixel(row, col);

    // Create clone using factory method, preserving source options
    const clonedComponent = MathTextComponent.fromSVGClone(
      sourceSvg,
      pixelCoords.x,
      pixelCoords.y,
      this.canvasSection,
      {
        fontSize: sourceMathText.fontSizeValue,
        stroke: sourceMathText.strokeColor,
        fill: sourceMathText.fillColor
      }
    );

    // Track for cleanup
    this.objects.push(clonedComponent);

    return clonedComponent;
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
      if (gc.containerDOM && gc.containerDOM.parentNode) {
        gc.containerDOM.parentNode.removeChild(gc.containerDOM);
      }
    });
    this.graphContainers = [];

    // Clear references
    this.objects = [];
  }
}
