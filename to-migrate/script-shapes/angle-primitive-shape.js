import { GeomPrimitiveShape } from './geom-primitive-shape.js';
import { AnglePathGenerator } from '../path-generators/angle-path-generator.js';
import { Point } from '../geom/Point.js';
import $ from 'jquery';

// Default colors for different angle types
const ANGLE_COLORS = {
  INTERIOR: '#FF9800', // Orange
  EXTERIOR_FIRST: '#2196F3', // Blue
  EXTERIOR_SECOND: '#4CAF50', // Green
  REFLEX: '#9C27B0', // Purple
  OPPOSITE: '#FFEB3B', // Yellow
  RIGHT: '#8B4513', // Brown
  DEFAULT: '#FF9800' // Orange
};

export class AnglePrimitiveShape extends GeomPrimitiveShape {
  constructor(modelCoordinates, angleType = 'interior', options = {}) {
    super(modelCoordinates);
    
    // Validate we have 6 coordinates (3 points * 2 coordinates each)
    if (modelCoordinates.length !== 6) {
      throw new Error('AnglePrimitiveShape requires exactly 3 points (6 coordinates)');
    }
    
    this.angleType = angleType;
    this.angleOptions = options;
    this.radius = options.radius || 0.8;
    // All angles draw only arcs without fill by default
    this.fillSector = false;  // Never fill the sector, just draw the arc
    this.showValue = options.showValue || false;
    this.valuePrecision = options.valuePrecision || 1;
    
    // Set default color based on angle type
    const defaultColor = ANGLE_COLORS[angleType.toUpperCase().replace('-', '_')] || ANGLE_COLORS.DEFAULT;
    this.styleObj.stroke = options.stroke || defaultColor;
    this.styleObj['stroke-width'] = options.strokeWidth || 2;
    
    // Handle fill - all angles are arc-only without fill
    if (angleType === 'right') {
      // Right angles use two lines with sharp corners
      delete this.styleObj.fill;  // Remove parent's fill first
      this.styleObj.fill = 'none';
      this.styleObj['fill-opacity'] = 0;
      this.styleObj['stroke-linejoin'] = 'miter';  // Sharp corner
      this.styleObj['stroke-linecap'] = 'square';  // Square ends
    } else {
      // All other angle types are arcs without fill
      delete this.styleObj.fill;  // Remove parent's fill first
      this.styleObj.fill = 'none';
      this.styleObj['fill-opacity'] = 0;
    }
    
    // Store angle center for label positioning
    this.angleCenter = null;
    this.angleDegrees = null;
  }
  
  doCreate() {
    super.doCreate();
    
    // All angles have no fill - they're arc-only
    this.primitiveShape.attr('fill', 'none');
    this.primitiveShape.attr('fill-opacity', 0);
  }
  
  generatePath() {
    // Convert model coordinates to view coordinates using parent's method
    const coordinates = this.getViewCoordinates(this.modelCoordinates);
    
    // Extract view coordinates
    const viewVertex = { x: coordinates[0], y: coordinates[1] };
    const viewPoint1 = { x: coordinates[2], y: coordinates[3] };
    const viewPoint2 = { x: coordinates[4], y: coordinates[5] };
    
    // Get options based on angle type
    const pathOptions = this.getAngleTypeOptions();
    
    // Convert radius to view coordinates
    const viewRadius = this.graphsheet2d.toUIWidth(this.radius);
    
    // Calculate angle value (works in any coordinate system)
    const modelVertex = { x: this.modelCoordinates[0], y: this.modelCoordinates[1] };
    const modelPoint1 = { x: this.modelCoordinates[2], y: this.modelCoordinates[3] };
    const modelPoint2 = { x: this.modelCoordinates[4], y: this.modelCoordinates[5] };
    
    this.angleDegrees = AnglePathGenerator.getAngleDegrees(
      modelVertex,
      modelPoint1,
      modelPoint2,
      pathOptions
    );
    
    // Calculate angle center in model space then convert
    const modelAngleCenter = AnglePathGenerator.getAngleCenter(
      modelVertex,
      modelPoint1,
      modelPoint2,
      this.radius,
      pathOptions
    );
    
    // Convert angle center to view coordinates
    this.angleCenter = {
      x: this.graphsheet2d.toViewX(modelAngleCenter.x),
      y: this.graphsheet2d.toViewY(modelAngleCenter.y)
    };
    
    // Generate the angle path in view coordinates
    const pathStr = AnglePathGenerator.generate(
      viewVertex,
      viewPoint1,
      viewPoint2,
      viewRadius,
      this.fillSector,
      pathOptions
    );
    
    this.primitiveShape.attr('d', pathStr);
    
    // Skip label for now - can be enabled later
    // if (this.angleOptions.label || this.showValue) {
    //   this.addAngleLabel();
    // }
  }
  
