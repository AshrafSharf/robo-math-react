/**
 * AnimatedDiagram class extending Diagram
 * Shapes are queued for animation and played sequentially
 * Uses generator functions with yield for step-by-step control
 */

import { Diagram } from './diagram.js';
import { MathShapeEffect } from '../effects/shape-effects/math-shape-effect.js';
import { SequenceStepEffect } from '../effects/sequence-step-effect.js';
import { MessageModel } from '../models/message.model.js';
import { MessageEffect } from '../effects/message-effect.js';
import { ReverseVectorEffect } from '../effects/reverse-vector-effect.js';
import { MoveVectorEffect } from '../effects/move-vector-effect.js';
import { MathTextComponent } from '../mathtext/components/math-text-component.js';
import { WriteEffect } from '../mathtext/effects/write-effect.js';
import { ComponentState } from '../models/component-state.js';
import { IdUtil } from '../shared/utils/id-util.js';
import {
  parseColor,
  getAngleColor,
  getAnimationType,
  DEFAULT_SHAPE_COLORS
} from './style_helper.js';

export class AnimatedDiagram extends Diagram {
  constructor(containerElement, options = {}) {
    super(containerElement, options);
    
    // Animation queue - shapes added since last yield
    this.animationQueue = [];
    
    // Currently playing effect
    this.currentEffect = null;
    
    // Track if we're in animation mode
    this.isAnimating = false;
  }
  
