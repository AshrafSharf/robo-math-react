/**
 * PolarGrapher - Graph container for polar coordinate systems
 *
 * Similar to Grapher but uses GraphsheetPolar for polar coordinate rendering.
 * Provides the same shape creation API but with polar coordinate grid.
 */

import { select } from 'd3-selection';
import $ from 'jquery';
import SVG from 'svg.js';
import { GraphsheetPolar } from '../geom/graphing/graphsheet-polar.js';
import { GridOptions } from '../geom/graphing/grid-options.js';
import { IdUtil } from '../utils/id-util.js';
import { ComponentState } from './component-state.js';

// Shape imports
import { PointPrimitiveShape } from '../script-shapes/point-primitive-shape.js';
import { LinePrimitiveShape } from '../script-shapes/line-primitive-shape.js';
import { VectorPrimitiveShape } from '../script-shapes/vector-primitive-shape.js';
import { PlotShape } from '../script-shapes/plot-shape.js';
import { ParametricPlotShape } from '../script-shapes/parametric-plot-shape.js';
import { ArcPrimitiveShape } from '../script-shapes/arc-primitive-shape.js';
import { CirclePrimitiveShape } from '../script-shapes/circle-primitive-shape.js';
import { PolygonPrimitiveShape } from '../script-shapes/polygon-primitive-shape.js';
import { CurvePrimitiveShape } from '../script-shapes/curve-primitive-shape.js';
import { LatexPrimitiveShape } from '../script-shapes/latex-primitive-shape.js';

const svgFunc = SVG;

export class PolarGrapher {
  constructor(containerElement, options = {}) {
    // Store the container element
    this.containerElement = containerElement;
    this.options = options;

    // Track all math shapes - MUST be initialized before init()
    this.mathScriptShapes = [];

    // Initialize the canvas
    this.init(containerElement, options);
  }

  init(containerElement, options = {}) {
    const id = IdUtil.getID();

    console.log('🔧 PolarGrapher.init() called with container:', containerElement.id || containerElement.className);

    // Create component state
    this.componentState = Object.assign(new ComponentState(), {
      componentId: `polar-graph-item_${id}`,
      content: '',
      props: {}
    });

    // Create container div
    this.containerDOM = $('<div>').attr({
      'id': this.componentState.componentId,
      'class': 'graph-item polar-graph-item'
    })[0];
    $(containerElement).append(this.containerDOM);

    // Initialize the graph
    this.initGraph(options);
    this.initViewBox();
    this.toDefaultState();
    this.applyStyle();
  }

