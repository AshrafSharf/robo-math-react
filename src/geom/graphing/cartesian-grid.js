import { BaseGrid } from './base-grid.js';
import { format } from 'd3-format';
import { matchPiMultiple } from './pi-utils.js';

export class CartesianGrid extends BaseGrid {
  constructor(gridId, gridLayerGroup, width, height, gridOption, xScaleBuilder, yScaleBuilder) {
    super(gridId, gridLayerGroup, width, height, gridOption, xScaleBuilder, yScaleBuilder);
  }

  renderGrid(gridOptions) {
    this.createGridGroups(gridOptions);
  }

  createGridGroups(gridOption) {
    // Clear any existing grid elements first
    this.gridLayerGroup.selectAll("g").remove();
    this.gridLayerGroup.selectAll("line").remove();
    this.gridLayerGroup.selectAll("text").remove();

    const xScale = this.xScale;
    const yScale = this.yScale;

    // Get scale domains
    const [xMin, xMax] = xScale.domain();
    const [yMin, yMax] = yScale.domain();

    // Determine scale types
    const xScaleType = gridOption.xScaleType || 'linear';
    const yScaleType = gridOption.yScaleType || 'linear';

    // Calculate the actual visible range in model coordinates
    const visibleXMin = xScale.invert ? xScale.invert(0) : xMin;
    const visibleXMax = xScale.invert ? xScale.invert(this.width) : xMax;
    const visibleYMin = yScale.invert ? yScale.invert(this.height) : yMin;
    const visibleYMax = yScale.invert ? yScale.invert(0) : yMax;

    // Get step from range expression
    const xStep = gridOption.xStep;
    const yStep = gridOption.yStep;

    // Generate X ticks
    let xTicks;
    if (xScaleType === 'trig') {
      // Trig scale: use step or default to pi
      const step = xStep || Math.PI;
      xTicks = this.generateUniformTicks(visibleXMin, visibleXMax, step);
    } else if (xStep !== null && xStep !== undefined) {
      xTicks = this.generateUniformTicks(visibleXMin, visibleXMax, xStep);
    } else {
      // Default: use d3's smart tick generation
      xTicks = xScale.ticks(10);
    }

    // Generate Y ticks
    let yTicks;
    if (yScaleType === 'trig') {
      // Trig scale: use step or default to pi
      const step = yStep || Math.PI;
      yTicks = this.generateUniformTicks(visibleYMin, visibleYMax, step);
    } else if (yStep !== null && yStep !== undefined) {
      yTicks = this.generateUniformTicks(visibleYMin, visibleYMax, yStep);
    } else {
      // Default: use d3's smart tick generation
      yTicks = yScale.ticks(10);
    }

    // Store scale types for label formatting
    gridOption._xScaleType = xScaleType;
    gridOption._yScaleType = yScaleType;

    // Render grid lines if enabled (and showGridLines is not explicitly false)
    if (gridOption.renderGrid && gridOption.renderGridLines !== false) {
      this.renderGridLines(xTicks, yTicks, xScale, yScale, gridOption);
    }

    // Render axes and labels if enabled
    if (gridOption.renderAxis) {
      this.renderAxes(xMin, xMax, yMin, yMax, xScale, yScale);
      this.renderTickLabels(xTicks, yTicks, xScale, yScale, xMin, xMax, yMin, yMax, gridOption);
    }
  }

  generateUniformTicks(min, max, step) {
    const ticks = [];
    // Start from a round number based on the step
    const start = Math.ceil(min / step) * step;
    
    for (let tick = start; tick <= max; tick += step) {
      // Round to avoid floating point errors  
      ticks.push(Math.round(tick / step) * step);
    }
    
    return ticks;
  }
  
  renderGridLines(xTicks, yTicks, xScale, yScale, gridOptions = {}) {
    const svgGroup = this.gridLayerGroup.append("g");

    // Get grid styling from options, with defaults
    const gridColor = gridOptions.gridColor || "#ddd";
    const gridStrokeWidth = gridOptions.gridStrokeWidth !== null ? gridOptions.gridStrokeWidth : 0.5;

    // Vertical grid lines - render for all ticks that fall within the view
    xTicks.forEach(tick => {
      const xPos = xScale(tick);
      // Only render if the line is within the visible area
      if (Math.abs(tick) > 1e-10 && xPos >= 0 && xPos <= this.width) {
        svgGroup.append("line")
          .attr("x1", xPos)
          .attr("x2", xPos)
          .attr("y1", 0)
          .attr("y2", this.height)
          .style("stroke", gridColor)
          .style("stroke-width", gridStrokeWidth);
      }
    });

    // Horizontal grid lines - render for all ticks that fall within the view
    yTicks.forEach(tick => {
      const yPos = yScale(tick);
      // Only render if the line is within the visible area
      if (Math.abs(tick) > 1e-10 && yPos >= 0 && yPos <= this.height) {
        svgGroup.append("line")
          .attr("x1", 0)
          .attr("x2", this.width)
          .attr("y1", yPos)
          .attr("y2", yPos)
          .style("stroke", gridColor)
          .style("stroke-width", gridStrokeWidth);
      }
    });
  }
  