  /**
   * Create a point (queued for animation)
   * @param {Object} position - Position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {radius, strokeWidth}
   * @returns {Object} Point shape
   */
  point(position, label = '', color = 'red', options = {}) {
    const shape = this.graphContainer.point(position.x, position.y, options.radius || 4);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide(); // Initially hidden for animation
    
    // Queue for animation
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a vector (queued for animation)
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Vector shape
   */
  vector(start, end, label = '', color = 'red', options = {}) {
    const shape = this.graphContainer.vector(start.x, start.y, end.x, end.y);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide();
    
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a dashed vector (queued for animation)
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, dashPattern}
   * @returns {Object} Vector shape with dash pattern
   */
  dashedVector(start, end, label = '', color = 'red', options = {}) {
    const shape = this.graphContainer.vector(start.x, start.y, end.x, end.y);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Add dash pattern
    const dashPattern = options.dashPattern || '5,3';
    shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    
    // Shape is already created by graphContainer
    shape.hide();
    
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a reversed vector (pointing in opposite direction) with flip animation
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
    
    // Calculate the vector displacement
    const displacement = {
      x: end.x - start.x,
      y: end.y - start.y
    };
    
    // Create the reversed vector starting at the original's end point
    // Initial position: tail at end point, head pointing back towards start
    const shape = this.graphContainer.vector(end.x, end.y, start.x, start.y);
    const color = options.color || 'red';
    shape.stroke(this.parseColor(color));
    
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Add dash pattern for dashed appearance
    if (options.dashed !== false) {
      const dashPattern = options.dashPattern || '5,3';
      shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    }
    
    // Initially hide the shape
    shape.hide();
    
    // Create a proper effect instance for the reverse animation
    // Pass original start, end, and displacement for sliding animation
    const reverseEffect = new ReverseVectorEffect(shape, start, end, displacement);
    
    // Queue the effect for animation
    this.animationQueue.push(reverseEffect);
    this.objects.push(shape);
    
    return shape;
  }
  
  /**
   * Create a vector at original position and animate it moving to target position
   * @param {Object} originalVector - Original vector definition {start: {x,y}, end: {x,y}}
   * @param {Object} targetPosition - Target position {x, y} or target vector {start: {x,y}, end: {x,y}}
   * @param {Object} options - Options including label, color, and animation settings
   * @returns {Object} The animated vector shape
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
    
    // Create the vector at its ORIGINAL position
    const shape = this.graphContainer.vector(
      originalStart.x, 
      originalStart.y, 
      originalEnd.x, 
      originalEnd.y
    );
    
    const color = options.color || 'blue';
    shape.stroke(this.parseColor(color));
    
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Add dash pattern if specified
    if (options.dashed) {
      const dashPattern = options.dashPattern || '5,3';
      shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    }
    
    // Initially hide the shape
    shape.hide();
    
    // Create move effect for animation
    const moveEffect = new MoveVectorEffect(shape, originalStart, targetStart);
    
    // Queue the effect for animation
    this.animationQueue.push(moveEffect);
    this.objects.push(shape);
    
    return shape;
  }
  
  /**
   * Create a line segment (queued for animation)
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Line shape
   */
  line(start, end, label = '', color = 'black', options = {}) {
    const shape = this.graphContainer.line(start.x, start.y, end.x, end.y);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(this.parseColor(options.fill));
    
    // Shape is already created by graphContainer
    shape.hide();
    
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a measurement indicator with end markers (queued for animation)
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {mainRadius, markerLength, markerRadius, offset}
   * @returns {Object} Measurement indicator shape
   */
  measurementIndicator(start, end, label = '', color = 'black', options = {}) {
    const shape = this.graphContainer.measurementIndicator(start.x, start.y, end.x, end.y, options);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide();
    
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a function plot (queued for animation)
   * @param {Function} equation - Function that takes x and returns y
   * @param {number} domainMin - Minimum x value
   * @param {number} domainMax - Maximum x value
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Plot shape
   */
  plot(equation, domainMin, domainMax, label = '', color = 'green', options = {}) {
    const shape = this.graphContainer.plot(equation, domainMin, domainMax);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide();
    
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a circle (queued for animation)
   * @param {Object} center - Center position {x, y}
   * @param {number} radius - Circle radius
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Circle shape
   */
  circle(center, radius, label = '', color = 'blue', options = {}) {
    // Pass options to the shape constructor
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color,
      label: label
    };
    
    const shape = this.graphContainer.circle(center.x, center.y, radius, shapeOptions);
    
    // Apply styles using shape methods
    shape.stroke(this.parseColor(shapeOptions.stroke));
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide();
    
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an ellipse (queued for animation)
   * @param {Object} center - Center position {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Ellipse shape
   */
  ellipse(center, rx, ry, label = '', color = 'red', options = {}) {
    // Pass options to the shape constructor
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color,
      label: label
    };
    
    const shape = this.graphContainer.ellipse(center.x, center.y, rx, ry, shapeOptions);
    
    // Apply styles using shape methods
    shape.stroke(this.parseColor(shapeOptions.stroke));
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide();
    
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an arc (queued for animation)
   * @param {Object} start - Start point {x, y}
   * @param {Object} end - End point {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Arc shape
   */
  arc(start, end, rx, ry, label = '', color = 'green', options = {}) {
    const shape = this.graphContainer.arc(start, end, rx, ry);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide();
    
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a polygon (queued for animation)
   * @param {Array<Object>} vertices - Array of vertices [{x, y}, ...]
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Polygon shape
   */
  polygon(vertices, label = '', color = 'orange', options = {}) {
    // Convert array of {x, y} to flat array for graphContainer
    const coords = [];
    vertices.forEach(v => {
      coords.push(v.x, v.y);
    });
    
    // Pass options to the shape constructor
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color,
      label: label
    };
    
    const shape = this.graphContainer.polygon(...coords, shapeOptions);
    
    // Apply styles using shape methods
    shape.stroke(this.parseColor(shapeOptions.stroke));
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide();
    
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a curve (queued for animation)
   * @param {string} type - Curve type ('linear', 'basis', 'cardinal', etc.)
   * @param {Array<Object>} points - Control points [{x, y}, ...]
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Curve shape
   */
  curve(type, points, label = '', color = 'violet', options = {}) {
    // Convert array of {x, y} to flat array
    const coords = [];
    points.forEach(p => {
      coords.push(p.x, p.y);
    });
    
    const shape = this.graphContainer.curve(type, ...coords);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide();
    
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a curved arrow (queued for animation)
   * @param {Object} start - Start position {x, y} in graph coordinates
   * @param {Object} end - End position {x, y} in graph coordinates
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, angle, clockwise}
   * @returns {Object} Arrow shape
   */
  arrow(start, end, color = 'red', options = {}) {
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
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide(); // Initially hidden for animation
    
    // Queue for animation using MathShapeEffect (same as vector, line, etc.)
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an angle between three points or two vectors (queued for animation)
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
    
    // Apply default color based on angle type if not specified
    const defaultColors = {
      'interior': '#FF9800',
      'exterior-first': '#2196F3',
      'exterior-second': '#4CAF50',
      'reflex': '#9C27B0',
      'opposite': '#FFEB3B'
    };
    
    // Use color from options or default based on angle type
    const color = options.color || options.stroke || defaultColors[angleType] || '#FF9800';
    shape.stroke(this.parseColor(color));
    shape.fill(this.parseColor(options.fill || color));
    
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Shape is already created by graphContainer
    shape.hide(); // Initially hidden for animation
    
    // Queue for animation
    const effect = new MathShapeEffect(shape);
    this.animationQueue.push(effect);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an interior angle (standard angle between two vectors) - animated
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  interiorAngle(vector1, vector2, radius = 0.8, label = '', color = '#FF9800', options = {}) {
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
   * Create a right angle indicator (small square with only two edges) - animated
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} size - Size of the square (default 0.5)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Right angle indicator shape
   */
  rightAngleIndicator(vector1, vector2, size = 0.5, label = '', color = '#FF9800', options = {}) {
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
   * Create an exterior angle at first vector - animated
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  exteriorAngleFirst(vector1, vector2, radius = 0.8, label = '', color = '#2196F3', options = {}) {
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
   * Create an exterior angle at second vector - animated
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  exteriorAngleSecond(vector1, vector2, radius = 0.8, label = '', color = '#4CAF50', options = {}) {
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
   * Create a reflex angle (>180 degrees) - animated
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  reflexAngle(vector1, vector2, radius = 0.8, label = '', color = '#9C27B0', options = {}) {
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
   * Create an opposite/vertical angle - animated
   * @param {Object} vector1 - First vector {start: {x, y}, end: {x, y}}
   * @param {Object} vector2 - Second vector {start: {x, y}, end: {x, y}}
   * @param {number} radius - Radius of angle arc (default 0.8)
   * @param {string} label - Label for the angle
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options
   * @returns {Object} Angle shape
   */
  oppositeAngle(vector1, vector2, radius = 0.8, label = '', color = '#FFEB3B', options = {}) {
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
   * Create math text at logical coordinates (animated display)
   * @param {string} content - LaTeX content
   * @param {number} logicalX - Logical X coordinate
   * @param {number} logicalY - Logical Y coordinate
   * @param {Object} options - Options (fontSize, stroke, etc.)
   * @returns {Promise} Resolves when animation completes
   */
  async mathText(content, logicalX, logicalY, options = {}) {
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

    // Create and play write effect
    const writeEffect = new WriteEffect(mathComponent);
    await writeEffect.play();

    this.mathTexts.push(mathComponent);
    return mathComponent;
  }

  /**
   * Play animations queued since last yield
   * Called by the paginator when advancing steps
   * @returns {Promise} Resolves when animations complete
   */
  async playNext() {
    if (this.animationQueue.length === 0) {
      return Promise.resolve();
    }
    
    // Create a sequence effect for all queued animations
    const sequenceEffect = new SequenceStepEffect();
    sequenceEffect.addAll(this.animationQueue);
    
    // Clear the queue
    this.animationQueue = [];
    
    // Play the sequence
    this.currentEffect = sequenceEffect;
    
    try {
      await sequenceEffect.play();
    } catch (error) {
      console.error('Animation error:', error);
    } finally {
      this.currentEffect = null;
    }
  }
  
  /**
   * Stop current animation
   */
  stopAnimation() {
    if (this.currentEffect) {
      this.currentEffect.stop();
      this.currentEffect = null;
    }
  }
  
  /**
   * Clear animation queue without playing
   */
  clearQueue() {
    this.animationQueue = [];
  }
  
  /**
   * Clear all and reset animation state
   */
  clearAll() {
    this.stopAnimation();
    this.clearQueue();
    super.clearAll();
  }
  
  /**
   * Show all shapes instantly (skip animation)
   */
  showAllInstantly() {
    // Clear any pending animations
    this.clearQueue();
    
    // Show all shapes with their end state
    this.objects.forEach(obj => {
      if (obj.renderEndState) {
        obj.renderEndState();
      }
      if (obj.show) {
        obj.show();
      }
    });
  }
  
  // ============= OVERRIDE ZOOM METHODS FOR ANIMATION =============
  
  /**
   * Zoom in to a specific point (animated)
   * @param {Object} point - Point to zoom to {x, y}
   * @param {Object} options - Zoom options {scale, duration, animate}
   */
  zoom(point, options = {}) {
    this.graphContainer.zoomIn({
      point: point,
      scale: options.scale || 0.5,
      duration: options.duration || 0.5,
      animate: options.animate !== false
    });
  }
  
  /**
   * Zoom out (reset zoom) - animated
   * @param {Object} options - Zoom options {duration}
   */
  zoomOut(options = {}) {
    this.graphContainer.zoomOut(options);
  }
  
  /**
   * Zoom to fit specific shapes (animated)
   * @param {Array} shapes - Array of shapes to zoom to
   * @param {Object} options - Options {padding, duration, animate}
   */
  zoomToShapes(shapes, options = {}) {
    this.graphContainer.zoomToShapes(shapes, options);
  }
  
  /**
   * Zoom to fit a single shape (animated)
   * @param {Object} shape - Shape to zoom to
   * @param {Object} options - Options {padding, duration, animate}
   */
  zoomToShape(shape, options = {}) {
    this.graphContainer.zoomToShape(shape, options);
  }
  
  // ============= OVERRIDE MESSAGE/NOTE METHODS FOR ANIMATION =============
  
  /**
   * Create a message/notification (queued for animation)
   * @param {string} text - Message text
   * @param {Object} position - Position {x, y} in pixels
   * @param {Object} options - Message options {width, height, animation, style}
   * @returns {Object} Message effect object
   */
  message(text, position, options = {}) {
    // Parse animation type
    const animationMap = {
      'fade': 'f',
      'slide-left': 'l',
      'slide-right': 'r',
      'slide-top': 't',
      'slide-bottom': 'b',
      'center': 'c',
      'width': 'w'
    };

    const animation = animationMap[options.animation] || options.animation || 'f';

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

    // Queue for animation instead of showing immediately
    this.animationQueue.push(messageEffect);
    this.objects.push(messageEffect);

    return messageEffect;
  }
}