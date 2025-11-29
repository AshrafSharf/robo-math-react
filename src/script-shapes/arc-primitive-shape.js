import { GeomPrimitiveShape } from './geom-primitive-shape.js';
import { ArcPathGenerator } from '../path-generators/arc-path-generator.js';
import { Point } from '../geom/Point.js';

export class ArcPrimitiveShape extends GeomPrimitiveShape {
  generatePath() {
    const largeflag = 1;
    const sweepFlag = 0;
    const startX = this.graphsheet2d.toViewX(this.modelCoordinates[0]);
    const startY = this.graphsheet2d.toViewY(this.modelCoordinates[1]);
    const endX = this.graphsheet2d.toViewX(this.modelCoordinates[2]);
    const endY = this.graphsheet2d.toViewY(this.modelCoordinates[3]);

    const start = new Point(startX, startY);
    const end = new Point(endX, endY);
    const rx = this.graphsheet2d.toUIWidth(this.modelCoordinates[4]);
    const ry = this.graphsheet2d.toUIHeight(this.modelCoordinates[5]);
    const pathStr = ArcPathGenerator.generate(start, end, rx, ry, largeflag, sweepFlag);
    this.primitiveShape.attr('d', pathStr);
  }

  getShapeType() {
    return 'arc';
  }
}