/**
 * Base Diagram class for 2D visualizations
 * Provides a clean API with dictionary-style parameters
 * All shapes render instantly (non-animated)
 */

import { XLinearScale, YLinearScale } from '../geom/graphing/graph-scales.js';
import { MessageModel } from '../models/message.model.js';
import { MessageEffect } from '../effects/message-effect.js';
import {
  parseColor,
  getAngleColor,
  getAnimationType,
  getMessageStyle,
  DEFAULT_SHAPE_COLORS
} from './style_helper.js';
import { ParallelogramPrimitiveShape } from '../script-shapes/parallelogram-primitive-shape.js';
import { subtractVectors, addVectors } from '../utils/vector-math-2d.js';
import { FocusEffect } from '../effects/focus-effect.js';
import { MathTextComponent } from '../mathtext/components/math-text-component.js';
import { ComponentState } from '../models/component-state.js';
import { IdUtil } from '../shared/utils/id-util.js';
import { GraphComponent } from '../components/graph-component.js';
import { GraphContainer } from '../blocks/graph-container.js';

export class Diagram {
  constructor(containerElement, options = {}) {
    this.containerElement = containerElement;
    this.options = options;

    // Create GraphComponent directly
    const position = options.position || {left: 0, top: 0};
    const size = options.size || {width: 400, height: 400};

    // Default scale is [-10, 10] for both axes
    const xRange = options.xRange || [-10, 10];
    const yRange = options.yRange || [-10, 10];

    // Create component state
    const componentState = Object.assign(new ComponentState(), {
      componentId: `graph-item_${IdUtil.getID()}`,
      content: '',
      left: position.left || position.x || 0,
      top: position.top || position.y || 0,
      width: size.width || 200,
      height: size.height || 200,
      props: {}
    });

    // Create graph component
    const graphComponent = new GraphComponent(
      componentState,
      containerElement,
      (width) => XLinearScale(xRange, width),
      (height) => YLinearScale(yRange, height)
    );
    graphComponent.init();

    // Create graph container wrapper
    this.graphContainer = new GraphContainer(graphComponent);

    // Render grid if specified
    if (options.showGrid !== false) {
      this.graphContainer.graphComponent.renderGrid();
    }

    // Track all created objects
    this.objects = [];

    // Generator function placeholder - to be set by user
    this.renderGenerator = null;

    // Focus effect instance
    this.focusEffect = new FocusEffect();

    // Text section and coordinate mapper (set by RoboCanvas)
    this.textSection = options.textSection || null;
    this.coordinateMapper = options.coordinateMapper || null;

    // Message container (set by RoboCanvas)
    this.messageContainer = options.messageContainer || null;

    // Store math text components
    this.mathTexts = [];
  }
  
