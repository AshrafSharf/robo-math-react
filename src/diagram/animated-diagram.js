/**
 * AnimatedDiagram class extending BaseDiagram
 * Shapes are created and animated immediately
 * Step control handled through direct method calls
 */

import { BaseDiagram } from './base-diagram.js';
import { TexToSVGShapeEffect } from '../effects/shape-effects/tex-to-svg-shape-effect.js';
import { MathShapeEffect } from '../effects/shape-effects/math-shape-effect.js';
import { ReverseVectorEffect } from '../effects/reverse-vector-effect.js';
import { MoveVectorEffect } from '../effects/move-vector-effect.js';
import { ZoomEffect } from '../effects/zoom-effect.js';
import { PanEffect } from '../effects/pan-effect.js';
import { DEFAULT_SHAPE_COLORS } from './style_helper.js';
import { WriteEffect } from '../mathtext/effects/write-effect.js';

export class AnimatedDiagram extends BaseDiagram {
  /**
   * @param {Object} coordinateMapper - Coordinate mapper for logical to pixel conversion
   * @param {HTMLElement} canvasSection - Parent DOM element for rendering
   * @param {Object} roboCanvas - RoboCanvas instance for auto-scrolling
   * @param {Object} options - Additional options
   */
  constructor(coordinateMapper, canvasSection, roboCanvas, options = {}) {
    super(coordinateMapper, canvasSection, roboCanvas, options);

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
    if (this.animateMode) {
      shape.hide();
      const effect = effectInstance || new MathShapeEffect(shape);
      this._playEffect(effect);
    } else {
      shape.renderEndState();
      shape.show();
    }
  }
  
