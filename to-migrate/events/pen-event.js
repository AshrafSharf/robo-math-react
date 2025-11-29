import { Point } from '../geom/Point.js';

export class PenEvent {
  static POSITION_EVENT_NAME = 'position';

  constructor(screenPoint) {
    this.screenPoint = screenPoint;
  }
}