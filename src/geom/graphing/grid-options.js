export class GridOptions {
  constructor() {
    // Simple boolean flags for grid and axis visibility
    this.renderGrid = true;
    this.renderGridLines = true;  // Grid lines can be hidden while keeping axis
    this.renderAxis = true;

    // Scale type options
    this.xScaleType = 'linear';
    this.yScaleType = 'linear';

    // Divisions for linear scale (number of grid lines)
    // Interval is calculated as: (max - min) / divisions
    this.xDivisions = 10;
    this.yDivisions = 10;

    // Log scale base
    this.xLogBase = '10';
    this.yLogBase = '10';

    // Pi scale multiplier (preset intervals: 2pi, pi, pi/2, pi/4, pi/6)
    this.xPiMultiplier = 'pi';
    this.yPiMultiplier = 'pi';
  }
}