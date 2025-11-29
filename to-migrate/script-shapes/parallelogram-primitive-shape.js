import { GeomPrimitiveShape } from './geom-primitive-shape.js';
import { PolygonPathGenerator } from '../path-generators/polygon-path-generator.js';
import { parallelogramFourthVertex } from '../utils/vector-math-2d.js';

/**
 * Parallelogram shape defined by origin and two vectors
 * Useful for visualizing vector addition and cross product area
 */
export class ParallelogramPrimitiveShape extends GeomPrimitiveShape {
  constructor(modelCoordinates, options = {}) {
    // Expects 6 coordinates: origin(x,y), v1End(x,y), v2End(x,y)
    if (modelCoordinates.length !== 6) {
      throw new Error('ParallelogramPrimitiveShape requires exactly 3 points (6 coordinates)');
    }
    
    // Calculate the fourth vertex
    const origin = { x: modelCoordinates[0], y: modelCoordinates[1] };
    const v1End = { x: modelCoordinates[2], y: modelCoordinates[3] };
    const v2End = { x: modelCoordinates[4], y: modelCoordinates[5] };
    
    const fourthVertex = parallelogramFourthVertex(origin, v1End, v2End);
    
    // Convert to polygon coordinates (4 vertices)
    const polygonCoords = [
      origin.x, origin.y,
      v1End.x, v1End.y,
      fourthVertex.x, fourthVertex.y,
      v2End.x, v2End.y
    ];
    
    // Call parent with polygon coordinates
    super(polygonCoords);
    
    // Store original input for reference
    this.originalCoordinates = modelCoordinates;
    this.parallelogramOptions = options;
    
    // Style options
    if (options.showEdges !== false) {
      this.styleObj['stroke-width'] = options.edgeWidth || 2;
    } else {
      this.styleObj['stroke-width'] = 0;
    }
    
    if (options.fillOpacity !== undefined) {
      this.styleObj['fill-opacity'] = options.fillOpacity;
    }
  }
  
  generatePath() {
    // Convert model coordinates to view coordinates
    const coordinates = this.getViewCoordinates(this.modelCoordinates);
    
    // Use polygon path generator
    const polygonPathGenerator = new PolygonPathGenerator();
    const pathStr = polygonPathGenerator.generate(coordinates);
    this.primitiveShape.attr('d', pathStr);
  }
  
  getShapeType() {
    return 'parallelogram';
  }
  
  /**
   * Get the centroid of the parallelogram
   * @returns {Object} Centroid {x, y} in model coordinates
   */
  getCentroid() {
    // Average of all four vertices
    const sumX = this.modelCoordinates[0] + this.modelCoordinates[2] + 
                 this.modelCoordinates[4] + this.modelCoordinates[6];
    const sumY = this.modelCoordinates[1] + this.modelCoordinates[3] + 
                 this.modelCoordinates[5] + this.modelCoordinates[7];
    
    return {
      x: sumX / 4,
      y: sumY / 4
    };
  }
  
  /**
   * Get the area of the parallelogram
   * Area = |v1 × v2| where × is the 2D cross product
   * @returns {number} Area
   */
  getArea() {
    const origin = { x: this.originalCoordinates[0], y: this.originalCoordinates[1] };
    const v1End = { x: this.originalCoordinates[2], y: this.originalCoordinates[3] };
    const v2End = { x: this.originalCoordinates[4], y: this.originalCoordinates[5] };
    
    // Vectors from origin
    const v1 = { x: v1End.x - origin.x, y: v1End.y - origin.y };
    const v2 = { x: v2End.x - origin.x, y: v2End.y - origin.y };
    
    // 2D cross product gives signed area
    return Math.abs(v1.x * v2.y - v1.y * v2.x);
  }
  
  /**
   * Get the vertices of the parallelogram
   * @returns {Array<Object>} Array of vertices {x, y}
   */
  getVertices() {
    return [
      { x: this.modelCoordinates[0], y: this.modelCoordinates[1] },
      { x: this.modelCoordinates[2], y: this.modelCoordinates[3] },
      { x: this.modelCoordinates[4], y: this.modelCoordinates[5] },
      { x: this.modelCoordinates[6], y: this.modelCoordinates[7] }
    ];
  }
  
  /**
   * Check if a point is inside the parallelogram
   * Uses the cross product method
   * @param {Object} point - Point {x, y} in model coordinates
   * @returns {boolean} True if inside
   */
  containsPoint(point) {
    const vertices = this.getVertices();
    
    // Check if point is on the same side of all edges
    let sign = null;
    for (let i = 0; i < 4; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % 4];
      
      // Vector from v1 to v2
      const edge = { x: v2.x - v1.x, y: v2.y - v1.y };
      // Vector from v1 to point
      const toPoint = { x: point.x - v1.x, y: point.y - v1.y };
      
      // Cross product
      const cross = edge.x * toPoint.y - edge.y * toPoint.x;
      
      if (sign === null) {
        sign = Math.sign(cross);
      } else if (Math.sign(cross) !== sign && Math.abs(cross) > 0.0001) {
        return false;
      }
    }
    
    return true;
  }
}