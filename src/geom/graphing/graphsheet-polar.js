import { PolarGrid } from './polar-grid.js';

/**
 * GraphsheetPolar - Wrapper for polar coordinate grid
 *
 * Similar to Graphsheet2d but for polar coordinates.
 * Provides coordinate transformation and shape layer management.
 */
export class GraphsheetPolar {
  constructor(svgElementD3, gridId, width, height, gridOption) {
    this.svgElementD3 = svgElementD3;
    this.width = width;
    this.height = height;

    // Create layer groups
    this.gridLayerGroup = svgElementD3.append("g").attr("class", "graphsheetGridGroup");
    this.backgroundImageGroup = svgElementD3.append("g").attr("class", "backgroundImageGroup");
    this.plotGroup = svgElementD3.append("g").attr("class", "graphsheetPlotGroup");
    this.shapesGroup = svgElementD3.append("g").attr("class", "graphsheetShapesGroup");

    // Create polar grid
    this.graphGrid = new PolarGrid(gridId, this.gridLayerGroup, width, height, gridOption);
  }

  /**
   * Convert model x coordinate to view x coordinate
   * (Cartesian x within the polar coordinate system)
   */
  toViewX(val) {
    return this.graphGrid.toViewX(val);
  }

  /**
   * Convert view x coordinate to model x coordinate
   */
  toModelX(val) {
    return this.graphGrid.toModelX(val);
  }

  /**
   * Convert model y coordinate to view y coordinate
   * (Cartesian y within the polar coordinate system)
   */
  toViewY(val) {
    return this.graphGrid.toViewY(val);
  }

  /**
   * Convert view y coordinate to model y coordinate
   */
  toModelY(val) {
    return this.graphGrid.toModelY(val);
  }

  /**
   * Convert polar coordinates to view coordinates
   * @param {number} r - Radial distance
   * @param {number} theta - Angle in radians
   * @returns {{x: number, y: number}}
   */
  polarToView(r, theta) {
    return this.graphGrid.polarToView(r, theta);
  }

  /**
   * Convert view coordinates to polar coordinates
   * @param {number} x - View x coordinate
   * @param {number} y - View y coordinate
   * @returns {{r: number, theta: number}}
   */
  viewToPolar(x, y) {
    return this.graphGrid.viewToPolar(x, y);
  }

  /**
   * Convert model width to UI width
   */
  toUIWidth(modelWidth) {
    return this.toViewX(modelWidth) - this.toViewX(0);
  }

  /**
   * Convert model height to UI height
   */
  toUIHeight(modelHeight) {
    return Math.abs(this.toViewY(0) - this.toViewY(modelHeight));
  }

  /**
   * Render the polar grid
   */
  renderGrid(gridOptions) {
    this.graphGrid.renderGrid(gridOptions);
  }

  /**
   * Get the shapes layer DOM node
   */
  getScriptShapeLayerNode() {
    return this.shapesGroup.node();
  }

  /**
   * Get the plot layer D3 selection
   */
  getPlotGroup() {
    return this.plotGroup;
  }

  /**
   * Get UI width
   */
  getUIWidth() {
    return this.graphGrid.getWidth();
  }

  /**
   * Get UI height
   */
  getUIHeight() {
    return this.graphGrid.getHeight();
  }

  /**
   * Get center point of the polar grid
   */
  getCenter() {
    return this.graphGrid.getCenter();
  }

  /**
   * Get the maximum radius in model coordinates
   */
  getRMax() {
    return this.graphGrid.rMax;
  }

  /**
   * Get the r scale
   */
  getRScale() {
    return this.graphGrid.getRScale();
  }

  /**
   * Get x coordinate range (for compatibility with Cartesian plotting)
   */
  xends() {
    const rMax = this.graphGrid.rMax;
    return { min: -rMax, max: rMax };
  }

  /**
   * Get y coordinate range (for compatibility with Cartesian plotting)
   */
  yends() {
    const rMax = this.graphGrid.rMax;
    return { min: -rMax, max: rMax };
  }

  /**
   * Clear all shapes from the shapes layer
   */
  clearShapes() {
    this.shapesGroup.selectAll("*").remove();
    this.backgroundImageGroup.selectAll("*").remove();
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.graphGrid && this.graphGrid.destroy) {
      this.graphGrid.destroy();
    }
    this.clearShapes();
  }

  /**
   * Set background image pattern
   */
  setImagePattern(patternId, componentDimension) {
    this.backgroundImageGroup.append('rect')
      .attr("x", 0)
      .attr("y", 0)
      .attr('width', componentDimension.width)
      .attr('height', componentDimension.height)
      .attr('fill', `url(#${patternId})`);
  }
}
