/**
 * StaticDiagram2d class for 2D visualizations
 * Provides a clean API with dictionary-style parameters
 * All shapes render instantly (non-animated)
 */

import { BaseDiagram2d } from './base-diagram-2d.js';
import {
  parseColor,
  DEFAULT_SHAPE_COLORS
} from './style_helper.js';
import { ParallelogramPrimitiveShape } from '../script-shapes/parallelogram-primitive-shape.js';
import { subtractVectors } from '../utils/vector-math-2d.js';
import { FocusEffect } from '../effects/focus-effect.js';

export class StaticDiagram2d extends BaseDiagram2d {
  /**
   * @param {Object} coordinateMapper - Coordinate mapper for logical to pixel conversion
   * @param {HTMLElement} canvasSection - Parent DOM element for rendering
   * @param {Object} roboCanvas - RoboCanvas instance for auto-scrolling
   * @param {Object} options - Additional options
   */
  constructor(coordinateMapper, canvasSection, roboCanvas, options = {}) {
    super(coordinateMapper, canvasSection, roboCanvas, options);

    // Focus effect instance
    this.focusEffect = new FocusEffect();
  }


  /**
   * Create a point
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} position - Position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {radius, strokeWidth}
   * @returns {Promise<Object>} Point shape
   */
  async point(graphContainer, position, color = DEFAULT_SHAPE_COLORS.point, options = {}) {
    const shape = this._createPoint(graphContainer, position, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a vector (arrow)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Promise<Object>} Vector shape
   */
  async vector(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.vector, options = {}) {
    const shape = this._createVector(graphContainer, start, end, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a vector at original position and instantly move it to target position
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} originalVector - Original vector definition {start: {x,y}, end: {x,y}}
   * @param {Object} targetPosition - Target position {x, y} or target vector {start: {x,y}, end: {x,y}}
   * @param {Object} options - Options including color, strokeWidth, dashed, dashPattern
   * @returns {Promise<Object>} The vector shape at target position
   */
  async moveVector(graphContainer, originalVector, targetPosition, options = {}) {
    const originalStart = originalVector.start;
    const originalEnd = originalVector.end;
    const targetStart = targetPosition.start || targetPosition;

    const displacement = {
      x: targetStart.x - originalStart.x,
      y: targetStart.y - originalStart.y
    };

    const shape = graphContainer.vector(
      targetStart.x,
      targetStart.y,
      originalEnd.x + displacement.x,
      originalEnd.y + displacement.y
    );

    const color = options.color || 'blue';
    shape.stroke(parseColor(color));

    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    if (options.dashed) {
      const dashPattern = options.dashPattern || '5,3';
      shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    }

    shape.renderEndState();
    shape.show();

    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a line segment
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Promise<Object>} Line shape
   */
  async line(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.line, options = {}) {
    const shape = this._createLine(graphContainer, start, end, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a measurement indicator with end markers
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {mainRadius, markerLength, markerRadius, offset, strokeWidth}
   * @returns {Promise<Object>} Measurement indicator shape
   */
  async measurementIndicator(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.line, options = {}) {
    const shape = this._createMeasurementIndicator(graphContainer, start, end, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a function plot from a callback function
   * @param {Object} graphContainer - The graph container to render on
   * @param {Function} func - Function that takes x and returns y
   * @param {number} domainMin - Minimum x value
   * @param {number} domainMax - Maximum x value
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Promise<Object>} Plot shape
   */
  async plotFunction(graphContainer, func, domainMin, domainMax, color = DEFAULT_SHAPE_COLORS.plot, options = {}) {
    const shape = this._createPlotFunction(graphContainer, func, domainMin, domainMax, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a plot from expression string with variable scope
   * Uses math.js for parsing - supports standard math syntax
   * @param {Object} graphContainer - The graph container to render on
   * @param {string} expression - Math expression like "a*x^2 + b*x + c" or "sin(x)"
   * @param {number} domainMin - Minimum x value
   * @param {number} domainMax - Maximum x value
   * @param {Object} scope - Variable substitution map {a: 1, b: 2, c: 3}
   * @param {string} color - Color name or hex
   * @param {Object} options - Style options {strokeWidth, variable}
   * @returns {Promise<Object>} Plot shape
   */
  async plot(graphContainer, expression, domainMin, domainMax, scope = {}, color = DEFAULT_SHAPE_COLORS.plot, options = {}) {
    const { variable = 'x', ...plotOptions } = options;
    const shape = this._createPlotFromExpression(
      graphContainer, expression, variable, scope,
      domainMin, domainMax, color, plotOptions
    );
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a parametric plot
   * @param {Object} graphContainer - The graph container to render on
   * @param {Function} xFunction - Function that takes t and returns x
   * @param {Function} yFunction - Function that takes t and returns y
   * @param {number} tMin - Minimum t value
   * @param {number} tMax - Maximum t value
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Promise<Object>} Parametric plot shape
   */
  async parametricPlot(graphContainer, xFunction, yFunction, tMin, tMax, color = DEFAULT_SHAPE_COLORS.plot, options = {}) {
    const shape = this._createParametricPlot(graphContainer, xFunction, yFunction, tMin, tMax, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a circle
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} center - Center position {x, y}
   * @param {number} radius - Circle radius
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Promise<Object>} Circle shape
   */
  async circle(graphContainer, center, radius, color = DEFAULT_SHAPE_COLORS.circle, options = {}) {
    const shape = this._createCircle(graphContainer, center, radius, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an ellipse
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} center - Center position {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Promise<Object>} Ellipse shape
   */
  async ellipse(graphContainer, center, rx, ry, color = DEFAULT_SHAPE_COLORS.ellipse, options = {}) {
    const shape = this._createEllipse(graphContainer, center, rx, ry, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an arc
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start point {x, y}
   * @param {Object} end - End point {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Promise<Object>} Arc shape
   */
  async arc(graphContainer, start, end, rx, ry, color = DEFAULT_SHAPE_COLORS.arc, options = {}) {
    const shape = this._createArc(graphContainer, start, end, rx, ry, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a curved arrow
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y} in graph coordinates
   * @param {Object} end - End position {x, y} in graph coordinates
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, angle, clockwise}
   * @returns {Promise<Object>} Arrow shape
   */
  async arrow(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.arrow, options = {}) {
    const shape = this._createArrow(graphContainer, start, end, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a polygon
   * @param {Object} graphContainer - The graph container to render on
   * @param {Array<Object>} vertices - Array of vertices [{x, y}, ...]
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Promise<Object>} Polygon shape
   */
  async polygon(graphContainer, vertices, color = DEFAULT_SHAPE_COLORS.polygon, options = {}) {
    const shape = this._createPolygon(graphContainer, vertices, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a curve
   * @param {Object} graphContainer - The graph container to render on
   * @param {string} type - Curve type ('linear', 'basis', 'cardinal', etc.)
   * @param {Array<Object>} points - Control points [{x, y}, ...]
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Promise<Object>} Curve shape
   */
  async curve(graphContainer, type, points, color = DEFAULT_SHAPE_COLORS.curve, options = {}) {
    const shape = this._createCurve(graphContainer, type, points, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a LaTeX text rendered as SVG
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} position - Position {x, y}
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {fontSize, scale}
   * @returns {Promise<Object>} LatexShape
   */
  async texToSvg(graphContainer, position, latexString, color = 'black', options = {}) {
    const shape = this._createTexToSvg(graphContainer, position, latexString, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a label at a specific point with optional rotation and offset
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} point - Point position {x, y}
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {fontSize, rotation, offset}
   * @returns {Promise<Object>} Label shape
   */
  async labelOnPoint(graphContainer, point, latexString, color = 'black', options = {}) {
    const shape = this._createLabelOnPoint(graphContainer, point, latexString, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a label between two points with automatic rotation and offset
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start point {x, y}
   * @param {Object} end - End point {x, y}
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {fontSize, offset}
   * @returns {Promise<Object>} Label shape
   */
  async labelBetweenPoints(graphContainer, start, end, latexString, color = 'black', options = {}) {
    const shape = this._createLabelBetweenPoints(graphContainer, start, end, latexString, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a MathTextComponent label on a grapher with pen animation support
   * Uses MathJax rendering positioned absolutely over the grapher
   * @param {Object} graphContainer - The grapher to position the label on
   * @param {Object} position - Position in model coordinates {x, y}
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Text color (default: 'black')
   * @param {Object} options - Options {fontSize, background, offset}
   * @returns {Promise<MathTextComponent>} Math text component (shown instantly)
   */
  async label(graphContainer, position, latexString, color = 'black', options = {}) {
    const mathComponent = this._createLabel(graphContainer, position, latexString, color, options);
    mathComponent.show();
    mathComponent.enableStroke();
    return mathComponent;
  }

  /**
   * Create a label for an angle shape at its center with optional offset
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} angleShape - The angle shape object (from interiorAngle, exteriorAngle, etc.)
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Color name or hex (default: 'black')
   * @param {Object} options - Additional options {offsetInView, fontSize}
   * @returns {Promise<Object>} Label shape
   */
  async angleLabel(graphContainer, angleShape, latexString, color = 'black', options = {}) {
    // Get angle center in view coordinates
    const viewCenter = angleShape.getAngleCenter();
    if (!viewCenter) {
      console.error('Error: Could not get angle center from shape');
      return null;
    }

    // Apply offset in view coordinates if specified
    let finalViewX = viewCenter.x;
    let finalViewY = viewCenter.y;

    const offsetDistance = options.offsetInView || 0;
    if (offsetDistance !== 0) {
      finalViewX = viewCenter.x;
      finalViewY = viewCenter.y - offsetDistance;
    }

    // Convert final view position to model coordinates
    const modelX = graphContainer.graphSheet2D.toModelX(finalViewX);
    const modelY = graphContainer.graphSheet2D.toModelY(finalViewY);
    const modelPosition = { x: modelX, y: modelY };

    // Use labelOnPoint with model coordinates
    return this.labelOnPoint(graphContainer, modelPosition, latexString, color, options);
  }

  /**
   * Create an angle between three points or two vectors
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object|Array} vertex - Vertex point {x, y} or array of 3 points
   * @param {Object} point1 - First point {x, y} (if vertex is not array)
   * @param {Object} point2 - Second point {x, y} (if vertex is not array)
   * @param {string} angleType - Type of angle ('interior', 'exterior-first', 'exterior-second', 'reflex', 'opposite')
   * @param {Object} options - Additional options {radius, color, fill, fillOpacity, strokeWidth, showValue}
   * @returns {Promise<Object>} Angle shape
   */
  async angle(graphContainer, vertex, point1, point2, angleType = 'interior', options = {}) {
    const color = options.color || options.stroke || DEFAULT_SHAPE_COLORS.angle;
    const shape = this._createAngle(graphContainer, vertex, point1, point2, angleType, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an interior angle (standard angle between two vectors)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Angle shape
   */
  async interiorAngle(graphContainer, vector1, vector2, radius = 0.8, color = DEFAULT_SHAPE_COLORS.angle, options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    return this.angle(graphContainer, vertex, point1, point2, 'interior', { ...options, radius, color });
  }
  
  /**
   * Create a right angle indicator (small square with only two edges)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} size - Size of the square (default 0.5)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Right angle indicator shape
   */
  async rightAngleIndicator(graphContainer, vector1, vector2, size = 0.5, color = DEFAULT_SHAPE_COLORS.angle, options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    return this.angle(graphContainer, vertex, point1, point2, 'right', { ...options, radius: size, color });
  }
  
  /**
   * Create an exterior angle at first vector
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Angle shape
   */
  async exteriorAngleFirst(graphContainer, vector1, vector2, radius = 0.8, color = DEFAULT_SHAPE_COLORS.angle, options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    return this.angle(graphContainer, vertex, point1, point2, 'exterior-first', { ...options, radius, color });
  }
  
  /**
   * Create an exterior angle at second vector
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Angle shape
   */
  async exteriorAngleSecond(graphContainer, vector1, vector2, radius = 0.8, color = DEFAULT_SHAPE_COLORS.angle, options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    return this.angle(graphContainer, vertex, point1, point2, 'exterior-second', { ...options, radius, color });
  }
  
  /**
   * Create a reflex angle (>180 degrees)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Angle shape
   */
  async reflexAngle(graphContainer, vector1, vector2, radius = 0.8, color = DEFAULT_SHAPE_COLORS.angle, options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    return this.angle(graphContainer, vertex, point1, point2, 'reflex', { ...options, radius, color });
  }
  
  /**
   * Create an opposite/vertical angle
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Angle shape
   */
  async oppositeAngle(graphContainer, vector1, vector2, radius = 0.8, color = DEFAULT_SHAPE_COLORS.angle, options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    return this.angle(graphContainer, vertex, point1, point2, 'opposite', { ...options, radius, color });
  }
  
  // ============= ZOOM METHODS =============
  
  /**
   * Zoom in to a specific point
   * @param {Object} point - Point to zoom to {x, y}
   * @param {Object} options - Zoom options {scale, duration, animate}
   * Note: In base Diagram, zoom does nothing (static view)
   */
  zoom(point, options = {}) {
    // No-op in static diagram
    // Only AnimatedDiagram implements actual zooming
  }
  
  /**
   * Pan to a specific point without changing zoom level
   * @param {Object} point - Point to pan to {x, y}
   * @param {Object} options - Pan options {duration, animate}
   * Note: In base Diagram, pan does nothing (static view)
   */
  panTo(point, options = {}) {
    // No-op in static diagram
    // Only AnimatedDiagram implements actual panning
  }
  
  /**
   * Zoom out (reset zoom)
   * @param {Object} options - Zoom options {duration}
   * Note: In base Diagram, zoom does nothing (static view)
   */
  zoomOut(options = {}) {
    // No-op in static diagram
    // Only AnimatedDiagram implements actual zooming
  }
  
  /**
   * Zoom to fit specific shapes
   * @param {Array} shapes - Array of shapes to zoom to
   * @param {Object} options - Options {padding, duration, animate}
   * Note: In base Diagram, zoom does nothing (static view)
   */
  zoomToShapes(shapes, options = {}) {
    // No-op in static diagram
    // Only AnimatedDiagram implements actual zooming
  }
  
  /**
   * Zoom to fit a single shape
   * @param {Object} shape - Shape to zoom to
   * @param {Object} options - Options {padding, duration, animate}
   * Note: In base Diagram, zoom does nothing (static view)
   */
  zoomToShape(shape, options = {}) {
    // No-op in static diagram
    // Only AnimatedDiagram implements actual zooming
  }
  
  /**
   * Get current zoom state
   * @returns {Object} Current zoom state
   */
  getZoomState() {
    return this.graphContainer.getZoomState();
  }
  
  // ============= TOOLTIP METHODS =============
  
  /**
   * Add tooltip to a shape
   * @param {Object} shape - Shape to add tooltip to
   * @param {string} text - Tooltip text (can include LaTeX with $...$)
   * @param {Object} options - Tooltip options {placement, distance, theme}
   * @returns {Object} Tooltip instance
   */
  tooltip(shape, text, options = {}) {
    return this.graphContainer.tooltip(shape, text, options);
  }
  
  /**
   * Add tooltip at specific position
   * @param {Object} position - Position {x, y} in model coordinates
   * @param {string} text - Tooltip text
   * @param {Object} options - Tooltip options
   * @returns {Object} Tooltip instance
   */
  tooltipAt(position, text, options = {}) {
    return this.graphContainer.tooltipAt(position, text, options);
  }
  
  /**
   * Hide tooltip for a shape
   * @param {Object} shape - Shape to hide tooltip for
   */
  hideTooltip(shape) {
    this.graphContainer.hideTooltip(shape);
  }
  
  /**
   * Show tooltip for a shape
   * @param {Object} shape - Shape to show tooltip for
   */
  showTooltip(shape) {
    this.graphContainer.showTooltip(shape);
  }
  
  /**
   * Remove tooltip from a shape
   * @param {Object} shape - Shape to remove tooltip from
   */
  removeTooltip(shape) {
    this.graphContainer.removeTooltip(shape);
  }
  
  /**
   * Clear all tooltips
   */
  clearTooltips() {
    this.graphContainer.clearTooltips();
  }
  
  /**
   * Clear a specific tooltip
   * @param {Object} tooltip - Tooltip instance to clear
   */
  clearTooltip(tooltip) {
    if (tooltip && tooltip.destroy) {
      tooltip.destroy();
    }
  }
  
  // ============= NEW MATHEMATICAL METHODS =============
  
  /**
   * Create a parallelogram from origin and two vectors
   * Useful for visualizing vector addition and cross product area
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} origin - Origin point {x, y}
   * @param {Object} vector1End - End point of first vector {x, y}
   * @param {Object} vector2End - End point of second vector {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {fill, fillOpacity, showEdges, edgeWidth, strokeWidth}
   * @returns {Promise<Object>} Parallelogram shape
   */
  async parallelogram(graphContainer, origin, vector1End, vector2End, color = DEFAULT_SHAPE_COLORS.polygon, options = {}) {
    const coords = [
      origin.x, origin.y,
      vector1End.x, vector1End.y,
      vector2End.x, vector2End.y
    ];

    const parallelogramShape = new ParallelogramPrimitiveShape(coords, options);
    const shape = graphContainer.addMathShape(parallelogramShape);
    shape.stroke(parseColor(color));
    if (options.fill) shape.fill(parseColor(options.fill));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    shape.renderEndState();
    shape.show();

    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a dashed line segment
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, dashPattern}
   * @returns {Promise<Object>} Line shape with dash pattern
   */
  async dashedLine(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.line, options = {}) {
    const shape = graphContainer.line(start.x, start.y, end.x, end.y);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    const dashPattern = options.dashPattern || '5,3';
    shape.primitiveShape.attr('stroke-dasharray', dashPattern);

    shape.renderEndState();
    shape.show();

    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a dashed vector (arrow)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, dashPattern}
   * @returns {Promise<Object>} Vector shape with dash pattern
   */
  async dashedVector(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.vector, options = {}) {
    const shape = this._createDashedVector(graphContainer, start, end, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a reversed vector (pointing in opposite direction)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vectorShape - Vector shape object or {start, end} coordinates
   * @param {Object} options - Options including color, dashPattern, strokeWidth
   * @returns {Promise<Object>} Reversed vector shape
   */
  async reverseVector(graphContainer, vectorShape, options = {}) {
    let start, end;

    if (vectorShape.modelCoordinates) {
      const coords = vectorShape.modelCoordinates;
      start = { x: coords[0], y: coords[1] };
      end = { x: coords[2], y: coords[3] };
    } else if (vectorShape.start && vectorShape.end) {
      start = vectorShape.start;
      end = vectorShape.end;
    }

    const displacement = subtractVectors(end, start);
    const reversedEnd = subtractVectors(start, displacement);

    const color = options.color || DEFAULT_SHAPE_COLORS.vector;
    return this.dashedVector(graphContainer, start, reversedEnd, color, options);
  }
  
  
  /**
   * Trace vector path - shows vector addition chain
   * Takes an array of vector shapes and shows their sum
   * @param {Object} graphContainer - The graph container to render on
   * @param {Array} vectorShapes - Array of vector shape objects
   * @param {Object} options - Options {chainColor, directColor, showChain, showDirect}
   * @returns {Promise<Object>} Object containing trace elements
   */
  async traceVectorPath(graphContainer, vectorShapes, options = {}) {
    const vectorPaths = vectorShapes.map(shape => {
      if (shape.modelCoordinates) {
        const coords = shape.modelCoordinates;
        return {
          start: { x: coords[0], y: coords[1] },
          end: { x: coords[2], y: coords[3] }
        };
      } else if (shape.start && shape.end) {
        return { start: shape.start, end: shape.end };
      }
    });

    const directPath = {
      start: vectorPaths[0].start,
      end: vectorPaths[vectorPaths.length - 1].end
    };

    const elements = {
      vectors: vectorShapes,
      chain: [],
      direct: null
    };

    if (options.showChain !== false) {
      const chainColor = options.chainColor || '#888888';
      for (let i = 0; i < vectorPaths.length - 1; i++) {
        const chainLine = await this.dashedLine(
          graphContainer,
          vectorPaths[i].end,
          vectorPaths[i + 1].start,
          chainColor,
          { dashPattern: '2,2', strokeWidth: 1 }
        );
        elements.chain.push(chainLine);
      }
    }

    if (options.showDirect !== false) {
      const directColor = options.directColor || 'red';
      elements.direct = await this.dashedVector(
        graphContainer,
        directPath.start,
        directPath.end,
        directColor,
        { dashPattern: '8,4', strokeWidth: 3 }
      );
    }

    return elements;
  }
  
  /**
   * Focus on specific objects by dimming others
   * @param {Array} objectsToFocus - Array of shape objects to highlight
   * @param {number} unfocusedOpacity - Opacity for unfocused objects (0-1)
   * @param {number} duration - Animation duration in seconds
   * @returns {Promise<void>}
   */
  async focus(objectsToFocus, unfocusedOpacity = 0.3, duration = 0.5) {
    this.focusEffect.focus(objectsToFocus, this.objects, unfocusedOpacity, duration);
  }
  
  /**
   * Restore all objects from focus effect
   * @param {number} duration - Animation duration in seconds
   * @returns {Promise<void>}
   */
  async restore(duration = 0.5) {
    this.focusEffect.restore(duration);
  }
  
  /**
   * Check if focus effect is active
   * @returns {boolean} True if focused
   */
  isFocused() {
    return this.focusEffect.isActive();
  }
  
  // ============= WRITE ANIMATION METHODS =============

  /**
   * Show a math text component instantly (no animation)
   * @param {MathTextComponent} mathComponent - The math text component to show
   * @returns {Promise<MathTextComponent>} The math text component
   */
  async writeMathText(mathComponent) {
    mathComponent.show();
    mathComponent.enableStroke();
    return mathComponent;
  }

  /**
   * Hide marked parts in a math text component instantly
   * @param {MathTextComponent} mathComponent - The math text component
   * @returns {Promise<MathTextComponent>} The math text component
   */
  async hideMathTextParts(mathComponent) {
    mathComponent.hideBBoxContent();
    return mathComponent;
  }

  /**
   * Show only the marked parts in a math text component instantly
   * @param {MathTextComponent} mathComponent - The math text component
   * @param {boolean} includeAll - Whether to include all content (default: false)
   * @returns {Promise<MathTextComponent>} The math text component
   */
  async writeOnlyMathTextParts(mathComponent, includeAll = false) {
    mathComponent.showOnlyBBox(includeAll);
    return mathComponent;
  }

  /**
   * Show everything except the marked parts in a math text component instantly
   * @param {MathTextComponent} mathComponent - The math text component
   * @returns {Promise<MathTextComponent>} The math text component
   */
  async writeWithoutMathTextParts(mathComponent) {
    mathComponent.showWithoutBBox();
    return mathComponent;
  }

  // ============= ANNOTATION METHODS =============

  /**
   * Draw a rectangle around a bbox section on the annotation layer (instant, no animation)
   * @param {MathTextComponent} mathTextComponent - The math text component with bbox sections
   * @param {number} sectionIndex - Index of the bbox section to highlight
   * @param {Object} options - Styling options {stroke, strokeWidth, fill, padding}
   * @returns {Promise<MathTextRectShape|null>} The rect shape, or null if invalid
   */
  async annotateSectionRect(mathTextComponent, sectionIndex, options = {}) {
    const shape = this._createAnnotateSectionRect(mathTextComponent, sectionIndex, options);
    if (shape) {
      shape.renderEndState();
    }
    return shape;
  }

  /**
   * Clear all shapes and clean up resources
   */
  destroy() {
    super.destroy();
    this.focusEffect = null;
  }
}