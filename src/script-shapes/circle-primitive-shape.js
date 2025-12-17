import { GeomPrimitiveShape } from './geom-primitive-shape.js';
import { CirclePathGenerator } from '../path-generators/circle-path-generator.js';

export class CirclePrimitiveShape extends GeomPrimitiveShape {
  constructor(modelCoordinates, options = {}) {
    super(modelCoordinates);
    
    // Apply options to styleObj
    if (options.strokeWidth) this.styleObj['stroke-width'] = options.strokeWidth;
    if (options.stroke) this.styleObj.stroke = options.stroke;
    if (options.fill) this.styleObj.fill = options.fill;
    if (options.fillOpacity !== undefined) this.styleObj['fill-opacity'] = options.fillOpacity;
  }
  generatePath() {
    const cx = this.graphsheet2d.toViewX(this.modelCoordinates[0]);
    const cy = this.graphsheet2d.toViewY(this.modelCoordinates[1]);
    // For a true circle, we need to average the X and Y scaling
    // or use consistent scaling in both directions
    const rX = this.graphsheet2d.toUIWidth(this.modelCoordinates[2]);
    const rY = this.graphsheet2d.toUIHeight(this.modelCoordinates[2]);
    // Use the average to maintain circular shape
    const r = (Math.abs(rX) + Math.abs(rY)) / 2;
    const pathStr = new CirclePathGenerator().generate({ cx, cy, r: r });
    this.primitiveShape.attr('d', pathStr);
  }

  getShapeType() {
    return 'circle';
  }

  generatePathForCoordinates(coords) {
    const cx = this.graphsheet2d.toViewX(coords[0]);
    const cy = this.graphsheet2d.toViewY(coords[1]);
    const rX = this.graphsheet2d.toUIWidth(coords[2]);
    const rY = this.graphsheet2d.toUIHeight(coords[2]);
    const r = (Math.abs(rX) + Math.abs(rY)) / 2;
    return new CirclePathGenerator().generate({ cx, cy, r });
  }

  getCoordinatePairCount() {
    // Circle has [cx, cy, radius] - only 1 coordinate pair
    return 1;
  }
  
  disableStroke() {
    // Hide both stroke and fill during animation
    this.primitiveShape.attr('stroke-dasharray', '0,10000');
    this.primitiveShape.attr('fill-opacity', 0);
  }
  
  enableStroke() {
    // Restore stroke and fill after animation
    this.primitiveShape.attr('stroke-dasharray', '0,0');
    this.primitiveShape.attr('fill-opacity', this.styleObj['fill-opacity'] || 0);
  }
  
  getPreCompletionHandler() {
    // Called when stroke animation is done, before completion
    return () => {
      this.enableStroke();
    };
  }
}