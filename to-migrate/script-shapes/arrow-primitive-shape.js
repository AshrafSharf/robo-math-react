import { VectorPrimitiveShape } from './vector-primitive-shape.js';
import { ArrowUtil } from '../geom/arrow-util.js';
import { Point } from '../geom/Point.js';
import { PolygonPathGenerator } from '../path-generators/polygon-path-generator.js';

export class ArrowPrimitiveShape extends VectorPrimitiveShape {
  constructor(modelCoordinates, angle = Math.PI, clockwise = true) {
    super(modelCoordinates);
    this.angle = angle;
    this.clockwise = clockwise;
  }

  generatePath() {
    // If it's nearly straight, use parent's implementation
    if (Math.abs(this.angle - Math.PI) < 0.1) {
      return super.generatePath();
    }
    
    // For curved arrows, use ArrowUtil
    const coordinates = this.getViewCoordinates(this.modelCoordinates);
    const from = new Point(coordinates[0], coordinates[1]);
    const to = new Point(coordinates[2], coordinates[3]);
    
    const pathStr = ArrowUtil.getArrowPath(from, to, this.angle, this.clockwise);
    this.primitiveShape.attr('d', pathStr);
    this.addArrowToDefs();
  }

  getShapeType() {
    return 'arrow';
  }
  
  // Methods to update arrow curvature
  setAngle(angle) {
    this.angle = angle;
    this.generatePath();
  }
  
  setClockwise(clockwise) {
    this.clockwise = clockwise;
    this.generatePath();
  }
  
  setCurvature(angle, clockwise) {
    this.angle = angle;
    this.clockwise = clockwise;
    this.generatePath();
  }
}