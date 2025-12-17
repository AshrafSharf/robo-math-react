/**
 * Consolidated Grapher class - merges CanvasContainer, GraphContainer, and Grapher
 * Provides a single clean API for creating and managing graphs
 */

import { select } from 'd3-selection';
import $ from 'jquery';
import SVG from 'svg.js';
import { Graphsheet2d } from '../geom/graphing/graphsheet-2d.js';
import { GridOptions } from '../geom/graphing/grid-options.js';
import { ZoomUtils } from '../utils/zoom-utils.js';
import { IdUtil } from '../shared/utils/id-util.js';
import { ComponentState } from './component-state.js';
import { getXScaleBuilder, getYScaleBuilder } from '../geom/graphing/graph-scales.js';

// Shape imports
import { PointPrimitiveShape } from '../script-shapes/point-primitive-shape.js';
import { LinePrimitiveShape } from '../script-shapes/line-primitive-shape.js';
import { VectorPrimitiveShape } from '../script-shapes/vector-primitive-shape.js';
import { ArrowPrimitiveShape } from '../script-shapes/arrow-primitive-shape.js';
import { PlotShape } from '../script-shapes/plot-shape.js';
import { ParametricPlotShape } from '../script-shapes/parametric-plot-shape.js';
import { ArcPrimitiveShape } from '../script-shapes/arc-primitive-shape.js';
import { CirclePrimitiveShape } from '../script-shapes/circle-primitive-shape.js';
import { EllipsePrimitiveShape } from '../script-shapes/ellipse-primitive-shape.js';
import { PolygonPrimitiveShape } from '../script-shapes/polygon-primitive-shape.js';
import { CurvePrimitiveShape } from '../script-shapes/curve-primitive-shape.js';
import { AnglePrimitiveShape } from '../script-shapes/angle-primitive-shape.js';
import { MeasurementIndicatorPrimitiveShape } from '../script-shapes/measurement-indicator-primitive-shape.js';
import { LatexPrimitiveShape } from '../script-shapes/latex-primitive-shape.js';
import { Tooltip } from './tooltip.js';

const svgFunc = SVG;

export class Grapher {
  constructor(containerElement, options = {}) {
    // Store the container element
    this.containerElement = containerElement;
    this.options = options;
    
    // Track all math shapes - MUST be initialized before init()
    this.mathScriptShapes = [];
    
    // Zoom state
    this.originalViewBox = null;
    this.currentZoomScale = 1;
    this.currentZoomPoint = null;
    this.isZoomed = false;
    
    // Initialize the canvas - this calls toDefaultState which needs mathScriptShapes
    this.init(containerElement, options);
  }
  
  init(containerElement, options = {}) {
    const id = IdUtil.getID();

    console.log('🔧 Grapher.init() called with container:', containerElement.id || containerElement.className);

    // Create component state
    this.componentState = Object.assign(new ComponentState(), {
      componentId: `graph-item_${id}`,
      content: '',
      props: {}
    });

    // Create container div
    this.containerDOM = $('<div>').attr({
      'id': this.componentState.componentId,
      'class': 'graph-item'
    })[0];
    $(containerElement).append(this.containerDOM);
    console.log('🔧 Created graph-item div with id:', this.componentState.componentId);
    console.log('🔧 Appended to:', containerElement.id || containerElement.className);

    // Initialize the graph
    this.initGraph(options);
    this.initViewBox();
    this.toDefaultState();
    this.applyStyle();
  }
  