  getAngleTypeOptions() {
    const options = {};
    
    switch (this.angleType.toLowerCase()) {
      case 'interior':
        // Standard angle between two vectors
        options.reverseFirst = false;
        options.reverseSecond = false;
        options.reflex = false;
        options.isRightAngle = false;
        break;
        
      case 'right':
        // Right angle indicator (square)
        options.reverseFirst = false;
        options.reverseSecond = false;
        options.reflex = false;
        options.isRightAngle = true;
        break;
        
      case 'exterior-first':
      case 'exterior_first':
        // Based on JSXGraph: exterior angle at first vector
        // This extends the second vector backward
        options.reverseFirst = false;
        options.reverseSecond = true;
        options.reflex = false;
        options.isRightAngle = false;
        break;
        
      case 'exterior-second':
      case 'exterior_second':
        // Based on JSXGraph: exterior angle at second vector
        // This extends the first vector backward
        options.reverseFirst = true;
        options.reverseSecond = false;
        options.reflex = false;
        options.isRightAngle = false;
        break;
        
      case 'reflex':
        // The larger angle (>180°)
        options.reverseFirst = false;
        options.reverseSecond = false;
        options.reflex = true;
        options.isRightAngle = false;
        break;
        
      case 'opposite':
      case 'vertical':
        // Angle between backward extensions of both vectors
        options.reverseFirst = true;
        options.reverseSecond = true;
        options.reflex = false;
        options.isRightAngle = false;
        break;
        
      default:
        options.reverseFirst = false;
        options.reverseSecond = false;
        options.reflex = false;
        options.isRightAngle = false;
    }
    
    return options;
  }
  
  addAngleLabel() {
    if (!this.angleCenter) return;
    
    // Remove existing label if any
    if (this.labelText) {
      this.labelText.remove();
    }
    
    // Create label text
    let labelContent = '';
    
    if (this.angleOptions.label) {
      labelContent = this.angleOptions.label;
    }
    
    if (this.showValue && this.angleDegrees !== null) {
      const valueStr = `${this.angleDegrees.toFixed(this.valuePrecision)}°`;
      if (labelContent) {
        labelContent += ` = ${valueStr}`;
      } else {
        labelContent = valueStr;
      }
    }
    
    if (labelContent) {
      // Create text element using D3 selection
      this.labelText = this.shapeGroup.append('text')
        .attr('x', this.angleCenter.x)
        .attr('y', this.angleCenter.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', this.angleOptions.fontSize || 14)
        .attr('font-family', 'Arial, sans-serif')
        .attr('fill', this.angleOptions.labelColor || '#000000')
        .text(labelContent);
    }
  }
  
  getShapeType() {
    return 'angle';
  }
  
  disableStroke() {
    // Hide both stroke and fill during animation
    this.primitiveShape.attr('stroke-dasharray', '0,10000');
    this.primitiveShape.attr('fill-opacity', 0);
  }
  
  enableStroke() {
    // Restore stroke after animation (no fill for angles - arc only)
    this.primitiveShape.attr('stroke-dasharray', '0,0');
    this.primitiveShape.attr('fill-opacity', 0);  // Keep fill opacity at 0
  }
  
  getPreCompletionHandler() {
    // Called when stroke animation is done, before completion
    return () => {
      this.enableStroke();
    };
  }
  
  doRenderEndState() {
    super.doRenderEndState();
    
    // All angles have no fill - they're arc-only
    this.primitiveShape.attr('fill', 'none');
    this.primitiveShape.attr('fill-opacity', 0);
    
    // Skip label for now - can be enabled later
    // if (this.showValue) {
    //   this.addAngleLabel();
    // }
  }
  
  // For animation, we might want to animate the angle sweep
  renderWithAnimation(penStartPoint, completionHandler) {
    // For now, just use the parent's animation
    // Could be enhanced to animate the angle sweep
    super.renderWithAnimation(penStartPoint, completionHandler);
  }
  
  getTextPosition() {
    if (this.angleCenter) {
      return [this.angleCenter.x, this.angleCenter.y];
    }
    return super.getTextPosition();
  }
  
  /**
   * Get the calculated angle value in degrees
   * @returns {number} Angle in degrees
   */
  getAngleValue() {
    return this.angleDegrees;
  }
  
  /**
   * Get the angle center position (useful for external label positioning)
   * @returns {Object} Center point {x, y}
   */
  getAngleCenter() {
    return this.angleCenter;
  }
  
  /**
   * Update the angle type dynamically
   * @param {string} newType - New angle type
   */
  setAngleType(newType) {
    this.angleType = newType;
    
    // Update default color if not explicitly set
    if (!this.angleOptions.stroke) {
      const defaultColor = ANGLE_COLORS[newType.toUpperCase().replace('-', '_')] || ANGLE_COLORS.DEFAULT;
      this.styleObj.stroke = defaultColor;
      // No fill for angles - arc only
      this.styleObj.fill = 'none';
      this.styleObj['fill-opacity'] = 0;
    }
    
    // Regenerate path
    this.generatePath();
    this.primitiveShape.attr(this.styleObj);
  }
}