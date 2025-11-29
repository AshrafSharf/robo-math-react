import { ComponentState } from './models/component-state.js';
import { IdUtil } from './shared/utils/id-util.js';
import { GeomUtil } from './shared/utils/geom-util.js';
import { GraphComponent } from './components/graph-component.js';
import { GraphContainer as GraphWrapper } from './blocks/graph-container.js';
import * as d3 from 'd3';

export class GraphContainer {
  constructor(options = {}) {
    // Set position and size
    this.left = options.left || 100;
    this.top = options.top || 100;
    this.width = options.width || 400;
    this.height = options.height || 300;
    
    // Set up scales from options or use defaults
    const scaleType = options.scaleType || 'linear';
    
    // Determine if we need pi scaling for each axis
    let xPiScale = false;
    let yPiScale = false;
    
    if (scaleType === 'square') {
      // Square scale: supports different domains but maintains square aspect ratio
      const xDomain = options.xDomain || options.domain || [-10, 10];
      const yDomain = options.yDomain || options.domain || [-10, 10];
      
      // Reserve padding for labels
      const padding = 30; // Padding for axis labels
      
      // Calculate the span of each domain
      const xSpan = xDomain[1] - xDomain[0];
      const ySpan = yDomain[1] - yDomain[0];
      
      // Determine the scale factor to maintain square aspect ratio
      // One unit in model space should be the same pixels in both X and Y
      const maxSpan = Math.max(xSpan, ySpan);
      const availableSize = Math.min(this.width - 2*padding, this.height - 2*padding);
      const pixelsPerUnit = availableSize / maxSpan;
      
      // Calculate actual dimensions based on the domains
      const actualWidth = xSpan * pixelsPerUnit;
      const actualHeight = ySpan * pixelsPerUnit;
      
      // Center the coordinate system in the available space, with padding
      const xOffset = padding + ((this.width - 2*padding) - actualWidth) / 2;
      const yOffset = padding + ((this.height - 2*padding) - actualHeight) / 2;
      
      this.xScale = () => d3.scaleLinear()
        .domain(xDomain)
        .range([xOffset, xOffset + actualWidth]);
      this.yScale = () => d3.scaleLinear()
        .domain(yDomain)
        .range([yOffset + actualHeight, yOffset]);
        
      xPiScale = false;
      yPiScale = false;
    } else if (scaleType === 'x-pi-scale') {
      // X-axis uses pi scale, Y-axis is numerical - NOT square aspect ratio
      const xDomain = options.xDomain || [-2, 2]; // Pi multiples
      const yDomain = options.yDomain || [-2, 2]; // Regular numbers
      const padding = 30;
      
      // Use full available width and height (minus padding)
      const availableWidth = this.width - 2*padding;
      const availableHeight = this.height - 2*padding;
      
      // Convert X domain from pi multiples to radians
      const actualXDomain = [xDomain[0] * Math.PI, xDomain[1] * Math.PI];
      
      this.xScale = () => d3.scaleLinear()
        .domain(actualXDomain)
        .range([padding, padding + availableWidth]);
      this.yScale = () => d3.scaleLinear()
        .domain(yDomain)
        .range([padding + availableHeight, padding]);
        
      xPiScale = true;
      yPiScale = false;
    } else if (scaleType === 'y-pi-scale') {
      // Y-axis uses pi scale, X-axis is numerical - NOT square aspect ratio
      const xDomain = options.xDomain || [-2, 2]; // Regular numbers
      const yDomain = options.yDomain || [-1, 1]; // Pi multiples
      const padding = 30;
      
      // Use full available width and height (minus padding)
      const availableWidth = this.width - 2*padding;
      const availableHeight = this.height - 2*padding;
      
      // Convert Y domain from pi multiples to radians
      const actualYDomain = [yDomain[0] * Math.PI, yDomain[1] * Math.PI];
      
      this.xScale = () => d3.scaleLinear()
        .domain(xDomain)
        .range([padding, padding + availableWidth]);
      this.yScale = () => d3.scaleLinear()
        .domain(actualYDomain)
        .range([padding + availableHeight, padding]);
        
      xPiScale = false;
      yPiScale = true;
    } else {
      // Regular scales with potentially different domains
      const xDomain = options.xDomain || [0, 10];
      const yDomain = options.yDomain || [0, 10];
      
      if (scaleType === 'linear') {
        this.xScale = (size) => d3.scaleLinear().domain(xDomain).range([0, size]);
        this.yScale = (size) => d3.scaleLinear().domain(yDomain).range([size, 0]);
      } else if (scaleType === 'log') {
        this.xScale = (size) => d3.scaleLog().domain(xDomain).range([0, size]);
        this.yScale = (size) => d3.scaleLog().domain(yDomain).range([size, 0]);
      } else if (scaleType === 'time') {
        this.xScale = (size) => d3.scaleTime().domain(xDomain).range([0, size]);
        this.yScale = (size) => d3.scaleTime().domain(yDomain).range([size, 0]);
      }
    }
    
    // Grid visibility from options
    this.gridVisible = options.showGrid !== false;  // Default true
    this.axisVisible = options.showAxis !== false;  // Default true
    this.xPiScale = xPiScale;
    this.yPiScale = yPiScale;
    
    // Create container DOM
    this.containerDOM = document.createElement('div');
    this.containerDOM.id = `graph-container-${IdUtil.getID()}`;
    this.containerDOM.style.position = 'absolute';
    this.containerDOM.style.left = this.left + 'px';
    this.containerDOM.style.top = this.top + 'px';
    this.containerDOM.style.width = this.width + 'px';
    this.containerDOM.style.height = this.height + 'px';
    document.body.appendChild(this.containerDOM);
    
    // Initialize graph component
    this.initGraph();
  }
  
