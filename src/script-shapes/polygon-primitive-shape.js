import { GeomPrimitiveShape } from './geom-primitive-shape.js';
import { PolygonPathGenerator } from '../path-generators/polygon-path-generator.js';

export class PolygonPrimitiveShape extends GeomPrimitiveShape {
  constructor(modelCoordinates, options = {}) {
    super(modelCoordinates);
    
    // Apply options to styleObj
    if (options.strokeWidth) this.styleObj['stroke-width'] = options.strokeWidth;
    if (options.stroke) this.styleObj.stroke = options.stroke;
    if (options.fill) this.styleObj.fill = options.fill;
    if (options.fillOpacity !== undefined) this.styleObj['fill-opacity'] = options.fillOpacity;
  }
  generatePath() {
    const coordinates = this.getViewCoordinates(this.modelCoordinates);
    const startX = this.graphsheet2d.toViewX(this.modelCoordinates[0]);
    const startY = this.graphsheet2d.toViewY(this.modelCoordinates[1]);
    coordinates.push(startX);
    coordinates.push(startY);
    const polygonPathGenerator = new PolygonPathGenerator();
    const pathStr = polygonPathGenerator.generate(coordinates);
    this.primitiveShape.attr('d', pathStr);
  }

  getShapeType() {
    return 'polygon';
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