import { BaseGrid } from './base-grid.js';
import { format } from 'd3-format';

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

    // For linear scale, calculate interval from divisions and range
    const xDivisions = gridOption.xDivisions || 10;
    const yDivisions = gridOption.yDivisions || 10;
    const xSpan = xMax - xMin;
    const ySpan = yMax - yMin;
    const xInterval = xSpan / xDivisions;
    const yInterval = ySpan / yDivisions;

    const xPiMultiplier = gridOption.xPiMultiplier || 'pi';
    const yPiMultiplier = gridOption.yPiMultiplier || 'pi';
    const xLogBase = gridOption.xLogBase || '10';
    const yLogBase = gridOption.yLogBase || '10';

    // Calculate the actual visible range in model coordinates
    const visibleXMin = xScale.invert ? xScale.invert(0) : xMin;
    const visibleXMax = xScale.invert ? xScale.invert(this.width) : xMax;
    const visibleYMin = yScale.invert ? yScale.invert(this.height) : yMin;
    const visibleYMax = yScale.invert ? yScale.invert(0) : yMax;

    // Generate X ticks based on scale type using d3's built-in tick generation
    let xTicks;
    if (xScaleType === 'pi') {
      // Pi scale needs custom ticks at multiples of pi
      xTicks = this.generatePiTicks(visibleXMin, visibleXMax, xPiMultiplier, this.width);
    } else {
      // Use d3's ticks() for both linear and log scales
      xTicks = xScale.ticks(xDivisions);
    }

    // Generate Y ticks based on scale type using d3's built-in tick generation
    let yTicks;
    if (yScaleType === 'pi') {
      // Pi scale needs custom ticks at multiples of pi
      yTicks = this.generatePiTicks(visibleYMin, visibleYMax, yPiMultiplier, this.height);
    } else {
      // Use d3's ticks() for both linear and log scales
      yTicks = yScale.ticks(yDivisions);
    }

    // Store scale types for label formatting
    gridOption._xScaleType = xScaleType;
    gridOption._yScaleType = yScaleType;
    gridOption._xLogBase = xLogBase;
    gridOption._yLogBase = yLogBase;

    // Render grid lines if enabled (and showGridLines is not explicitly false)
    if (gridOption.renderGrid && gridOption.renderGridLines !== false) {
      this.renderGridLines(xTicks, yTicks, xScale, yScale);
    }

    // Render axes and labels if enabled
    if (gridOption.renderAxis) {
      this.renderAxes(xMin, xMax, yMin, yMax, xScale, yScale);
      this.renderTickLabels(xTicks, yTicks, xScale, yScale, xMin, xMax, yMin, yMax, gridOption);
    }
  }

  /**
   * Generate ticks for pi scale
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {string} multiplier - '2pi', 'pi', 'pi/2', 'pi/4', or 'pi/6'
   * @param {number} availablePixels - Available pixels for rendering
   */
  generatePiTicks(min, max, multiplier, availablePixels) {
    const PI = Math.PI;
    let step;

    // Base step from multiplier
    switch (multiplier) {
      case '2pi': step = 2 * PI; break;
      case 'pi': step = PI; break;
      case 'pi/2': step = PI / 2; break;
      case 'pi/4': step = PI / 4; break;
      case 'pi/6': step = PI / 6; break;
      default: step = PI;
    }

    // Adjust step if too cramped
    const range = max - min;
    const tickCount = range / step;
    const pixelsPerTick = availablePixels / tickCount;

    if (pixelsPerTick < 30 && step < 2 * PI) {
      step = step * 2; // Double the step if too cramped
    }

    return this.generateUniformTicks(min, max, step);
  }

  generateTicks(min, max, count) {
    const ticks = [];
    // Use nice round intervals (0.5, 1, 2, 5, 10)
    const range = max - min;
    let step = 1;
    
    if (range > 50) {
      step = 10;
    } else if (range > 25) {
      step = 5;
    } else if (range > 10) {
      step = 2;
    } else if (range > 5) {
      step = 1;
    } else if (range > 2) {
      step = 0.5;
    } else {
      step = 0.25;
    }
    
    // Start from a round number
    const start = Math.ceil(min / step) * step;
    
    for (let tick = start; tick <= max; tick += step) {
      // Round to avoid floating point errors
      ticks.push(Math.round(tick / step) * step);
    }
    
    return ticks;
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
  
  renderGridLines(xTicks, yTicks, xScale, yScale) {
    const svgGroup = this.gridLayerGroup.append("g");
    
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
          .style("stroke", "#ddd")
          .style("stroke-width", "0.5");
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
          .style("stroke", "#ddd")
          .style("stroke-width", "0.5");
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
    const xLogBase = gridOption._xLogBase || '10';
    const yLogBase = gridOption._yLogBase || '10';

    // Pi formatter for trigonometric scales
    const piFormatter = (v) => {
      const pi = Math.PI;
      const tolerance = 0.0001;

      if (Math.abs(v) < tolerance) return "0";

      const ratio = v / pi;

      // Check for integer multiples of π
      if (Math.abs(ratio - Math.round(ratio)) < tolerance) {
        const n = Math.round(ratio);
        if (n === 1) return "π";
        if (n === -1) return "−π";
        return n + "π";
      }

      // Check for sixth-π values (π/6, 5π/6, 7π/6, 11π/6, etc.)
      const sixthRatio = ratio * 6;
      if (Math.abs(sixthRatio - Math.round(sixthRatio)) < tolerance) {
        const n = Math.round(sixthRatio);
        const sign = n < 0 ? "−" : "";
        const absN = Math.abs(n);
        if (absN === 1) return sign + "π/6";
        if (absN === 5) return sign + "5π/6";
        if (absN === 7) return sign + "7π/6";
        if (absN === 11) return sign + "11π/6";
        // Other sixths that simplify
        if (absN === 2) return sign + "π/3";
        if (absN === 4) return sign + "2π/3";
        if (absN === 3) return sign + "π/2";
        if (absN === 6) return sign + "π";
      }

      // Check for quarter-π values
      const quarterRatio = ratio * 4;
      if (Math.abs(quarterRatio - Math.round(quarterRatio)) < tolerance) {
        const n = Math.round(quarterRatio);
        const sign = n < 0 ? "−" : "";
        const absN = Math.abs(n);
        if (absN === 1) return sign + "π/4";
        if (absN === 3) return sign + "3π/4";
        if (absN === 5) return sign + "5π/4";
        if (absN === 7) return sign + "7π/4";
        if (absN === 2) return sign + "π/2";
      }

      // Check for half-π values
      if (Math.abs(ratio - 0.5) < tolerance) return "π/2";
      if (Math.abs(ratio + 0.5) < tolerance) return "−π/2";
      if (Math.abs(ratio - 1.5) < tolerance) return "3π/2";
      if (Math.abs(ratio + 1.5) < tolerance) return "−3π/2";

      // For other values, show decimal
      return format(".2f")(v);
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
      if (xScaleType === 'pi') return piFormatter(v);
      if (xScaleType === 'log') {
        // Use d3's format to check if label should be shown
        const d3Label = xD3Format(v);
        if (d3Label === '') return ''; // d3 says skip this label
        return logFormatterWithSuperscript(v, xLogBase);
      }
      // Linear: use d3's formatter
      return xD3Format(v);
    };

    // Get appropriate formatter for Y axis
    const yFormatter = (v) => {
      if (yScaleType === 'pi') return piFormatter(v);
      if (yScaleType === 'log') {
        // Use d3's format to check if label should be shown
        const d3Label = yD3Format(v);
        if (d3Label === '') return ''; // d3 says skip this label
        return logFormatterWithSuperscript(v, yLogBase);
      }
      // Linear: use d3's formatter
      return yD3Format(v);
    };

    // X-axis labels and tick marks
    xTicks.forEach(tick => {
      const xPos = xScale(tick);
      // Only render labels that are within the visible area with some margin
      if (xPos >= 20 && xPos <= this.width - 20) {
        const label = xFormatter(tick);
        if (Math.abs(tick) > 1e-10 || xScaleType === 'log') {  // Skip 0 for linear/pi, not for log
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
        if (Math.abs(tick) > 1e-10 || yScaleType === 'log') {  // Skip 0 for linear/pi, not for log
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