import * as d3 from 'd3';

export class PathInterpolator {
  constructor(pathNode) {
    this.pathNode = pathNode;
    this.pathLength = this.pathNode.getTotalLength();
    this.interpolator = d3.interpolate(0, this.pathLength);
  }

  getLength() {
    return this.pathLength;
  }

  getPoint(ratio) {
    const length = this.interpolator(ratio);
    const point = this.pathNode.getPointAtLength(length);
    return { x: point.x, y: point.y };
  }

  getLocalSVGValue(ratio) {
    const localMatrix = this.pathNode.getCTM();
    const length = this.interpolator(ratio);
    const point = this.pathNode.getPointAtLength(length);
    const transformedPoint = point.matrixTransform(localMatrix);
    return transformedPoint;
  }

  getAngle(ratio) {
    if (ratio === 1) {
      ratio = ratio - 0.01;
    }
    const p1 = this.getPoint(ratio);
    const p2 = this.getPoint(ratio + 0.01);
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    return angle;
  }
}