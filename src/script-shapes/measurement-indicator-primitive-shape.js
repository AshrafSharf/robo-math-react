import { GeomPrimitiveShape } from './geom-primitive-shape.js';
import { MultiPathAnimator } from '../animator/multi-path-animator.js';
import * as d3 from 'd3';

export class MeasurementIndicatorPrimitiveShape extends GeomPrimitiveShape {
  constructor(modelCoordinates, options = {}) {
    super(modelCoordinates);
    this.options = {
      mainRadius: options.mainRadius || 2,     // Main line thickness in pixels
      markerLength: options.markerLength || 8, // End marker length in pixels
      markerRadius: options.markerRadius || 1.5, // End marker thickness
      offset: options.offset || 0,             // Offset distance (number) perpendicular to line
      ...options
    };
  }

  doCreate() {
    // Create a group to hold all three lines
    this.shapeGroup = this.layer.group();
    
    // Create three separate paths for the measurement indicator
    this.mainLine = this.shapeGroup.path();
    this.startMarker = this.shapeGroup.path();
    this.endMarker = this.shapeGroup.path();
    
    // Store all paths for styling
    this.paths = [this.mainLine, this.startMarker, this.endMarker];
    
    // Generate the paths
    this.generatePath();
    
    // Apply initial styles to all paths
    this.paths.forEach(path => {
      path.attr(this.styleObj);
      path.attr('stroke-width', this.options.mainRadius);
    });
    
    // Use mainLine as the primary shape for compatibility
    this.primitiveShape = this.mainLine;
    this.generatedSVGPath = this.mainLine;
  }

  generatePath() {
    // modelCoordinates: [x1, y1, x2, y2] representing start and end points
    const [x1, y1, x2, y2] = this.modelCoordinates;

    // Convert to view coordinates
    const startView = this.getViewCoordinates([x1, y1]);
    const endView = this.getViewCoordinates([x2, y2]);

    let startX = startView[0], startY = startView[1];
    let endX = endView[0], endY = endView[1];

    // Calculate direction vector in view/pixel space
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Apply perpendicular offset in pixel space if specified
    if (this.options.offset !== 0 && length > 0) {
      // Calculate perpendicular direction in view space (rotate 90 degrees)
      const perpX = -dy / length;
      const perpY = dx / length;

      // Apply offset in pixel space
      startX += perpX * this.options.offset;
      startY += perpY * this.options.offset;
      endX += perpX * this.options.offset;
      endY += perpY * this.options.offset;
    }
    
    if (length === 0) {
      // If start and end are the same, clear all paths
      this.mainLine.attr('d', '');
      this.startMarker.attr('d', '');
      this.endMarker.attr('d', '');
      return;
    }
    
    // Normalize direction
    const dirX = dx / length;
    const dirY = dy / length;
    
    // Calculate perpendicular direction for end markers
    const perpX = -dirY;
    const perpY = dirX;
    
    // Build the main line path
    const mainPath = d3.path();
    mainPath.moveTo(startX, startY);
    mainPath.lineTo(endX, endY);
    this.mainLine.attr('d', mainPath.toString());
    
    // Build the start marker path (top to bottom)
    const markerHalfLen = this.options.markerLength / 2;
    const startMarkerPath = d3.path();
    startMarkerPath.moveTo(startX - perpX * markerHalfLen, startY - perpY * markerHalfLen);
    startMarkerPath.lineTo(startX + perpX * markerHalfLen, startY + perpY * markerHalfLen);
    this.startMarker.attr('d', startMarkerPath.toString());

    // Build the end marker path (top to bottom)
    const endMarkerPath = d3.path();
    endMarkerPath.moveTo(endX - perpX * markerHalfLen, endY - perpY * markerHalfLen);
    endMarkerPath.lineTo(endX + perpX * markerHalfLen, endY + perpY * markerHalfLen);
    this.endMarker.attr('d', endMarkerPath.toString());
  }

  getShapeContainers() {
    return [this.shapeGroup];
  }

  doRenderEndState() {
    // Apply styles to all paths
    this.paths.forEach(path => {
      path.attr(this.styleObj);
      path.attr('stroke-width', this.options.mainRadius);
    });
    this.shapeGroup.show();
  }

  renderWithAnimation(penStartPoint, completionHandler) {
    try {
      // Show the group but keep paths hidden initially
      this.shapeGroup.show();
      
      // Get the native SVG path elements in the correct order:
      // Main line -> Start marker (left) -> End marker (right)
      const pathElements = [
        this.mainLine.node,
        this.startMarker.node,
        this.endMarker.node
      ];
      
      // Use MultiPathAnimator to handle all the animation complexity
      MultiPathAnimator.animate(pathElements, completionHandler);
      
    } catch (e) {
      console.log('Animation error:', e);
      // Fallback: just show everything and complete
      this.enableStroke();
      completionHandler();
    }
  }

  getStylableObjects() {
    return this.paths || [this.primitiveShape];
  }

  disableStroke() {
    this.paths.forEach(path => {
      path.attr('stroke-dasharray', '0,10000');
    });
  }

  enableStroke() {
    this.paths.forEach(path => {
      path.attr('stroke-dasharray', '0,0');
    });
  }

  getShapeType() {
    return 'measurement-indicator';
  }

  /**
   * Get the default rotation point for a measurement indicator
   * Returns the midpoint of the measurement line
   * @returns {Object} Midpoint {x, y} in model coordinates
   */
  getRotationCenter() {
    const [x1, y1, x2, y2] = this.modelCoordinates;
    return {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2
    };
  }

  /**
   * Update the offset for the measurement indicator
   * @param {number} offset - New offset distance (perpendicular to line)
   */
  setOffset(offset) {
    this.options.offset = offset;
    this.generatePath();
  }

  /**
   * Update the marker style
   * @param {Object} style - Style options {markerLength, markerRadius}
   */
  setMarkerStyle(style) {
    if (style.markerLength !== undefined) {
      this.options.markerLength = style.markerLength;
    }
    if (style.markerRadius !== undefined) {
      this.options.markerRadius = style.markerRadius;
    }
    this.generatePath();
  }
}