  initGraph(options = {}) {
    console.log('🔧 Grapher.initGraph options:', options);
    // Default scale is [-5, 5] for both axes
    const xRange = options.xRange || [-5, 5];
    const yRange = options.yRange || [-5, 5];

    // Get scale types and options
    const xScaleType = options.xScaleType || 'linear';
    const yScaleType = options.yScaleType || 'linear';
    const xScaleOptions = { logBase: options.xLogBase || '10' };
    const yScaleOptions = { logBase: options.yLogBase || '10' };

    // Create scale builders using the appropriate scale type
    const xBuilder = getXScaleBuilder(xScaleType, xScaleOptions);
    const yBuilder = getYScaleBuilder(yScaleType, yScaleOptions);
    this.xScaleBuilder = (width) => xBuilder(xRange, width);
    this.yScaleBuilder = (height) => yBuilder(yRange, height);

    // Initialize grid options
    this.gridOptions = new GridOptions();

    // Copy scale type options from input options
    console.log('🎨 Grapher options:', JSON.stringify({
      xScaleType: options.xScaleType,
      yScaleType: options.yScaleType,
      xDivisions: options.xDivisions,
      yDivisions: options.yDivisions,
      xLogBase: options.xLogBase,
      yLogBase: options.yLogBase
    }));
    if (options.xScaleType) this.gridOptions.xScaleType = options.xScaleType;
    if (options.yScaleType) this.gridOptions.yScaleType = options.yScaleType;
    if (options.xDivisions !== undefined) this.gridOptions.xDivisions = options.xDivisions;
    if (options.yDivisions !== undefined) this.gridOptions.yDivisions = options.yDivisions;
    if (options.xLogBase) this.gridOptions.xLogBase = options.xLogBase;
    if (options.yLogBase) this.gridOptions.yLogBase = options.yLogBase;
    if (options.xPiMultiplier) this.gridOptions.xPiMultiplier = options.xPiMultiplier;
    if (options.yPiMultiplier) this.gridOptions.yPiMultiplier = options.yPiMultiplier;

    // Create SVG container
    this.svgContainer = $(`<svg id="graph-${this.componentState.componentId}" width="100%" height="100%" style="overflow: hidden;" xmlns="http://www.w3.org/2000/svg"></svg>`);
    this.svgContainer.html(` <defs>
      <marker id="scriptArrowHead" viewBox="-10 -10 20 20" refX="0" refY="0" markerWidth="10" markerHeight="10" fill="none" stroke-width="2" orient="auto">
        <polyline stroke-linejoin="bevel" points="-6.75,-6.75 0,0 -6.75,6.75" stroke="white"></polyline></marker>
    </defs>`);
    $(this.containerDOM).append(this.svgContainer);
    this.d3SvgRoot = select(this.svgContainer[0]);
    
    // Use provided dimensions from options
    const width = this.options.width;
    const height = this.options.height;
    
    this.graphSheet2D = new Graphsheet2d(this.d3SvgRoot, this.componentState.componentId,
      width, height,
      this.gridOptions, this.xScaleBuilder, this.yScaleBuilder);
    this.scriptShapeSVGJSGroup = svgFunc.adopt(this.graphSheet2D.getScriptShapeLayerNode());
    
    // Render grid if requested
    if (options.showGrid !== false) {
      // Pass showGridLines option to control whether grid lines are rendered
      this.gridOptions.renderGridLines = options.showGridLines !== false;
      this.renderGrid();
    }
  }
  
  applyStyle() {
    // Styles can be applied directly using jQuery if needed
  }
  
  renderGrid() {
    if (this.graphSheet2D) {
      this.graphSheet2D.renderGrid(this.gridOptions);
    }
  }
  
  clearDiagram() {
    if (this.graphSheet2D) {
      this.graphSheet2D.clearShapes();
    }
  }
  
  toDefaultState() {
    // Use provided dimensions from options
    const width = this.options.width;
    const height = this.options.height;

    // Set default size only - don't override position (may be absolute from parent)
    const compStyle = {
      'width': width + 'px',
      'height': height + 'px'
    };
    $(this.containerDOM).css(compStyle);
    this.mathScriptShapes.forEach((scriptShape) => {
      if (scriptShape.disableStroke) {
        scriptShape.disableStroke();
      }
    });
  }
  
