import { CartesianGrid } from './cartesian-grid.js';
import { GridOptions } from './grid-options.js';

export class Graphsheet2d {
  constructor(svgElementD3, gridId, width, height, gridOption, xScaleBuilder, yScaleBuilder) {
    this.svgElementD3 = svgElementD3;
    this.gridLayerGroup = svgElementD3.append("g").attr("class", "graphsheetGridGroup");
    this.backgroundImageGroup = svgElementD3.append("g").attr("class", "backgroundImageGroup");
    this.plotGroup = svgElementD3.append("g").attr("class", "graphsheetPlotGroup");
    this.shapesGroup = svgElementD3.append("g").attr("class", "graphsheetShapesGroup");
    this.graphGrid = new CartesianGrid(gridId, this.gridLayerGroup, width, height, gridOption, xScaleBuilder, yScaleBuilder);
  }

  toViewX(val) {
    return this.graphGrid.toViewX(val);
  }

  toModelX(val) {
    return this.graphGrid.toModelX(val);
  }

  toViewY(val) {
    return this.graphGrid.toViewY(val);
  }

  toUIWidth(modelWidth) {
    return this.toViewX(modelWidth) - this.toViewX(0);
  }

  toUIHeight(modelHeight) {
    return Math.abs(this.toViewY(0) - this.toViewY(modelHeight));
  }

  renderGrid(gridOptions) {
    this.graphGrid.renderGrid(gridOptions);
  }

  getScriptShapeLayerNode() {
    return this.shapesGroup.node();
  }

  getUIWidth() {
    return this.graphGrid.getWidth();
  }

  getUIHeight() {
    return this.graphGrid.getHeight();
  }

  clearShapes() {
    this.shapesGroup.selectAll("*").remove();
    this.backgroundImageGroup.selectAll("*").remove();
  }

  setImagePattern(patternId, componentDimension) {
    this.backgroundImageGroup.append('rect')
      .attr("x", 0)
      .attr("y", 0)
      .attr('width', componentDimension.width)
      .attr('height', componentDimension.height)
      .attr('fill', `url(#${patternId})`);
  }
}