  renderAxes(xMin, xMax, yMin, yMax, xScale, yScale) {
    const svgGroup = this.gridLayerGroup.append("g");
    
    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      // Axis crosses at y=0
      svgGroup.append("line")
        .attr("x1", 0)
        .attr("x2", this.width)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("class", "axis-line")
        .style("stroke", "black")
        .style("stroke-width", "1.5")
        .style("shape-rendering", "crispEdges");
    } else {
      // Axis at bottom
      svgGroup.append("line")
        .attr("x1", 0)
        .attr("x2", this.width)
        .attr("y1", this.height)
        .attr("y2", this.height)
        .attr("class", "axis-line")
        .style("stroke", "black")
        .style("stroke-width", "1.5")
        .style("shape-rendering", "crispEdges");
    }
    
    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      // Axis crosses at x=0
      svgGroup.append("line")
        .attr("x1", xScale(0))
        .attr("x2", xScale(0))
        .attr("y1", 0)
        .attr("y2", this.height)
        .attr("class", "axis-line")
        .style("stroke", "black")
        .style("stroke-width", "1.5")
        .style("shape-rendering", "crispEdges");
    } else {
      // Axis at left
      svgGroup.append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", this.height)
        .attr("class", "axis-line")
        .style("stroke", "black")
        .style("stroke-width", "1.5")
        .style("shape-rendering", "crispEdges");
    }
  }
  
  renderTickLabels(xTicks, yTicks, xScale, yScale, xMin, xMax, yMin, yMax, gridOption) {
    const svgGroup = this.gridLayerGroup.append("g");

    // Get scale types from stored values
    const xScaleType = gridOption._xScaleType || 'linear';
    const yScaleType = gridOption._yScaleType || 'linear';

    // Pi formatter for trigonometric scales
    const piFormatter = (v) => {
      const tolerance = 0.0001;
      if (Math.abs(v) < tolerance) return "0";

      const match = matchPiMultiple(v);
      if (match) {
        return match.label;
      }

      // For other values, show decimal
      return format(".2f")(v);
    };

    // Imaginary formatter for complex plane y-axis
    const imFormatter = (v) => {
      const tolerance = 0.0001;
      if (Math.abs(v) < tolerance) return "0";
      if (Math.abs(v - 1) < tolerance) return "i";
      if (Math.abs(v + 1) < tolerance) return "−i";
      // Check if it's a clean integer
      if (Math.abs(v - Math.round(v)) < tolerance) {
        const n = Math.round(v);
        return n < 0 ? `−${Math.abs(n)}i` : `${n}i`;
      }
      // For decimals
      return v < 0 ? `−${Math.abs(v)}i` : `${v}i`;
    };

    // Custom log formatter with superscript exponents
    const logFormatterWithSuperscript = (v, base) => {
      if (v <= 0) return "";
      const logBase = base === 'e' ? Math.E : base === '2' ? 2 : 10;
      const exponent = Math.log(v) / Math.log(logBase);

      // If it's a clean power, show as exponent
      if (Math.abs(exponent - Math.round(exponent)) < 0.001) {
        const exp = Math.round(exponent);
        if (base === 'e') {
          return exp === 0 ? "1" : exp === 1 ? "e" : `e${this.toSuperscript(exp)}`;
        } else if (base === '2') {
          return exp === 0 ? "1" : exp === 1 ? "2" : `2${this.toSuperscript(exp)}`;
        } else {
          return exp === 0 ? "1" : exp === 1 ? "10" : `10${this.toSuperscript(exp)}`;
        }
      }
      return format(".2g")(v);
    };

    // Get d3 tick formatters - d3 handles nice formatting and label filtering
    const xD3Format = xScale.tickFormat ? xScale.tickFormat() : format(",");
    const yD3Format = yScale.tickFormat ? yScale.tickFormat() : format(",");

    // Get appropriate formatter for X axis
    const xFormatter = (v) => {
      if (xScaleType === 'trig') return piFormatter(v);
      if (xScaleType === 'log') {
        const d3Label = xD3Format(v);
        if (d3Label === '') return '';
        return logFormatterWithSuperscript(v, '10');
      }
      if (xScaleType === 'ln') {
        const d3Label = xD3Format(v);
        if (d3Label === '') return '';
        return logFormatterWithSuperscript(v, 'e');
      }
      return xD3Format(v);
    };

    // Get appropriate formatter for Y axis
    const yFormatter = (v) => {
      if (yScaleType === 'trig') return piFormatter(v);
      if (yScaleType === 'im') return imFormatter(v);
      if (yScaleType === 'log') {
        const d3Label = yD3Format(v);
        if (d3Label === '') return '';
        return logFormatterWithSuperscript(v, '10');
      }
      if (yScaleType === 'ln') {
        const d3Label = yD3Format(v);
        if (d3Label === '') return '';
        return logFormatterWithSuperscript(v, 'e');
      }
      return yD3Format(v);
    };

    // X-axis labels and tick marks
    xTicks.forEach(tick => {
      const xPos = xScale(tick);
      // Only render labels that are within the visible area with some margin
      if (xPos >= 20 && xPos <= this.width - 20) {
        const label = xFormatter(tick);
        if (Math.abs(tick) > 1e-10 || xScaleType === 'log' || xScaleType === 'ln') {  // Skip 0 for linear/pi, not for log
          // Position labels below the x-axis, but within SVG bounds
          const yAxisPos = (yMin <= 0 && yMax >= 0) ? yScale(0) : this.height;
          const yPos = (yMin <= 0 && yMax >= 0) ?
            Math.min(yScale(0) + 15, this.height - 5) :
            this.height - 5;

          // Add tick mark always
          svgGroup.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos)
            .attr("y1", yAxisPos)
            .attr("y2", yAxisPos + 5)
            .style("stroke", "black")
            .style("stroke-width", "1");

          // Only add label if not empty (d3 returns "" for cluttered labels)
          if (label !== '') {
            svgGroup.append("text")
              .attr("x", xPos)
              .attr("y", yPos)
              .attr("text-anchor", "middle")
              .style("fill", "black")
              .style("font-size", "11px")
              .style("font-family", "Arial, sans-serif")
              .text(label);
          }
        }
      }
    });

    // Y-axis labels and tick marks
    yTicks.forEach(tick => {
      const yPos = yScale(tick);
      // Only render labels that are within the visible area with some margin
      if (yPos >= 15 && yPos <= this.height - 15) {
        const label = yFormatter(tick);
        if (Math.abs(tick) > 1e-10 || yScaleType === 'log' || yScaleType === 'ln') {  // Skip 0 for linear/pi, not for log
          // Position labels to the left of y-axis
          const xAxisPos = (xMin <= 0 && xMax >= 0) ? xScale(0) : 0;
          const xLabelPos = (xMin <= 0 && xMax >= 0) ?
            Math.max(xScale(0) - 8, 15) :
            15;

          // Add tick mark always
          svgGroup.append("line")
            .attr("x1", xAxisPos - 5)
            .attr("x2", xAxisPos)
            .attr("y1", yPos)
            .attr("y2", yPos)
            .style("stroke", "black")
            .style("stroke-width", "1");

          // Only add label if not empty (d3 returns "" for cluttered labels)
          if (label !== '') {
            svgGroup.append("text")
              .attr("x", xLabelPos)
              .attr("y", yPos + 4)
              .attr("text-anchor", xLabelPos < 20 ? "start" : "end")
              .style("fill", "black")
              .style("font-size", "11px")
              .style("font-family", "Arial, sans-serif")
              .text(label);
          }
        }
      }
    });

    // Origin label - positioned to the bottom-left of origin (only for linear scales)
    if (xScaleType !== 'log' && yScaleType !== 'log' &&
        xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
      svgGroup.append("text")
        .attr("x", xScale(0) - 8)
        .attr("y", yScale(0) + 15)
        .attr("text-anchor", "end")
        .style("fill", "black")
        .style("font-size", "11px")
        .style("font-family", "Arial, sans-serif")
        .text("0");
    }
  }

  /**
   * Convert number to superscript for exponent display
   */
  toSuperscript(num) {
    const superscripts = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '-': '⁻'
    };
    return String(num).split('').map(c => superscripts[c] || c).join('');
  }
}