  destroy() {
    console.log('Grapher: Starting destroy');
    
    // Clean up all math shapes first
    if (this.mathScriptShapes) {
      this.mathScriptShapes.forEach(shape => {
        if (shape && shape.remove) {
          shape.remove();
        }
      });
      this.mathScriptShapes = [];
    }
    
    // Clean up graphSheet2D
    if (this.graphSheet2D) {
      this.graphSheet2D.destroy();
      this.graphSheet2D = null;
    }
    
    // Clean up SVG and DOM elements
    if (this.scriptShapeSVGJSGroup) {
      this.scriptShapeSVGJSGroup.remove();
      this.scriptShapeSVGJSGroup = null;
    }
    
    if (this.svgContainer) {
      this.svgContainer.remove();
      this.svgContainer = null;
    }
    
    if (this.d3SvgRoot) {
      this.d3SvgRoot.remove();
      this.d3SvgRoot = null;
    }
    
    // Clean up container DOM
    if (this.containerDOM) {
      $(this.containerDOM).empty().remove();
      this.containerDOM = null;
    }
    
    // Clear all references
    this.containerElement = null;
    this.componentState = null;
    this.xScaleBuilder = null;
    this.yScaleBuilder = null;
    this.gridOptions = null;
    
    console.log('Grapher: Destroy completed');
  }
  
  // Removed resize handling as dimensions are fixed
  
  addMathShape(mathScriptShape) {
    mathScriptShape.setRenderingContent(this.d3SvgRoot, this.scriptShapeSVGJSGroup, this.graphSheet2D);
    mathScriptShape.create();
    this.mathScriptShapes.push(mathScriptShape);
  }
  
  getSVGRoot() {
    return this.d3SvgRoot;
  }
  
  getD3SVGRoot() {
    return this.d3SvgRoot;
  }
  
  getContainerDOM() {
    return this.containerDOM;
  }

  /**
   * Get the grapher's position relative to its offset parent
   * @returns {{left: number, top: number}}
   */
  getPosition() {
    if (!this.containerDOM) {
      throw new Error('Grapher.getPosition: containerDOM is null');
    }
    return {
      left: this.containerDOM.offsetLeft,
      top: this.containerDOM.offsetTop
    };
  }

  xends() {
    return this.graphSheet2D.xends();
  }

  yends() {
    return this.graphSheet2D.yends();
  }

  /**
   * Convert model X coordinate to view (pixel) X coordinate
   * @param {number} modelX - X coordinate in model space
   * @returns {number} X coordinate in view/pixel space
   */
  toViewX(modelX) {
    return this.graphSheet2D.toViewX(modelX);
  }

  /**
   * Convert model Y coordinate to view (pixel) Y coordinate
   * @param {number} modelY - Y coordinate in model space
   * @returns {number} Y coordinate in view/pixel space
   */
  toViewY(modelY) {
    return this.graphSheet2D.toViewY(modelY);
  }

  hide(allChildItems) {
    this.mathScriptShapes.forEach((scriptShape) => {
      if (scriptShape.disableStroke) {
        scriptShape.disableStroke();
      }
    });
    $(this.containerDOM).hide();
  }
  
