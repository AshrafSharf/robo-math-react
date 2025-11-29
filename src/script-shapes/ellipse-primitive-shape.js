import { GeomPrimitiveShape } from './geom-primitive-shape.js';
import { EllipsePathGenerator } from '../path-generators/ellipse-path-generator.js';

export class EllipsePrimitiveShape extends GeomPrimitiveShape {
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
    const rx = this.graphsheet2d.toUIWidth(this.modelCoordinates[2]) / 2;
    const ry = this.graphsheet2d.toUIHeight(this.modelCoordinates[3]) / 2;
    const pathStr = EllipsePathGenerator.generate(cx, cy, rx, ry);
    this.primitiveShape.attr('d', pathStr);
  }

  getShapeType() {
    return 'ellipse';
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