  initGraph() {
    // Create component state for the graph
    const componentState = Object.assign(new ComponentState(), {
      componentId: `graph-item_${IdUtil.getID()}`,
      content: '',
      left: 0,  // Relative to container
      top: 0,   // Relative to container
      width: this.width,
      height: this.height,
      props: {}
    });
    
    // Create graph component with the scales
    this.graphComponent = new GraphComponent(
      componentState, 
      this.containerDOM,
      this.xScale,
      this.yScale
    );
    this.graphComponent.init();
    
    // Apply grid visibility state and render
    // Make sure gridOptions exists and is properly configured
    if (this.graphComponent.gridOptions) {
      this.graphComponent.gridOptions.renderGrid = this.gridVisible;
      this.graphComponent.gridOptions.renderAxis = this.axisVisible;
      this.graphComponent.gridOptions.xPiScale = this.xPiScale;
      this.graphComponent.gridOptions.yPiScale = this.yPiScale;
      // Force render the grid with the options
      this.graphComponent.renderGrid();
    }
    
    // Wrap in GraphWrapper for shape methods
    this.graph = new GraphWrapper(this.graphComponent);
  }
  
  // Deprecated - scales should be set during construction
  setScale() {
    console.warn('setScale is deprecated. Pass scale options during construction instead.');
    return this;
  }
  
  // Show/hide grid and axis
  showGrid(show = true) {
    // Save the state
    this.gridVisible = show;
    this.axisVisible = show;
    
    if (this.graphComponent && this.graphComponent.gridOptions) {
      this.graphComponent.gridOptions.renderGrid = show;
      this.graphComponent.gridOptions.renderAxis = show;
      this.graphComponent.renderGrid();
    }
    return this;
  }
  
  // Primitive shape methods (delegate to graph wrapper)
  circle(x, y, radius) {
    return this.graph.circle(x, y, radius);
  }
  
  line(x1, y1, x2, y2) {
    return this.graph.line(x1, y1, x2, y2);
  }
  
  point(x, y, radius) {
    return this.graph.point(x, y, radius);
  }
  
  vector(x1, y1, x2, y2) {
    return this.graph.vector(x1, y1, x2, y2);
  }
  
  arc(start, end, rx, ry) {
    return this.graph.arc(start, end, rx, ry);
  }
  
  ellipse(x, y, rx, ry) {
    return this.graph.ellipse(x, y, rx, ry);
  }
  
  polygon(...coords) {
    return this.graph.polygon(...coords);
  }
  
