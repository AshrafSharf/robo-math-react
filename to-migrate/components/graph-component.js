import { select } from 'd3-selection';
import $ from 'jquery';
import SVG from 'svg.js';
import { Graphsheet2d } from '../geom/graphing/graphsheet-2d.js';
import { GridOptions } from '../geom/graphing/grid-options.js';
import { ZoomUtils } from '../utils/zoom-utils.js';
import '../block-styles.css';

const svgFunc = SVG;

export class GraphComponent {
  constructor(componentState, parentDOM, xScaleBuilder, yScaleBuilder) {
    this.componentState = componentState;
    this.parentDOM = parentDOM;
    this.xScaleBuilder = xScaleBuilder;
    this.yScaleBuilder = yScaleBuilder;
    this.mathScriptShapes = [];
    this.containerDOM = null;
    this.svgContainer = null;
    this.d3SvgRoot = null;
    this.graphSheet2D = null;
    this.gridOptions = null;
    this.scriptShapeSVGJSGroup = null;
    
    // Zoom state
    this.originalViewBox = null;
    this.currentZoomScale = 1;
    this.currentZoomPoint = null;
    this.isZoomed = false;
  }

  init() {
    // Create container div like the original base class
    this.containerDOM = $('<div>').attr({
      'id': this.componentState.componentId,
      'class': this.getComponentClass()
    })[0];
    $(this.parentDOM).append(this.containerDOM);
    this.initChild();
    this.initViewBox();
    this.toDefaultState();
    this.applyStyle();
  }

  getComponentClass() {
    return 'graph-item';
  }

  initChild() {
    this.mathScriptShapes = [];
    this.gridOptions = new GridOptions();
    this.svgContainer = $(`<svg id="graph-${this.componentState.componentId}" width="100%" height="100%" style="overflow: visible;" xmlns="http://www.w3.org/2000/svg"></svg>`);
    this.svgContainer.html(` <defs>
      <marker id="scriptArrowHead" viewBox="-10 -10 20 20" refX="0" refY="0" markerWidth="10" markerHeight="10" fill="none" stroke-width="2" orient="auto">
        <polyline stroke-linejoin="bevel" points="-6.75,-6.75 0,0 -6.75,6.75" stroke="white"></polyline></marker>
    </defs>`);
    $(this.containerDOM).append(this.svgContainer);
    this.d3SvgRoot = select(this.svgContainer[0]);
    this.initScriptShapeListeners();
  }

  initScriptShapeListeners() {
    const width = this.componentState.width || this.componentState.size?.width || 0;
    const height = this.componentState.height || this.componentState.size?.height || 0;
    this.graphSheet2D = new Graphsheet2d(this.d3SvgRoot, this.componentState.componentId,
      width, height,
      this.gridOptions, this.xScaleBuilder, this.yScaleBuilder);
    this.scriptShapeSVGJSGroup = svgFunc.adopt(this.graphSheet2D.getScriptShapeLayerNode());
    // Don't render grid here - let GraphContainer control it
  }

  applyStyle() {
    // Styles can be applied directly using jQuery if needed
  }

  renderGrid() {
    this.graphSheet2D.renderGrid(this.gridOptions);
  }

  clearDiagram() {
    this.graphSheet2D.clearShapes();
  }

  toDefaultState() {
    // Set default position and size
    const compStyle = {
      'position': 'absolute',
      'left': (this.componentState.left || 0) + 'px',
      'top': (this.componentState.top || 0) + 'px',
      'width': (this.componentState.width || this.componentState.size?.width || 0) + 'px',
      'height': (this.componentState.height || this.componentState.size?.height || 0) + 'px'
    };
    $(this.containerDOM).css(compStyle);
    this.mathScriptShapes.forEach((scriptShape) => {
      if (scriptShape.disableStroke) {
        scriptShape.disableStroke();
      }
    });
  }

  destroy() {
    this.graphSheet2D.clearShapes();
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
      const width = this.componentState.width || this.componentState.size?.width || 200;
      const height = this.componentState.height || this.componentState.size?.height || 200;
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
    
    // Calculate new viewBox
    const newViewBox = ZoomUtils.calculateZoomedViewBox(
      currentViewBox,
      { x: viewX, y: viewY },
      scale
    );
    
    // Apply zoom
    if (animate) {
      ZoomUtils.animateViewBox(svg, newViewBox, duration);
    } else {
      svg.setAttribute('viewBox', ZoomUtils.formatViewBox(newViewBox));
    }
    
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
    if (animate) {
      ZoomUtils.animateViewBox(svg, original, duration);
    } else {
      svg.setAttribute('viewBox', this.originalViewBox);
    }
    
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
}