  // Initialize viewBox tracking
  initViewBox() {
    const svg = this.d3SvgRoot.node();
    // Set initial viewBox if not present
    if (!svg.getAttribute('viewBox')) {
      // Use the dimensions provided in options
      const width = this.options.width;
      const height = this.options.height;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    // Store original viewBox
    this.originalViewBox = svg.getAttribute('viewBox');
  }
  
  // Zoom with object parameters
  zoom(options = {}) {
    const {
      point,           // { x: modelX, y: modelY }
      scale = 0.5,     // zoom scale (0.1 to 1.0)
      duration = 0.5,  // animation duration in seconds
      animate = true   // whether to animate
    } = options;

    if (!point) {
      throw new Error('Zoom requires a point: { x, y } in model coordinates');
    }

    // Convert model to view coordinates
    const viewX = this.graphSheet2D.toViewX(point.x);
    const viewY = this.graphSheet2D.toViewY(point.y);
    
    // Get current viewBox
    const svg = this.d3SvgRoot.node();
    const currentViewBox = svg.getAttribute('viewBox') || this.originalViewBox;
    
    // Calculate new viewBox with bounds checking
    const newViewBox = ZoomUtils.calculateZoomedViewBox(
      currentViewBox,
      { x: viewX, y: viewY },
      scale,
      this.originalViewBox  // Pass original viewBox as bounds
    );
    
    // Apply zoom
    ZoomUtils.animateViewBox(svg, newViewBox, duration, animate);
    
    // Store current zoom state
    this.currentZoomScale = scale;
    this.currentZoomPoint = point;
    this.isZoomed = true;
  }
  
  // Reset zoom to original view
  resetZoom(options = {}) {
    const {
      duration = 0.5,
      animate = true
    } = options;

    if (!this.originalViewBox) return;
    
    const svg = this.d3SvgRoot.node();
    const original = ZoomUtils.parseViewBox(this.originalViewBox);
    
    // Animate or set immediately
    ZoomUtils.animateViewBox(svg, original, duration, animate);
    
    this.currentZoomScale = 1;
    this.currentZoomPoint = null;
    this.isZoomed = false;
  }
  
  // Get current zoom state
  getZoomState() {
    return {
      isZoomed: this.isZoomed || false,
      scale: this.currentZoomScale || 1,
      point: this.currentZoomPoint || null,
      originalViewBox: this.originalViewBox
    };
  }
  
  // ============= Shape creation methods =============
  
  point(x, y, radius = 4) {
    const pointPrimitiveShape = new PointPrimitiveShape([x, y], radius);
    this.addMathShape(pointPrimitiveShape);
    return pointPrimitiveShape;
  }
  
  line(x1, y1, x2, y2) {
    const linePrimitiveShape = new LinePrimitiveShape([x1, y1, x2, y2]);
    this.addMathShape(linePrimitiveShape);
    return linePrimitiveShape;
  }
  
  vector(x1, y1, x2, y2) {
    const vectorPrimitiveShape = new VectorPrimitiveShape([x1, y1, x2, y2]);
    this.addMathShape(vectorPrimitiveShape);
    return vectorPrimitiveShape;
  }
  
  arrow(x1, y1, x2, y2, angle = Math.PI, clockwise = true) {
    const arrowPrimitiveShape = new ArrowPrimitiveShape([x1, y1, x2, y2], angle, clockwise);
    this.addMathShape(arrowPrimitiveShape);
    return arrowPrimitiveShape;
  }
  
  plot(plotEquation, domainMin, domainMax) {
    const plotShape = new PlotShape(plotEquation, domainMin, domainMax);
    this.addMathShape(plotShape);
    return plotShape;
  }
  
  parametricPlot(xFunction, yFunction, tMin, tMax) {
    const parametricPlotShape = new ParametricPlotShape(xFunction, yFunction, tMin, tMax);
    this.addMathShape(parametricPlotShape);
    return parametricPlotShape;
  }
  
  arc(start, end, rx, ry) {
    const arcPrimitiveShape = new ArcPrimitiveShape([start.x, start.y, end.x, end.y, rx, ry]);
    this.addMathShape(arcPrimitiveShape);
    return arcPrimitiveShape;
  }
  
  circle(originX, originY, radius, options = {}) {
    const circlePrimitiveShape = new CirclePrimitiveShape([originX, originY, radius], options);
    this.addMathShape(circlePrimitiveShape);
    return circlePrimitiveShape;
  }
  
  ellipse(originX, originY, rx, ry, options = {}) {
    const ellipsePrimitiveShape = new EllipsePrimitiveShape([originX, originY, rx, ry], options);
    this.addMathShape(ellipsePrimitiveShape);
    return ellipsePrimitiveShape;
  }
  
  label(x, y, mathContent) {
    // For now, create a simple label - need to implement LabelScriptShape
    console.log('Label not fully implemented yet:', mathContent, 'at', x, y);
    return null;
  }
  
  polygon(...args) {
    // Check if last argument is options object
    let modelCoordinates = args;
    let options = {};
    if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
      options = args[args.length - 1];
      modelCoordinates = args.slice(0, -1);
    }
    const polygonPrimitiveShape = new PolygonPrimitiveShape(modelCoordinates, options);
    this.addMathShape(polygonPrimitiveShape);
    return polygonPrimitiveShape;
  }
  
  //curveType: {'linear', 'step', 'step-before', 'step-after', 'basis', 'cardinal', 'monotone', 'catmull'}
  curve(curveType, ...modelCoordinates) {
    const curvePrimitiveShape = new CurvePrimitiveShape(modelCoordinates, curveType);
    this.addMathShape(curvePrimitiveShape);
    return curvePrimitiveShape;
  }
  
