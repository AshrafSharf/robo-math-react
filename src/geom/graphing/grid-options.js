export class GridOptions {
  constructor() {
    // Boolean flags for grid and axis visibility
    this.renderGrid = true;
    this.renderGridLines = true;
    this.renderAxis = true;

    // Scale type from range expression (linear, pi, log)
    this.xScaleType = 'linear';
    this.yScaleType = 'linear';

    // Step (tick interval) from range expression
    this.xStep = null;
    this.yStep = null;

    // Grid styling from grid expression
    this.gridColor = null;
    this.gridStrokeWidth = null;
  }
}