import { BaseGrid } from './base-grid.js';
import { scaleLinear } from 'd3-scale';
import { format } from 'd3-format';

/**
 * PolarGrid - Renders polar coordinate grid with concentric circles and radial lines
 *
 * Coordinate system:
 * - r: radial distance from center (0 to rMax)
 * - θ (theta): angle in radians (0 to 2π, counterclockwise from positive x-axis)
 *
 * SVG coordinate conversion:
 * - x = centerX + r * cos(θ)
 * - y = centerY - r * sin(θ)  (inverted for SVG)
 */
export class PolarGrid extends BaseGrid {
  constructor(gridId, gridLayerGroup, width, height, gridOption, rScaleBuilder) {
    // Create identity scale builders for base class (we handle scaling differently)
    const identityXScale = () => scaleLinear().domain([0, width]).range([0, width]);
    const identityYScale = () => scaleLinear().domain([0, height]).range([height, 0]);

    super(gridId, gridLayerGroup, width, height, gridOption, identityXScale, identityYScale);

    // Center point of the polar grid
    this.centerX = width / 2;
    this.centerY = height / 2;

    // Maximum radius in pixels (fit within the smaller dimension)
    this.maxRadiusPixels = Math.min(width, height) / 2 - 30; // Leave margin for labels

    // Model coordinates
    this.rMax = gridOption.rMax || 10;

    // Create radial scale: model r (0 to rMax) -> pixel radius (0 to maxRadiusPixels)
    this.rScale = scaleLinear()
      .domain([0, this.rMax])
      .range([0, this.maxRadiusPixels]);

    // Grid options
    this.radialLines = gridOption.radialLines || 12; // Number of radial lines (θ divisions)
    this.concentricCircles = gridOption.concentricCircles || 5; // Number of concentric circles
    this.showAngleLabels = gridOption.angleLabels !== false;
  }

  /**
   * Convert polar coordinates (r, θ) to SVG view coordinates (x, y)
   * @param {number} r - Radial distance in model coordinates
   * @param {number} theta - Angle in radians
   * @returns {{x: number, y: number}} SVG coordinates
   */
  polarToView(r, theta) {
    const radiusPixels = this.rScale(r);
    return {
      x: this.centerX + radiusPixels * Math.cos(theta),
      y: this.centerY - radiusPixels * Math.sin(theta) // Inverted for SVG
    };
  }