  angle(vertex, point1, point2, angleType = 'interior', options = {}) {
    // Just pass flat coordinates directly like vector does
    const coordinates = [
      vertex.x, vertex.y,
      point1.x, point1.y,
      point2.x, point2.y
    ];
    
    const anglePrimitiveShape = new AnglePrimitiveShape(coordinates, angleType, options);
    this.addMathShape(anglePrimitiveShape);
    return anglePrimitiveShape;
  }
  
  measurementIndicator(x1, y1, x2, y2, options = {}) {
    const measurementIndicatorPrimitiveShape = new MeasurementIndicatorPrimitiveShape([x1, y1, x2, y2], options);
    this.addMathShape(measurementIndicatorPrimitiveShape);
    return measurementIndicatorPrimitiveShape;
  }
  
  latex(x, y, latexString, options = {}) {
    const latexPrimitiveShape = new LatexPrimitiveShape([x, y], latexString, options);
    this.addMathShape(latexPrimitiveShape);
    return latexPrimitiveShape;
  }
  
  // ============= Zoom methods =============
  
  // Primary zoom method with object parameters
  zoomIn(options) {
    // Support both object style and backwards compatibility
    if (typeof options === 'object' && options.point) {
      // Object style: { point: {x, y}, scale: 0.5, duration: 0.5 }
      this.zoom(options);
    } else if (typeof options === 'object' && (options.x !== undefined || options.y !== undefined)) {
      // Simplified object with x,y directly: { x: 5, y: 7, scale: 0.5 }
      const { x, y, scale = 0.5, duration = 0.5, animate = true } = options;
      this.zoom({
        point: { x, y },
        scale,
        duration,
        animate
      });
    } else {
      throw new Error('zoomIn requires an object with point coordinates: { point: {x, y} } or { x, y }');
    }
    return this; // for chaining
  }
  
  // Reset zoom
  zoomOut(options = {}) {
    this.resetZoom(options);
    return this; // for chaining
  }
  
  // Pan to a specific point without changing zoom level
  panTo(options = {}) {
    const {
      point,           // { x: modelX, y: modelY }
      duration = 0.5,  // animation duration in seconds
      animate = true   // whether to animate
    } = options;

    if (!point) {
      throw new Error('panTo requires a point: { x, y }');
    }

    // Convert model coordinates to view coordinates
    const viewX = this.graphSheet2D.toViewX(point.x);
    const viewY = this.graphSheet2D.toViewY(point.y);

    // Get current viewBox
    const svg = this.d3SvgRoot.node();
    const currentViewBox = svg.getAttribute('viewBox') || this.originalViewBox;
    const parsed = ZoomUtils.parseViewBox(currentViewBox);
    
    // Calculate new viewBox position (center on point, keep same dimensions)
    const newX = viewX - parsed.width / 2;
    const newY = viewY - parsed.height / 2;
    
    const newViewBox = {
      x: newX,
      y: newY,
      width: parsed.width,
      height: parsed.height
    };
    
    // Constrain to original bounds if needed
    const original = ZoomUtils.parseViewBox(this.originalViewBox);
    if (newViewBox.x < original.x) newViewBox.x = original.x;
    if (newViewBox.y < original.y) newViewBox.y = original.y;
    if (newViewBox.x + newViewBox.width > original.x + original.width) {
      newViewBox.x = original.x + original.width - newViewBox.width;
    }
    if (newViewBox.y + newViewBox.height > original.y + original.height) {
      newViewBox.y = original.y + original.height - newViewBox.height;
    }
    
    // Apply pan
    ZoomUtils.animateViewBox(svg, newViewBox, duration, animate);
    
    // Store current state
    this.currentZoomPoint = point;
    
    return this; // for chaining
  }
  
