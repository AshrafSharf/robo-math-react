import $ from 'jquery';

export class BaseGrid {
  constructor(gridId, gridLayerGroup, width, height, gridOption, xScaleBuilder, yScaleBuilder) {
    this.gridId = gridId;
    this.gridLayerGroup = gridLayerGroup;
    this.width = width;
    this.height = height;
    this.xScale = xScaleBuilder(this.width);
    this.yScale = yScaleBuilder(this.height);
    
    // Store references for resize handling
    this.$svg = $(this.gridLayerGroup.node().ownerSVGElement);
    this.$parentSection = this.$svg.closest('section');
    
    // Background rectangle removed - no visual impact
    // this.backgroundRect = this.gridLayerGroup.append("rect")
    //   .attr("class", "grid-background")
    //   .style("fill", "white")
    //   .style("stroke", "#ccc")
    //   .style("stroke-width", "1px")
    //   .style("shape-rendering", "crispEdges");
    
    // Set initial dimensions
    // this.updateBackgroundDimensions();
    
    // Set up resize observer for the parent section
    this.setupResizeObserver();
  }
  
  updateBackgroundDimensions() {
    // Background rectangle removed - method kept for compatibility
    // const [xMin, xMax] = this.xScale.domain();
    // const [yMax, yMin] = this.yScale.domain(); // yScale is inverted (max to min)
    // 
    // const coordinateWidth = xMax - xMin;
    // const coordinateHeight = yMax - yMin;
    // 
    // this.backgroundRect
    //   .attr("x", xMin)
    //   .attr("y", yMin)
    //   .attr("width", coordinateWidth)
    //   .attr("height", coordinateHeight);
  }
  
  setupResizeObserver() {
    // Resize observer is no longer needed for background dimensions
    // The dimensions are set when the graph is created/recreated
    // Keep empty method for compatibility
  }
  
  destroy() {
    // Clean up not needed since we removed resize observers
  }

  // Coordinate transformation methods (required by shapes)
  toViewX(x) {
    return this.xScale(x);
  }

  toModelX(x) {
    return this.xScale.invert ? this.xScale.invert(x) : x;
  }

  toViewY(y) {
    return this.yScale(y);
  }

  toModelY(y) {
    return this.yScale.invert ? this.yScale.invert(y) : y;
  }

  // Getters for scale access
  getXScale() {
    return this.xScale;
  }

  getYScale() {
    return this.yScale;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  // Abstract method - must be implemented by subclasses
  renderGrid(gridOptions) {
    throw new Error("renderGrid must be implemented by subclass");
  }
}