  /**
   * Convert SVG view coordinates to polar coordinates
   * @param {number} x - SVG x coordinate
   * @param {number} y - SVG y coordinate
   * @returns {{r: number, theta: number}} Polar coordinates
   */
  viewToPolar(x, y) {
    const dx = x - this.centerX;
    const dy = this.centerY - y; // Invert back from SVG
    const radiusPixels = Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dy, dx);
    return {
      r: this.rScale.invert(radiusPixels),
      theta: theta < 0 ? theta + 2 * Math.PI : theta // Normalize to [0, 2π]
    };
  }

  /**
   * Override toViewX/Y to work with Cartesian coordinates within the polar graph
   * These convert model (x, y) to view coordinates, treating the polar grid as Cartesian
   */
  toViewX(x) {
    // Scale x from model space to pixel space, centered
    const scale = this.maxRadiusPixels / this.rMax;
    return this.centerX + x * scale;
  }

  toViewY(y) {
    // Scale y from model space to pixel space, centered (inverted for SVG)
    const scale = this.maxRadiusPixels / this.rMax;
    return this.centerY - y * scale;
  }

  toModelX(viewX) {
    const scale = this.maxRadiusPixels / this.rMax;
    return (viewX - this.centerX) / scale;
  }

  toModelY(viewY) {
    const scale = this.maxRadiusPixels / this.rMax;
    return (this.centerY - viewY) / scale;
  }

  renderGrid(gridOptions) {
    this.createGridGroups(gridOptions);
  }

  createGridGroups(gridOption) {
    // Clear any existing grid elements
    this.gridLayerGroup.selectAll("g").remove();
    this.gridLayerGroup.selectAll("line").remove();
    this.gridLayerGroup.selectAll("circle").remove();
    this.gridLayerGroup.selectAll("text").remove();

    const svgGroup = this.gridLayerGroup.append("g").attr("class", "polar-grid");

    // Render grid elements if enabled
    if (gridOption.renderGrid) {
      this.renderConcentricCircles(svgGroup);
      this.renderRadialLines(svgGroup);
    }

    // Render axis and labels if enabled
    if (gridOption.renderAxis) {
      this.renderPolarAxis(svgGroup);
      if (this.showAngleLabels) {
        this.renderAngleLabels(svgGroup);
      }
      this.renderRadiusLabels(svgGroup);
    }
  }

  /**
   * Render concentric circles for r values
   */
  renderConcentricCircles(svgGroup) {
    const circleGroup = svgGroup.append("g").attr("class", "concentric-circles");

    // Calculate r step for concentric circles
    const rStep = this.rMax / this.concentricCircles;

    for (let i = 1; i <= this.concentricCircles; i++) {
      const r = i * rStep;
      const radiusPixels = this.rScale(r);

      circleGroup.append("circle")
        .attr("cx", this.centerX)
        .attr("cy", this.centerY)
        .attr("r", radiusPixels)
        .style("fill", "none")
        .style("stroke", "#ddd")
        .style("stroke-width", "0.5");
    }
  }

  /**
   * Render radial lines for θ values
   */
  renderRadialLines(svgGroup) {
    const lineGroup = svgGroup.append("g").attr("class", "radial-lines");

    // Calculate angle step for radial lines
    const thetaStep = (2 * Math.PI) / this.radialLines;

    for (let i = 0; i < this.radialLines; i++) {
      const theta = i * thetaStep;
      const endPoint = this.polarToView(this.rMax, theta);

      lineGroup.append("line")
        .attr("x1", this.centerX)
        .attr("y1", this.centerY)
        .attr("x2", endPoint.x)
        .attr("y2", endPoint.y)
        .style("stroke", "#ddd")
        .style("stroke-width", "0.5");
    }
  }

  /**
   * Render polar axis (θ = 0 line emphasized, and center point)
   */
  renderPolarAxis(svgGroup) {
    const axisGroup = svgGroup.append("g").attr("class", "polar-axis");

    // Main polar axis (θ = 0, positive x direction)
    const endPoint = this.polarToView(this.rMax, 0);
    axisGroup.append("line")
      .attr("x1", this.centerX)
      .attr("y1", this.centerY)
      .attr("x2", endPoint.x)
      .attr("y2", endPoint.y)
      .style("stroke", "black")
      .style("stroke-width", "1.5");

    // Vertical axis (θ = π/2)
    const topPoint = this.polarToView(this.rMax, Math.PI / 2);
    axisGroup.append("line")
      .attr("x1", this.centerX)
      .attr("y1", this.centerY)
      .attr("x2", topPoint.x)
      .attr("y2", topPoint.y)
      .style("stroke", "black")
      .style("stroke-width", "1");

    // Center point (origin)
    axisGroup.append("circle")
      .attr("cx", this.centerX)
      .attr("cy", this.centerY)
      .attr("r", 3)
      .style("fill", "black");
  }

  /**
   * Render angle labels around the perimeter
   */
  renderAngleLabels(svgGroup) {
    const labelGroup = svgGroup.append("g").attr("class", "angle-labels");

    // Standard angle labels at common positions
    const angleLabels = [
      { theta: 0, label: "0" },
      { theta: Math.PI / 6, label: "π/6" },
      { theta: Math.PI / 4, label: "π/4" },
      { theta: Math.PI / 3, label: "π/3" },
      { theta: Math.PI / 2, label: "π/2" },
      { theta: 2 * Math.PI / 3, label: "2π/3" },
      { theta: 3 * Math.PI / 4, label: "3π/4" },
      { theta: 5 * Math.PI / 6, label: "5π/6" },
      { theta: Math.PI, label: "π" },
      { theta: 7 * Math.PI / 6, label: "7π/6" },
      { theta: 5 * Math.PI / 4, label: "5π/4" },
      { theta: 4 * Math.PI / 3, label: "4π/3" },
      { theta: 3 * Math.PI / 2, label: "3π/2" },
      { theta: 5 * Math.PI / 3, label: "5π/3" },
      { theta: 7 * Math.PI / 4, label: "7π/4" },
      { theta: 11 * Math.PI / 6, label: "11π/6" },
    ];

    // Filter to show only labels that align with radial lines
    const thetaStep = (2 * Math.PI) / this.radialLines;
    const tolerance = 0.01;

    const labelsToShow = angleLabels.filter(({ theta }) => {
      // Check if this angle aligns with any radial line
      for (let i = 0; i < this.radialLines; i++) {
        const lineAngle = i * thetaStep;
        if (Math.abs(theta - lineAngle) < tolerance ||
            Math.abs(theta - lineAngle - 2 * Math.PI) < tolerance) {
          return true;
        }
      }
      return false;
    });

    // Position labels slightly outside the outermost circle
    const labelRadius = this.rMax * 1.12;

    labelsToShow.forEach(({ theta, label }) => {
      const pos = this.polarToView(labelRadius, theta);

      // Adjust text anchor based on position
      let textAnchor = "middle";
      if (Math.cos(theta) > 0.3) textAnchor = "start";
      else if (Math.cos(theta) < -0.3) textAnchor = "end";

      // Adjust vertical alignment
      let dy = "0.35em";
      if (Math.sin(theta) > 0.3) dy = "0.7em";
      else if (Math.sin(theta) < -0.3) dy = "0em";

      labelGroup.append("text")
        .attr("x", pos.x)
        .attr("y", pos.y)
        .attr("text-anchor", textAnchor)
        .attr("dy", dy)
        .style("fill", "black")
        .style("font-size", "10px")
        .style("font-family", "Arial, sans-serif")
        .text(label);
    });
  }

  /**
   * Render radius labels along the positive x-axis
   */
  renderRadiusLabels(svgGroup) {
    const labelGroup = svgGroup.append("g").attr("class", "radius-labels");

    const rStep = this.rMax / this.concentricCircles;
    const formatter = (num) => Number.isInteger(num) ? num.toString() : format(".1f")(num);

    for (let i = 1; i <= this.concentricCircles; i++) {
      const r = i * rStep;
      const pos = this.polarToView(r, 0); // Along θ = 0 axis

      labelGroup.append("text")
        .attr("x", pos.x + 5)
        .attr("y", pos.y - 5)
        .attr("text-anchor", "start")
        .style("fill", "black")
        .style("font-size", "10px")
        .style("font-family", "Arial, sans-serif")
        .text(formatter(r));
    }

    // Origin label
    labelGroup.append("text")
      .attr("x", this.centerX - 10)
      .attr("y", this.centerY + 15)
      .attr("text-anchor", "end")
      .style("fill", "black")
      .style("font-size", "10px")
      .style("font-family", "Arial, sans-serif")
      .text("0");
  }

  /**
   * Get the center point coordinates
   */
  getCenter() {
    return { x: this.centerX, y: this.centerY };
  }

  /**
   * Get the maximum radius in pixels
   */
  getMaxRadiusPixels() {
    return this.maxRadiusPixels;
  }

  /**
   * Get the r scale for external use
   */
  getRScale() {
    return this.rScale;
  }
}
