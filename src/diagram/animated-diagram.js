/**
 * AnimatedDiagram class extending Diagram
 * Shapes are created and animated immediately
 * Step control handled through direct method calls
 */

import { Diagram } from './diagram.js';
import { TexToSVGShapeEffect } from '../effects/shape-effects/tex-to-svg-shape-effect.js';
import { MathShapeEffect } from '../effects/shape-effects/math-shape-effect.js';
import { ReverseVectorEffect } from '../effects/reverse-vector-effect.js';
import { MoveVectorEffect } from '../effects/move-vector-effect.js';
import { ZoomEffect } from '../effects/zoom-effect.js';
import { PanEffect } from '../effects/pan-effect.js';
import {
  parseColor,
  getAngleColor,
  DEFAULT_SHAPE_COLORS
} from './style_helper.js';
import { MathTextComponent } from '../mathtext/components/math-text-component.js';
import { WriteEffect } from '../mathtext/effects/write-effect.js';

export class AnimatedDiagram extends Diagram {
  constructor(graphContainer, options = {}) {
    // graphContainer is a Grapher instance, not a DOM element
    super(graphContainer, options);

    // Track active timeouts for cleanup
    this.activeTimeouts = new Set();

    // Animation callbacks
    this.initCallback = null;
    this.initialized = false;

    // Animation mode flag - true for animations, false for instant rendering
    this.animateMode = true;

    // Generator navigation properties
    this.currentStep = -1;
    this.generator = null;
  }
  
  /**
   * Set animation mode
   * @param {boolean} enabled - True for animations, false for instant rendering
   */
  setAnimateMode(enabled) {
    this.animateMode = enabled;
  }
  
  /**
   * Get current animation mode
   * @returns {boolean} Current animation mode
   */
  getAnimateMode() {
    return this.animateMode;
  }
  
  /**
   * Internal method to play an effect immediately
   * @param {BaseEffect} effect - Effect to play
   */
  _playEffect(effect) {
    if (effect && effect.play) {
      effect.play();
    }
  }
  
  /**
   * Apply animation mode logic to a shape
   * @param {Object} shape - The shape to apply mode logic to
   * @param {BaseEffect} effectInstance - Optional custom effect instance
   * @private
   */
  _applyModeLogic(shape, effectInstance = null) {
    console.log(`🔥 _applyModeLogic called, animateMode=${this.animateMode}, shape type=${shape.constructor.name}`);
    if (this.animateMode) {
      console.log('  -> Animating shape with effect');
      shape.hide();
      // Use MathShapeEffect for geometric shapes, TexToSVGShapeEffect for LaTeX
      const effect = effectInstance || new MathShapeEffect(shape);
      this._playEffect(effect);
    } else {
      console.log('  -> Showing shape instantly (no animation)');
      shape.renderEndState();
      shape.show();
    }
  }
  
