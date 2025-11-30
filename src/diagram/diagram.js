/**
 * Base Diagram class for 2D visualizations
 * Provides a clean API with dictionary-style parameters
 * All shapes render instantly (non-animated)
 */

import { Grapher } from '../blocks/grapher.js';
import {
  parseColor,
  getAngleColor,
  DEFAULT_SHAPE_COLORS
} from './style_helper.js';
import { ParallelogramPrimitiveShape } from '../script-shapes/parallelogram-primitive-shape.js';
import { subtractVectors, addVectors } from '../utils/vector-math-2d.js';
import { FocusEffect } from '../effects/focus-effect.js';
import { MathTextComponent } from '../mathtext/components/math-text-component.js';
import { WriteEffect } from '../mathtext/effects/write-effect.js';

export class Diagram {
  constructor(options = {}) {
    // Store canvasSection (parent DOM) and coordinateMapper for cell positioning
    this.options = options;
    this.coordinateMapper = options.coordinateMapper || null;
    this.canvasSection = options.canvasSection || null;
    this.roboCanvas = options.roboCanvas || null;  // For auto-scrolling

    // Track objects for utility methods
    this.objects = [];

    // Track graph containers created by graphContainer() method
    this.graphContainers = [];

    // Focus effect instance
    this.focusEffect = new FocusEffect();
  }


