import { Point } from '../../geom/Point.js';
import { MathTimeLine } from './math-time-line.js';

export class PenTraceable {
  getStartPoint() {
    throw new Error('getStartPoint() must be implemented by subclass');
  }

  getLastPoint() {
    throw new Error('getLastPoint() must be implemented by subclass');
  }

  buildPathDrawingTimeLine(mathTimeLine) {
    throw new Error('buildPathDrawingTimeLine() must be implemented by subclass');
  }
}