  /**
   * Create a point (hidden by default for fragment control)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} position - Position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {radius, strokeWidth}
   * @returns {Object} Point shape
   */
  point(graphContainer, position, color = 'red', options = {}) {
    const shape = this._createPoint(graphContainer, position, color, options);
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a vector (hidden by default for fragment control)
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Vector shape
   */
  vector(graphContainer, start, end, color = 'red', options = {}) {
    const shape = this._createVector(graphContainer, start, end, color, options);
    shape.primitiveShape.attr('fill', null);
    shape.start = { x: start.x, y: start.y };
    shape.end = { x: end.x, y: end.y };
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a dashed vector with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, dashPattern}
   * @returns {Object} Vector shape with dash pattern
   */
  dashedVector(graphContainer, start, end, color = 'red', options = {}) {
    const shape = this._createDashedVector(graphContainer, start, end, color, options);
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a reversed vector (pointing in opposite direction) with flip animation
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

    const displacement = {
      x: end.x - start.x,
      y: end.y - start.y
    };

    const shape = graphContainer.vector(end.x, end.y, start.x, start.y);
    const color = options.color || 'red';
    shape.stroke(this.parseColor(color));

    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    if (options.dashed !== false) {
      const dashPattern = options.dashPattern || '5,3';
      shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    }

    const reverseEffect = new ReverseVectorEffect(shape, start, end, displacement);
    this._applyModeLogic(shape, reverseEffect);
    this.objects.push(shape);

    return shape;
  }
  
  /**
   * Create a vector at original position and animate it moving to target position
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} originalVector - Original vector definition {start: {x,y}, end: {x,y}}
   * @param {Object} targetPosition - Target position {x, y} or target vector {start: {x,y}, end: {x,y}}
   * @param {Object} options - Options including color, strokeWidth, dashed, dashPattern
   * @returns {Object} The animated vector shape
   */
  moveVector(graphContainer, originalVector, targetPosition, options = {}) {
    const originalStart = originalVector.start;
    const originalEnd = originalVector.end;
    const targetStart = targetPosition.start || targetPosition;

    const shape = graphContainer.vector(
      originalStart.x,
      originalStart.y,
      originalEnd.x,
      originalEnd.y
    );

    const color = options.color || 'blue';
    shape.stroke(this.parseColor(color));

    if (options.strokeWidth) shape.strokeWidth(options.strokeWidth);

    if (options.dashed) {
      const dashPattern = options.dashPattern || '5,3';
      shape.primitiveShape.attr('stroke-dasharray', dashPattern);
    }

    const moveEffect = new MoveVectorEffect(shape, originalStart, targetStart);
    this._applyModeLogic(shape, moveEffect);
    this.objects.push(shape);

    return shape;
  }
  
  /**
   * Create a line segment with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Line shape
   */
  line(graphContainer, start, end, color = 'black', options = {}) {
    const shape = this._createLine(graphContainer, start, end, color, options);
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a measurement indicator with end markers and immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {mainRadius, markerLength, markerRadius, offset, strokeWidth}
   * @returns {Object} Measurement indicator shape
   */
  measurementIndicator(graphContainer, start, end, color = 'black', options = {}) {
    const shape = this._createMeasurementIndicator(graphContainer, start, end, color, options);
    // Measurement indicators always render instantly (no animation)
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a function plot with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Function} equation - Function that takes x and returns y
   * @param {number} domainMin - Minimum x value
   * @param {number} domainMax - Maximum x value
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Plot shape
   */
  plot(graphContainer, equation, domainMin, domainMax, color = 'green', options = {}) {
    const shape = this._createPlot(graphContainer, equation, domainMin, domainMax, color, options);
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }

  /**
   * Plot a mathematical expression string with animation
   * Uses math.js for parsing - supports standard math syntax
   * @param {Object} graphContainer - The graph container to render on
   * @param {string} expression - Math expression like "a*x^2 + b*x + c" or "sin(x)"
   * @param {number} domainMin - Minimum x value
   * @param {number} domainMax - Maximum x value
   * @param {Object} scope - Variable substitution map {a: 1, b: 2, c: 3}
   * @param {Object} options - Style options {color, strokeWidth, variable}
   * @returns {Object} Plot shape
   */
  plotExpression(graphContainer, expression, domainMin, domainMax, scope = {}, options = {}) {
    const { variable = 'x', color = 'blue', ...plotOptions } = options;
    const shape = this._createPlotFromExpression(
      graphContainer, expression, variable, scope,
      domainMin, domainMax, color, plotOptions
    );
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a parametric plot with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Function} xFunction - Function that takes t and returns x
   * @param {Function} yFunction - Function that takes t and returns y
   * @param {number} tMin - Minimum t value
   * @param {number} tMax - Maximum t value
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Parametric plot shape
   */
  parametricPlot(graphContainer, xFunction, yFunction, tMin, tMax, color = 'blue', options = {}) {
    const shape = this._createParametricPlot(graphContainer, xFunction, yFunction, tMin, tMax, color, options);
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a circle with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} center - Center position {x, y}
   * @param {number} radius - Circle radius
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill, stroke}
   * @returns {Object} Circle shape
   */
  circle(graphContainer, center, radius, color = 'blue', options = {}) {
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color
    };
    const shape = this._createCircle(graphContainer, center, radius, shapeOptions.stroke, shapeOptions);
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an ellipse with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} center - Center position {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Ellipse shape
   */
  ellipse(graphContainer, center, rx, ry, color = 'red', options = {}) {
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color
    };
    const shape = this._createEllipse(graphContainer, center, rx, ry, shapeOptions.stroke, shapeOptions);
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an arc with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start point {x, y}
   * @param {Object} end - End point {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Arc shape
   */
  arc(graphContainer, start, end, rx, ry, color = 'green', options = {}) {
    const shape = this._createArc(graphContainer, start, end, rx, ry, color, options);
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a polygon with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Array<Object>} vertices - Array of vertices [{x, y}, ...]
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, fill}
   * @returns {Object} Polygon shape
   */
  polygon(graphContainer, vertices, color = 'orange', options = {}) {
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color
    };
    const shape = this._createPolygon(graphContainer, vertices, shapeOptions.stroke, shapeOptions);
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a curve with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {string} type - Curve type ('linear', 'basis', 'cardinal', etc.)
   * @param {Array<Object>} points - Control points [{x, y}, ...]
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth}
   * @returns {Object} Curve shape
   */
  curve(graphContainer, type, points, color = 'violet', options = {}) {
    const shape = this._createCurve(graphContainer, type, points, color, options);
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a curved arrow with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} start - Start position {x, y} in graph coordinates
   * @param {Object} end - End position {x, y} in graph coordinates
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {strokeWidth, angle, clockwise}
   * @returns {Object} Arrow shape
   */
  arrow(graphContainer, start, end, color = 'red', options = {}) {
    const shape = this._createArrow(graphContainer, start, end, color, options);
    shape.primitiveShape.attr('fill', null);
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create an angle between three points or two vectors with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object|Array} vertex - Vertex point {x, y} or array of 3 points
   * @param {Object} point1 - First point {x, y} (if vertex is not array)
   * @param {Object} point2 - Second point {x, y} (if vertex is not array)
   * @param {string} angleType - Type of angle ('interior', 'exterior-first', 'exterior-second', 'reflex', 'opposite')
   * @param {Object} options - Additional options {radius, label, color, fillOpacity, strokeWidth, showValue}
   * @returns {Object} Angle shape
   */
  angle(graphContainer, vertex, point1, point2, angleType = 'interior', options = {}) {
    const color = options.color || options.stroke || DEFAULT_SHAPE_COLORS.angle;
    const shape = this._createAngle(graphContainer, vertex, point1, point2, angleType, color, options);
    this._applyModeLogic(shape);
    this.objects.push(shape);
    return shape;
  }
  
