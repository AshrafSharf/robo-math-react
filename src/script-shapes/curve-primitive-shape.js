import { GeomPrimitiveShape } from './geom-primitive-shape.js';
import { CurvePathGenerator } from '../path-generators/curve-path-generator.js';

export class CurvePrimitiveShape extends GeomPrimitiveShape {
  constructor(modelCoordinates, curveType) {
    super(modelCoordinates);
    this.curveType = curveType;
    // Explicitly ensure curves have no fill
    this.styleObj.fill = 'none';
  }

  generatePath() {
    const coordinates = this.getViewCoordinates(this.modelCoordinates);
    const curvePathGenerator = new CurvePathGenerator();
    const pathStr = curvePathGenerator.generate(coordinates, this.curveType);
    this.primitiveShape.attr('d', pathStr);
  }

  getShapeType() {
    return 'curve';
  }
}