  /**
   * Create a point
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} position - Position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {radius, strokeWidth}
   * @returns {Object} Point shape
   */
  point(graphContainer, position, color = DEFAULT_SHAPE_COLORS.point, options = {}) {
    const shape = graphContainer.point(position.x, position.y, options.radius || 4);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

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
   * @returns {Object} Vector shape
   */
  vector(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.vector, options = {}) {
    const shape = graphContainer.vector(start.x, start.y, end.x, end.y);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

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
   * @returns {Object} The vector shape at target position
   */
  moveVector(graphContainer, originalVector, targetPosition, options = {}) {
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
   * @returns {Object} Line shape
   */
  line(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.line, options = {}) {
    const shape = graphContainer.line(start.x, start.y, end.x, end.y);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(parseColor(options.fill));

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
   * @returns {Object} Measurement indicator shape
   */
  measurementIndicator(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.line, options = {}) {
    const shape = graphContainer.measurementIndicator(start.x, start.y, end.x, end.y, options);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    shape.renderEndState();
    shape.show();

    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a function plot
   * @param {Object} graphContainer - The graph container to render on
   * @param {Function} equation - Function that takes x and returns y
   * @param {number} domainMin - Minimum x value
   * @param {number} domainMax - Maximum x value
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Plot shape
   */
  plot(graphContainer, equation, domainMin, domainMax, color = DEFAULT_SHAPE_COLORS.plot, options = {}) {
    const shape = graphContainer.plot(equation, domainMin, domainMax);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

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
   * @returns {Object} Circle shape
   */
  circle(graphContainer, center, radius, color = DEFAULT_SHAPE_COLORS.circle, options = {}) {
    const shape = graphContainer.circle(center.x, center.y, radius);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(parseColor(options.fill));

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
   * @returns {Object} Ellipse shape
   */
  ellipse(graphContainer, center, rx, ry, color = DEFAULT_SHAPE_COLORS.ellipse, options = {}) {
    const shape = graphContainer.ellipse(center.x, center.y, rx, ry);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(parseColor(options.fill));

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
   * @returns {Object} Arc shape
   */
  arc(graphContainer, start, end, rx, ry, color = DEFAULT_SHAPE_COLORS.arc, options = {}) {
    const shape = graphContainer.arc(start, end, rx, ry);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

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
   * @returns {Object} Arrow shape
   */
  arrow(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.arrow, options = {}) {
    const shape = graphContainer.arrow(
      start.x,
      start.y,
      end.x,
      end.y,
      options.angle || Math.PI,
      options.clockwise !== undefined ? options.clockwise : true
    );

    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

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
   * @returns {Object} Polygon shape
   */
  polygon(graphContainer, vertices, color = DEFAULT_SHAPE_COLORS.polygon, options = {}) {
    const coords = [];
    vertices.forEach(v => {
      coords.push(v.x, v.y);
    });

    const shape = graphContainer.polygon(...coords);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(parseColor(options.fill));

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
   * @returns {Object} Curve shape
   */
  curve(graphContainer, type, points, color = DEFAULT_SHAPE_COLORS.curve, options = {}) {
    const coords = [];
    points.forEach(p => {
      coords.push(p.x, p.y);
    });

    const shape = graphContainer.curve(type, ...coords);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    shape.renderEndState();
    shape.show();

    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an angle between three points or two vectors
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object|Array} vertex - Vertex point {x, y} or array of 3 points
   * @param {Object} point1 - First point {x, y} (if vertex is not array)
   * @param {Object} point2 - Second point {x, y} (if vertex is not array)
   * @param {string} angleType - Type of angle ('interior', 'exterior-first', 'exterior-second', 'reflex', 'opposite')
   * @param {Object} options - Additional options {radius, color, fill, fillOpacity, strokeWidth, showValue}
   * @returns {Object} Angle shape
   */
  angle(graphContainer, vertex, point1, point2, angleType = 'interior', options = {}) {
    const shape = graphContainer.angle(vertex, point1, point2, angleType, options);

    const color = options.color || options.stroke || getAngleColor(angleType);
    shape.stroke(parseColor(color));
    shape.fill(parseColor(options.fill || color));

    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

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
   * @returns {Object} Angle shape
   */
  interiorAngle(graphContainer, vector1, vector2, radius = 0.8, color = getAngleColor('interior'), options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;

    return this.angle(
      graphContainer,
      vertex,
      point1,
      point2,
      'interior',
      { ...options, radius, color }
    );
  }
  
  /**
   * Create a right angle indicator (small square with only two edges)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} size - Size of the square (default 0.5)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Right angle indicator shape
   */
  rightAngleIndicator(graphContainer, vector1, vector2, size = 0.5, color = DEFAULT_SHAPE_COLORS.angle, options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;

    return this.angle(
      graphContainer,
      vertex,
      point1,
      point2,
      'right',
      { ...options, radius: size, color }
    );
  }
  
  /**
   * Create an exterior angle at first vector
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  exteriorAngleFirst(graphContainer, vector1, vector2, radius = 0.8, color = getAngleColor('exterior-first'), options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;

    return this.angle(
      graphContainer,
      vertex,
      point1,
      point2,
      'exterior-first',
      { ...options, radius, color }
    );
  }
  
  /**
   * Create an exterior angle at second vector
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  exteriorAngleSecond(graphContainer, vector1, vector2, radius = 0.8, color = getAngleColor('exterior-second'), options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;

    return this.angle(
      graphContainer,
      vertex,
      point1,
      point2,
      'exterior-second',
      { ...options, radius, color }
    );
  }
  
  /**
   * Create a reflex angle (>180 degrees)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  reflexAngle(graphContainer, vector1, vector2, radius = 0.8, color = getAngleColor('reflex'), options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;

    return this.angle(
      graphContainer,
      vertex,
      point1,
      point2,
      'reflex',
      { ...options, radius, color }
    );
  }
  
  /**
   * Create an opposite/vertical angle
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  oppositeAngle(graphContainer, vector1, vector2, radius = 0.8, color = getAngleColor('opposite'), options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;

    return this.angle(
      graphContainer,
      vertex,
      point1,
      point2,
      'opposite',
      { ...options, radius, color }
    );
  }
  
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
   * Get the graph container for advanced usage
   * @returns {Object} GraphContainer instance
   */
  getGraphContainer() {
    return this.graphContainer;
  }
  
  /**
   * Get all created objects
   * @returns {Array} Array of shape objects
   */
  getObjects() {
    return this.objects;
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
  
  // ============= MESSAGE/NOTE METHODS =============
  
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
   * @returns {Object} Parallelogram shape
   */
  parallelogram(graphContainer, origin, vector1End, vector2End, color = DEFAULT_SHAPE_COLORS.polygon, options = {}) {
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
   * @returns {Object} Line shape with dash pattern
   */
  dashedLine(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.line, options = {}) {
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
   * @returns {Object} Vector shape with dash pattern
   */
  dashedVector(graphContainer, start, end, color = DEFAULT_SHAPE_COLORS.vector, options = {}) {
    const shape = graphContainer.vector(start.x, start.y, end.x, end.y);
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
   * Create a reversed vector (pointing in opposite direction)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} vectorShape - Vector shape object or {start, end} coordinates
   * @param {Object} options - Options including color, dashPattern, strokeWidth
   * @returns {Object} Reversed vector shape
   */
  reverseVector(graphContainer, vectorShape, options = {}) {
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
   * @returns {Object} Object containing trace elements
   */
  traceVectorPath(graphContainer, vectorShapes, options = {}) {
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
        const chainLine = this.dashedLine(
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
      elements.direct = this.dashedVector(
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
   */
  focus(objectsToFocus, unfocusedOpacity = 0.3, duration = 0.5) {
    this.focusEffect.focus(objectsToFocus, this.objects, unfocusedOpacity, duration);
  }
  
  /**
   * Restore all objects from focus effect
   * @param {number} duration - Animation duration in seconds
   */
  restore(duration = 0.5) {
    this.focusEffect.restore(duration);
  }
  
  /**
   * Check if focus effect is active
   * @returns {boolean} True if focused
   */
  isFocused() {
    return this.focusEffect.isActive();
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
    this.objects.push(mathComponent);

    return mathComponent;
  }

  // ============= WRITE ANIMATION METHODS =============

  /**
   * Show a math text component instantly (no animation)
   * @param {MathTextComponent} mathComponent - The math text component to show
   * @returns {MathTextComponent} The math text component
   */
  writeMathText(mathComponent) {
    mathComponent.show();
    mathComponent.enableStroke();
    return mathComponent;
  }

  /**
   * Hide marked parts in a math text component instantly
   * @param {MathTextComponent} mathComponent - The math text component
   * @returns {MathTextComponent} The math text component
   */
  hideMathTextParts(mathComponent) {
    mathComponent.hideBBoxContent();
    return mathComponent;
  }

  /**
   * Show only the marked parts in a math text component instantly
   * @param {MathTextComponent} mathComponent - The math text component
   * @param {boolean} includeAll - Whether to include all content (default: false)
   * @returns {MathTextComponent} The math text component
   */
  writeOnlyMathTextParts(mathComponent, includeAll = false) {
    mathComponent.showOnlyBBox(includeAll);
    return mathComponent;
  }

  /**
   * Show everything except the marked parts in a math text component instantly
   * @param {MathTextComponent} mathComponent - The math text component
   * @returns {MathTextComponent} The math text component
   */
  writeWithoutMathTextParts(mathComponent) {
    mathComponent.showWithoutBBox();
    return mathComponent;
  }

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
    this.focusEffect = null;
  }
}