  initGraph(options = {}) {
    // Polar grid options
    const rMax = options.rMax || 10;
    const radialLines = options.radialLines || 12;
    const concentricCircles = options.concentricCircles || 5;
    const angleLabels = options.angleLabels !== false;

    // Initialize grid options
    this.gridOptions = new GridOptions();
    this.gridOptions.rMax = rMax;
    this.gridOptions.radialLines = radialLines;
    this.gridOptions.concentricCircles = concentricCircles;
    this.gridOptions.angleLabels = angleLabels;

    // Create SVG container
    this.svgContainer = $(`<svg id="polar-graph-${this.componentState.componentId}" width="100%" height="100%" style="overflow: hidden;" xmlns="http://www.w3.org/2000/svg"></svg>`);
    this.svgContainer.html(` <defs>
      <marker id="scriptArrowHead" viewBox="-10 -10 20 20" refX="0" refY="0" markerWidth="10" markerHeight="10" fill="none" stroke-width="2" orient="auto">
        <polyline stroke-linejoin="bevel" points="-6.75,-6.75 0,0 -6.75,6.75" stroke="white"></polyline></marker>
    </defs>`);
    $(this.containerDOM).append(this.svgContainer);
    this.d3SvgRoot = select(this.svgContainer[0]);

    // Use provided dimensions from options
    const width = this.options.width;
    const height = this.options.height;

    // Create polar graphsheet
    this.graphSheet2D = new GraphsheetPolar(
      this.d3SvgRoot,
      this.componentState.componentId,
      width,
      height,
      this.gridOptions
    );
    this.scriptShapeSVGJSGroup = svgFunc.adopt(this.graphSheet2D.getScriptShapeLayerNode());

    // Render grid if requested
    if (options.showGrid !== false) {
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

    // Set default size only
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
    console.log('PolarGrapher: Starting destroy');

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
    this.gridOptions = null;

    console.log('PolarGrapher: Destroy completed');
  }

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

  // Initialize viewBox tracking
  initViewBox() {
    const svg = this.d3SvgRoot.node();
    // Set initial viewBox if not present
    if (!svg.getAttribute('viewBox')) {
      const width = this.options.width;
      const height = this.options.height;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    // Store original viewBox
    this.originalViewBox = svg.getAttribute('viewBox');
  }

  /**
   * Get x coordinate range
   */
  xends() {
    return this.graphSheet2D.xends();
  }

  /**
   * Get y coordinate range
   */
  yends() {
    return this.graphSheet2D.yends();
  }

  /**
   * Convert model X coordinate to view (pixel) X coordinate
   */
  toViewX(modelX) {
    return this.graphSheet2D.toViewX(modelX);
  }

  /**
   * Convert model Y coordinate to view (pixel) Y coordinate
   */
  toViewY(modelY) {
    return this.graphSheet2D.toViewY(modelY);
  }

  /**
   * Convert polar coordinates to view coordinates
   * @param {number} r - Radial distance
   * @param {number} theta - Angle in radians
   * @returns {{x: number, y: number}}
   */
  polarToView(r, theta) {
    return this.graphSheet2D.polarToView(r, theta);
  }

  /**
   * Get the center point of the polar grid in view coordinates
   */
  getCenter() {
    return this.graphSheet2D.getCenter();
  }

  /**
   * Get the maximum radius in model coordinates
   */
  getRMax() {
    return this.graphSheet2D.getRMax();
  }

  // ============= Shape creation methods =============

  point(x, y, radius = 4) {
    const pointPrimitiveShape = new PointPrimitiveShape([x, y], radius);
    this.addMathShape(pointPrimitiveShape);
    return pointPrimitiveShape;
  }

  /**
   * Create a point using polar coordinates
   * @param {number} r - Radial distance
   * @param {number} theta - Angle in radians
   * @param {number} radius - Point display radius
   */
  polarPoint(r, theta, radius = 4) {
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    return this.point(x, y, radius);
  }

  line(x1, y1, x2, y2) {
    const linePrimitiveShape = new LinePrimitiveShape([x1, y1, x2, y2]);
    this.addMathShape(linePrimitiveShape);
    return linePrimitiveShape;
  }

  /**
   * Create a line using polar coordinates
   * @param {number} r1 - Start radial distance
   * @param {number} theta1 - Start angle in radians
   * @param {number} r2 - End radial distance
   * @param {number} theta2 - End angle in radians
   */
  polarLine(r1, theta1, r2, theta2) {
    const x1 = r1 * Math.cos(theta1);
    const y1 = r1 * Math.sin(theta1);
    const x2 = r2 * Math.cos(theta2);
    const y2 = r2 * Math.sin(theta2);
    return this.line(x1, y1, x2, y2);
  }

  vector(x1, y1, x2, y2) {
    const vectorPrimitiveShape = new VectorPrimitiveShape([x1, y1, x2, y2]);
    this.addMathShape(vectorPrimitiveShape);
    return vectorPrimitiveShape;
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

  /**
   * Create a polar curve r = f(theta)
   * @param {Function} rFunction - Function that takes theta and returns r
   * @param {number} thetaMin - Start angle (default 0)
   * @param {number} thetaMax - End angle (default 2π)
   */
  polarPlot(rFunction, thetaMin = 0, thetaMax = 2 * Math.PI) {
    // Convert polar function to parametric Cartesian
    const xFunction = (theta) => rFunction(theta) * Math.cos(theta);
    const yFunction = (theta) => rFunction(theta) * Math.sin(theta);
    return this.parametricPlot(xFunction, yFunction, thetaMin, thetaMax);
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

  polygon(...args) {
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

  curve(curveType, ...modelCoordinates) {
    const curvePrimitiveShape = new CurvePrimitiveShape(modelCoordinates, curveType);
    this.addMathShape(curvePrimitiveShape);
    return curvePrimitiveShape;
  }

  latex(x, y, latexString, options = {}) {
    const latexPrimitiveShape = new LatexPrimitiveShape([x, y], latexString, options);
    this.addMathShape(latexPrimitiveShape);
    return latexPrimitiveShape;
  }

  hide(allChildItems) {
    this.mathScriptShapes.forEach((scriptShape) => {
      if (scriptShape.disableStroke) {
        scriptShape.disableStroke();
      }
    });
    $(this.containerDOM).hide();
  }

  show() {
    $(this.containerDOM).show();
  }
}
