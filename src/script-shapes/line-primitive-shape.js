import { GeomPrimitiveShape } from './geom-primitive-shape.js';
import { PolygonPathGenerator } from '../path-generators/polygon-path-generator.js';

export class LinePrimitiveShape extends GeomPrimitiveShape {
  constructor(modelCoordinates) {
    super(modelCoordinates);
  }

  generatePath() {
    console.log('🔧 LinePrimitiveShape.generatePath()');
    console.log('🔧 Model coordinates:', this.modelCoordinates);
    console.log('🔧 graphsheet2d:', this.graphsheet2d);

    const coordinates = this.getViewCoordinates(this.modelCoordinates);
    console.log('🔧 View coordinates:', coordinates);

    const polygonPathGenerator = new PolygonPathGenerator();
    const pathStr = polygonPathGenerator.generate(coordinates);
    console.log('🔧 Generated path:', pathStr);

    this.primitiveShape.attr('d', pathStr);
  }

  getShapeType() {
    return 'line';
  }

  /**
   * Get the default rotation point for a line
   * For lines, this is the start point
   * @returns {Object} Start point {x, y} in model coordinates
   */
  getRotationCenter() {
    // Line has [x1, y1, x2, y2] - return the start point
    return {
      x: this.modelCoordinates[0],
      y: this.modelCoordinates[1]
    };
  }
}