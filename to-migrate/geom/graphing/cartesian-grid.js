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
    
    // Calculate the actual visible range in model coordinates
    // This accounts for the full width/height of the SVG
    const visibleXMin = xScale.invert ? xScale.invert(0) : xMin;
    const visibleXMax = xScale.invert ? xScale.invert(this.width) : xMax;
    const visibleYMin = yScale.invert ? yScale.invert(this.height) : yMin;
    const visibleYMax = yScale.invert ? yScale.invert(0) : yMax;
    
    // For uniform grid, use the same tick interval for both axes
    // Calculate the step based on the domain, not the visible area
    const domainRange = Math.max(xMax - xMin, yMax - yMin);
    let step = 1;
    
    // Check if we should use pi-based intervals
    if (gridOption.xPiScale) {
      // For pi scale, use pi/2, pi/4, etc.
      step = Math.PI / 2;
    } else if (domainRange > 50) {
      step = 10;
    } else if (domainRange > 25) {
      step = 5;
    } else if (domainRange > 10) {
      step = 2;
    }
    
    // Generate ticks using the appropriate step
    let xStep = step;
    if (gridOption.xPiScale) {
      // For pi scale, adjust step based on visible range AND available width to avoid clutter
      const xRange = visibleXMax - visibleXMin;
      const pixelsPerPi = this.width / (xRange / Math.PI);
      
      // Need at least 40 pixels per label to avoid overlap
      if (pixelsPerPi < 40) {
        // Very cramped - only show multiples of 2π
        xStep = 2 * Math.PI;
      } else if (pixelsPerPi < 60) {
        // Cramped - only show multiples of π
        xStep = Math.PI;
      } else if (pixelsPerPi < 120) {
        // Normal - show π/2 intervals
        xStep = Math.PI / 2;
      } else {
        // Plenty of space - can show π/4 intervals
        xStep = Math.PI / 4;
      }
    }
    // For Y-axis: use 1 for x-pi-scale graphs, pi/2 for y-pi-scale, otherwise use calculated step
    let yStep = step;
    if (gridOption.yPiScale) {
      // Similar logic for y-pi-scale to avoid clutter
      const yRange = visibleYMax - visibleYMin;
      const pixelsPerPi = this.height / (yRange / Math.PI);
      
      if (pixelsPerPi < 40) {
        yStep = 2 * Math.PI;
      } else if (pixelsPerPi < 60) {
        yStep = Math.PI;
      } else if (pixelsPerPi < 120) {
        yStep = Math.PI / 2;
      } else {
        yStep = Math.PI / 4;
      }
    } else if (gridOption.xPiScale) {
      // For graphs with pi on X-axis (like sin), use nice Y intervals
      const yRange = visibleYMax - visibleYMin;
      if (yRange <= 3) {
        yStep = 0.5;
      } else if (yRange <= 6) {
        yStep = 1;
      } else {
        yStep = 2;
      }
    }
    
    const xTicks = this.generateUniformTicks(visibleXMin, visibleXMax, xStep);
    const yTicks = this.generateUniformTicks(visibleYMin, visibleYMax, yStep);
    
    // Render grid lines if enabled
    if (gridOption.renderGrid) {
      this.renderGridLines(xTicks, yTicks, xScale, yScale);
    }
    
    // Render axes and labels if enabled
    if (gridOption.renderAxis) {
      this.renderAxes(xMin, xMax, yMin, yMax, xScale, yScale);
      this.renderTickLabels(xTicks, yTicks, xScale, yScale, xMin, xMax, yMin, yMax, gridOption);
    }
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
    
    // Pi formatter for trigonometric scales
    const piFormatter = (v) => {
      const pi = Math.PI;
      const tolerance = 1e-10;
      
      if (Math.abs(v) < tolerance) return "0";
      
      const ratio = v / pi;
      
      // Check for common fractions of π
      if (Math.abs(ratio - Math.round(ratio)) < tolerance) {
        const n = Math.round(ratio);
        if (n === 1) return "π";
        if (n === -1) return "−π";
        return n + "π";
      }
      
      // Check for half-π values
      if (Math.abs(ratio - 0.5) < tolerance) return "π/2";
      if (Math.abs(ratio + 0.5) < tolerance) return "−π/2";
      if (Math.abs(ratio - 1.5) < tolerance) return "3π/2";
      if (Math.abs(ratio + 1.5) < tolerance) return "−3π/2";
      
      // Check for quarter-π values
      if (Math.abs(ratio - 0.25) < tolerance) return "π/4";
      if (Math.abs(ratio - 0.75) < tolerance) return "3π/4";
      if (Math.abs(ratio + 0.25) < tolerance) return "−π/4";
      if (Math.abs(ratio + 0.75) < tolerance) return "−3π/4";
      
      // For other values, show decimal
      return format(".2f")(v);
    };
    
    // Format numbers without unnecessary decimals
    const formatter = (num) => {
      return Number.isInteger(num) || Math.abs(num - Math.round(num)) < 0.0001 
        ? Math.round(num).toString() 
        : format(".1f")(num);
    };
    
    // X-axis labels and tick marks
    xTicks.forEach(tick => {
      const xPos = xScale(tick);
      // Only render labels that are within the visible area with some margin
      if (xPos >= 20 && xPos <= this.width - 20) {
        const label = gridOption && gridOption.xPiScale ? piFormatter(tick) : formatter(tick);
        if (Math.abs(tick) > 1e-10) {  // Skip 0
          // Position labels below the x-axis, but within SVG bounds
          const yAxisPos = (yMin <= 0 && yMax >= 0) ? yScale(0) : this.height;
          const yPos = (yMin <= 0 && yMax >= 0) ? 
            Math.min(yScale(0) + 15, this.height - 5) : 
            this.height - 5;
          
          // Add tick mark
          svgGroup.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos)
            .attr("y1", yAxisPos)
            .attr("y2", yAxisPos + 5)
            .style("stroke", "black")
            .style("stroke-width", "1");
          
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
    });
    
    // Y-axis labels and tick marks
    yTicks.forEach(tick => {
      const yPos = yScale(tick);
      // Only render labels that are within the visible area with some margin
      if (yPos >= 15 && yPos <= this.height - 15) {
        const label = gridOption && gridOption.yPiScale ? piFormatter(tick) : formatter(tick);
        if (Math.abs(tick) > 1e-10) {  // Skip 0
          // Position labels to the left of y-axis
          const xAxisPos = (xMin <= 0 && xMax >= 0) ? xScale(0) : 0;
          const xLabelPos = (xMin <= 0 && xMax >= 0) ? 
            Math.max(xScale(0) - 8, 15) : 
            15;
          
          // Add tick mark
          svgGroup.append("line")
            .attr("x1", xAxisPos - 5)
            .attr("x2", xAxisPos)
            .attr("y1", yPos)
            .attr("y2", yPos)
            .style("stroke", "black")
            .style("stroke-width", "1");
          
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
    });
    
    // Origin label - positioned to the bottom-left of origin
    if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
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
}