  /**
   * Create a LaTeX text rendered as SVG with immediate animation
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} position - Position {x, y}
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Color name or hex
   * @param {Object} options - Additional options {fontSize, scale}
   * @returns {Object} LatexShape
   */
  texToSvg(graphContainer, position, latexString, color = 'black', options = {}) {
    const shape = this._createTexToSvg(graphContainer, position, latexString, color, options);
    // Use TexToSVGShapeEffect for animated drawing
    shape.hide();
    this._playEffect(new TexToSVGShapeEffect(shape));
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
   * @returns {Object} Label shape
   */
  labelOnPoint(graphContainer, point, latexString, color = 'black', options = {}) {
    const shape = this._createLabelOnPoint(graphContainer, point, latexString, color, options);
    // Labels always render instantly (no animation)
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
   * @returns {Object} Label shape
   */
  labelBetweenPoints(graphContainer, start, end, latexString, color = 'black', options = {}) {
    const shape = this._createLabelBetweenPoints(graphContainer, start, end, latexString, color, options);
    // Labels always render instantly (no animation)
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a label for an angle shape at its center with optional offset
   * @param {Object} graphContainer - The graph container to render on
   * @param {Object} angleShape - The angle shape object (from interiorAngle, exteriorAngle, etc.)
   * @param {string} latexString - LaTeX expression string
   * @param {string} color - Color name or hex (default: 'black')
   * @param {Object} options - Additional options {offsetInView, fontSize}
   * @returns {Object} Label shape
   */
  angleLabel(graphContainer, angleShape, latexString, color = 'black', options = {}) {
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
   * Write a math text component with pen animation (override base class)
   * @param {MathTextComponent} mathComponent - Math text component to animate
   * @returns {MathTextComponent} The math text component
   */
  writeMathText(mathComponent) {
    this._playEffect(new WriteEffect(mathComponent));
    return mathComponent;
  }

  /**
   * Animate writing a math text component with full write effect (alias)
   * @param {MathTextComponent} mathComponent - Math text component to animate
   * @returns {AnimatedDiagram} - For chaining
   */
  write(mathComponent) {
    this._playEffect(new WriteEffect(mathComponent));
    return this;
  }

  /**
   * Animate writing a math text component excluding bbox-marked sections
   * @param {MathTextComponent} mathComponent - Math text component to animate
   * @returns {AnimatedDiagram} - For chaining
   */
  writeWithout(mathComponent) {
    this._playEffect(mathComponent.writeWithoutBBox());
    return this;
  }

  /**
   * Animate writing only bbox-marked sections of a math text component
   * @param {MathTextComponent} mathComponent - Math text component to animate
   * @param {boolean} includeAll - Whether to include all content (default: false)
   * @returns {AnimatedDiagram} - For chaining
   */
  writeOnly(mathComponent, includeAll = false) {
    this._playEffect(mathComponent.writeOnlyBBox(includeAll));
    return this;
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