  // Zoom to fit specific bounds
  zoomToFit(options = {}) {
    const {
      bounds,           // { x, y, width, height } in model coordinates
      padding = 0.1,    // padding factor (0.1 = 10% padding)
      duration = 0.5,
      animate = true
    } = options;

    if (!bounds) {
      throw new Error('zoomToFit requires bounds: { x, y, width, height }');
    }

    // Convert model bounds to view bounds
    const viewBounds = {
      x: this.graphSheet2D.toViewX(bounds.x),
      y: this.graphSheet2D.toViewY(bounds.y),
      width: this.graphSheet2D.toUIWidth(bounds.width),
      height: this.graphSheet2D.toUIHeight(bounds.height)
    };
    
    // Calculate zoom to fit these bounds
    const svg = this.d3SvgRoot.node();
    const currentViewBox = ZoomUtils.parseViewBox(svg.getAttribute('viewBox'));
    
    // Calculate scale to fit
    const scaleX = currentViewBox.width / (viewBounds.width * (1 + padding));
    const scaleY = currentViewBox.height / (viewBounds.height * (1 + padding));
    const scale = Math.min(scaleX, scaleY, 0.9); // Cap at 0.9 to avoid over-zoom
    
    // Zoom to center of bounds
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    this.zoomIn({
      point: { x: centerX, y: centerY },
      scale,
      duration,
      animate
    });
    
    return this;
  }
  
  // Zoom to a single shape
  zoomToShape(shape, options = {}) {
    if (!shape) {
      console.warn('No shape provided to zoomToShape');
      return this;
    }
    
    // Delegate to zoomToShapes with single shape
    return this.zoomToShapes([shape], options);
  }
  
  // Zoom to multiple shapes
  zoomToShapes(shapes, options = {}) {
    const {
      padding = 0.2,    // 20% padding by default
      duration = 0.5,
      animate = true
    } = options;

    if (!shapes || shapes.length === 0) {
      console.warn('No shapes provided to zoomToShapes');
      return this;
    }

    // Ensure shapes is an array
    const shapeArray = Array.isArray(shapes) ? shapes : [shapes];
    
    // Extract model coordinates from shapes
    const points = [];
    shapeArray.forEach(shape => {
      if (shape.modelCoordinates) {
        // For point shapes: [x, y]
        if (shape.modelCoordinates.length === 2) {
          points.push({
            x: shape.modelCoordinates[0],
            y: shape.modelCoordinates[1]
          });
        }
        // For other shapes, extract pairs of coordinates
        else {
          for (let i = 0; i < shape.modelCoordinates.length - 1; i += 2) {
            points.push({
              x: shape.modelCoordinates[i],
              y: shape.modelCoordinates[i + 1]
            });
          }
        }
      }
    });

    if (points.length === 0) {
      console.warn('No valid coordinates found in shapes');
      return this;
    }

    // Calculate bounding box
    const bounds = ZoomUtils.calculateBounds(points);
    
    // If it's a single point, create a small bounding box around it
    if (points.length === 1) {
      const point = points[0];
      const boxSize = 2; // Create a 2x2 box around the point in model coordinates
      bounds.x = point.x - boxSize / 2;
      bounds.y = point.y - boxSize / 2;
      bounds.width = boxSize;
      bounds.height = boxSize;
    }
    
    // Ensure minimum bounds size
    if (bounds.width < 0.1) bounds.width = 2;
    if (bounds.height < 0.1) bounds.height = 2;

    // Use zoomToFit with the calculated bounds
    return this.zoomToFit({
      bounds,
      padding,
      duration,
      animate
    });
  }
  
  // ============= Tooltip methods =============
  
  tooltip(shape, text, options) {
    if (!this._tooltip) {
      this._tooltip = new Tooltip(this);
    }
    this._tooltip.add(shape, text, options);
    return this; // chainable
  }
  
  tooltipAt(modelPoint, text, options) {
    if (!this._tooltip) {
      this._tooltip = new Tooltip(this);
    }
    return this._tooltip.addAt(modelPoint, text, options);
  }
  
  hideTooltip(shape) {
    if (this._tooltip) {
      this._tooltip.hide(shape);
    }
    return this;
  }
  
  showTooltip(shape) {
    if (this._tooltip) {
      this._tooltip.show(shape);
    }
    return this;
  }
  
  removeTooltip(shape) {
    if (this._tooltip) {
      this._tooltip.remove(shape);
    }
    return this;
  }
  
  clearTooltips() {
    if (this._tooltip) {
      this._tooltip.clear();
    }
    return this;
  }
}