  /**
   * Create a point
   * @param {Object} position - Position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {radius, strokeWidth}
   * @returns {Object} Point shape
   */
  point(position, label = '', color = DEFAULT_SHAPE_COLORS.point, options = {}) {
    const shape = this.graphContainer.point(position.x, position.y, options.radius || 4);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer.point() -> addMathShape()
    // Just render and show it
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a vector (arrow)
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Vector shape
   */
  vector(start, end, label = '', color = DEFAULT_SHAPE_COLORS.vector, options = {}) {
    const shape = this.graphContainer.vector(start.x, start.y, end.x, end.y);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a vector at original position and instantly move it to target position
   * @param {Object} originalVector - Original vector definition {start: {x,y}, end: {x,y}}
   * @param {Object} targetPosition - Target position {x, y} or target vector {start: {x,y}, end: {x,y}}
   * @param {Object} options - Options including label, color
   * @returns {Object} The vector shape at target position
   */
  moveVector(originalVector, targetPosition, options = {}) {
    // Extract start and end from originalVector
    let originalStart, originalEnd;
    if (originalVector.start && originalVector.end) {
      originalStart = originalVector.start;
      originalEnd = originalVector.end;
    } else {
      throw new Error('Invalid originalVector provided to moveVector');
    }
    
    // Extract target start position
    const targetStart = targetPosition.start || targetPosition;
    
    // Calculate displacement
    const displacement = {
      x: targetStart.x - originalStart.x,
      y: targetStart.y - originalStart.y
    };
    
    // Create the vector at TARGET position (no animation in base Diagram)
    const shape = this.graphContainer.vector(
      targetStart.x,
      targetStart.y,
      originalEnd.x + displacement.x,
      originalEnd.y + displacement.y
    );
    
    const color = options.color || 'blue';
    shape.stroke(parseColor(color));
    
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Add dash pattern if specified
    if (options.dashed) {
      const dashPattern = options.dashPattern || '5,3';
      shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    }
    
    // Show immediately at target position
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a line segment
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Line shape
   */
  line(start, end, label = '', color = DEFAULT_SHAPE_COLORS.line, options = {}) {
    const shape = this.graphContainer.line(start.x, start.y, end.x, end.y);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(parseColor(options.fill));
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a measurement indicator with end markers
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {mainRadius, markerLength, markerRadius, offset}
   * @returns {Object} Measurement indicator shape
   */
  measurementIndicator(start, end, label = '', color = DEFAULT_SHAPE_COLORS.line, options = {}) {
    const shape = this.graphContainer.measurementIndicator(start.x, start.y, end.x, end.y, options);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a function plot
   * @param {Function} equation - Function that takes x and returns y
   * @param {number} domainMin - Minimum x value
   * @param {number} domainMax - Maximum x value
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Plot shape
   */
  plot(equation, domainMin, domainMax, label = '', color = DEFAULT_SHAPE_COLORS.plot, options = {}) {
    const shape = this.graphContainer.plot(equation, domainMin, domainMax);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a circle
   * @param {Object} center - Center position {x, y}
   * @param {number} radius - Circle radius
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Circle shape
   */
  circle(center, radius, label = '', color = DEFAULT_SHAPE_COLORS.circle, options = {}) {
    const shape = this.graphContainer.circle(center.x, center.y, radius);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(parseColor(options.fill));
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an ellipse
   * @param {Object} center - Center position {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Ellipse shape
   */
  ellipse(center, rx, ry, label = '', color = DEFAULT_SHAPE_COLORS.ellipse, options = {}) {
    const shape = this.graphContainer.ellipse(center.x, center.y, rx, ry);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(parseColor(options.fill));
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an arc
   * @param {Object} start - Start point {x, y}
   * @param {Object} end - End point {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Arc shape
   */
  arc(start, end, rx, ry, label = '', color = DEFAULT_SHAPE_COLORS.arc, options = {}) {
    const shape = this.graphContainer.arc(start, end, rx, ry);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a curved arrow
   * @param {Object} start - Start position {x, y} in graph coordinates
   * @param {Object} end - End position {x, y} in graph coordinates
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, angle, clockwise}
   * @returns {Object} Arrow shape
   */
  arrow(start, end, color = DEFAULT_SHAPE_COLORS.arrow, options = {}) {
    // Create arrow using GraphContainer (same as vector, line, etc.)
    const shape = this.graphContainer.arrow(
      start.x, 
      start.y, 
      end.x, 
      end.y, 
      options.angle || Math.PI,  // Default to straight arrow
      options.clockwise !== undefined ? options.clockwise : true
    );
    
    // Apply styling
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a polygon
   * @param {Array<Object>} vertices - Array of vertices [{x, y}, ...]
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Polygon shape
   */
  polygon(vertices, label = '', color = DEFAULT_SHAPE_COLORS.polygon, options = {}) {
    // Convert array of {x, y} to flat array for graphContainer
    const coords = [];
    vertices.forEach(v => {
      coords.push(v.x, v.y);
    });
    
    const shape = this.graphContainer.polygon(...coords);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(parseColor(options.fill));
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a curve
   * @param {string} type - Curve type ('linear', 'basis', 'cardinal', etc.)
   * @param {Array<Object>} points - Control points [{x, y}, ...]
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Curve shape
   */
  curve(type, points, label = '', color = DEFAULT_SHAPE_COLORS.curve, options = {}) {
    // Convert array of {x, y} to flat array
    const coords = [];
    points.forEach(p => {
      coords.push(p.x, p.y);
    });
    
    const shape = this.graphContainer.curve(type, ...coords);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an angle between three points or two vectors
   * @param {Object|Array} vertex - Vertex point {x, y} or array of 3 points
   * @param {Object} point1 - First point {x, y} (if vertex is not array)
   * @param {Object} point2 - Second point {x, y} (if vertex is not array)
   * @param {string} angleType - Type of angle ('interior', 'exterior-first', 'exterior-second', 'reflex', 'opposite')
   * @param {Object} options - Additional options {radius, label, color, fillOpacity, strokeWidth, showValue}
   * @returns {Object} Angle shape
   */
  angle(vertex, point1, point2, angleType = 'interior', options = {}) {
    // Pass parameters directly to graphContainer.angle
    // It will handle the coordinate formatting internally
    const shape = this.graphContainer.angle(vertex, point1, point2, angleType, options);
    
    // Use color from options or default based on angle type
    const color = options.color || options.stroke || getAngleColor(angleType);
    shape.stroke(parseColor(color));
    shape.fill(parseColor(options.fill || color));
    
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an interior angle (standard angle between two vectors)
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  interiorAngle(vector1, vector2, radius = 0.8, label = '', color = getAngleColor('interior'), options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'interior',
      { ...options, radius, label, color }
    );
  }
  
  /**
   * Create a right angle indicator (small square with only two edges)
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} size - Size of the square (default 0.5)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Right angle indicator shape
   */
  rightAngleIndicator(vector1, vector2, size = 0.5, label = '', color = DEFAULT_SHAPE_COLORS.angle, options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'right',
      { ...options, radius: size, label, color }
    );
  }
  
  /**
   * Create an exterior angle at first vector
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  exteriorAngleFirst(vector1, vector2, radius = 0.8, label = '', color = getAngleColor('exterior-first'), options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'exterior-first',
      { ...options, radius, label, color }
    );
  }
  
  /**
   * Create an exterior angle at second vector
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  exteriorAngleSecond(vector1, vector2, radius = 0.8, label = '', color = getAngleColor('exterior-second'), options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'exterior-second',
      { ...options, radius, label, color }
    );
  }
  
  /**
   * Create a reflex angle (>180 degrees)
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  reflexAngle(vector1, vector2, radius = 0.8, label = '', color = getAngleColor('reflex'), options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'reflex',
      { ...options, radius, label, color }
    );
  }
  
  /**
   * Create an opposite/vertical angle
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  oppositeAngle(vector1, vector2, radius = 0.8, label = '', color = getAngleColor('opposite'), options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'opposite',
      { ...options, radius, label, color }
    );
  }
  
  /**
   * Create math text at logical coordinates (instant display)
   * @param {string} content - LaTeX content
   * @param {number} logicalX - Logical X coordinate
   * @param {number} logicalY - Logical Y coordinate
   * @param {Object} options - Options (fontSize, stroke, etc.)
   * @returns {Object} MathTextComponent
   */
  mathText(content, logicalX, logicalY, options = {}) {
    // Convert logical coordinates to pixels
    const pixelPos = this.coordinateMapper.toPixel(logicalX, logicalY);

    // Create component state
    const componentState = Object.assign(new ComponentState(), {
      componentId: `math-text-${IdUtil.getID()}`,
      content: content,
      left: pixelPos.x,
      top: pixelPos.y
    });

    // Create math text component
    const mathComponent = new MathTextComponent(
      componentState,
      this.textSection,
      {
        fontSize: options.fontSize || 32,
        stroke: options.stroke || '#000000',
        ...options
      }
    );

    // Show immediately
    mathComponent.show();
    mathComponent.enableStroke();

    this.mathTexts.push(mathComponent);
    return mathComponent;
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

    // Clear math texts
    this.mathTexts.forEach(mathText => {
      mathText.containerDOM.parentNode.removeChild(mathText.containerDOM);
    });
    this.mathTexts = [];
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
  
  /**
   * Create a message/notification
   * @param {string} text - Message text
   * @param {Object} position - Position {x, y} in pixels
   * @param {Object} options - Message options {width, height, animation, style}
   * @returns {Object} Message effect object
   */
  message(text, position, options = {}) {
    // Parse animation type
    const animation = getAnimationType(options.animation);

    // Create message model
    const messageModel = new MessageModel(
      text,
      animation,
      options.style || {}
    );

    // Create message effect
    const messageEffect = new MessageEffect(
      messageModel,
      this.messageContainer,
      {left: position.x || position.left || 0, top: position.y || position.top || 0},
      {width: options.width || 200, height: options.height || 60}
    );

    // For Diagram: show immediately
    messageEffect.toEndState();

    this.objects.push(messageEffect);
    return messageEffect;
  }
  
  /**
   * Create a note (styled message)
   * @param {string} text - Note text
   * @param {Object} position - Position {x, y} in pixels
   * @param {Object} options - Note options {width, height, animation, style}
   * @returns {Object} Note effect object
   */
  note(text, position, options = {}) {
    return this.message(text, position, {
      ...options,
      style: {
        ...getMessageStyle('note'),
        ...options.style
      }
    });
  }
  
  /**
   * Create an alert message
   * @param {string} text - Alert text
   * @param {Object} position - Position {x, y} in pixels
   * @param {Object} options - Alert options
   * @returns {Object} Alert effect object
   */
  alert(text, position, options = {}) {
    return this.message(text, position, {
      animation: options.animation || 'center',
      ...options,
      style: {
        ...getMessageStyle('alert'),
        ...options.style
      }
    });
  }
  
  /**
   * Create a success message
   * @param {string} text - Success text
   * @param {Object} position - Position {x, y} in pixels
   * @param {Object} options - Success options
   * @returns {Object} Success effect object
   */
  success(text, position, options = {}) {
    return this.message(text, position, {
      animation: options.animation || 'slide-top',
      ...options,
      style: {
        ...getMessageStyle('success'),
        ...options.style
      }
    });
  }
  
  /**
   * Clear a specific message/note
   * @param {Object} messageEffect - Message effect to clear
   */
  clearMessage(messageEffect) {
    if (messageEffect) {
      if (messageEffect.hide) {
        messageEffect.hide();
      }
      if (messageEffect.remove) {
        messageEffect.remove();
      }
      // Remove from objects array
      const index = this.objects.indexOf(messageEffect);
      if (index > -1) {
        this.objects.splice(index, 1);
      }
    }
  }
  
  /**
   * Clear all messages and notes
   */
  clearMessages() {
    // Find all message effects in objects array
    const messages = this.objects.filter(obj => 
      obj instanceof MessageEffect || 
      (obj && obj.constructor && obj.constructor.name === 'MessageEffect')
    );
    
    messages.forEach(msg => this.clearMessage(msg));
  }
  
  /**
   * Alias for clearMessage
   * @param {Object} note - Note to clear
   */
  clearNote(note) {
    this.clearMessage(note);
  }
  
  /**
   * Clear all notes (alias for clearMessages)
   */
  clearNotes() {
    this.clearMessages();
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
  
  // ============= NEW MATHEMATICAL METHODS =============
  
  /**
   * Create a parallelogram from origin and two vectors
   * Useful for visualizing vector addition and cross product area
   * @param {Object} origin - Origin point {x, y}
   * @param {Object} vector1End - End point of first vector {x, y}
   * @param {Object} vector2End - End point of second vector {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {fill, fillOpacity, showEdges, edgeWidth}
   * @returns {Object} Parallelogram shape
   */
  parallelogram(origin, vector1End, vector2End, label = '', color = DEFAULT_SHAPE_COLORS.polygon, options = {}) {
    const coords = [
      origin.x, origin.y,
      vector1End.x, vector1End.y,
      vector2End.x, vector2End.y
    ];
    
    // Create parallelogram shape instance
    const parallelogramShape = new ParallelogramPrimitiveShape(coords, options);
    const shape = this.graphContainer.addMathShape(parallelogramShape);
    shape.stroke(parseColor(color));
    if (options.fill) shape.fill(parseColor(options.fill));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    shape.renderEndState();
    shape.show();
    
    // Add label if provided (for future use)
    if (label) {
      shape.label = label;
    }
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a dashed line segment
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, dashPattern}
   * @returns {Object} Line shape with dash pattern
   */
  dashedLine(start, end, label = '', color = DEFAULT_SHAPE_COLORS.line, options = {}) {
    const shape = this.graphContainer.line(start.x, start.y, end.x, end.y);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Add dash pattern
    const dashPattern = options.dashPattern || '5,3';
    shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a dashed vector (arrow)
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, dashPattern}
   * @returns {Object} Vector shape with dash pattern
   */
  dashedVector(start, end, label = '', color = DEFAULT_SHAPE_COLORS.vector, options = {}) {
    const shape = this.graphContainer.vector(start.x, start.y, end.x, end.y);
    shape.stroke(parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Add dash pattern
    const dashPattern = options.dashPattern || '5,3';
    shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a reversed vector (pointing in opposite direction)
   * @param {Object} vectorShape - Vector shape object or {start, end} coordinates
   * @param {Object} options - Options including label, color, dashPattern
   * @returns {Object} Reversed vector shape
   */
  reverseVector(vectorShape, options = {}) {
    let start, end;
    
    // Extract coordinates from vector shape or use provided coordinates
    if (vectorShape.modelCoordinates) {
      const coords = vectorShape.modelCoordinates;
      start = { x: coords[0], y: coords[1] };
      end = { x: coords[2], y: coords[3] };
    } else if (vectorShape.start && vectorShape.end) {
      start = vectorShape.start;
      end = vectorShape.end;
    } else {
      throw new Error('Invalid vector shape provided to reverseVector');
    }
    
    // Calculate reversed end point
    const displacement = subtractVectors(end, start);
    const reversedEnd = subtractVectors(start, displacement);
    
    // Create dashed vector in opposite direction
    const color = options.color || DEFAULT_SHAPE_COLORS.vector;
    return this.dashedVector(start, reversedEnd, options.label || '', color, options);
  }
  
  /**
   * Move a vector to a new position while maintaining its direction
   * @param {Object} vectorShape - Vector shape object or {start, end} coordinates
   * @param {Object} newStart - New starting position {x, y}
   * @param {Object} options - Options including label, color, dashPattern
   * @returns {Object} Moved vector shape
   */
  moveVector(vectorShape, newStart, options = {}) {
    let start, end;
    
    // Extract coordinates from vector shape
    if (vectorShape.modelCoordinates) {
      const coords = vectorShape.modelCoordinates;
      start = { x: coords[0], y: coords[1] };
      end = { x: coords[2], y: coords[3] };
    } else if (vectorShape.start && vectorShape.end) {
      start = vectorShape.start;
      end = vectorShape.end;
    } else {
      throw new Error('Invalid vector shape provided to moveVector');
    }
    
    // Get displacement vector
    const displacement = subtractVectors(end, start);
    
    // Calculate new end position
    const newEnd = addVectors(newStart, displacement);
    
    // Create vector at new position (optionally dashed)
    const color = options.color || DEFAULT_SHAPE_COLORS.vector;
    
    if (options.dashed) {
      return this.dashedVector(newStart, newEnd, options.label || '', color, options);
    } else {
      return this.vector(newStart, newEnd, options.label || '', color, options);
    }
  }
  
  /**
   * Get all tracked objects in the diagram
   * @returns {Array} Array of all shape objects
   */
  getObjects() {
    return this.objects;
  }
  
  /**
   * Trace vector path - shows vector addition chain
   * Takes an array of vector shapes and shows their sum
   * @param {Array} vectorShapes - Array of vector shape objects
   * @param {Object} options - Options {traceColor, directColor, showDirect}
   * @returns {Object} Object containing trace elements
   */
  traceVectorPath(vectorShapes, options = {}) {
    if (!Array.isArray(vectorShapes) || vectorShapes.length < 2) {
      throw new Error('traceVectorPath requires at least 2 vector shapes');
    }
    
    // Extract coordinates from vector shapes
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
      throw new Error('Invalid vector shape in array');
    });
    
    // Calculate direct path from first start to last end
    const directPath = {
      start: vectorPaths[0].start,
      end: vectorPaths[vectorPaths.length - 1].end
    };
    
    // Create visual elements
    const elements = {
      vectors: vectorShapes,
      chain: [],
      direct: null
    };
    
    // Create chain visualization (dashed lines showing the path)
    if (options.showChain !== false) {
      const chainColor = options.chainColor || '#888888';
      for (let i = 0; i < vectorPaths.length - 1; i++) {
        const chainLine = this.dashedLine(
          vectorPaths[i].end,
          vectorPaths[i + 1].start,
          '',
          chainColor,
          { dashPattern: '2,2', strokeWidth: 1 }
        );
        elements.chain.push(chainLine);
      }
    }
    
    // Create direct path vector
    if (options.showDirect !== false) {
      const directColor = options.directColor || 'red';
      elements.direct = this.dashedVector(
        directPath.start,
        directPath.end,
        options.directLabel || 'sum',
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
}