  // Create a tangent line to a function at a given x value
  tangent(func, x, length) {
    if (typeof func !== 'function') {
      throw new Error('tangent() expects a function as the first argument');
    }
    
    // Default tangent line length (in model units)
    if (length === undefined) {
      const xScale = this.xScale();
      const xDomain = xScale.domain();
      length = (xDomain[1] - xDomain[0]) / 10; // Default to 1/10 of domain
    }
    
    // Use GeomUtil to calculate tangent line endpoints
    const endpoints = GeomUtil.tangentLineEndpoints(func, x, length);
    
    // Create and return a line shape
    return this.line(endpoints.x1, endpoints.y1, endpoints.x2, endpoints.y2);
  }
  
  // Function plotting - accepts a callback function
  plot(func, domainMin, domainMax) {
    if (typeof func !== 'function') {
      throw new Error('plot() expects a function that takes x and returns y');
    }
    
    // If no domain provided, use the full visible X range of the graph
    if (domainMin === undefined || domainMax === undefined) {
      const xScale = this.xScale();
      // Get the actual visible domain by inverting the range endpoints
      const visibleXMin = xScale.invert(0);
      const visibleXMax = xScale.invert(this.width);
      domainMin = domainMin !== undefined ? domainMin : visibleXMin;
      domainMax = domainMax !== undefined ? domainMax : visibleXMax;
    }
    
    // Generate points by evaluating the function
    const numPoints = 200;
    const points = [];
    const step = (domainMax - domainMin) / numPoints;
    
    for (let i = 0; i <= numPoints; i++) {
      const x = domainMin + i * step;
      const y = func(x);
      
      // Skip invalid y values (NaN, Infinity)
      if (isFinite(y)) {
        // The coordinates are in model space - curve will handle view conversion
        points.push(x, y);
      }
    }
    
    // Create a smooth curve from the points
    // 'monotone' gives a smooth curve that passes through all points
    const curve = this.graph.curve('monotone', ...points);
    return curve;
  }
  
  // Parametric plotting - accepts two callback functions x(t) and y(t)
  parametricPlot(xFunc, yFunc, tMin, tMax, numPoints = 200) {
    if (typeof xFunc !== 'function' || typeof yFunc !== 'function') {
      throw new Error('parametricPlot() expects two functions: x(t) and y(t)');
    }
    
    // Default parameter range if not provided
    if (tMin === undefined) tMin = 0;
    if (tMax === undefined) tMax = 2 * Math.PI;
    
    // Get the visible bounds of the graph
    const xScale = this.xScale();
    const yScale = this.yScale();
    const [xMin, xMax] = xScale.domain();
    const [yMin, yMax] = yScale.domain();
    
    // Generate points by evaluating both functions
    const segments = []; // Array of point segments (to handle discontinuities)
    let currentSegment = [];
    const step = (tMax - tMin) / numPoints;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = tMin + i * step;
      const x = xFunc(t);
      const y = yFunc(t);
      
      // Check if point is valid and within visible bounds
      if (isFinite(x) && isFinite(y) && 
          x >= xMin && x <= xMax && 
          y >= yMin && y <= yMax) {
        // Point is within bounds - add to current segment
        currentSegment.push(x, y);
      } else {
        // Point is out of bounds - save current segment if it has points
        if (currentSegment.length >= 4) { // Need at least 2 points (4 values) for a line
          segments.push([...currentSegment]);
        }
        currentSegment = [];
      }
    }
    
    // Don't forget the last segment
    if (currentSegment.length >= 4) {
      segments.push(currentSegment);
    }
    
    // Create curves for each segment
    const curves = [];
    for (const segment of segments) {
      if (segment.length >= 4) { // Need at least 2 points to draw
        const curve = this.graph.curve('monotone', ...segment);
        curves.push(curve);
      }
    }
    
    // Return the first curve if only one segment, or an array of curves
    return curves.length === 1 ? curves[0] : curves;
  }
  
  
  // Clean up
  destroy() {
    if (this.containerDOM && this.containerDOM.parentNode) {
      this.containerDOM.parentNode.removeChild(this.containerDOM);
    }
  }
}