  /**
   * Create a point (hidden by default for fragment control)
   * @param {Object} position - Position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {radius, strokeWidth}
   * @returns {Object} Point shape
   */
  point(position, color = 'red', options = {}) {
    const shape = this.graphContainer.point(position.x, position.y, options.radius || 4);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    // Apply animation mode logic (animate in animated mode, instant in static mode)
    this._applyModeLogic(shape);

    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a vector (hidden by default for fragment control)
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Vector shape
   */
  vector(start, end, color = 'red', options = {}) {
    console.log(`🚀 vector() called with color=${color}, animateMode=${this.animateMode}`);
    const shape = this.graphContainer.vector(start.x, start.y, end.x, end.y);
    shape.stroke(this.parseColor(color));
    // Remove fill attribute entirely for vectors
    shape.primitiveShape.attr('fill', null);
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Add start/end properties for easier coordinate access in labeling
    shape.start = {x: start.x, y: start.y};
    shape.end = {x: end.x, y: end.y};
    
    this._applyModeLogic(shape);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a dashed vector with immediate animation
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, dashPattern}
   * @returns {Object} Vector shape with dash pattern
   */
  dashedVector(start, end, color = 'red', options = {}) {
    const shape = this.graphContainer.vector(start.x, start.y, end.x, end.y);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Add dash pattern
    const dashPattern = options.dashPattern || '5,3';
    shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    
    this._applyModeLogic(shape);
    
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
    
    // Create a proper effect instance for the reverse animation
    const reverseEffect = new ReverseVectorEffect(shape, start, end, displacement);
    this._applyModeLogic(shape, reverseEffect);
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
    
    // Create move effect for animation
    const moveEffect = new MoveVectorEffect(shape, originalStart, targetStart);
    this._applyModeLogic(shape, moveEffect);
    this.objects.push(shape);
    
    return shape;
  }
  
  /**
   * Create a line segment with immediate animation
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Line shape
   */
  line(start, end, color = 'black', options = {}) {
    const shape = this.graphContainer.line(start.x, start.y, end.x, end.y);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    if (options.fill) shape.fill(this.parseColor(options.fill));
    
    this._applyModeLogic(shape);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a measurement indicator with end markers and immediate animation
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {mainRadius, markerLength, markerRadius, offset}
   * @returns {Object} Measurement indicator shape
   */
  measurementIndicator(start, end, color = 'black', options = {}) {
    const shape = this.graphContainer.measurementIndicator(start.x, start.y, end.x, end.y, options);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Always render measurement indicators instantly (exception to animation mode)
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a function plot with immediate animation
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
    
    this._applyModeLogic(shape);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a parametric plot with immediate animation
   * @param {Function} xFunction - Function that takes t and returns x
   * @param {Function} yFunction - Function that takes t and returns y
   * @param {number} tMin - Minimum t value
   * @param {number} tMax - Maximum t value
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Parametric plot shape
   */
  parametricPlot(xFunction, yFunction, tMin, tMax, label = '', color = 'blue', options = {}) {
    const shape = this.graphContainer.parametricPlot(xFunction, yFunction, tMin, tMax);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    this._applyModeLogic(shape);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a circle with immediate animation
   * @param {Object} center - Center position {x, y}
   * @param {number} radius - Circle radius
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Circle shape
   */
  circle(center, radius, color = 'blue', options = {}) {
    console.log(`🔵 circle() called with color=${color}, animateMode=${this.animateMode}`);
    // Pass options to the shape constructor
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color
    };
    
    const shape = this.graphContainer.circle(center.x, center.y, radius, shapeOptions);
    
    // Apply styles using shape methods
    shape.stroke(this.parseColor(shapeOptions.stroke));
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    this._applyModeLogic(shape);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an ellipse with immediate animation
   * @param {Object} center - Center position {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Ellipse shape
   */
  ellipse(center, rx, ry, color = 'red', options = {}) {
    // Pass options to the shape constructor
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color
    };
    
    const shape = this.graphContainer.ellipse(center.x, center.y, rx, ry, shapeOptions);
    
    // Apply styles using shape methods
    shape.stroke(this.parseColor(shapeOptions.stroke));
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    this._applyModeLogic(shape);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an arc with immediate animation
   * @param {Object} start - Start point {x, y}
   * @param {Object} end - End point {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Arc shape
   */
  arc(start, end, rx, ry, color = 'green', options = {}) {
    const shape = this.graphContainer.arc(start, end, rx, ry);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    this._applyModeLogic(shape);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a polygon with immediate animation
   * @param {Array<Object>} vertices - Array of vertices [{x, y}, ...]
   * @param {string} label - Optional label
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Polygon shape
   */
  polygon(vertices, color = 'orange', options = {}) {
    // Convert array of {x, y} to flat array for graphContainer
    const coords = [];
    vertices.forEach(v => {
      coords.push(v.x, v.y);
    });
    
    // Pass options to the shape constructor
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color
    };
    
    const shape = this.graphContainer.polygon(...coords, shapeOptions);
    
    // Apply styles using shape methods
    shape.stroke(this.parseColor(shapeOptions.stroke));
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    this._applyModeLogic(shape);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a curve with immediate animation
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
    
    this._applyModeLogic(shape);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a curved arrow with immediate animation
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
    // Remove fill attribute entirely for arrows
    shape.primitiveShape.attr('fill', null);
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    this._applyModeLogic(shape);
    
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an angle between three points or two vectors with immediate animation
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
    
    this._applyModeLogic(shape);
    
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
  interiorAngle(vector1, vector2, radius = 0.8, color = '#FF9800', options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'interior',
      { ...options, radius, color }
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
  rightAngleIndicator(vector1, vector2, size = 0.5, color = '#FF9800', options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'right',
      { ...options, radius: size, color }
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
  exteriorAngleFirst(vector1, vector2, radius = 0.8, color = '#2196F3', options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'exterior-first',
      { ...options, radius, color }
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
  exteriorAngleSecond(vector1, vector2, radius = 0.8, color = '#4CAF50', options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'exterior-second',
      { ...options, radius, color }
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
  reflexAngle(vector1, vector2, radius = 0.8, color = '#9C27B0', options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'reflex',
      { ...options, radius, color }
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
  oppositeAngle(vector1, vector2, radius = 0.8, color = '#FFEB3B', options = {}) {
    const vertex = vector1.start;
    const point1 = vector1.end;
    const point2 = vector2.end;
    
    return this.angle(
      vertex,
      point1,
      point2,
      'opposite',
      { ...options, radius, color }
    );
  }
  
  /**
   * Create a LaTeX text rendered as SVG with immediate animation
   * @param {Object} position - Position {x, y}
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {fontSize, scale}
   * @returns {Object} LatexShape
   */
  texToSvg(position, latexString, color = 'black', options = {}) {
    console.log('🔥 TEX-TO-SVG CALLED WITH FONTSIZE:', options.fontSize);
    // Create LaTeX shape using the graphContainer method (same pattern as other shapes)
    const shape = this.graphContainer.latex(position.x, position.y, latexString, options);
    shape.stroke(this.parseColor(color));
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    // Hide then play immediately
    shape.hide();
    this._playEffect(new TexToSVGShapeEffect(shape));
    console.log(`Created and animated LaTeX "${latexString}"`);

    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a label at a specific point with optional rotation and offset
   * @param {Object} point - Point position {x, y}
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {fontSize, rotation, offset}
   * @returns {Object} Label shape
   */
  labelOnPoint(point, latexString, color = 'black', options = {}) {
    console.log(`🏷️ labelOnPoint called: point=${JSON.stringify(point)}, latex="${latexString}", color=${color}`);
    const shape = this.graphContainer.latex(point.x, point.y, latexString, options);
    console.log(`🏷️ LaTeX shape created:`, shape);
    shape.fill(this.parseColor(color));
    shape.stroke('none');
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Apply rotation if specified
    if (options.rotation !== undefined) {
      // Rotate about the element's own center (0,0 relative to the element)
      shape.shapeGroup.transform({ rotation: options.rotation, cx: 0, cy: 0 });
    }
    
    // Apply perpendicular offset if specified
    if (options.offset !== undefined && options.offset !== 0) {
      const offsetX = options.offset * Math.cos((options.rotation || 0) + Math.PI/2);
      const offsetY = options.offset * Math.sin((options.rotation || 0) + Math.PI/2);
      console.log(`🏷️ Applying offset: offsetX=${offsetX}, offsetY=${offsetY}`);
      // Note: move() should also use view coordinates, but offset positioning may need revision
      shape.shapeGroup.move(point.x + offsetX, point.y + offsetY);
    }
    
    // Always render labels instantly (like measurement indicators)
    console.log(`🏷️ Rendering label instantly`);
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    console.log(`🏷️ Label added to objects, total objects: ${this.objects.length}`);
    return shape;
  }

  /**
   * Create a label between two points with automatic rotation and offset
   * @param {Object} start - Start point {x, y}
   * @param {Object} end - End point {x, y}
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {fontSize, offset}
   * @returns {Object} Label shape
   */
  labelBetweenPoints(start, end, latexString, color = 'black', options = {}) {
    console.log(`🏷️ labelBetweenPoints called: start=${JSON.stringify(start)}, end=${JSON.stringify(end)}, latex="${latexString}"`);
    // Calculate midpoint
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Calculate rotation angle in model coordinates, then flip sign for SVG
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const modelRotation = Math.atan2(dy, dx) * (180 / Math.PI);
    const svgRotation = -modelRotation; // Flip sign for SVG coordinate system
    console.log(`🏷️ Model rotation: ${modelRotation}°, SVG rotation: ${svgRotation}°`);
    
    // Convert midpoint to view coordinates (create temp shape to use getViewCoordinates)
    const tempShape = this.graphContainer.latex(0, 0, 'temp');
    const midViewCoords = tempShape.getViewCoordinates([midX, midY]);
    const midViewX = midViewCoords[0];
    const midViewY = midViewCoords[1];
    tempShape.remove(); // Clean up temp shape
    
    // Calculate offset position in view coordinates
    let finalViewX = midViewX;
    let finalViewY = midViewY;
    
    const offsetAmount = options.offset !== undefined ? options.offset : 30;
    console.log(`🏷️ Offset amount: ${offsetAmount}, midView: (${midViewX}, ${midViewY})`);
    
    if (offsetAmount !== 0) {
      // Calculate perpendicular direction in model coordinates, then convert to view
      const perpAngle = modelRotation + Math.PI/2;
      const modelPerpX = Math.cos(perpAngle);
      const modelPerpY = Math.sin(perpAngle);
      
      // Convert perpendicular direction to view coordinates
      const viewPerp1 = tempShape.getViewCoordinates([0, 0]);
      const viewPerp2 = tempShape.getViewCoordinates([modelPerpX, modelPerpY]);
      const viewPerpX = viewPerp2[0] - viewPerp1[0];
      const viewPerpY = viewPerp2[1] - viewPerp1[1];
      
      // Normalize the view perpendicular vector
      const perpLength = Math.sqrt(viewPerpX * viewPerpX + viewPerpY * viewPerpY);
      const unitViewPerpX = viewPerpX / perpLength;
      const unitViewPerpY = viewPerpY / perpLength;
      
      // Apply offset in view coordinates
      finalViewX = midViewX + offsetAmount * unitViewPerpX;
      finalViewY = midViewY + offsetAmount * unitViewPerpY;
      console.log(`🏷️ Applied ${offsetAmount}px offset, unitPerp: (${unitViewPerpX}, ${unitViewPerpY}), final: (${finalViewX}, ${finalViewY})`);
    }
    
    // Create the label at midpoint
    const shape = this.graphContainer.latex(midX, midY, latexString, options);
    console.log(`🏷️ LaTeX shape created at model coordinates: (${midX}, ${midY})`);
    shape.fill(this.parseColor(color));
    shape.stroke('none');
    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);
    
    // Apply rotation with center at (0,0) relative to the element
    shape.shapeGroup.rotate(svgRotation, 0, 0);
    console.log(`🏷️ Applied rotation: ${svgRotation}°`);
    
    // Apply vertical offset after rotation (default 30px or user-specified)
    const verticalOffset = options.offset !== undefined ? options.offset : 30;
    if (verticalOffset !== 0) {
      shape.shapeGroup.dy(-verticalOffset);
      console.log(`🏷️ Applied vertical offset: -${verticalOffset}px`);
    }
    
    // Always render labels instantly (like measurement indicators)
    console.log(`🏷️ Rendering label instantly`);
    shape.renderEndState();
    shape.show();
    
    this.objects.push(shape);
    console.log(`🏷️ Label added to objects, total objects: ${this.objects.length}`);
    return shape;
  }

  /**
   * Create a label for an angle shape at its center with optional offset
   * @param {Object} angleShape - The angle shape object (from interiorAngle, exteriorAngle, etc.)
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Color name or hex (default: 'black')
   * @param {Object} options - Additional options {offsetInView, fontSize}
   * @returns {Object} Label shape
   */
  angleLabel(angleShape, latexString, color = 'black', options = {}) {
    console.log(`🏷️ angleLabel called: latex="${latexString}", color=${color}, options:`, options);
    
    // Get angle center in view coordinates
    const viewCenter = angleShape.getAngleCenter();
    console.log(`🏷️ Angle center (view coordinates):`, viewCenter);
    
    if (!viewCenter) {
      console.error(`🏷️ Error: Could not get angle center from shape`);
      return null;
    }
    
    // Apply offset in view coordinates if specified
    let finalViewX = viewCenter.x;
    let finalViewY = viewCenter.y;
    
    const offsetDistance = options.offsetInView || 0;
    if (offsetDistance !== 0) {
      // For simplicity, apply offset radially outward from angle center
      // We can enhance this later to be directional if needed
      
      // For now, apply offset upward (negative Y in view coordinates)
      // This can be enhanced to calculate optimal direction later
      finalViewX = viewCenter.x;
      finalViewY = viewCenter.y - offsetDistance;
      
      console.log(`🏷️ Applied offset: ${offsetDistance}px, final view position: (${finalViewX}, ${finalViewY})`);
    }
    
    // Convert final view position to model coordinates for labelOnPoint
    const modelX = this.graphContainer.graphSheet2D.toModelX(finalViewX);
    const modelY = this.graphContainer.graphSheet2D.toModelY(finalViewY);
    const modelPosition = { x: modelX, y: modelY };
    
    console.log(`🏷️ Converted to model coordinates:`, modelPosition);
    
    // Use existing labelOnPoint method with model coordinates
    const shape = this.labelOnPoint(modelPosition, latexString, color, options);
    
    console.log(`🏷️ Angle label created successfully`);
    return shape;
  }

  // ============= MATHTEXT METHODS (Override) =============

  /**
   * Create mathematical text using MathJax rendering with animation
   * Overrides the Diagram class method to add animation support
   * @param {string} text - LaTeX mathematical expression
   * @param {number} col - Logical column coordinate
   * @param {number} row - Logical row coordinate
   * @param {Object} options - Rendering options {fontSize, stroke, fill}
   * @returns {MathTextComponent} Math text component
   */
  mathText(text, col, row, options = {}) {
    if (!this.textSection) {
      console.warn('mathText requires textSection to be configured in options');
      return null;
    }

    if (!this.coordinateMapper) {
      console.warn('mathText requires coordinateMapper to be configured in options');
      return null;
    }

    // Convert logical coordinates to pixel coordinates
    const pixelCoords = this.coordinateMapper.toPixel(col, row);

    // Create component state
    const componentState = {
      componentId: `math-text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: text,
      left: pixelCoords.x,
      top: pixelCoords.y
    };

    // Create MathTextComponent
    const mathComponent = new MathTextComponent(
      componentState,
      this.textSection,
      {
        fontSize: options.fontSize || 32,
        stroke: options.stroke || '#000000',
        fill: options.fill || '#000000'
      }
    );

    // Apply animation mode logic
    if (this.animateMode) {
      // Hide initially, then animate with WriteEffect
      mathComponent.hide();
      mathComponent.disableStroke();
      const writeEffect = new WriteEffect(mathComponent);
      this._playEffect(writeEffect);
    } else {
      // Show immediately (non-animated) for instant rendering
      mathComponent.enableStroke();
      mathComponent.show();
    }

    // Track the component
    this.objects.push(mathComponent);

    return mathComponent;
  }

  /**
   * Stop current animation (simplified)
   */
  stopAnimation() {
    // Cancel any active timeouts
    this.activeTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.activeTimeouts.clear();
  }
  
  /**
   * Clear active timeouts (legacy compatibility)
   */
  clearQueue() {
    // Cancel active timeouts
    this.activeTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.activeTimeouts.clear();
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
   * Zoom in with immediate animation
   * @param {Object} point - Point to zoom to {x, y}
   * @param {Object} options - Zoom options {scale, duration}
   */
  zoomIn(point, options = {}) {
    // Create and play zoom effect immediately
    const zoomEffect = new ZoomEffect(this, point, {
      scale: options.scale || 0.5,
      duration: options.duration || 1
    });
    
    this._playEffect(zoomEffect);
    console.log(`Zoomed in to point:`, point);
    return this;
  }
  
  /**
   * Zoom out with immediate animation
   * @param {Object} options - Zoom options {duration}
   */
  zoomOut(options = {}) {
    // Create and play zoom out effect immediately (point = null means zoom out)
    const zoomEffect = new ZoomEffect(this, null, {
      duration: options.duration || 1
    });
    
    this._playEffect(zoomEffect);
    console.log(`Zoomed out`);
    return this;
  }
  
  /**
   * Direct zoom in - for immediate zoom
   * @param {Object} point - Point to zoom to {x, y}
   * @param {Object} options - Zoom options {scale, duration, animate}
   */
  zoomDirect(point, options = {}) {
    this.graphContainer.zoomIn({
      point: point,
      scale: options.scale || 0.5,
      duration: options.duration || 0.5,
      animate: options.animate !== undefined ? options.animate : this.animateMode
    });
  }
  
  /**
   * Direct zoom out - for immediate zoom reset
   * @param {Object} options - Zoom options {duration}
   */
  zoomOutDirect(options = {}) {
    this.graphContainer.zoomOut({
      ...options,
      animate: options.animate !== undefined ? options.animate : this.animateMode
    });
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
  
  /**
   * Pan to a specific point with immediate animation
   * @param {Object} point - Point to pan to {x, y}
   * @param {Object} options - Pan options {duration}
   */
  panTo(point, options = {}) {
    // Create and play pan effect immediately
    const panEffect = new PanEffect(this, point, {
      duration: options.duration || 0.5
    });
    
    this._playEffect(panEffect);
    console.log(`Panned to point:`, point);
    return this;
  }
  
  /**
   * Direct pan - for immediate pan
   * @param {Object} point - Point to pan to {x, y}
   * @param {Object} options - Pan options {duration, animate}
   */
  panDirect(point, options = {}) {
    this.graphContainer.panTo({
      point: point,
      duration: options.duration || 0.5,
      animate: options.animate !== undefined ? options.animate : this.animateMode
    });
  }
  
  // ============= ANIMATION REGISTRATION METHODS =============
  
  /**
   * Set initialization callback to be called when slide is shown
   * @param {Function} callback - Initialization function that receives the diagram instance
   * @returns {AnimatedDiagram} - For chaining
   */
  onReady(callback) {
    this.initCallback = callback;

    // Initialize immediately if not already initialized
    if (!this.initialized) {
      this.initialize();
    }

    return this;
  }
  
  /**
   * Initialize the animated diagram
   * @private
   */
  initialize() {
    if (this.initialized || !this.initCallback) return;
    
    // Reset viewBox to original state at start
    const svg = this.graphContainer.d3SvgRoot.node();
    svg.setAttribute('viewBox', this.graphContainer.originalViewBox);
    
    // Call initialization callback
    if (this.initCallback) {
      this.initCallback(this);
    }
    
    this.initialized = true;
  }
  
  // ============= GENERATOR NAVIGATION METHODS =============
  
  /**
   * Navigate to next step using generator
   */
  next() {
    console.log(`📍 next() called, currentStep=${this.currentStep}, animateMode=${this.animateMode}`);
    if (!this.generator) {
      console.log(`  Creating new generator`);
      this.generator = this.renderGenerator();
    }
    
    // Ensure animation mode is on for the next step
    const originalAnimateMode = this.animateMode;
    console.log(`  Setting animateMode from ${originalAnimateMode} to true`);
    this.setAnimateMode(true);
    
    console.log(`  About to call generator.next()`);
    const result = this.generator.next();
    console.log(`  Generator returned, done=${result.done}`);
    
    if (!result.done) {
      this.currentStep++;
      console.log(`  Generator step executed, new currentStep=${this.currentStep}`);
    }
    
    // Restore original animation mode
    console.log(`  Restoring animateMode back to ${originalAnimateMode}`);
    this.setAnimateMode(originalAnimateMode);
  }
  
  /**
   * Navigate to previous step
   */
  previous() {
    if (this.currentStep > 0) {
      this.goTo(this.currentStep - 1);
    }
  }
  
  /**
   * Navigate to specific step with optimized replay
   * @param {number} targetStep - Target step index
   */
  goTo(targetStep) {
    if (targetStep < 0) {
      targetStep = -1;
    }
    
    // Clear diagram and reset
    this.clearAll();
    this.generator = this.renderGenerator();
    this.currentStep = -1;
    
    // Special case: if going to step 0, ensure animation is on and run first step
    if (targetStep === 0) {
      // Make sure animation mode is on for the first step
      const originalAnimateMode = this.animateMode;
      this.setAnimateMode(true);
      
      // Run the first step with animation
      const result = this.generator.next();
      if (!result.done) {
        this.currentStep = 0;
      }
      
      // Restore original animation mode
      this.setAnimateMode(originalAnimateMode);
      return;
    }
    
    // Optimization: Turn off animations for replay steps
    const originalAnimateMode = this.animateMode;
    this.setAnimateMode(false);
    
    // Run generator instantly up to target-1
    for (let i = 0; i < targetStep; i++) {
      const result = this.generator.next();
      if (result.done) break;
      this.currentStep = i;
    }
    
    // Turn on animation for final step
    this.setAnimateMode(true);
    
    // Animate the target step
    if (targetStep >= 0) {
      const result = this.generator.next();
      if (!result.done) {
        this.currentStep = targetStep;
      }
    }
    
    // Restore original animation mode
    this.setAnimateMode(originalAnimateMode);
  }
  
  /**
   * Reset generator navigation to initial state
   */
  resetNavigation() {
    this.clearAll();
    this.currentStep = -1;
    this.generator = null;
  }
  
  /**
   * Get current step in navigation
   * @returns {number} Current step index
   */
  getCurrentStep() {
    return this.currentStep;
  }
  
  /**
   * Override this method in subclasses to define step-by-step rendering
   * @returns {Generator} Generator that yields after each step
   */
  *renderGenerator() {
    // Default implementation - override in subclasses
    console.log('renderGenerator() should be overridden in subclasses');
    yield;
  }

  /**
   * Clean up resources (simplified)
   */
  destroy() {
    console.log('AnimatedDiagram: Starting cleanup');
    
    // Stop any current animations
    this.stopAnimation();
    
    // Reset viewBox to original state if available
    if (this.graphContainer && this.graphContainer.d3SvgRoot) {
      const svg = this.graphContainer.d3SvgRoot.node();
      if (svg && this.graphContainer.originalViewBox) {
        svg.setAttribute('viewBox', this.graphContainer.originalViewBox);
      }
    }
    
    // Call parent destroy
    super.destroy();
    
    // Clear remaining references
    this.initCallback = null;
    this.initialized = false;
    this.generator = null;
    
    console.log('AnimatedDiagram: Cleanup completed');
  }
  
}