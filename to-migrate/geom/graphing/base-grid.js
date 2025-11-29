export class BaseGrid {
  constructor(gridId, gridLayerGroup, width, height, gridOption, xScaleBuilder, yScaleBuilder) {
    this.gridId = gridId;
    this.gridLayerGroup = gridLayerGroup;
    this.width = width;
    this.height = height;
    this.xScale = xScaleBuilder(this.width);
    this.yScale = yScaleBuilder(this.height);
    
    // Add background rectangle
    this.gridLayerGroup.append("rect")
      .attr("class", "grid-background")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("fill", "white")
      .style("stroke", "#ccc")
      .style("stroke-width", "1px")
      .style("shape-rendering", "crispEdges");
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